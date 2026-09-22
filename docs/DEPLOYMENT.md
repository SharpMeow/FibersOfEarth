# Deployment

## Standalone

Open the root index.html in a modern browser. It contains the complete app. No server is needed, and the browser never needs to fetch map geometry or runtime libraries.

## Static hosting

Run `npm ci` and `npm run build`. Deploy the contents of `dist/` to a static host. Hash-based navigation needs no rewrite rules. The committed root index.html can also be served directly.

## GitHub Pages

The included Pages workflow is manually triggered. In repository Settings, open Pages and select GitHub Actions as the source, then run the Deploy site workflow. Pages is enabled for this repository with GitHub Actions as its source. The workflow builds and uploads only dist/.

No custom domain, credentials, environment secrets or API keys are needed. If a custom domain is configured later, preserve HTTPS and test direct fragment links.

## Updating

Edit src/, run the tests, rebuild and commit the updated root index.html. Deploy the new build. Bookmark IDs remain stable across updates when the same material IDs are preserved.

## Glossary and SEO

The build now emits `glossary/index.html`, 32 static term pages, and `sitemap.xml` into both the repository and `dist/`. Deploy all of `dist/`, not only the root HTML, to expose the reading edition. These pages work without JavaScript and use normal relative links.

The default canonical base is `https://sharpmeow.github.io/FibersOfEarth/`. For another address, build with `SITE_URL=https://example.com/your-path/ npm run build`. Do not publish mismatched canonicals. The sitemap can be submitted after deployment; no indexing or ranking guarantee is implied. See [GLOSSARY-RESEARCH.md](GLOSSARY-RESEARCH.md).
