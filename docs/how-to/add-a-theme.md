# How to Add a Themed Scenario

This guide shows you how to add a new fake loading screen theme to W.R.A.A.S.

## Prerequisites

- Local dev environment set up (see [How to Run Locally](run-locally.md))
- Familiarity with the theme fields (see [Theme Configuration Reference](../reference/theme-configuration.md))

## Steps

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

### 2. Test locally

```sh
just dev
# Open http://localhost:8000/your-path in a browser
```

Verify that:

- The loading screen appears with your text
- The rickroll reveals after the specified delay
- The browser tab shows your title

### 3. Add tests

Add your new path to the E2E theme tests in `tests/e2e/themes.spec.js`. See [How to Run Tests](run-tests.md) for details on the test suite.

### 4. Update the README

Add your theme to the "Themed Scenarios" table in `README.md`.

### 5. Submit a pull request

See [How to Submit a Pull Request](submit-a-pr.md).
