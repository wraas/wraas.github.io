# How to Debug CI Failures

This guide shows you how to diagnose and fix failures in the W.R.A.A.S. CI workflows when they block your pull request.

## Prerequisites

- A pull request with a failing CI check
- Access to the GitHub Actions logs (click "Details" next to the failing check on the PR)

## Identify which workflow failed

Look at the checks section on your pull request. Each workflow reports independently:

- **CI** — lint, external URLs, or OG metadata
- **Lighthouse CI** — performance, accessibility, best practices, or SEO scores below 90
- **Check robots.txt** — invalid `robots.txt` syntax (only runs when `site/robots.txt` is modified)
- **Preview Build** — the site failed to build

Most workflows comment on the PR with details. Check the PR comments first before digging into logs.

## CI workflow failures

### Lint failures

The CI workflow runs `just lint`. If it fails:

```sh
just lint
```

Fix any reported issues and push again.

### External URL failures

The CI workflow checks that all external URLs in `site/` are reachable. If a URL fails:

1. Check if the URL is genuinely down (try it in a browser).
2. If it is a transient failure, re-run the workflow from the Actions tab.
3. If the URL is permanently broken, update or remove it from the source file mentioned in the PR comment.

### OG metadata failures

The CI workflow validates that `site/index.html` and `site/404.html` contain required Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`). If a tag is missing, add it back.

## Lighthouse failures

Lighthouse audits run on all key pages (`/`, `/about/`, `/generate/`, `/karaoke/`, `/404.html`). All categories must score 90 or above.

The PR comment shows per-page scores. To reproduce locally:

```sh
just build
cd _site && python3 -m http.server 8000 &
lighthouse http://localhost:8000/ --chrome-flags="--headless=new" --output=json --output-path=report.json
```

Common causes:
- **Performance** — large unoptimized assets, render-blocking resources
- **Accessibility** — missing ARIA labels, insufficient color contrast, missing alt text
- **Best Practices** — mixed content, deprecated APIs, console errors
- **SEO** — missing meta description, missing canonical URL

## robots.txt failures

This workflow only triggers on PRs that modify `site/robots.txt`. It validates:

- Every `Allow`/`Disallow` directive has a preceding `User-agent`
- `Sitemap` values are valid URLs
- A catch-all `User-agent: *` rule exists

Fix the syntax issues reported in the PR comment.

## Preview Build failures

If the preview build fails, the site did not build successfully:

```sh
just build
```

Fix any build errors locally and push again.

## Re-running a workflow

If a failure was transient (network timeout, flaky external service):

1. Go to the Actions tab on the repository.
2. Find the failed workflow run.
3. Click "Re-run failed jobs".

## Troubleshooting

### CI passes locally but fails in CI

- Ensure you are running the same lint rules: `just lint`, not a local linter config.
- External URL checks may fail due to rate limiting or geo-blocking in CI. Re-run the workflow to confirm.

### Lighthouse scores differ locally vs CI

CI runs Lighthouse with DevTools throttling on a shared runner. Local scores on a fast machine will be higher. Optimize until CI passes, not just local.
