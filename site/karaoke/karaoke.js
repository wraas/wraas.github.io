(function() {
    // ---- Song catalog (the bait) ----
    var songs = [
        { title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", difficulty: "hard" },
        { title: "Imagine", artist: "John Lennon", genre: "Ballad", difficulty: "easy" },
        { title: "Hotel California", artist: "Eagles", genre: "Rock", difficulty: "medium" },
        { title: "Wonderwall", artist: "Oasis", genre: "Britpop", difficulty: "easy" },
        { title: "Sweet Caroline", artist: "Neil Diamond", genre: "Pop", difficulty: "easy" },
        { title: "Don't Stop Believin'", artist: "Journey", genre: "Rock", difficulty: "medium" },
        { title: "I Will Always Love You", artist: "Whitney Houston", genre: "Ballad", difficulty: "hard" },
        { title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "Rock", difficulty: "hard" },
        { title: "Hallelujah", artist: "Leonard Cohen", genre: "Ballad", difficulty: "medium" },
        { title: "Somebody to Love", artist: "Queen", genre: "Rock", difficulty: "medium" },
        { title: "Billie Jean", artist: "Michael Jackson", genre: "Pop", difficulty: "medium" },
        { title: "Like a Virgin", artist: "Madonna", genre: "Pop", difficulty: "easy" },
        { title: "Purple Haze", artist: "Jimi Hendrix", genre: "Rock", difficulty: "hard" },
        { title: "My Way", artist: "Frank Sinatra", genre: "Jazz", difficulty: "medium" },
        { title: "Yesterday", artist: "The Beatles", genre: "Ballad", difficulty: "easy" },
        { title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Grunge", difficulty: "hard" },
        { title: "Mr. Brightside", artist: "The Killers", genre: "Indie", difficulty: "medium" },
        { title: "Shallow", artist: "Lady Gaga & Bradley Cooper", genre: "Ballad", difficulty: "hard" },
        { title: "Take On Me", artist: "a-ha", genre: "Synth-pop", difficulty: "hard" },
        { title: "Dancing Queen", artist: "ABBA", genre: "Disco", difficulty: "easy" }
    ];

    function trackEvent(path, title) {
        if (typeof goatcounter !== "undefined" && goatcounter.count) {
            goatcounter.count({ path: path, title: title, event: true });
        }
    }

    var songGrid = document.getElementById("song-grid");
    var searchBar = document.getElementById("search-bar");

    var rickLyrics = [
        { title: "Never gonna give you up", artist: "Rick Astley", genre: "Pop", difficulty: "legendary" },
        { title: "Never gonna let you down", artist: "Rick Astley", genre: "Pop", difficulty: "legendary" },
        { title: "Never gonna run around and desert you", artist: "Rick Astley", genre: "Pop", difficulty: "legendary" },
        { title: "Never gonna make you cry", artist: "Rick Astley", genre: "Pop", difficulty: "legendary" },
        { title: "Never gonna say goodbye", artist: "Rick Astley", genre: "Pop", difficulty: "legendary" },
        { title: "Never gonna tell a lie and hurt you", artist: "Rick Astley", genre: "Pop", difficulty: "legendary" }
    ];

    function renderSongs(filter) {
        songGrid.innerHTML = "";
        var lowerFilter = (filter || "").toLowerCase();

        // Easter egg: searching "never" or "rick" reveals the true setlist
        var isEasterEgg = lowerFilter.indexOf("never") !== -1 || lowerFilter.indexOf("rick") !== -1;
        if (isEasterEgg) trackEvent("karaoke-easter-egg", "Easter egg search");
        var catalog = isEasterEgg ? rickLyrics : songs;

        catalog.forEach(function(song, i) {
            if (catalog === songs && lowerFilter &&
                song.title.toLowerCase().indexOf(lowerFilter) === -1 &&
                song.artist.toLowerCase().indexOf(lowerFilter) === -1 &&
                song.genre.toLowerCase().indexOf(lowerFilter) === -1) {
                return;
            }
            var card = document.createElement("div");
            card.className = "song-card";
            card.setAttribute("tabindex", "0");
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", "Sing " + song.title + " by " + song.artist);
            card.innerHTML =
                '<div class="song-title">' + song.title + '</div>' +
                '<div class="song-artist">' + song.artist + '</div>' +
                '<div class="song-meta">' +
                    '<span class="song-tag">' + song.genre + '</span>' +
                    '<span class="song-tag difficulty-' + song.difficulty + '">' +
                        song.difficulty.charAt(0).toUpperCase() + song.difficulty.slice(1) +
                    '</span>' +
                '</div>' +
                '<span class="sing-label">Sing &rarr;</span>';

            card.addEventListener("click", function() { startSong(song); });
            card.addEventListener("keydown", function(e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    startSong(song);
                }
            });
            songGrid.appendChild(card);
        });
    }

    searchBar.addEventListener("input", function() {
        renderSongs(searchBar.value);
    });

    renderSongs();

    // ---- Elements ----
    var songSelect = document.getElementById("song-select");
    var loadingScreen = document.getElementById("loading-screen");
    var loadingText = document.getElementById("loading-text");
    var karaokeStage = document.getElementById("karaoke-stage");
    var muteBtn = document.getElementById("mute-btn");
    var backBtn = document.getElementById("back-btn");
    var nowPlaying = document.getElementById("now-playing");
    var npTitle = document.getElementById("np-title");
    var npArtist = document.getElementById("np-artist");
    var progressBar = document.getElementById("progress-bar");
    var scoreEl = document.getElementById("score");
    var scoreValue = document.getElementById("score-value");
    var lyricsContainer = document.getElementById("karaoke-lyrics");

    // ---- Audio system ----
    var audioCtx = null;
    var isPlaying = false;
    var isMuted = false;
    var loopTimer = null;
    var lyricTimers = [];
    var scoreTimer = null;
    var currentScore = 0;

    // Rickroll melody — 6 chorus lines at 113 BPM
    var beat = 60 / 113;
    var eighth = beat / 2;
    var quarter = beat;
    var dottedQuarter = beat * 1.5;

    var notes = [
        // Line 1: "Never gonna give you up"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },
        { freq: 369.99, dur: quarter },{ freq: 369.99, dur: eighth },{ freq: 329.63, dur: dottedQuarter },
        // Line 2: "Never gonna let you down"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 659.25, dur: eighth },
        { freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 440, dur: quarter },{ freq: 0, dur: quarter },
        // Line 3: "Never gonna run around and desert you"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },
        { freq: 369.99, dur: quarter },{ freq: 369.99, dur: eighth },{ freq: 329.63, dur: eighth },{ freq: 329.63, dur: eighth },
        { freq: 293.66, dur: eighth },{ freq: 329.63, dur: eighth },{ freq: 293.66, dur: dottedQuarter },{ freq: 0, dur: quarter },
        // Line 4: "Never gonna make you cry"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },
        { freq: 369.99, dur: quarter },{ freq: 369.99, dur: eighth },{ freq: 329.63, dur: dottedQuarter },
        // Line 5: "Never gonna say goodbye"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 659.25, dur: eighth },
        { freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 440, dur: quarter },{ freq: 0, dur: quarter },
        // Line 6: "Never gonna tell a lie and hurt you"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },
        { freq: 369.99, dur: quarter },{ freq: 369.99, dur: eighth },{ freq: 329.63, dur: eighth },{ freq: 329.63, dur: eighth },
        { freq: 293.66, dur: eighth },{ freq: 329.63, dur: eighth },{ freq: 293.66, dur: dottedQuarter },{ freq: 0, dur: quarter },
    ];

    var melodyDuration = 0;
    notes.forEach(function(n) { melodyDuration += n.dur; });

    // ---- Lyrics data synced to melody (6 chorus lines) ----
    // Start times and durations computed from note durations
    var chorusLyrics = [
        { text: "Never gonna give you up", start: 0, dur: 0 },
        { text: "Never gonna let you down", start: 0, dur: 0 },
        { text: "Never gonna run around and desert you", start: 0, dur: 0 },
        { text: "Never gonna make you cry", start: 0, dur: 0 },
        { text: "Never gonna say goodbye", start: 0, dur: 0 },
        { text: "Never gonna tell a lie and hurt you", start: 0, dur: 0 },
    ];

    // Compute start/dur from note durations (7, 8, 12, 7, 8, 12 notes per line)
    (function() {
        var notesPerLine = [7, 8, 12, 7, 8, 12];
        var noteIndex = 0;
        var timeMs = 0;
        for (var i = 0; i < 6; i++) {
            chorusLyrics[i].start = Math.round(timeMs);
            var lineDur = 0;
            for (var j = 0; j < notesPerLine[i]; j++) {
                lineDur += notes[noteIndex].dur;
                noteIndex++;
            }
            chorusLyrics[i].dur = Math.round(lineDur * 1000);
            timeMs += lineDur * 1000;
        }
    })();

    // ---- Lyrics rendering engine ----
    // Shows a sliding window: previous (sung), current (active with fill), next (upcoming)
    var WINDOW_SIZE = 3; // lines visible at once

    function buildLyricLine(text) {
        var line = document.createElement("span");
        line.className = "lyric-line";
        line.textContent = text;
        // Fill overlay (for sweep effect)
        var fill = document.createElement("span");
        fill.className = "lyric-fill";
        fill.textContent = text;
        line.appendChild(fill);
        return line;
    }

    function renderLyricsWindow(lyrics, activeIndex) {
        lyricsContainer.innerHTML = "";

        // Show: one before, active, and one (or two) after
        var startShow = Math.max(0, activeIndex - 1);
        var endShow = Math.min(lyrics.length, activeIndex + WINDOW_SIZE);

        for (var i = startShow; i < endShow; i++) {
            var el = buildLyricLine(lyrics[i].text);
            el.classList.add("visible");

            if (i < activeIndex) {
                el.classList.add("sung");
            } else if (i === activeIndex) {
                el.classList.add("active");
            }
            lyricsContainer.appendChild(el);
        }
    }

    function sweepFill(activeEl, duration) {
        var fill = activeEl.querySelector(".lyric-fill");
        if (!fill) return;
        fill.style.transition = "none";
        fill.style.backgroundPosition = "100% 0";
        void fill.offsetWidth;
        fill.style.transition = "background-position " + duration + "ms linear";
        fill.style.backgroundPosition = "0% 0";
    }

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
    }

    function playMelody() {
        if (!audioCtx || isPlaying) return;

        var time = audioCtx.currentTime + 0.1;
        var gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.15;
        gainNode.connect(audioCtx.destination);

        notes.forEach(function(note) {
            if (note.freq === 0) { time += note.dur; return; }
            var osc = audioCtx.createOscillator();
            osc.type = "square";
            osc.frequency.value = note.freq;

            var noteGain = audioCtx.createGain();
            noteGain.gain.setValueAtTime(0.15, time);
            noteGain.gain.exponentialRampToValueAtTime(0.01, time + note.dur - 0.02);

            osc.connect(noteGain);
            noteGain.connect(gainNode);
            osc.start(time);
            osc.stop(time + note.dur);
            time += note.dur;
        });

        isPlaying = true;
    }

    // ---- Lyric sync ----
    var currentLoop = 0;

    function clearTimers() {
        lyricTimers.forEach(function(t) { clearTimeout(t); });
        lyricTimers = [];
        clearTimeout(loopTimer);
        clearTimeout(scoreTimer);
    }

    function animateProgress(duration) {
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
        void progressBar.offsetWidth;
        progressBar.style.transition = "width " + duration + "ms linear";
        progressBar.style.width = "100%";
    }

    function bumpScore() {
        currentScore += Math.floor(Math.random() * 30) + 10;
        scoreValue.textContent = currentScore;
    }

    function startKaraokeLoop() {
        if (isMuted) return;

        var lyrics = chorusLyrics;
        var loopDuration = (melodyDuration * 1000) + 800;

        playMelody();
        animateProgress(loopDuration);

        // Schedule each lyric line
        lyrics.forEach(function(entry, i) {
            var t = setTimeout(function() {
                renderLyricsWindow(lyrics, i);
                bumpScore();
                // Sweep fill on the active line
                var activeEl = lyricsContainer.querySelector(".lyric-line.active");
                if (activeEl) sweepFill(activeEl, entry.dur);
            }, entry.start);
            lyricTimers.push(t);
        });

        // Mark last line as sung near end
        var lastEntry = lyrics[lyrics.length - 1];
        var sungTime = lastEntry.start + lastEntry.dur + 100;
        var t2 = setTimeout(function() {
            renderLyricsWindow(lyrics, lyrics.length);
        }, Math.min(sungTime, loopDuration - 200));
        lyricTimers.push(t2);

        loopTimer = setTimeout(function() {
            isPlaying = false;
            currentLoop++;
            startKaraokeLoop();
        }, loopDuration);
    }

    function stopKaraoke() {
        clearTimers();
        isPlaying = false;
        lyricsContainer.innerHTML = "";
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
    }

    // ---- Mute ----
    function updateMuteIcon(unmuted) {
        if (unmuted) {
            muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
            muteBtn.setAttribute("aria-label", "Mute audio");
        } else {
            muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
            muteBtn.setAttribute("aria-label", "Unmute audio");
        }
    }

    muteBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        trackEvent("karaoke-mute-click", "Karaoke mute toggle");
        if (isMuted) {
            isMuted = false;
            if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
            updateMuteIcon(true);
            startKaraokeLoop();
        } else {
            isMuted = true;
            if (audioCtx) audioCtx.suspend();
            stopKaraoke();
            updateMuteIcon(false);
        }
    });

    // ---- Fake loading messages ----
    var loadingMessages = [
        "Preparing karaoke track...",
        "Loading vocal isolation...",
        "Syncing lyrics...",
        "Warming up the mic...",
        "Cueing up the music..."
    ];

    // ---- Start song (the troll) ----
    function startSong(song) {
        trackEvent("karaoke-song-select", "Song selected: " + song.title);
        // Stop consent melody before karaoke takes over
        if (window.stopConsentMelody) window.stopConsentMelody();

        // Show loading
        loadingText.textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        loadingScreen.classList.add("visible");
        songSelect.classList.add("hidden");

        // Set "now playing" info (shows the selected song title for extra troll)
        npTitle.textContent = song.title;
        npArtist.textContent = song.artist;

        // Init audio on user gesture
        initAudio();

        setTimeout(function() {
            loadingScreen.classList.remove("visible");

            setTimeout(function() {
                // Reveal the karaoke stage
                karaokeStage.classList.add("visible");
                nowPlaying.classList.add("visible");
                muteBtn.classList.add("visible");
                backBtn.classList.add("visible");
                scoreEl.classList.add("visible");

                currentScore = 0;
                scoreValue.textContent = "0";
                currentLoop = 0;

                updateMuteIcon(true);
                startKaraokeLoop();
            }, 400);
        }, 2000);
    }

    // ---- Back to songs ----
    backBtn.addEventListener("click", function() {
        trackEvent("karaoke-back-click", "Back to song list");
        stopKaraoke();
        karaokeStage.classList.remove("visible");
        nowPlaying.classList.remove("visible");
        muteBtn.classList.remove("visible");
        backBtn.classList.remove("visible");
        scoreEl.classList.remove("visible");

        if (audioCtx) {
            audioCtx.suspend();
            isMuted = false;
        }

        setTimeout(function() {
            songSelect.classList.remove("hidden");
        }, 300);
    });
})();

// --- Cookie consent banner + melody on song selection ---
(function() {
    var audioCtx = null;
    var isPlaying = false;
    var melodyTimeout = null;

    var beat = 60 / 113;
    var eighth = beat / 2;
    var quarter = beat;
    var dottedQuarter = beat * 1.5;

    var notes = [
        // Line 1: "Never gonna give you up"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },
        { freq: 369.99, dur: quarter },{ freq: 369.99, dur: eighth },{ freq: 329.63, dur: dottedQuarter },
        // Line 2: "Never gonna let you down"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 659.25, dur: eighth },
        { freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 440, dur: quarter },{ freq: 0, dur: quarter },
        // Line 3: "Never gonna run around and desert you"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },
        { freq: 369.99, dur: quarter },{ freq: 369.99, dur: eighth },{ freq: 329.63, dur: eighth },{ freq: 329.63, dur: eighth },
        { freq: 293.66, dur: eighth },{ freq: 329.63, dur: eighth },{ freq: 293.66, dur: dottedQuarter },{ freq: 0, dur: quarter },
        // Line 4: "Never gonna make you cry"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },
        { freq: 369.99, dur: quarter },{ freq: 369.99, dur: eighth },{ freq: 329.63, dur: dottedQuarter },
        // Line 5: "Never gonna say goodbye"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 659.25, dur: eighth },
        { freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 440, dur: quarter },{ freq: 0, dur: quarter },
        // Line 6: "Never gonna tell a lie and hurt you"
        { freq: 440, dur: eighth },{ freq: 493.88, dur: eighth },{ freq: 587.33, dur: eighth },{ freq: 493.88, dur: eighth },
        { freq: 369.99, dur: quarter },{ freq: 369.99, dur: eighth },{ freq: 329.63, dur: eighth },{ freq: 329.63, dur: eighth },
        { freq: 293.66, dur: eighth },{ freq: 329.63, dur: eighth },{ freq: 293.66, dur: dottedQuarter },{ freq: 0, dur: quarter },
    ];

    function initAudio() {
        if (audioCtx) return;
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }

    function playMelody() {
        if (!audioCtx || isPlaying) return;
        var time = audioCtx.currentTime + 0.1;
        var gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.15;
        gainNode.connect(audioCtx.destination);
        notes.forEach(function(note) {
            if (note.freq === 0) { time += note.dur; return; }
            var osc = audioCtx.createOscillator();
            osc.type = "square";
            osc.frequency.value = note.freq;
            var noteGain = audioCtx.createGain();
            noteGain.gain.setValueAtTime(0.15, time);
            noteGain.gain.exponentialRampToValueAtTime(0.01, time + note.dur - 0.02);
            osc.connect(noteGain);
            noteGain.connect(gainNode);
            osc.start(time);
            osc.stop(time + note.dur);
            time += note.dur;
        });
        isPlaying = true;
        var dur = (time - audioCtx.currentTime) * 1000;
        melodyTimeout = setTimeout(function() { isPlaying = false; playMelody(); }, dur);
    }

    // Consent banner
    var banner = document.createElement("div");
    banner.id = "audio-hint";
    banner.style.cssText = "position:fixed;bottom:0;left:0;width:100%;z-index:200;background:#2b2d42;color:#edf2f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 -2px 12px rgba(0,0,0,0.4);";
    banner.innerHTML = '<div style="flex:1;min-width:200px;">'
        + '<div style="font-size:14px;font-weight:600;margin-bottom:4px;">We value your privacy (when aligned with our profits)</div>'
        + '<div style="font-size:12px;opacity:0.8;">We use cookies to <s>track you</s> enhance your browsing experience. Your choice won\'t be remembered because, frankly, nobody cares. You\'ll see this again next time. Such is life. <a href="#" id="audio-hint-policy" style="color:#8ecae6;text-decoration:underline;">Cookie Policy</a></div>'
        + '</div>'
        + '<div style="display:flex;gap:8px;flex-shrink:0;">'
        + '<button id="audio-hint-reject" style="background:transparent;border:1px solid #8d99ae;color:#edf2f4;padding:8px 20px;border-radius:4px;font-size:13px;cursor:pointer;">Reject All</button>'
        + '<button id="audio-hint-accept" style="background:#3b82f6;border:none;color:#fff;padding:8px 20px;border-radius:4px;font-size:13px;font-weight:600;cursor:pointer;">Accept All</button>'
        + '</div>';
    document.body.appendChild(banner);

    var melodyStarted = false;

    function startMelodyOnce() {
        if (melodyStarted) return;
        melodyStarted = true;
        initAudio();
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume().then(function() { playMelody(); });
        } else {
            playMelody();
        }
    }

    function onConsent() {
        banner.remove();
        startMelodyOnce();
    }
    banner.querySelector("#audio-hint-accept").addEventListener("click", onConsent);
    banner.querySelector("#audio-hint-reject").addEventListener("click", onConsent);
    banner.querySelector("#audio-hint-policy").addEventListener("click", function(e) { e.preventDefault(); onConsent(); });

    // Expose stop function for karaoke stage to use
    window.stopConsentMelody = function() {
        melodyStarted = true; // prevent future triggers
        clearTimeout(melodyTimeout);
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
        isPlaying = false;
        document.removeEventListener("click", ensureMelody);
        document.removeEventListener("touchstart", ensureMelody);
    };

    // Any click ensures melody (only if not already started and consent banner dismissed)
    function ensureMelody() {
        if (melodyStarted) return;
        if (document.getElementById("audio-hint")) return; // banner still visible, wait for consent
        startMelodyOnce();
    }
    document.addEventListener("click", ensureMelody);
    document.addEventListener("touchstart", ensureMelody);
})();

// --- Floating lyrics ---
(function() {
    var lyrics = [
        "Never gonna give you up",
        "Never gonna let you down",
        "Never gonna run around and desert you",
        "Never gonna make you cry",
        "Never gonna say goodbye",
        "Never gonna tell a lie and hurt you"
    ];
    var lineIndex = 0;

    var style = document.createElement("style");
    style.textContent = "@keyframes floatLyric {"
        + "0% { opacity:0; transform:translateX(0); }"
        + "10% { opacity:1; }"
        + "90% { opacity:1; }"
        + "100% { opacity:0; transform:translateX(30vw); }"
        + "}";
    document.head.appendChild(style);

    function spawnLyric() {
        var line = document.createElement("a");
        line.href = "/";
        line.textContent = lyrics[lineIndex % lyrics.length];
        lineIndex++;

        var top = 10 + Math.random() * 70;
        var left = Math.random() * 60;
        var duration = 8 + Math.random() * 6;
        var size = 0.7 + Math.random() * 0.5;

        line.style.cssText = "position:fixed;top:" + top + "%;left:" + left + "%;"
            + "color:rgba(255,255,255,0.15);font-size:" + size + "em;"
            + "text-decoration:none;pointer-events:auto;white-space:nowrap;"
            + "z-index:0;transition:color 0.3s,transform 0.3s;"
            + "animation:floatLyric " + duration + "s linear forwards;";

        line.addEventListener("mouseenter", function() {
            line.style.color = "rgba(74,222,128,0.7)";
            line.style.transform = "scale(1.15)";
        });
        line.addEventListener("mouseleave", function() {
            line.style.color = "rgba(255,255,255,0.15)";
            line.style.transform = "scale(1)";
        });

        document.body.appendChild(line);
        setTimeout(function() { line.remove(); }, duration * 1000);
    }

    spawnLyric();
    setInterval(spawnLyric, 3000);
})();
