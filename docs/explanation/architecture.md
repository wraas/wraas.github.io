# How the Rickroll Pipeline Works

Every visit to wraas.github.io passes through a four-stage pipeline: **routing**, **fake loading**, **reveal**, and **audio**. Each stage is designed to maximize the deception and ensure no visitor escapes unrickrolled.

## The entry point: GitHub Pages 404

GitHub Pages serves `404.html` for any URL that doesn't match a real file. W.R.A.A.S. exploits this by making `404.html` and `index.html` identical — the rickroll page. This means every possible URL (`/quarterly-report`, `/onboarding-form`, `/literally-anything`) serves the same rickroll.

The only real pages that exist as separate files are `/about/`, `/chuck/`, `/generate/`, and `/karaoke/`. Everything else hits the 404 catch-all.

## Stage 1: Routing

When `script.js` loads, the first thing it does is check the URL path against the `themes` object — a map of paths to fake loading screen configurations:

```js
var themes = {
    "/meeting": {
        loadingText: "Redirecting to your meeting...",
        fakeDelay: 2000,
        title: "You've been invited to a meeting",
        desc: "Your attendance is required."
    },
    // ...
};
```

The router tries two matching strategies:

1. **Exact match** — `/meeting` matches the `/meeting` theme directly.
2. **Keyword match** — `/my-team-meeting-notes` matches because it contains the keyword `meeting`.

If a theme matches, the browser tab title and meta description are updated to match the theme's `title` and `desc` before any visual changes occur. This sells the deception in the brief moment before the page renders.

If no theme matches, the rickroll reveals immediately with no fake loading.

## Stage 2: Fake loading

For themed URLs, a white overlay appears with a spinner and the theme's `loadingText`. This is the key deception layer — the victim sees a professional-looking loading screen and believes they're waiting for a real document, meeting link, or invoice.

The overlay includes a progress bar that advances through scripted steps (15%, 35%, 58%, 72%, 89%, 94%) at fixed intervals, creating the illusion of a real page load.

A "Taking too long? Click to speed up" skip button is pure trolling: each click resets the timer and adds 1.5 seconds of extra delay, cycling through messages like "Optimizing connection..." and "Recalibrating servers..." to keep the victim waiting longer.

After the theme's `fakeDelay` elapses (1.8s–2.5s depending on the theme), the progress bar jumps to 100% and the overlay fades out, revealing the rickroll beneath.

## Stage 3: Reveal

The reveal sequence is a timed animation:

1. The Rick Astley GIF background fades in (via the `.visible` CSS class on `.rick-bg`).
2. Each lyric line fades in one by one — 600ms initial delay, then 300ms between each line.
3. The mute button appears after the last lyric line.

If the user has `prefers-reduced-motion` enabled, all animations are skipped: lyrics, GIF, and mute button appear instantly. The fake loading stage is also skipped entirely.

## Stage 4: Audio

The melody is synthesized entirely in-browser using the Web Audio API. No audio files are loaded — the notes of "Never Gonna Give You Up" are defined as an array of frequency/duration pairs and played through square wave oscillators at 113 BPM (the original song's tempo).

Audio in browsers requires a user gesture to start. W.R.A.A.S. handles this with two mechanisms:

1. **Consent banner** — A fake cookie consent banner appears after the reveal. Both "Accept All" and "Reject All" trigger the melody (the choice was never real).
2. **Global click/tap listener** — Any click or tap anywhere on the page starts the melody if it isn't already playing, ensuring eventual rickrolling even if the banner is dismissed.

The melody loops indefinitely. The mute button suspends and resumes the AudioContext without destroying it, so unmuting picks up where the music left off.

## Link expiration

Links created with the generator can include an `?expires=` query parameter (a Unix timestamp). When `script.js` loads, it checks this parameter first — if the link has expired, it shows a static "This link has expired" page and short-circuits the entire pipeline. No rickroll, no audio. The victim gets away clean.

## Blocker detection

After the reveal, a background check looks for signs that the rickroll might be blocked:

- The GIF failed to load (blocked by a content blocker or ad blocker).
- The Web Audio API is unavailable or errored.
- Known rickroll-blocker extension markers exist in the DOM.

If a blocker is detected, the page falls back to a gradient background with pulsing lyrics and a notice: "It seems you have excellent taste in browser extensions. But you can't escape Rick."

## Service worker

A service worker (`sw.js`) caches critical assets (HTML, CSS, JS, GIF, WebP, fonts) for offline access. Once cached, the rickroll works without an internet connection. There is no escape.
