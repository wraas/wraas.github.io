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

See [How to Run Locally](docs/how-to/run-locally.md) for setup and dev server instructions.

### Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for guides on adding themes, running tests, and submitting PRs. New contributors should start with the [First Theme Tutorial](docs/tutorials/first-theme.md).

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

Five GitHub Actions workflows keep the rickroll alive:

- **CI** — Runs on every PR and push to `main`. Lints HTML, CSS, and JS via `just lint`, checks that critical external URLs are reachable, and validates OG metadata on the rickroll pages. Comments on the PR with details if anything fails.
- **Check robots.txt** — Validates `robots.txt` syntax on every PR that modifies it. Ensures directives are valid, every `Allow`/`Disallow` has a preceding `User-agent`, and the catch-all `User-agent: *` rule exists.
- **Check SRI Hash** — Runs daily. Verifies the GoatCounter `count.js` SRI integrity hash is still valid and opens a PR to update it if it has changed.
- **Lighthouse CI** — Audits performance, accessibility, best practices, and SEO on every PR and push to `main`. Comments scores on the PR; all categories must score 90+.
- **Broken Links** — Runs weekly and on push to `main`. Checks all links in `site/` and auto-creates an issue if any are broken.
- **Preview Build** — Builds the site on every PR and uploads the artifact for local preview.

### Analytics

Page views and mute button clicks are tracked via [GoatCounter](https://www.goatcounter.com/) — a privacy-friendly, open-source analytics platform. No cookies, no personal data collection.

---

## Tech Stack

- **Zero dependencies** — No frameworks, no jQuery, no Bootstrap. Pure vanilla HTML, CSS, and JavaScript.
- **GitHub Pages** — Static hosting with custom 404.html for universal path matching
- **Web Audio API** — Synthesized melody without external audio files
- **GoatCounter** — Privacy-respecting analytics
- **GitHub Actions** — CI lint checks, Lighthouse audits, broken link monitoring, and PR preview builds

## File Structure

```
site/
├── 404.html              # The rickroll (served for all unknown paths)
├── index.html            # The rickroll (served for the root path)
├── style.css             # Styles, animations, fake loading overlay
├── script.js             # Reveal sequence, audio system, theme router
├── sw.js                 # Service worker for offline caching
├── rick.gif              # Self-hosted Rick Astley GIF
├── rick.webp             # WebP version of the GIF
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
    ├── index.html        # Karaoke troll page
    └── karaoke.js        # Karaoke page JavaScript module

.github/workflows/
├── check-robots-txt.yaml # robots.txt syntax validation on PR
├── check-sri.yaml        # Daily GoatCounter SRI hash verification
├── ci.yaml               # Lint, external URL checks, OG validation
├── deploy.yaml           # GitHub Pages deployment
├── lighthouse.yaml       # Lighthouse performance audits
├── links.yaml            # Broken link checker
└── preview.yaml          # PR preview build

docs/
├── tutorials/
│   └── first-theme.md            # End-to-end tutorial for new contributors
├── how-to/
│   ├── add-a-theme.md            # Add a themed scenario
│   ├── debug-ci-failures.md      # Diagnose and fix CI failures
│   ├── run-locally.md            # Set up the dev environment
│   ├── run-tests.md              # Run the test suite
│   └── submit-a-pr.md            # Open a pull request
├── explanation/
│   ├── architecture.md           # How the rickroll pipeline works
│   ├── image-formats.md          # Why both GIF and WebP
│   └── sri-and-supply-chain.md   # SRI trade-offs for third-party scripts
└── reference/
    ├── ci-workflows.md           # GitHub Actions workflow reference
    ├── test-suite.md             # Test catalog, coverage, and timing
    └── theme-configuration.md    # Theme object fields and constraints
```

## License

[The Unlicense](LICENSE) — Public domain. Do whatever you want with it.
