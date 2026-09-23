# Security

The site is static, with no authentication or server-side data store. Interpolated strings are HTML-escaped, route IDs are resolved against known records, and external links use HTTPS with `noopener`/`noreferrer`. No remote JavaScript is loaded at runtime. Original archive application scripts are not shipped.

Report a security problem privately through GitHub's **Report a vulnerability** option when available. If it is unavailable, open an issue asking for a private reporting channel without posting exploit details or sensitive information. Only the latest release is maintained.

The standalone build contains inline script and style blocks for offline portability. Hosts that enforce a strict Content Security Policy should supply appropriate hashes or separate bundled assets. Do not relax unrelated browser security settings to run it.

External references are independent websites. Material profiles are educational descriptions, not certification of a product's safety, regulatory status, or protective performance.
