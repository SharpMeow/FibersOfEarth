# Deployment

## Offline copy

`npm run build` writes `dist/offline.html`, a single file with the app, styles and base map inlined. Open it in a modern browser without a server. Detailed zoom coastlines and the glossary reading edition need the hosted site.

## Static hosting

Run `npm ci` and `npm run build`. Deploy the contents of `dist/` to a static host. Hash-based navigation needs no rewrite rules. Serve `assets/` with long-lived caching (file names change with content) and `index.html` without it.

## GitHub Pages

The included Pages workflow is manually triggered. In repository Settings, open Pages and select GitHub Actions as the source, then run the Deploy site workflow. Pages is enabled for this repository with GitHub Actions as its source. The workflow builds and uploads only dist/.

No custom domain, credentials, environment secrets or API keys are needed. If a custom domain is configured later, preserve HTTPS and test direct fragment links.

## Updating

Edit src/, run the tests and commit the source. Build output is not committed; after merging, run the Deploy site workflow, which builds and publishes `dist/`. Bookmark IDs remain stable across updates when the same material IDs are preserved.

## Glossary and SEO

The build now emits `glossary/index.html`, one static page per glossary term (99 in this edition), and `sitemap.xml` into `dist/`. Deploy all of `dist/`, not only the root HTML, to expose the reading edition. These pages work without JavaScript and use normal relative links.

The default canonical base is `https://sharpmeow.github.io/FibersOfEarth/`. For another address, build with `SITE_URL=https://example.com/your-path/ npm run build`. Do not publish mismatched canonicals. The sitemap can be submitted after deployment; no indexing or ranking guarantee is implied. See [GLOSSARY-RESEARCH.md](GLOSSARY-RESEARCH.md).
