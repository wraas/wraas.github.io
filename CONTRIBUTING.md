# How to Contribute to W.R.A.A.S.

## Prerequisites

- Python 3 (for the local dev server)
- [just](https://github.com/casey/just) (command runner)
- Node.js (for running tests)

## Set up your environment

```sh
# Start the local dev server (serves on http://localhost:8000)
just dev

# Install test dependencies
npm install
```

The dev server mimics GitHub Pages 404 behavior — all unknown paths serve `404.html`, just like production.

## How to add a themed scenario

Themed scenarios show a fake loading screen before the rickroll reveal.

### 1. Add the theme entry

Add an entry to the `themes` object in `site/script.js`:

```js
"/your-path": {
    loadingText: "Your loading message...",
    fakeDelay: 2000,
    title: "Browser Tab Title",
    desc: "Description for OG meta tag."
}
```

- `loadingText` — What the victim sees during the fake loading screen.
- `fakeDelay` — How long (in ms) to show the loading screen before the rickroll. Keep it between 1500–3000ms for believability.
- `title` — Sets the browser tab title while the loading screen is active.
- `desc` — Used in Open Graph meta tags when the link is shared on social platforms.

### 2. Test your theme locally

```sh
just dev
# Open http://localhost:8000/your-path in a browser
```

Verify that:
- The loading screen appears with your text
- The rickroll reveals after the specified delay
- The browser tab shows your title

### 3. Add tests for your theme

Add your new path to the E2E theme tests in `tests/e2e/themes.spec.js`. See `TESTING.md` for details on running the test suite.

### 4. Update the README

Add your theme to the "Themed Scenarios" table in `README.md`.

## How to run checks

```sh
# Lint HTML, CSS, and JS
just lint

# Run all tests
npm test

# Run specific test suites
npm run test:e2e      # E2E tests
npm run test:unit     # Unit tests
npm run test:visual   # Visual regression
npm run test:a11y     # Accessibility
```

See `TESTING.md` for the full testing reference.

## How to submit a pull request

1. Fork the repository and create a branch from `main`.
2. Make your changes and verify they work locally with `just dev`.
3. Run `just lint` and `npm test` to ensure nothing is broken.
4. Open a pull request with a clear description of what your change does.

CI will automatically run lint checks, URL validation, and OG metadata verification on your PR.
