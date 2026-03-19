# How to Submit a Pull Request

This guide shows you how to submit a change to W.R.A.A.S.

## Steps

### 1. Fork and branch

Fork the repository and create a branch from `main`:

```sh
git checkout -b your-branch-name main
```

### 2. Make your changes

Edit files and verify they work locally:

```sh
just dev
```

### 3. Run checks

```sh
# Lint HTML, CSS, and JS
just lint

# Run the full test suite
npm test
```

Both must pass before submitting.

### 4. Open a pull request

Push your branch and open a pull request with a clear description of what your change does.

CI will automatically run:

- Lint checks (HTML, CSS, JS)
- External URL validation
- OG metadata verification
- Lighthouse performance audits
- Broken link checks
