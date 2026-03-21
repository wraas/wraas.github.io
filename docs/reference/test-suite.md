# Test Suite Reference

Complete catalog of the W.R.A.A.S. test suite. For instructions on running tests, see [How to Run Tests](../how-to/run-tests.md).

## Dependencies

| Package | Purpose |
|---------|---------|
| `playwright` | Browser automation for E2E, visual, and accessibility tests |
| `@axe-core/playwright` | Automated WCAG 2.1 accessibility audits |

No runtime dependencies. Unit tests use the Node.js built-in test runner.

## Configuration

**File:** `playwright.config.js`

| Setting | Value |
|---------|-------|
| Base URL | `http://localhost:8080` |
| Web server | `python3 dev-server.py` (auto-started) |
| Browsers | Chromium, Firefox, WebKit |
| Retries (local) | 0 |
| Retries (CI) | 2 |
| Workers (CI) | 1 |
| Screenshots | On failure only, stored in `test-results/` |
| Traces | On first retry |

### Viewport sizes

| Profile | Dimensions |
|---------|-----------|
| Desktop | 1280 x 720 (default) |
| Mobile | 375 x 667 |
| Tablet | 768 x 1024 |

## Test files

### `tests/e2e/themes.spec.js`

E2E tests for all themed scenarios.

**Coverage:**
- All 9 theme variations (`/meeting`, `/document`, `/password-reset`, `/invoice`, `/survey`, `/clickbait`, `/karaoke`, `/about`, `/chuck`)
- Base URL (no theme) — direct rickroll without fake loading
- Fake loading overlay visibility and text content
- Rickroll reveal timing and visibility
- Consent banner elements (Accept/Reject buttons)
- Skip button troll behavior
- Progress bar animation timing

### `tests/e2e/generator.spec.js`

Integration tests for the link generator (`/generate/`).

**Coverage:**
- Scenario selection updates preview (title, description, pun)
- Custom path input (URL generation, keyword detection, path sanitization)
- Copy button (clipboard API, "Copied!" feedback, auto-revert after 2s)
- QR code canvas (dimensions, pixel data, updates on URL change)
- Suggestion chips (appear/disappear, clickable, fill input)
- URL output (base domain, dynamic updates)
- QR code download (PNG file, filename `rickroll-qr.png`)

### `tests/unit/audio.test.js`

Unit tests for audio synthesis (runs in-browser via Playwright).

**Coverage:**
- Melody note frequencies (A4: 440 Hz, B4: 493.88 Hz, D5: 587.33 Hz, E5: 659.25 Hz, F#4: 369.99 Hz, E4: 329.63 Hz, D4: 293.66 Hz)
- 113 BPM timing calculations
- Mute/unmute button state and aria-label
- Consent banner triggers audio playback
- Audio context state management (suspended/running)
- Both Accept and Reject buttons trigger playback

### `tests/visual/rickroll.spec.js`

Visual regression tests using Playwright screenshot comparison.

**Coverage:**
- Rickroll reveal stages (initial, lyrics visible, mute button visible)
- Mute button states (unmuted/muted icons)
- Consent banner layout
- Fake loading screens per theme
- Full page layout, generate page, about page
- Reduced motion layout (no animations)
- Responsive layouts (mobile, tablet, desktop)

**Screenshot masks:** hides `<script>`/`<link>` tags, GIF background, and animated lyrics for consistency.

### `tests/a11y/accessibility.spec.js`

Accessibility audits using axe-core.

**Coverage:**
- Axe audit on main page (post-reveal), about page, generate page
- ARIA attributes (`aria-live="polite"`, `aria-atomic="false"`, `aria-label`, `aria-hidden="true"`)
- Focus management (Tab/Shift+Tab navigation, Space bar activation, focus indicators)
- Color contrast (>= 4.5:1)
- Semantic structure (headings, `<main>`, form labels, image alt text)
- `prefers-reduced-motion: reduce` (animations disabled, content instant, themed pages skip loading)
- Page language attribute (`lang="en"`)
- Descriptive page title

**Standards:** WCAG 2.1 Level AA

## Expected timing values

### Theme fake loading delays

| Theme | Delay |
|-------|-------|
| Meeting | 2000ms |
| Document | 2500ms |
| Password Reset | 2000ms |
| Invoice | 2200ms |
| Survey | 1800ms |
| Clickbait | 2500ms |
| Karaoke | 2000ms |
| About | 2000ms |
| Chuck | 2500ms |

### Rickroll reveal timing

| Phase | Duration |
|-------|----------|
| Initial delay | 600ms |
| Per-line delay | 300ms |
| Total (6 lines) | 600 + (6 x 300) = 2400ms |

### Audio timing (113 BPM)

| Note value | Duration |
|-----------|----------|
| Eighth note | 0.265s |
| Quarter note | 0.531s |
| Dotted quarter | 0.796s |
