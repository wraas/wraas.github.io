# Tutorial: Create Your First Themed Scenario

In this tutorial, you will add a new themed rickroll scenario from scratch — a fake loading screen that disguises the rickroll behind a convincing pretext.

By the end, you will have a working theme that shows a custom loading message, updates the browser tab title, and reveals Rick after a timed delay.

## Prerequisites

- Python 3
- [just](https://github.com/casey/just) installed
- Node.js (for running tests)
- A clone of the repository

## Step 1: Start the dev server

```sh
just dev
```

Open `http://localhost:8000` in your browser. You should see the rickroll. This is the base experience — no loading screen, straight to Rick.

Now try `http://localhost:8000/meeting`. You will see a white page with "Redirecting to your meeting..." before the rickroll reveals. That is a themed scenario. You are about to build one.

## Step 2: Pick your theme

Choose a scenario that would make a convincing link. Good themes impersonate something the victim expects — a shared document, a calendar invite, a support ticket. For this tutorial, we will create a `/ticket` theme that pretends to be a support ticket.

## Step 3: Add the theme entry

Open `site/script.js` and find the `themes` object near the top of the file. Add your new theme:

```js
"/ticket": {
    loadingText: "Loading support ticket #7291...",
    fakeDelay: 2200,
    title: "Support Ticket #7291 — Urgent",
    desc: "A support ticket has been assigned to you. Please review and respond within 24 hours."
},
```

A few things to note:

- **`loadingText`** is what the victim sees on the white loading screen. Use a present participle ("Loading...", "Opening...") to match real loading screens.
- **`fakeDelay`** is how long the loading screen lasts in milliseconds. 2200ms is a sweet spot — long enough to be convincing, short enough that the victim does not leave.
- **`title`** replaces the browser tab title. The victim sees this while the page "loads".
- **`desc`** sets the Open Graph description — what appears when the link is previewed on Slack, Discord, or iMessage.

See the [Theme Configuration Reference](../reference/theme-configuration.md) for the full field spec and constraints.

## Step 4: Test it locally

With the dev server still running, visit `http://localhost:8000/ticket` in your browser.

You should see:

1. A white page with a spinner and "Loading support ticket #7291..."
2. A progress bar advancing smoothly
3. A "Taking too long?" skip button (try clicking it — it adds delay instead of skipping)
4. After ~2.2 seconds, the rickroll reveals with lyrics fading in line by line

Also check that keyword matching works: visit `http://localhost:8000/my-ticket-queue`. It should trigger the same theme because the URL contains the word "ticket".

## Step 5: Add a test

Open `tests/e2e/themes.spec.js` and add your theme to the test suite. Follow the pattern of the existing theme tests:

```js
test("ticket: shows fake loading then rickroll", async ({ page }) => {
    await page.goto("/ticket");
    const overlay = page.locator("#fake-loading");
    await expect(overlay).toBeVisible();
    await expect(page.locator("#fake-loading-text")).toHaveText(
        "Loading support ticket #7291..."
    );
    await expect(overlay).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator(".rick-bg")).toBeVisible();
});
```

Run the test to verify it passes:

```sh
npx playwright test -g "ticket"
```

## Step 6: Update the README

Add your theme to the "Themed Scenarios" table in `README.md`:

```markdown
| [`/ticket`](https://wraas.github.io/ticket) | "Loading support ticket #7291..." | 2.2s |
```

## What you've learned

- Where themes are defined (`site/script.js` → `themes` object)
- What each theme field does and how it maps to the user experience
- How path matching works (exact match first, then keyword match)
- How to test a theme locally and with Playwright
- How the fake loading screen, progress bar, and skip button interact

## Next steps

- Read the [Architecture](../explanation/architecture.md) doc to understand the full rickroll pipeline
- Read the [Theme Configuration Reference](../reference/theme-configuration.md) for constraints and edge cases
- See [How to Run Tests](../how-to/run-tests.md) for the full test command reference
