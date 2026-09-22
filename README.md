<p align="center"><strong>FIBERS OF EARTH</strong></p>
<h1 align="center">Every thread has a world.</h1>
<p align="center">An independent textile atlas by Chaos.</p>

[![Checks](https://github.com/SharpMeow/FibersOfEarth/actions/workflows/check.yml/badge.svg)](https://github.com/SharpMeow/FibersOfEarth/actions/workflows/check.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-294e3c)](LICENSE)

Explore 100 material, fiber and technology profiles, 115 illustrative supply-chain journeys, and the science and history of textiles. The site works offline from a single HTML file, with no account, API key or application server.

![Fibers of Earth desktop atlas](docs/screenshots/atlas-desktop.png)

## Open the atlas

Download the repository and open **index.html** in a modern browser. All map geometry, styles, content and JavaScript are bundled. External references require a network connection when you choose to open them.

## Find your way around

| Section | What you can do |
| --- | --- |
| Atlas | Choose from 30 mapped materials, rotate and zoom the globe, switch to a flat map, inspect locations and choose a journey. |
| Materials | Search 100 profiles by name, use or alias; filter by family; sort alphabetically, by family or by mapped coverage. |
| Brands & technologies | Distinguish 20 proprietary offerings from their underlying fiber, feedstock or yarn process. |
| Compare | Put three materials side by side across composition, history, care, uses and sourcing questions. |
| Journeys | Search 115 illustrative routes by place or material; sort by estimated distance or stage count; export a route. |
| Learn | Read eight field notes, 100 historical summaries and a 32-term glossary. |
| Science lab | Change weave diagrams and calculate ideal filament diameter from denier and density. |
| Saved | Keep a local collection of materials in your browser. |

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

Open http://127.0.0.1:4173. Rebuild after source changes and restart the preview server. `npm run build` produces `dist/index.html` and the standalone root `index.html`.

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
