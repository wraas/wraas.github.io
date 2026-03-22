# W.R.A.A.S. — justfile

src := "site"
out := "_site"
port := "8000"

# List available recipes
default:
    @just --list --unsorted

# Start local development server (mimics GitHub Pages 404 behavior)
[group('dev')]
dev:
    python3 dev-server.py {{ port }} {{ src }}

# Build the site (copy to _site/) with cache-busting
[group('build')]
build: clean
    mkdir -p {{ out }}
    cp -r {{ src }}/* {{ out }}/
    @just cache-bust

# Add content-hash query strings to static assets
[group('build')]
cache-bust:
    #!/usr/bin/env bash
    set -euo pipefail

    # Compute hashes for CSS and JS files
    css_hash=$(sha256sum {{ out }}/style.css 2>/dev/null | cut -d' ' -f1 | cut -c1-8)
    js_hash=$(sha256sum {{ out }}/script.js 2>/dev/null | cut -d' ' -f1 | cut -c1-8)

    # Update all HTML files with cache-bust query strings
    for html_file in $(find {{ out }} -name '*.html'); do
        if [ -f "$html_file" ]; then
            sed -i "s|/style\.css\"|/style.css?v=${css_hash}\"|g" "$html_file"
            sed -i "s|/script\.js\"|/script.js?v=${js_hash}\"|g" "$html_file"
        fi
    done

    echo "Cache-busting applied (CSS: ?v=${css_hash}, JS: ?v=${js_hash})"

# Remove build artifacts
[group('build')]
clean:
    rm -rf {{ out }}

# Lint HTML files (check for common issues)
[group('lint')]
lint: lint-html lint-css lint-js
    @echo "All lint checks passed"

# Validate HTML structure
[group('lint')]
lint-html:
    #!/usr/bin/env bash
    set -euo pipefail
    errors=0
    for f in $(find {{ src }} -name '*.html'); do
        # Check DOCTYPE
        if ! head -1 "$f" | grep -qi '<!doctype html>'; then
            echo "WARN: $f — missing <!DOCTYPE html>"
            errors=$((errors + 1))
        fi
        # Check for unclosed tags (basic check)
        for tag in html head body; do
            opens=$(grep -oi "<${tag}[> ]" "$f" | wc -l)
            closes=$(grep -oi "</${tag}>" "$f" | wc -l)
            if [ "$opens" -ne "$closes" ]; then
                echo "ERROR: $f — mismatched <${tag}> tags (open: $opens, close: $closes)"
                errors=$((errors + 1))
            fi
        done
        # Check meta charset
        if ! grep -qi 'charset' "$f"; then
            echo "WARN: $f — missing charset declaration"
            errors=$((errors + 1))
        fi
    done
    if [ "$errors" -gt 0 ]; then
        echo "Found $errors HTML issue(s)"
        exit 1
    fi
    echo "HTML: ok"

# Validate CSS syntax (basic checks)
[group('lint')]
lint-css:
    #!/usr/bin/env bash
    set -euo pipefail
    errors=0
    for f in $(find {{ src }} -name '*.css'); do
        # Check balanced braces
        opens=$(grep -o '{' "$f" | wc -l)
        closes=$(grep -o '}' "$f" | wc -l)
        if [ "$opens" -ne "$closes" ]; then
            echo "ERROR: $f — unbalanced braces (open: $opens, close: $closes)"
            errors=$((errors + 1))
        fi
    done
    if [ "$errors" -gt 0 ]; then
        echo "Found $errors CSS issue(s)"
        exit 1
    fi
    echo "CSS: ok"

# Validate JS syntax
[group('lint')]
lint-js:
    #!/usr/bin/env bash
    set -euo pipefail
    errors=0
    for f in $(find {{ src }} -name '*.js'); do
        if ! node --check "$f" 2>/dev/null; then
            echo "ERROR: $f — syntax error"
            errors=$((errors + 1))
        fi
    done
    if [ "$errors" -gt 0 ]; then
        echo "Found $errors JS issue(s)"
        exit 1
    fi
    echo "JS: ok"

# Validate markdown documentation (broken internal links, heading structure)
[group('lint')]
lint-docs:
    #!/usr/bin/env bash
    set -euo pipefail
    errors=0
    for f in *.md; do
        [ -f "$f" ] || continue
        # Check internal file links exist (e.g. [text](CONTRIBUTING.md))
        while IFS= read -r link; do
            # Strip anchor fragments and query strings
            target="${link%%#*}"
            target="${target%%\?*}"
            [ -z "$target" ] && continue
            # Skip URLs
            case "$target" in http://*|https://*|mailto:*) continue;; esac
            if [ ! -e "$target" ]; then
                echo "ERROR: $f — broken link to '$target'"
                errors=$((errors + 1))
            fi
        done < <(sed -n 's/.*\[.*\](\([^)]*\)).*/\1/p' "$f")
        # Check for a top-level heading
        if ! grep -qm1 '^# ' "$f"; then
            echo "WARN: $f — missing top-level heading"
            errors=$((errors + 1))
        fi
    done
    if [ "$errors" -gt 0 ]; then
        echo "Found $errors docs issue(s)"
        exit 1
    fi
    echo "Docs: ok"

# Run unit tests (Playwright-based)
[group('test')]
test-unit: build
    npx playwright test tests/unit

# Run end-to-end tests
[group('test')]
test-e2e: build
    npx playwright test tests/e2e

# Run accessibility tests
[group('test')]
test-a11y: build
    npx playwright test tests/a11y

# Run visual tests
[group('test')]
test-visual: build
    npx playwright test tests/visual

# Run all tests (unit + e2e + a11y)
[group('test')]
test: build
    npx playwright test tests/unit tests/e2e tests/a11y

# Run all checks (lint + build + tests)
[group('ci')]
check: lint lint-docs build test
    @echo "All checks passed"

# Run Lighthouse audits on all key pages (localhost)
[group('test')]
lighthouse: build
    #!/usr/bin/env bash
    set -euo pipefail

    # Start local server
    cd {{ out }}
    python3 -m http.server {{ port }} > /dev/null 2>&1 &
    server_pid=$!
    cd - > /dev/null
    sleep 2

    cleanup() { kill "$server_pid" 2>/dev/null || true; }
    trap cleanup EXIT

    pages=("/" "/about/" "/chuck/" "/generate/" "/karaoke/" "/404.html")
    all_passed=true
    results_md=""

    for page in "${pages[@]}"; do
        url="http://localhost:{{ port }}${page}"
        echo "Testing $url..."

        npx lighthouse "$url" \
            --chrome-flags="--headless=new --no-sandbox" \
            --output=json \
            --output-path=/tmp/lighthouse-${page//\//-}.json \
            --disable-full-page-screenshot \
            --throttling-method=devtools \
            > /dev/null 2>&1 || true

        if [ -f "/tmp/lighthouse-${page//\//-}.json" ]; then
            perf=$(jq '.categories.performance.score * 100' "/tmp/lighthouse-${page//\//-}.json")
            access=$(jq '.categories.accessibility.score * 100' "/tmp/lighthouse-${page//\//-}.json")
            bp=$(jq '.categories."best-practices".score * 100' "/tmp/lighthouse-${page//\//-}.json")
            seo=$(jq '.categories.seo.score * 100' "/tmp/lighthouse-${page//\//-}.json")

            printf "Page: %-20s | Perf: %3.0f | A11y: %3.0f | BP: %3.0f | SEO: %3.0f\n" "$page" "$perf" "$access" "$bp" "$seo"
            results_md+=$'\n'"- **$page**: Performance $perf, Accessibility $access, Best Practices $bp, SEO $seo"

            for score in "$perf" "$access" "$bp"; do
                if (( $(echo "$score < 90" | bc -l) )); then
                    all_passed=false
                fi
            done
        else
            echo "WARN: No results for $page"
        fi
    done

    # Write results for CI consumption
    echo "$results_md" > /tmp/lighthouse-results.md

    if [ "$all_passed" = false ]; then
        echo "Some Lighthouse scores are below 90"
        exit 1
    fi
    echo "All Lighthouse checks passed (>= 90)"

# Serve the built site (from _site/, mimics GitHub Pages 404 behavior)
[group('dev')]
serve: build
    python3 dev-server.py {{ port }} {{ out }}
