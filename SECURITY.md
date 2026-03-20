# Security Policy

## Scope

W.R.A.A.S. is a static joke site hosted on GitHub Pages. It has no backend, no database, no user accounts, and no server-side processing. The attack surface is limited to:

- Client-side HTML, CSS, and JavaScript served from `wraas.github.io`
- Third-party scripts (GoatCounter analytics via `gc.zgo.at`)
- GitHub Actions CI/CD workflows

## Supported versions

Only the latest version deployed to `main` is supported. There are no versioned releases.

## Reporting a vulnerability

If you discover a security issue, please report it privately:

- **Email:** romain.lespinasse@gmail.com
- **GitHub:** [Open a private security advisory](https://github.com/wraas/wraas.github.io/security/advisories/new)

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact

You should receive an acknowledgment within 48 hours. Please do not open a public issue for security vulnerabilities.

## Security measures

### Subresource Integrity (SRI)

All third-party scripts are loaded with `integrity` and `crossorigin` attributes to prevent execution of tampered code. A daily CI workflow (`check-sri.yaml`) verifies that SRI hashes are current and opens a PR if they need updating.

### GitHub Actions supply-chain security

All GitHub Actions are pinned to specific commit SHAs rather than mutable tags, preventing compromised or hijacked actions from running in CI. See the [CI Workflows Reference](docs/reference/ci-workflows.md) for the full list of pinned versions.

### No sensitive data

The site collects no personal data, stores no credentials, and uses no cookies. Analytics are handled by GoatCounter, a privacy-respecting service that does not track individual users.

## Note about `security.txt`

The `/.well-known/security.txt` file on the live site is an easter egg — it is part of the rickroll. For actual security matters, use the contact methods listed above.
