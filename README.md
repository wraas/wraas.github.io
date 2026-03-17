# W.R.A.A.S.

**W**eb **R**ickroll **A**s **A** **S**ervice — the internet's most over-engineered rickroll.

Send someone a link. Any link. They all lead to Rick.

**https://wraas.github.io**

---

## Features

### The Rickroll

Every URL on `wraas.github.io` is a rickroll. The root path, any subpath, any typo — they all serve the same fate:

- Full-screen Rick Astley dancing GIF as background
- Iconic chorus lyrics fading in line by line with a dramatic reveal sequence (600ms initial delay, 300ms per line)
- Synthesized melody of "Never Gonna Give You Up" plays automatically on first click/tap via the Web Audio API
- Mute/unmute toggle button with animated speaker icon

### Disguised Link Previews

When shared on Slack, Discord, Twitter, iMessage, or any platform that renders Open Graph previews, the link appears as:

> **Important Notice — Action Required**
> You have a pending action that requires your immediate attention. Please review this document.
> *Secure Document Portal*

Complete with a professional-looking OG image resembling a secure document notification and an innocent document favicon in the browser tab.

### Themed Scenarios

Certain URL paths show a fake loading screen (white page, spinner, contextual text) before revealing the rickroll, making the deception more convincing:

| Path | Loading text | Delay |
|------|-------------|-------|
| [`/meeting`](https://wraas.github.io/meeting) | "Redirecting to your meeting..." | 2.0s |
| [`/document`](https://wraas.github.io/document) | "Opening shared document..." | 2.5s |
| [`/password-reset`](https://wraas.github.io/password-reset) | "Verifying your identity..." | 2.0s |
| [`/invoice`](https://wraas.github.io/invoice) | "Loading invoice #48291..." | 2.2s |
| [`/survey`](https://wraas.github.io/survey) | "Loading survey..." | 1.8s |

Any other path (e.g. `/quarterly-report`, `/onboarding-form`) skips the loading screen and goes straight to Rick.

### Link Generator

Visit **[wraas.github.io/generate](https://wraas.github.io/generate)** to create disguised rickroll links:

- Pick a themed scenario or use a custom path
- One-click copy to clipboard
- Live preview of how the link will appear when shared

The generator page itself is excluded from search engines via `noindex`.

### Audio

The melody is synthesized in-browser using the Web Audio API — no external audio files, no copyright-infringing mp3s. Just square wave oscillators playing the iconic notes at low volume.

- Triggers automatically on first user interaction (click or tap anywhere)
- Mute button toggles playback without navigating away from the page
- Speaker icon updates dynamically (muted/unmuted state)

### Accessibility

- Respects `prefers-reduced-motion`: all animations are disabled, lyrics and GIF appear instantly
- Lyrics container uses `aria-live="polite"` so screen readers announce lines as they appear
- Mute button is a semantic `<button>` element with descriptive `aria-label`
- Focus-visible outline on interactive elements

### The robots.txt

The [`robots.txt`](https://wraas.github.io/robots.txt) is itself a rickroll. AI crawlers are sent on a wild goose chase through lyric-themed `Disallow` paths:

```
User-agent: GPTBot
Disallow: /never-gonna-give-you-up
Disallow: /never-gonna-let-you-down

User-agent: Claude-bot
Disallow: /never-gonna-make-you-cry
Disallow: /never-gonna-say-goodbye
```

The sitemap points to the YouTube video. The `Crawl-delay` is set to `143` — the BPM of "Never Gonna Give You Up."

### CI/CD

Two GitHub Actions workflows keep the rickroll alive:

- **Check YouTube Videos** — Runs daily at 08:00 UTC and on every PR. Extracts all YouTube URLs from `docs/`, checks their availability via oEmbed API and playability status. Opens an issue or comments on the PR if a video goes down.
- **Check robots.txt** — Validates `robots.txt` syntax on every PR that modifies it. Ensures directives are valid, every `Allow`/`Disallow` has a preceding `User-agent`, and the catch-all `User-agent: *` rule exists.

### Analytics

Page views and mute button clicks are tracked via [GoatCounter](https://www.goatcounter.com/) — a privacy-friendly, open-source analytics platform. No cookies, no personal data collection.

---

## Tech Stack

- **Zero dependencies** — No frameworks, no jQuery, no Bootstrap. Pure vanilla HTML, CSS, and JavaScript.
- **GitHub Pages** — Static hosting with custom 404.html for universal path matching
- **Web Audio API** — Synthesized melody without external audio files
- **GoatCounter** — Privacy-respecting analytics
- **GitHub Actions** — Automated video availability and robots.txt validation

## File Structure

```
docs/
├── 404.html              # The rickroll (served for all unknown paths)
├── index.html            # The rickroll (served for the root path)
├── style.css             # Styles, animations, fake loading overlay
├── script.js             # Reveal sequence, audio system, theme router
├── robots.txt            # The other rickroll
├── og-image.png          # Social media preview image
├── og-image.svg          # Source SVG for the OG image
└── generate/
    └── index.html        # Link disguise generator tool

.github/workflows/
├── check-videos.yaml     # Daily YouTube availability check
└── check-robots-txt.yaml # robots.txt syntax validation on PR
```

## License

[The Unlicense](LICENSE) — Public domain. Do whatever you want with it.
