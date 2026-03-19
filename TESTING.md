# W.R.A.A.S. Testing Suite

Complete testing suite for the W.R.A.A.S. rickroll platform using Playwright (E2E) and Node.js built-in test runner (unit tests).

## Setup

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
npm run test:visual   # Visual regression tests
npm run test:a11y     # Accessibility tests
npm run test:all      # All Playwright tests (reports in HTML)
```

## Test Files Overview

### 1. **package.json** (Root)
- Defines dependencies: `playwright`, `@axe-core/playwright`
- Scripts for running different test suites
- Zero unnecessary dependencies - lightweight setup

### 2. **playwright.config.js** (Root)
- Web server configuration (serves `site/` on port 8080)
- Browser projects: Chromium, Firefox, WebKit
- Test directory: `tests/`
- Screenshot capture on failure
- Trace recording for debugging

---

## Test Files

### E2E Tests: `tests/e2e/themes.spec.js` (#38)
Comprehensive E2E tests for all themed scenarios.

**Coverage:**
- All 8 theme variations:
  - `/meeting` - Meeting redirect
  - `/document` - Shared document review
  - `/password-reset` - Password reset request
  - `/invoice` - Invoice payment notice
  - `/survey` - Quick survey
  - `/clickbait` - Clickbait content
  - `/karaoke` - Karaoke night
  - `/about` - About page
- Base URL (no theme) - direct rickroll without fake loading
- Fake loading screen appears with correct text
- Rickroll reveals after appropriate delay
- Consent banner shows after reveal
- Skip button functionality and troll behavior
- Progress bar animation timing

**Key Assertions:**
- Fake loading overlay visibility and text content
- Rickroll reveal timing and visibility
- Consent banner elements (Accept/Reject buttons)
- Progress bar width increases over time

### Unit Tests: `tests/unit/audio.test.js` (#39)
Playwright-based tests for audio synthesis (Web Audio API runs in-browser).

**Coverage:**
- Melody note sequence frequencies (440 Hz, 493.88 Hz, 587.33 Hz, etc.)
- 113 BPM timing calculations
- Mute/unmute button state changes
- Mute button aria-label updates when toggled
- Consent banner triggers audio playback
- Audio context state management (suspended/running)
- Both Accept and Reject buttons trigger playback

**Key Frequencies Tested:**
- A4: 440 Hz
- B4: 493.88 Hz
- D5: 587.33 Hz
- E5: 659.25 Hz
- F#4: 369.99 Hz
- E4: 329.63 Hz
- D4: 293.66 Hz

### Visual Regression: `tests/visual/rickroll.spec.js` (#40)
Visual regression tests using Playwright's screenshot comparison.

**Coverage:**
- Rickroll reveal sequence stages:
  - Initial reveal
  - Lyrics fully visible
  - Mute button visible
- Mute button states (unmuted/muted icons)
- Consent banner layout
- Fake loading screens for different themes
- Lyrics container styling
- Full page layout
- Generate page layout
- About page layout
- Reduced motion layout (no animations)
- Bottom links visibility
- Responsive layouts:
  - Mobile (375×667)
  - Tablet (768×1024)
  - Desktop (default)

**Screenshot Masks:**
- Hides `<script>` and `<link>` tags for consistency
- Hides GIF background (varies by network timing)
- Masks animated lyric elements on generate page

### Accessibility: `tests/a11y/accessibility.spec.js` (#41)
Automated accessibility audits using @axe-core/playwright.

**Coverage:**
- Main page axe audit after rickroll reveal
- About page audit
- Generate page audit
- ARIA attributes:
  - `aria-live="polite"` on lyrics
  - `aria-atomic="false"` on lyrics
  - `aria-label` on buttons
  - `aria-hidden="true"` on decorative elements
- Focus management (keyboard navigation)
- Color contrast verification
- Semantic structure (headings, main content)
- Form field labels
- Image alt text
- Reduced motion preference (`prefers-reduced-motion: reduce`)
  - All animations disabled
  - Content appears immediately
  - Themed pages skip fake loading
- Link descriptive text
- Page language attribute (`lang="en"`)
- Descriptive page title

**Keyboard Accessibility:**
- Tab/Shift+Tab navigation
- Space bar button activation
- Focus indicators visible

### Integration Tests: `tests/e2e/generator.spec.js` (#42)
Integration tests for the link generator (`/generate/`).

**Coverage:**
- Scenario selection updates preview:
  - Title changes
  - Description changes
  - Pun text changes
- Custom path input functionality:
  - URL generation with custom path
  - Theme keyword detection in custom path
  - Path sanitization (only alphanumeric, hyphens, underscores)
- Copy button:
  - Copies URL to clipboard
  - Shows "Copied!" feedback
  - Feedback auto-reverts after 2s
- QR code canvas:
  - Renders with correct dimensions
  - Contains pixel data (not empty)
  - Updates when URL changes
- Suggestion chips:
  - Appear when theme is selected
  - Disappear when no theme selected
  - Clickable and fill custom path input
  - Multiple suggestions per theme
- URL output:
  - Includes base domain
  - Updates dynamically
  - Shows preview domain (localhost)
- Direct rickroll option:
  - No theme = base URL only
  - Custom path appends to base URL
- QR code download:
  - Button functional
  - Downloads PNG file
  - Filename: `rickroll-qr.png`

---

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### E2E Tests (Themed + Generator)
```bash
npm run test:e2e
```

### Visual Tests
```bash
npm run test:visual
```

### Accessibility Tests
```bash
npm run test:a11y
```

### Headed Mode (see browser)
```bash
npx playwright test --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

### Single Test File
```bash
npx playwright test tests/e2e/themes.spec.js
```

### Single Test
```bash
npx playwright test -g "meeting: shows fake loading"
```

---

## Test Environment

- **Base URL:** `http://localhost:8080`
- **Web Server:** Python dev-server (serves `site/` directory)
- **Auto-start:** Server starts automatically with tests
- **Port:** 8080

## Configuration

### Viewport Sizes
- Desktop: Default (1280×720)
- Mobile: 375×667
- Tablet: 768×1024

### Browsers
- Chromium (default)
- Firefox (concurrent)
- WebKit/Safari (concurrent)

### Retries
- Local: 0 retries
- CI: 2 retries

### Screenshots
- Captured on failure only
- Stored in `test-results/`

---

## Expected Delays & Timeouts

### Theme Fake Loading Delays
- Meeting: 2000ms
- Document: 2500ms
- Password Reset: 2000ms
- Invoice: 2200ms
- Survey: 1800ms
- Clickbait: 2500ms
- Karaoke: 2000ms
- About: 2000ms

### Rickroll Reveal Timing
- Initial delay: 600ms
- Per-line delay: 300ms
- 6 lines total: 600ms + (6 × 300ms) = 2400ms

### Audio Timing
- 113 BPM = 0.531 seconds per beat
- Eighth note: 0.265 seconds
- Quarter note: 0.531 seconds
- Dotted quarter: 0.796 seconds

---

## Accessibility Standards

- WCAG 2.1 Level AA compliance
- Axe-core v4.8+ audit
- Keyboard navigation fully functional
- Screen reader compatible
- Reduced motion respected
- Color contrast ≥ 4.5:1 for text

---

## CI/CD Integration

Tests are optimized for CI environments:
- Single worker for consistency
- 2 retries for flaky tests
- HTML report generated
- Screenshots for failures
- Trace recordings included

To run in CI:
```bash
CI=1 npm test
```

---

## Debugging

### View Traces
```bash
npx playwright show-trace test-results/trace.zip
```

### View Screenshots
```bash
ls test-results/*.png
```

### Open HTML Report
```bash
npx playwright show-report
```

### Run with Debugging
```bash
npx playwright test --debug
# Press "Step over" to execute test line by line
```

---

## Common Issues

### Tests Timeout
- Increase timeout in test: `test('...', async ({ page }) => { page.setDefaultTimeout(30000); ... })`
- Check if dev-server is running: `curl http://localhost:8080`

### Audio Tests Fail
- Web Audio API may be blocked in some environments
- Tests check for audio context availability gracefully

### Visual Tests Differ
- Monitor resolution differences can cause screenshot mismatches
- Use `--update-snapshots` to regenerate: `npx playwright test --update-snapshots`

### Flaky Tests
- Increase timeouts for animations: `await page.waitForTimeout(3000);`
- Use retries in CI mode

---

## Best Practices

1. **Parallel Execution:** Tests run in parallel by default for speed
2. **Isolation:** Each test is independent and can run alone
3. **No External Deps:** Only Playwright and axe-core required
4. **Lightweight:** Uses Node.js built-in test runner, no Jest/Mocha overhead
5. **Maintainability:** Clear test names and organized by feature
6. **Accessibility First:** A11y tests ensure inclusive design

---

## Contributing Tests

When adding new features:

1. Add E2E tests in `tests/e2e/`
2. Add unit tests in `tests/unit/`
3. Add visual tests in `tests/visual/` if UI changes
4. Add a11y tests if new interactive elements
5. Update this file with new test coverage

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
