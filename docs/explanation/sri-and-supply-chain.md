# SRI and Supply-Chain Protection for Third-Party Scripts

W.R.A.A.S. loads GoatCounter's `count.js` from an external CDN (`gc.zgo.at`). This page explains why we pin that script with Subresource Integrity (SRI), what breaks when the hash goes stale, and how the automated check keeps things working.

## What is SRI?

Subresource Integrity lets you tell the browser: "only execute this script if its content matches this cryptographic hash." The `integrity` attribute on a `<script>` tag contains a base64-encoded SHA-384 digest of the expected file contents:

```html
<script src="//gc.zgo.at/count.js"
        integrity="sha384-DGiREytotlUiLflu8vLo0vvfxKWn36pKPT1ZBhh3R+3vhwrS/4p3H9eys9Zr2bPQ"
        crossorigin="anonymous"></script>
```

If the file served by the CDN does not match the hash, the browser refuses to execute it. This protects against:

- **CDN compromise** — if an attacker modifies the script on the CDN, the tampered version will not run.
- **Supply-chain attacks** — if the upstream project is compromised and pushes malicious code to their CDN, the hash mismatch blocks it.
- **Accidental changes** — if the CDN serves a different version due to a deployment error, it is caught.

The `crossorigin="anonymous"` attribute is required for SRI to work on cross-origin scripts. Without it, the browser skips the integrity check.

## The trade-off

SRI is a one-way lock: it protects you from unauthorized changes, but it also blocks *authorized* changes. When GoatCounter legitimately updates `count.js` (bug fixes, new features, performance improvements), the hash no longer matches and the browser silently refuses to load the script.

The failure mode is invisible:

- No error message is shown to the user.
- No console error is logged (unless the developer has the Network tab open).
- Analytics simply stop working. Page views are no longer counted.

This is the fundamental tension: **SRI trades availability for integrity**. Without SRI, the script always loads but you trust the CDN implicitly. With SRI, you verify every byte but risk silent breakage when the upstream changes.

## Why we chose SRI anyway

For W.R.A.A.S., the trade-off favors integrity:

1. **GoatCounter updates infrequently.** The `count.js` script is a small, stable analytics snippet. It changes rarely — typically a few times a year at most.

2. **Analytics loss is low-impact.** If the hash goes stale and analytics stops working for a day, no user-facing functionality is affected. The rickroll still works. Nobody's workflow is blocked.

3. **Supply-chain attacks are high-impact.** If the CDN is compromised and serves malicious JavaScript, it runs on every page load for every visitor. Even for a joke site, serving malware is not funny.

4. **We automated the detection.** The `check-sri` workflow runs daily, computes the remote script's hash, and opens a PR if it has changed. This narrows the window of broken analytics to at most 24 hours plus the time to merge the PR.

## How the automated check works

The `check-sri` workflow (`.github/workflows/check-sri.yaml`) runs daily at 6 AM UTC:

1. Fetches `https://gc.zgo.at/count.js` with `curl`.
2. Computes the SHA-384 hash: `openssl dgst -sha384 -binary | openssl base64 -A`.
3. Extracts the current hash from `site/index.html` (source of truth).
4. If they match, the workflow exits successfully.
5. If they differ, it updates the `integrity` attribute in all 5 HTML files and creates a PR with the `sri-update` label.

The PR includes the old and new hashes so you can verify the change before merging. You should review the PR rather than auto-merging it — the whole point of SRI is to verify before trusting, and blindly accepting a new hash defeats that purpose.

## The alternative: removing SRI

Some projects choose to load third-party scripts without SRI, accepting the trade-off in the other direction. This is a valid choice when:

- The script changes frequently and breakage would be disruptive.
- The CDN is highly trusted (e.g., a first-party CDN you control).
- The site has a Content Security Policy (CSP) that limits what the script can do.

W.R.A.A.S. has none of these conditions. GoatCounter's CDN is a third-party service, the script changes rarely, and the impact of a compromise outweighs the impact of stale analytics.

## The Google Fonts exception

The CSS file (`site/style.css`) imports Google Fonts without SRI. This is noted in a comment at the top of the file. Google Fonts responses vary by user-agent and browser capabilities — the same URL returns different CSS depending on who is requesting it. SRI is not feasible when the response is intentionally non-deterministic.

## Further reading

- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [CI Workflows Reference](../reference/ci-workflows.md) — details on all workflows including `check-sri`
