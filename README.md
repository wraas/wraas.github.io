# W.R.A.A.S.

> [!NOTE]
> **W**e **R**ickroll **A**bsolutely **A**nyone, **S**eriously.
> Trusted by 0 enterprises. Feared by all.

Send someone a link. Any link. They all lead to Rick.

<https://wraas.github.io>

---

## Usage

### Send a rickroll

Pick any URL on `wraas.github.io` and send it to your target:

1. **Quick** — Send `https://wraas.github.io` directly. It works, but the domain is suspicious.
2. **Themed** — Use a path like `https://wraas.github.io/meeting` or `https://wraas.github.io/invoice` for a fake loading screen that sells the deception.
3. **Custom** — Use the [link generator](https://wraas.github.io/generate) to pick a scenario and copy a ready-to-share link.

Any path that doesn't match a themed scenario goes straight to Rick — so `https://wraas.github.io/quarterly-report` works just as well.

### Run locally

Prerequisites: Python 3 and [just](https://github.com/casey/just).

```sh
just dev
```

This starts a local server at `http://localhost:8000` that mimics GitHub Pages 404 behavior (all unknown paths serve `404.html`).

To verify the developer easter eggs:

```sh
# Check custom HTTP headers
curl -I http://localhost:8000

# Check humans.txt
curl http://localhost:8000/humans.txt

# Check security.txt
curl http://localhost:8000/.well-known/security.txt
```

Then open `http://localhost:8000` in a browser and check the DevTools console for ASCII art.

### Add a themed scenario

See [CONTRIBUTING.md](CONTRIBUTING.md) for a step-by-step guide on adding new themed scenarios.

---

## Features

### The Rickroll

Every URL on `wraas.github.io` is a rickroll. The root path, any subpath, any typo — they all serve the same fate:

- Full-screen Rick Astley dancing GIF as background
- Iconic chorus lyrics fading in line by line with a dramatic reveal sequence (600ms initial delay, 300ms per line)
- Synthesized melody of "Never Gonna Give You Up" plays automatically on first click/tap via the Web Audio API
- Mute/unmute toggle button with animated speaker icon
- Browser tab title cycles through lyrics every 3 seconds

### Disguised Link Previews

When shared on Slack, Discord, Twitter, iMessage, or any platform that renders Open Graph previews, the link appears as:

> **Important Notice — Action Required**
> You have a pending action that requires your immediate attention. Please review this document.
> *Secure Document Portal*

Complete with a professional-looking OG image resembling a secure document notification and an innocent document favicon in the browser tab.

### Themed Scenarios

Certain URL paths show a fake loading screen (white page, spinner, contextual text) before revealing the rickroll, making the deception more convincing:

| Path                                                        | Loading text                     | Delay |
| ----------------------------------------------------------- | -------------------------------- | ----- |
| [`/meeting`](https://wraas.github.io/meeting)               | "Redirecting to your meeting..." | 2.0s  |
| [`/document`](https://wraas.github.io/document)             | "Opening shared document..."     | 2.5s  |
| [`/password-reset`](https://wraas.github.io/password-reset) | "Verifying your identity..."     | 2.0s  |
| [`/invoice`](https://wraas.github.io/invoice)               | "Loading invoice #48291..."      | 2.2s  |
| [`/survey`](https://wraas.github.io/survey)                 | "Loading survey..."              | 1.8s  |
| [`/clickbait`](https://wraas.github.io/clickbait)           | "Loading exclusive content..."   | 2.5s  |
| [`/karaoke`](https://wraas.github.io/karaoke)               | "Warming up the mic..."          | 2.0s  |
| [`/about`](https://wraas.github.io/about)                   | "Loading the manifesto..."       | 2.0s  |

Any other path (e.g. `/quarterly-report`, `/onboarding-form`) skips the loading screen and goes straight to Rick.

### Link Generator

Visit **[wraas.github.io/generate](https://wraas.github.io/generate)** to create disguised rickroll links:

- Pick a themed scenario or use a custom path
- One-click copy to clipboard
- Live preview of how the link will appear when shared
- QR code generated inline — save as PNG for printing or sharing

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

The sitemap points to the YouTube video. The `Crawl-delay` is set to `113` — the BPM of "Never Gonna Give You Up."

### Developer Easter Eggs

Developers who inspect the site get rickrolled too:

- **Browser console** — Opening DevTools reveals ASCII art, a styled "Never Gonna Give You Up" banner, and a `console.warn` with lyrics
- **View source** — Both `index.html` and `404.html` contain a large ASCII art comment with "Never Gonna Give You Up" in the `<head>`
- **CSS source** — `style.css` opens with a "Style Guide" comment where every rule is a lyric
- **HTTP headers** — The dev server adds `X-Rickroll`, `X-Song-BPM`, and `X-Lyrics` headers to every response (visible via `curl -I` or the Network tab)
- **[`/humans.txt`](https://wraas.github.io/humans.txt)** — Standard `humans.txt` format listing Rick Astley as the team
- **[`/.well-known/security.txt`](https://wraas.github.io/.well-known/security.txt)** — Security contact points to the YouTube video

### CI/CD

Two GitHub Actions workflows keep the rickroll alive:

- **CI** — Runs on every PR and push to `main`. Lints HTML, CSS, and JS via `just lint`, checks that critical external URLs are reachable (Rick GIF, Google Fonts, GoatCounter), and validates OG metadata on the rickroll pages. Comments on the PR with details if anything fails.
- **Check robots.txt** — Validates `robots.txt` syntax on every PR that modifies it. Ensures directives are valid, every `Allow`/`Disallow` has a preceding `User-agent`, and the catch-all `User-agent: *` rule exists.

### Analytics

Page views and mute button clicks are tracked via [GoatCounter](https://www.goatcounter.com/) — a privacy-friendly, open-source analytics platform. No cookies, no personal data collection.

---

## Tech Stack

- **Zero dependencies** — No frameworks, no jQuery, no Bootstrap. Pure vanilla HTML, CSS, and JavaScript.
- **GitHub Pages** — Static hosting with custom 404.html for universal path matching
- **Web Audio API** — Synthesized melody without external audio files
- **GoatCounter** — Privacy-respecting analytics
- **GitHub Actions** — CI lint checks, external URL validation, and robots.txt syntax enforcement

## File Structure

```
site/
├── 404.html              # The rickroll (served for all unknown paths)
├── index.html            # The rickroll (served for the root path)
├── style.css             # Styles, animations, fake loading overlay
├── script.js             # Reveal sequence, audio system, theme router
├── robots.txt            # The other rickroll
├── humans.txt            # Rickrolled humans.txt
├── og-image.png          # Social media preview image
├── og-image.svg          # Source SVG for the OG image
├── .well-known/
│   └── security.txt      # Rickrolled security.txt
├── about/
│   └── index.html        # The W.R.A.A.S. manifesto (also a rickroll)
├── generate/
│   └── index.html        # Link disguise generator tool
└── karaoke/
    └── index.html        # Karaoke troll page

.github/workflows/
├── ci.yaml               # Lint, external URL checks, OG validation
└── check-robots-txt.yaml # robots.txt syntax validation on PR
```

## License

[The Unlicense](LICENSE) — Public domain. Do whatever you want with it.
