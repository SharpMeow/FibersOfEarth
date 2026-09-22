# Deployment

## Standalone

Open the root index.html in a modern browser. It contains the complete app. No server is needed, and the browser never needs to fetch map geometry or runtime libraries.

## Static hosting

Run `npm ci` and `npm run build`. Deploy the contents of `dist/` to a static host. Hash-based navigation needs no rewrite rules. The committed root index.html can also be served directly.

## GitHub Pages

The included Pages workflow is manually triggered. In repository Settings, open Pages and select GitHub Actions as the source, then run the Deploy site workflow. Publishing the repository does not automatically enable Pages. The workflow builds and uploads only dist/.

No custom domain, credentials, environment secrets or API keys are needed. If a custom domain is configured later, preserve HTTPS and test direct fragment links.

## Updating

Edit src/, run the tests, rebuild and commit the updated root index.html. Deploy the new build. Bookmark IDs remain stable across updates when the same material IDs are preserved.
