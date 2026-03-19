# Theme Configuration Reference

Themes are defined in the `themes` object in `site/script.js`. Each theme maps a URL path to a fake loading screen configuration that plays before the rickroll reveal.

## Theme object

```js
var themes = {
    "/path": {
        loadingText: "string",
        fakeDelay: number,
        title: "string",
        desc: "string"
    }
};
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `loadingText` | string | Yes | Text displayed on the fake loading overlay. Should read like a real loading message for the scenario. |
| `fakeDelay` | number | Yes | Duration in milliseconds before the loading overlay dismisses and the rickroll reveals. |
| `title` | string | Yes | Sets the browser tab title when the themed URL is visited. Also used as the `og:title` override. |
| `desc` | string | Yes | Sets the meta description when the themed URL is visited. Also used as the `og:description` override. |

## Constraints

- **`fakeDelay`** — Keep between 1500ms and 3000ms. Below 1500ms the loading screen flashes too fast to be convincing. Above 3000ms the victim may leave before the reveal.
- **`loadingText`** — Use present participle form ("Loading...", "Redirecting...", "Verifying...") to match the conventions of real loading screens.
- **`title`** — Keep under 60 characters. This is what appears in the browser tab and in Open Graph previews when the link is shared.
- **`desc`** — Keep under 160 characters. This appears in Open Graph previews on social platforms.

## Path matching

The object key (e.g. `"/meeting"`) doubles as both an exact path and a keyword:

1. **Exact match** — The URL path `/meeting` (with or without trailing slash) matches first.
2. **Keyword match** — If no exact match, the path is searched for any theme keyword. `/my-team-meeting-recap` matches because it contains `meeting`.
3. **First match wins** — Keywords are checked in object insertion order. If a URL contains multiple keywords, the first defined theme wins.
4. **No match** — If no theme matches, the rickroll reveals immediately with no fake loading.

## Current themes

| Path | `loadingText` | `fakeDelay` | `title` |
|------|---------------|-------------|---------|
| `/meeting` | Redirecting to your meeting... | 2000ms | You've been invited to a meeting |
| `/document` | Opening shared document... | 2500ms | Shared Document — Review Required |
| `/password-reset` | Verifying your identity... | 2000ms | Password Reset Request |
| `/invoice` | Loading invoice #48291... | 2200ms | Invoice #48291 — Payment Due |
| `/survey` | Loading survey... | 1800ms | Quick Survey — Your Feedback Matters |
| `/clickbait` | Loading exclusive content... | 2500ms | You Won't Believe What Happens Next |
| `/karaoke` | Warming up the mic... | 2000ms | Karaoke Night — Pick Your Song! |
| `/about` | Loading the manifesto... | 2000ms | About W.R.A.A.S. — Our Mission |

## Skip button behavior

The fake loading overlay includes a "Taking too long? Click to speed up" button. Each click:

1. Resets the dismiss timer and adds 1.5 seconds of delay.
2. Changes the `loadingText` to a troll message ("Optimizing connection...", "Almost there, please wait...", "Recalibrating servers...", "Just a moment longer...").
3. Resets the progress bar to 42%.
4. After 4 clicks, the button text changes to "We appreciate your patience" and becomes inert.

This behavior is hardcoded and cannot be configured per-theme.

## Adding a new theme

1. Add an entry to the `themes` object in `site/script.js`.
2. Test locally with `just dev` and visit `http://localhost:8000/your-path`.
3. Add the path to the themes table in `tests/e2e/themes.spec.js`.
4. Update the themes table in `README.md`.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the full walkthrough.
