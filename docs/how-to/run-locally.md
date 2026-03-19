# How to Run Locally

This guide shows you how to set up and run the W.R.A.A.S. site on your local machine.

## Prerequisites

- Python 3
- [just](https://github.com/casey/just)

## Steps

### 1. Start the dev server

```sh
just dev
```

This serves the site at `http://localhost:8000`. The dev server mimics GitHub Pages 404 behavior — all unknown paths serve `404.html`, just like production.

### 2. Verify the site

Open `http://localhost:8000` in a browser. You should see the rickroll reveal with lyrics and the dancing GIF.

Try a themed URL like `http://localhost:8000/meeting` to see a fake loading screen.

### 3. Verify developer easter eggs

```sh
# Check custom HTTP headers
curl -I http://localhost:8000

# Check humans.txt
curl http://localhost:8000/humans.txt

# Check security.txt
curl http://localhost:8000/.well-known/security.txt
```

Open the browser DevTools console to see the ASCII art and styled banner.

### 4. Install test dependencies (optional)

If you plan to run the test suite:

```sh
npm install
```

## Troubleshooting

### Port already in use

The dev server defaults to port 8000. If that port is taken, edit the `port` variable in the `justfile` or kill the existing process.

### Python not found

The dev server requires Python 3. Verify with `python3 --version`. On some systems, `python` may point to Python 2.
