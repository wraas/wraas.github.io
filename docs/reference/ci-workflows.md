# CI Workflows Reference

Complete reference for the W.R.A.A.S. GitHub Actions workflows. For troubleshooting failures, see [How to Debug CI Failures](../how-to/debug-ci-failures.md).

## Overview

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `ci.yaml` | PR, push to `main` | Lint, external URL checks, OG metadata validation |
| Lighthouse CI | `lighthouse.yaml` | PR, push to `main` | Performance, accessibility, best practices, SEO audits |
| Check robots.txt | `check-robots-txt.yaml` | PR (when `site/robots.txt` changes) | robots.txt syntax validation |
| Check SRI Hash | `check-sri.yaml` | Daily (6 AM UTC), manual | GoatCounter SRI integrity hash verification |
| Broken Links | `links.yaml` | Weekly (Monday 9 AM UTC), push to `main`, manual | Broken link detection across `site/` |
| Preview Build | `preview.yaml` | PR | Build artifact for PR preview |
| Deploy | `deploy.yaml` | Push to `main`, manual | Deploy to GitHub Pages |

## CI (`ci.yaml`)

**Triggers:** `pull_request`, `push` to `main`

**Permissions:** `contents: read`, `pull-requests: write`

**Steps:**

1. Lint HTML, CSS, and JS via `just lint`
2. Extract and validate all external URLs in `site/` (excludes `youtube.com`, `lyricsondemand.com`, `goatcounter.com`, `wraas.github.io`)
3. Validate required OG metadata tags on `site/index.html` and `site/404.html`
4. On failure: comment on PR with details (updates existing comment if present)

**Required OG tags:** `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`

## Lighthouse CI (`lighthouse.yaml`)

**Triggers:** `pull_request`, `push` to `main`

**Permissions:** `contents: read`, `pull-requests: write`

**Steps:**

1. Build site via `just build`
2. Start a local Python HTTP server on port 8000
3. Run Lighthouse on 6 pages: `/`, `/about/`, `/chuck/`, `/generate/`, `/karaoke/`, `/404.html`
4. Fail if any category (performance, accessibility, best practices) scores below 90
5. Comment on PR with per-page scores (updates existing comment if present)

**Lighthouse flags:** `--headless=new`, `--no-sandbox`, `--throttling-method=devtools`, `--disable-full-page-screenshot`

## Check robots.txt (`check-robots-txt.yaml`)

**Triggers:** `pull_request` (only when `site/robots.txt` is modified)

**Permissions:** `pull-requests: write`

**Steps:**

1. Parse `site/robots.txt` line by line
2. Validate directive syntax: `User-agent`, `Allow`, `Disallow`, `Sitemap`, `Crawl-delay`, `Host`
3. Verify every `Allow`/`Disallow` has a preceding `User-agent`
4. Verify `Sitemap` values are valid URLs
5. Verify a catch-all `User-agent: *` rule exists
6. On failure: comment on PR with details

## Check SRI Hash (`check-sri.yaml`)

**Triggers:** `schedule` (daily at 6 AM UTC), `workflow_dispatch`

**Permissions:** `contents: write`, `pull-requests: write`

**Steps:**

1. Fetch `https://gc.zgo.at/count.js` and compute its `sha384` hash
2. Extract the current SRI hash from `site/index.html`
3. If hashes match: exit successfully
4. If mismatched: update the `integrity` attribute in all 5 HTML files and create a PR

**Updated files:** `site/index.html`, `site/404.html`, `site/about/index.html`, `site/chuck/index.html`, `site/karaoke/index.html`, `site/generate/index.html`

**PR details:** branch `fix/update-goatcounter-sri`, label `sri-update`

## Broken Links (`links.yaml`)

**Triggers:** `schedule` (weekly, Monday at 9 AM UTC), `push` to `main`, `workflow_dispatch`

**Permissions:** `contents: read`, `issues: write`

**Steps:**

1. Run lychee link checker on `site/` directory
2. Excludes: `youtube.com`, `lyricsondemand.com`, `localhost`, `127.0.0.1`, rickroll-related URLs
3. On failure: create an issue labeled `broken-links` (skips if one already exists)

**Lychee config:** `--timeout 30`, `--max-retries 2`

## Preview Build (`preview.yaml`)

**Triggers:** `pull_request`

**Permissions:** `contents: read`, `pull-requests: write`

**Steps:**

1. Build site via `just build`
2. Upload `_site` as artifact `preview-site-{PR number}` (retained 7 days)
3. Comment on PR with download instructions

## Deploy (`deploy.yaml`)

**Triggers:** `push` to `main`, `workflow_dispatch`

**Permissions:** `contents: read`, `pages: write`, `id-token: write`

**Concurrency:** group `pages`, does not cancel in-progress deploys

**Steps:**

1. Build site via `just build`
2. Upload `_site` as a Pages artifact
3. Deploy to the `github-pages` environment

## Action versions

All actions are pinned to commit SHAs for supply-chain security.

| Action | Version | SHA |
|--------|---------|-----|
| `actions/checkout` | v6.0.2 | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` |
| `actions/configure-pages` | v5.0.0 | `983d7736d9b0ae728b81ab479565c72886d7745b` |
| `actions/upload-pages-artifact` | v4.0.0 | `7b1f4a764d45c48632c6b24a0339c27f5614fb0b` |
| `actions/deploy-pages` | v4.0.5 | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` |
| `actions/upload-artifact` | v4.6.2 | `ea165f8d65b6e75b540449e92b4886f43607fa02` |
| `actions/github-script` | v8.0.0 | `ed597411d8f924073f98dfc5c65a23a2325f34cd` |
| `taiki-e/install-action` | v2.69.2 | `42721ded7ddc3cd90f687527e8602066e4e1ff3a` |
| `lycheeverse/lychee-action` | v2.8.0 | `8646ba30535128ac92d33dfc9133794bfdd9b411` |
| `peter-evans/create-pull-request` | v8.1.0 | `c0f553fe549906ede9cf27b5156039d195d2ece0` |

## Running workflows manually

Workflows with `workflow_dispatch` can be triggered manually:

1. Go to the Actions tab on the repository.
2. Select the workflow from the left sidebar.
3. Click "Run workflow" and select the branch.

Manual dispatch is available on: **Deploy**, **Broken Links**, **Check SRI Hash**.
