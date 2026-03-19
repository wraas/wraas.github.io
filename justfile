# W.R.A.A.S. — justfile

src := "site"
out := "_site"
port := "8000"

# List available recipes
default:
    @just --list

# Start local development server (mimics GitHub Pages 404 behavior)
dev:
    python3 dev-server.py {{ port }} {{ src }}

# Build the site (copy to _site/) with cache-busting
build: clean
    mkdir -p {{ out }}
    cp -r {{ src }}/* {{ out }}/
    @just cache-bust
    @echo "Built site in {{ out }}/"

# Add content-hash query strings to static assets
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

    @echo "Cache-busting applied (CSS: ?v=${css_hash}, JS: ?v=${js_hash})"

# Remove build artifacts
clean:
    rm -rf {{ out }}

# Lint HTML files (check for common issues)
lint: lint-html lint-css lint-js
    @echo "All lint checks passed"

# Validate HTML structure
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

# Run all checks (lint + build)
check: lint lint-docs build
    @echo "All checks passed"

# Serve the built site (from _site/, mimics GitHub Pages 404 behavior)
serve: build
    python3 dev-server.py {{ port }} {{ out }}
