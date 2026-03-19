(function() {
    "use strict";

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Theme system: fake loading screens based on URL path ---
    var themes = {
        "/meeting": {
            loadingText: "Redirecting to your meeting...",
            fakeDelay: 2000,
            title: "You've been invited to a meeting",
            desc: "Your attendance is required. Click to join the meeting room now."
        },
        "/document": {
            loadingText: "Opening shared document...",
            fakeDelay: 2500,
            title: "Shared Document — Review Required",
            desc: "A document has been shared with you. Please review and approve before the deadline."
        },
        "/password-reset": {
            loadingText: "Verifying your identity...",
            fakeDelay: 2000,
            title: "Password Reset Request",
            desc: "A password reset was requested for your account. Click to verify your identity and set a new password."
        },
        "/invoice": {
            loadingText: "Loading invoice #48291...",
            fakeDelay: 2200,
            title: "Invoice #48291 — Payment Due",
            desc: "You have an outstanding invoice that requires your attention. Please review the details."
        },
        "/survey": {
            loadingText: "Loading survey...",
            fakeDelay: 1800,
            title: "Quick Survey — Your Feedback Matters",
            desc: "We'd love to hear your thoughts. This survey takes less than 2 minutes to complete."
        },
        "/clickbait": {
            loadingText: "Loading exclusive content...",
            fakeDelay: 2500,
            title: "You Won't Believe What Happens Next",
            desc: "Scientists are baffled. Doctors hate this. Number 7 will shock you. Click to find out why everyone is talking about this."
        },
        "/karaoke": {
            loadingText: "Warming up the mic...",
            fakeDelay: 2000,
            title: "Karaoke Night — Pick Your Song!",
            desc: "Join the party! Browse our catalog of hit songs and sing your heart out. Your mic is ready."
        }
    };

    // Update page title/meta for themed URLs (browser tab)
    var currentTheme = getTheme();
    if (currentTheme && currentTheme.title) {
        document.title = currentTheme.title;
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", currentTheme.desc);
    }

    function getTheme() {
        var path = window.location.pathname.toLowerCase();
        // Exact match first
        var exact = themes[path.replace(/\/$/, "")];
        if (exact) return exact;
        // Keyword match: first theme keyword found in URL wins
        var keys = Object.keys(themes);
        for (var i = 0; i < keys.length; i++) {
            var keyword = keys[i].replace("/", "");
            if (path.indexOf(keyword) !== -1) return themes[keys[i]];
        }
        return null;
    }

    function showFakeLoading(theme, callback) {
        var overlay = document.getElementById("fake-loading");
        var text = document.getElementById("fake-loading-text");
        var actions = document.getElementById("fake-loading-actions");
        if (!overlay || !text) { callback(); return; }

        text.textContent = theme.loadingText;
        overlay.classList.add("visible");

        // Add fake progress bar + skip link
        if (actions) {
            actions.innerHTML = '<div class="fake-loading-progress"><div class="fake-loading-progress-bar" id="fake-progress-bar"></div></div>'
                + '<button class="skip-btn" id="fake-skip">Taking too long? Click to speed up</button>';

            // Animate progress bar
            var bar = document.getElementById("fake-progress-bar");
            var steps = [
                { width: "15%", at: 200 },
                { width: "35%", at: 600 },
                { width: "58%", at: 1000 },
                { width: "72%", at: 1400 },
                { width: "89%", at: 1800 },
                { width: "94%", at: 2200 }
            ];
            steps.forEach(function(step) {
                if (step.at < theme.fakeDelay) {
                    setTimeout(function() { if (bar) bar.style.width = step.width; }, step.at);
                }
            });

            // Skip button adds more delay (trolling)
            var skipBtn = document.getElementById("fake-skip");
            var clickCount = 0;
            var messages = [
                "Optimizing connection...",
                "Almost there, please wait...",
                "Recalibrating servers...",
                "Just a moment longer..."
            ];
            skipBtn.addEventListener("click", function() {
                clickCount++;
                if (clickCount < messages.length) {
                    text.textContent = messages[clickCount];
                } else {
                    skipBtn.textContent = "We appreciate your patience";
                    skipBtn.style.cursor = "default";
                    skipBtn.style.textDecoration = "none";
                }
                if (bar) bar.style.width = "42%";
                // Reset the dismiss timer — each click adds 1.5s
                clearTimeout(dismissTimer);
                dismissTimer = setTimeout(dismiss, 1500);
            });
        }

        function dismiss() {
            if (actions) {
                var b = document.getElementById("fake-progress-bar");
                if (b) b.style.width = "100%";
            }
            setTimeout(function() {
                overlay.classList.remove("visible");
                setTimeout(callback, 400);
            }, 300);
        }

        var dismissTimer = setTimeout(dismiss, theme.fakeDelay);
    }

    function revealRickroll() {
        var bg = document.querySelector(".rick-bg");
        if (bg) bg.classList.add("visible");

        var lines = document.querySelectorAll(".lyrics-line");
        var initialDelay = 600;
        var interval = 300;

        if (prefersReducedMotion) {
            lines.forEach(function(line) { line.classList.add("visible"); });
            var muteBtn = document.querySelector(".mute-btn");
            if (muteBtn) muteBtn.classList.add("visible");
            return;
        }

        lines.forEach(function(line, i) {
            setTimeout(function() {
                line.classList.add("visible");
            }, initialDelay + i * interval);
        });

        setTimeout(function() {
            var muteBtn = document.querySelector(".mute-btn");
            if (muteBtn) muteBtn.classList.add("visible");
        }, initialDelay + lines.length * interval);
    }

    // --- Audio system ---
    var audioCtx = null;
    var isPlaying = false;
    var audioUnlocked = false;
    var melodyTimeout = null;

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // Web Audio not supported
        }
    }

    function playRickrollAudio() {
        if (!audioCtx || isPlaying) return;

        // 113 BPM timing (original song tempo)
        var beat = 60 / 113;
        var eighth = beat / 2;
        var quarter = beat;
        var dottedQuarter = beat * 1.5;

        var notes = [
            // Line 1: "Never gonna give you up"
            { freq: 440, dur: eighth },          // A4  "Ne-"
            { freq: 493.88, dur: eighth },       // B4  "-ver"
            { freq: 587.33, dur: eighth },       // D5  "gon-"
            { freq: 493.88, dur: eighth },       // B4  "-na"
            { freq: 369.99, dur: quarter },      // F#4 "give"
            { freq: 369.99, dur: eighth },       // F#4 "you"
            { freq: 329.63, dur: dottedQuarter }, // E4  "up"

            // Line 2: "Never gonna let you down"
            { freq: 440, dur: eighth },          // A4  "Ne-"
            { freq: 493.88, dur: eighth },       // B4  "-ver"
            { freq: 587.33, dur: eighth },       // D5  "gon-"
            { freq: 659.25, dur: eighth },       // E5  "-na"
            { freq: 587.33, dur: eighth },       // D5  "let"
            { freq: 493.88, dur: eighth },       // B4  "you"
            { freq: 440, dur: quarter },         // A4  "down"
            { freq: 0, dur: quarter },           // rest

            // Line 3: "Never gonna run around and desert you"
            { freq: 440, dur: eighth },          // A4  "Ne-"
            { freq: 493.88, dur: eighth },       // B4  "-ver"
            { freq: 587.33, dur: eighth },       // D5  "gon-"
            { freq: 493.88, dur: eighth },       // B4  "-na"
            { freq: 369.99, dur: quarter },      // F#4 "run"
            { freq: 369.99, dur: eighth },       // F#4 "a-"
            { freq: 329.63, dur: eighth },       // E4  "-round"
            { freq: 329.63, dur: eighth },       // E4  "and"
            { freq: 293.66, dur: eighth },       // D4  "de-"
            { freq: 329.63, dur: eighth },       // E4  "-sert"
            { freq: 293.66, dur: dottedQuarter }, // D4  "you"
            { freq: 0, dur: quarter },           // rest

            // Line 4: "Never gonna make you cry"
            { freq: 440, dur: eighth },          // A4  "Ne-"
            { freq: 493.88, dur: eighth },       // B4  "-ver"
            { freq: 587.33, dur: eighth },       // D5  "gon-"
            { freq: 493.88, dur: eighth },       // B4  "-na"
            { freq: 369.99, dur: quarter },      // F#4 "make"
            { freq: 369.99, dur: eighth },       // F#4 "you"
            { freq: 329.63, dur: dottedQuarter }, // E4  "cry"

            // Line 5: "Never gonna say goodbye"
            { freq: 440, dur: eighth },          // A4  "Ne-"
            { freq: 493.88, dur: eighth },       // B4  "-ver"
            { freq: 587.33, dur: eighth },       // D5  "gon-"
            { freq: 659.25, dur: eighth },       // E5  "-na"
            { freq: 587.33, dur: eighth },       // D5  "say"
            { freq: 493.88, dur: eighth },       // B4  "good-"
            { freq: 440, dur: quarter },         // A4  "-bye"
            { freq: 0, dur: quarter },           // rest

            // Line 6: "Never gonna tell a lie and hurt you"
            { freq: 440, dur: eighth },          // A4  "Ne-"
            { freq: 493.88, dur: eighth },       // B4  "-ver"
            { freq: 587.33, dur: eighth },       // D5  "gon-"
            { freq: 493.88, dur: eighth },       // B4  "-na"
            { freq: 369.99, dur: quarter },      // F#4 "tell"
            { freq: 369.99, dur: eighth },       // F#4 "a"
            { freq: 329.63, dur: eighth },       // E4  "lie"
            { freq: 329.63, dur: eighth },       // E4  "and"
            { freq: 293.66, dur: eighth },       // D4  "hurt"
            { freq: 329.63, dur: eighth },       // E4  "you"
            { freq: 293.66, dur: dottedQuarter }, // D4  (resolve)
            { freq: 0, dur: quarter },           // rest before loop
        ];

        var time = audioCtx.currentTime + 0.1;
        var gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.15;
        gainNode.connect(audioCtx.destination);

        notes.forEach(function(note) {
            if (note.freq === 0) {
                time += note.dur;
                return;
            }
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
        var melodyDuration = (time - audioCtx.currentTime) * 1000;
        melodyTimeout = setTimeout(function() {
            isPlaying = false;
            playRickrollAudio();
        }, melodyDuration);
    }

    function toggleMute() {
        if (!audioCtx) {
            initAudio();
            if (audioCtx) {
                playRickrollAudio();
                audioUnlocked = true;
                updateMuteButton(true);
            }
            return;
        }
        if (isPlaying) {
            audioCtx.suspend();
            clearTimeout(melodyTimeout);
            isPlaying = false;
            updateMuteButton(false);
        } else {
            audioCtx.resume().then(function() {
                playRickrollAudio();
                updateMuteButton(true);
            });
        }
    }

    function updateMuteButton(unmuted) {
        var muteBtn = document.querySelector(".mute-btn");
        if (!muteBtn) return;
        var hint = document.getElementById("audio-hint");
        if (hint) hint.remove();
        if (unmuted) {
            muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
            muteBtn.setAttribute("aria-label", "Mute audio");
        } else {
            muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
            muteBtn.setAttribute("aria-label", "Unmute audio");
        }
    }

    function showAudioHint() {
        var existing = document.getElementById("audio-hint");
        if (existing) existing.remove();
        var banner = document.createElement("div");
        banner.id = "audio-hint";
        banner.style.cssText = "position:fixed;bottom:0;left:0;width:100%;z-index:50;background:#2b2d42;color:#edf2f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 -2px 12px rgba(0,0,0,0.4);";
        banner.innerHTML = '<div style="flex:1;min-width:200px;">'
            + '<div style="font-size:14px;font-weight:600;margin-bottom:4px;">We value your privacy (when aligned with our profits)</div>'
            + '<div style="font-size:12px;opacity:0.8;">We use cookies to <s>track you</s> enhance your browsing experience. Your choice won\'t be remembered because, frankly, nobody cares. You\'ll see this again next time. Such is life. <a href="#" id="audio-hint-policy" style="color:#8ecae6;text-decoration:underline;">Cookie Policy</a></div>'
            + '</div>'
            + '<div style="display:flex;gap:8px;flex-shrink:0;">'
            + '<button id="audio-hint-reject" style="background:transparent;border:1px solid #8d99ae;color:#edf2f4;padding:8px 20px;border-radius:4px;font-size:13px;cursor:pointer;">Reject All</button>'
            + '<button id="audio-hint-accept" style="background:#3b82f6;border:none;color:#fff;padding:8px 20px;border-radius:4px;font-size:13px;font-weight:600;cursor:pointer;">Accept All</button>'
            + '</div>';
        document.body.appendChild(banner);
        // Both buttons start the melody
        function onConsent() {
            banner.remove();
            initAudio();
            if (audioCtx && audioCtx.state === "suspended") {
                audioCtx.resume().then(function() {
                    playRickrollAudio();
                    audioUnlocked = true;
                    updateMuteButton(true);
                });
            } else {
                playRickrollAudio();
                audioUnlocked = true;
                updateMuteButton(true);
            }
        }
        banner.querySelector("#audio-hint-accept").addEventListener("click", onConsent);
        banner.querySelector("#audio-hint-reject").addEventListener("click", onConsent);
        banner.querySelector("#audio-hint-policy").addEventListener("click", function(e) {
            e.preventDefault();
            onConsent();
        });
    }

    // --- Init ---
    document.addEventListener("DOMContentLoaded", function() {
        // --- Developer easter eggs in the console ---
        console.log("%c" + [
            " ____  _      _             _ _          _ ",
            "|  _ \\(_) ___| | ___ __ ___| | | ___  __| |",
            "| |_) | |/ __| |/ / '__/ _ \\ | |/ _ \\/ _` |",
            "|  _ <| | (__|   <| | | (_) | | |  __/ (_| |",
            "|_| \\_\\_|\\___|_|\\_\\_|  \\___/|_|_|\\___|\\__,_|"
        ].join("\n"), "color: #e74c3c; font-size: 14px; font-family: monospace;");
        console.log(
            "%cNever Gonna Give You Up",
            "color: #ff6b35; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 0 #c0392b;"
        );
        console.warn("You know the rules and so do I.");
        var muteBtn = document.querySelector(".mute-btn");

        if (muteBtn) {
            muteBtn.addEventListener("click", function(e) {
                e.preventDefault();
                toggleMute();

                if (typeof goatcounter !== "undefined" && goatcounter.count) {
                    goatcounter.count({
                        path: "mute-btn-click",
                        title: "Mute button click",
                        event: true
                    });
                }
            });
        }

        // Always show consent banner, start melody when user clicks
        function startMelody() {
            initAudio();
            if (!audioCtx) return;
            playRickrollAudio();
            audioUnlocked = true;
            updateMuteButton(true);
        }

        // Any click or tap ensures melody is playing (maximum trolling)
        function ensureMelody(e) {
            // Let mute button handle its own clicks
            if (muteBtn && muteBtn.contains(e.target)) return;
            initAudio();
            if (!audioCtx) return;
            if (audioCtx.state === "suspended") {
                audioCtx.resume().then(function() {
                    if (!isPlaying) {
                        playRickrollAudio();
                        audioUnlocked = true;
                        updateMuteButton(true);
                    }
                });
            } else if (!isPlaying) {
                playRickrollAudio();
                audioUnlocked = true;
                updateMuteButton(true);
            }
        }
        document.addEventListener("click", ensureMelody);
        document.addEventListener("touchstart", ensureMelody);

        // Theme-based fake loading or direct reveal
        var theme = getTheme();
        var isKaraoke = window.location.pathname.toLowerCase().indexOf("karaoke") !== -1
            && window.location.pathname.indexOf("/karaoke/") !== 0;
        if (isKaraoke && theme && !prefersReducedMotion) {
            showFakeLoading(theme, function() {
                window.location.href = "/karaoke/";
            });
        } else if (theme && !prefersReducedMotion) {
            showFakeLoading(theme, function() {
                revealRickroll();
                showAudioHint();
            });
        } else {
            revealRickroll();
            showAudioHint();
        }
    });
})();
