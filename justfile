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

# Build the site (copy to _site/)
build: clean
    mkdir -p {{ out }}
    cp -r {{ src }}/* {{ out }}/
    @echo "Built site in {{ out }}/"

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

# Run all checks (lint + build)
check: lint build
    @echo "All checks passed"

# Serve the built site (from _site/, mimics GitHub Pages 404 behavior)
serve: build
    python3 dev-server.py {{ port }} {{ out }}
