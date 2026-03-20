# How to Run Tests

This guide shows you how to run the W.R.A.A.S. test suite.

## Prerequisites

- Node.js
- Dependencies installed (`npm install`)

## Run all tests

```sh
npm test
```

This runs unit tests (Node.js built-in runner) followed by all Playwright tests.

## Run specific test suites

```sh
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests (themes + generator)
npm run test:visual   # Visual regression tests
npm run test:a11y     # Accessibility audits
npm run test:all      # All Playwright tests with HTML report
```

## Run a single test file

```sh
npx playwright test tests/e2e/themes.spec.js
```

## Run a single test by name

```sh
npx playwright test -g "meeting: shows fake loading"
```

## Run in headed mode

See the browser while tests execute:

```sh
npx playwright test --headed
```

## Run in debug mode

Step through tests line by line:

```sh
npx playwright test --debug
```

## Run in CI mode

```sh
CI=1 npm test
```

This enables 2 retries and single-worker mode for consistency.

## Update visual snapshots

When UI changes are intentional, regenerate baseline screenshots:

```sh
npx playwright test --update-snapshots
```

## Troubleshooting

### Tests timeout

- Check if the dev server starts correctly: `curl http://localhost:8080`
- Increase the default timeout in the test: `page.setDefaultTimeout(30000)`

### Audio tests fail

Web Audio API may be blocked in headless environments. The tests handle this gracefully, but if failures persist, run in headed mode to verify.

### Visual tests differ

Monitor resolution differences cause screenshot mismatches across machines. Use `--update-snapshots` to regenerate baselines for your environment.

### Flaky tests

Increase timeouts for animation-dependent assertions. In CI, the 2-retry policy handles most transient failures.
