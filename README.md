<p align="center"><strong>FIBERS OF EARTH</strong></p>
<h1 align="center">Every thread has a world.</h1>
<p align="center">An independent textile atlas by Chaos.</p>

[![Checks](https://github.com/SharpMeow/FibersOfEarth/actions/workflows/check.yml/badge.svg)](https://github.com/SharpMeow/FibersOfEarth/actions/workflows/check.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-294e3c)](LICENSE)

Explore 100 material, fiber and technology profiles, 115 illustrative supply-chain journeys, and the science and history of textiles. It is a static site with no account, API key or application server. Visit the hosted atlas, or build it locally.

![Fibers of Earth desktop atlas](docs/screenshots/atlas-desktop.png)

## Open the atlas

Visit [sharpmeow.github.io/FibersOfEarth](https://sharpmeow.github.io/FibersOfEarth/), or run `npm ci && npm run build && npm run dev` and open http://127.0.0.1:4173. The build also writes `dist/offline.html`, a single-file copy that opens without a server (base world map only). External references require a network connection when you choose to open them.

## Find your way around

| Section | What you can do |
| --- | --- |
| Atlas | Choose from 30 mapped materials. Each globe opens centered on its trade route; raised arcs animate the direction of travel. Zoom with the wheel, pinch, buttons or keyboard (0.6x to 16x) for finer coastlines, country names and grids; go full screen; switch to a flat map. |
| Materials | 100 profiles with a reader guide (types and grades, fabrics, buying cues, pros and cons, footprint, care, FAQ, notable facts) and a research layer (structure and chemistry, processing, performance, identification, labeling law, deeper history, key figures, references). Ranked, typo-tolerant search covers every section. Cite in APA or BibTeX, or print the full profile. |
| Brands & technologies | Distinguish 20 proprietary offerings from their underlying fiber, feedstock or yarn process. |
| Compare | Put three materials side by side across composition, history, care, uses and sourcing questions. |
| Journeys | Search 115 illustrative routes by place or material; sort by estimated distance or stage count; export a route. |
| Learn | Read eight field notes, 100 historical summaries and a 99-term glossary with the science, numbers and origins behind each term. |
| Science lab | Change weave diagrams, calculate ideal filament diameter, and convert yarn counts (tex, dtex, denier, Nm, Ne) and fabric weights (g/m², oz/yd², momme). |
| Saved | Keep a local collection of materials in your browser. |
| Display settings | Reduce motion, enlarge text, raise contrast or underline links from the header; choices stay in your browser. |

Press `/` to search the atlas. Links preserve views using URL fragments. Browser Back and Forward navigate between sections. Saved items stay on your device.

## What the map means

The routes are educational models, **not live shipments or verified supplier relationships**. Markers are approximate cities and regions. Distance is the sum of great-circle segments, not road or shipping distance and not an emissions calculation. Specialty connections inherited from the earlier atlas are labeled as unverified legacy concepts.

The catalog includes generic fibers, selected variants, fillings, historical materials and proprietary technologies. It does not claim to cover every species, polymer grade, trademark or experimental formulation. Producer statements are attributed, not independently certified. See [content methodology](docs/CONTENT.md) and the in-site reference shelf.

## Development

Use Node.js 22 or newer.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Rebuild after source changes and restart the preview server. `npm run build` writes the site to `dist/`: a small `index.html`, content-hashed `assets/app-*.js` and `assets/styles-*.css`, the glossary reading edition, the sitemap, on-demand map geometry in `geo/`, and `offline.html`. Build output is not committed; CI builds and deploys it.

For browser and accessibility checks:

```sh
npx playwright install chromium
npm run test:browser
```

The browser command starts its own preview server. To use an installed Chrome instead, set `BROWSER_CHANNEL=chrome`. Test screenshots and a machine-readable report are written to `docs/`.

## Documentation

- [Architecture and routes](docs/ARCHITECTURE.md)
- [Content model and editorial evidence](docs/CONTENT.md)
- [Testing and verification](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)
- [Privacy](PRIVACY.md) and [security policy](SECURITY.md)
- [Changelog](CHANGELOG.md) and [third-party notices](THIRD_PARTY_NOTICES.md)

## Credits

Created by **Chaos**. Original application code and original editorial text are MIT licensed. Material names and trademarks belong to their respective owners. Reference organizations and material producers are not affiliated with or endorsing this project. Map data and library licenses are documented separately.

### Detailed textile glossary

[Read the glossary](https://sharpmeow.github.io/FibersOfEarth/glossary/) or use the interactive glossary to search by aliases and filter by topic or letter. All 99 terms include explanations, the science and numbers, practical examples, distinctions, origins, related terms and sources. The build creates 100 JavaScript-free glossary pages plus a sitemap for static hosting. [Research and SEO notes](docs/GLOSSARY-RESEARCH.md) explain the source methodology and deployment requirements. The site is published through GitHub Pages at [sharpmeow.github.io/FibersOfEarth](https://sharpmeow.github.io/FibersOfEarth/). Search indexing is controlled by search engines.
