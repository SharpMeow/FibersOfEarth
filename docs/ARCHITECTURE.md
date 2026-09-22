# Architecture

FibersOfEarth is a local-first static application. ES modules are bundled with esbuild into an IIFE inside a standalone HTML file. No runtime CDN, font, tracking, geocoding or API dependency is required.

## Modules

| File | Responsibility |
| --- | --- |
| src/app.js | Hash router, page rendering, search, filtering, saved materials, downloads and dialogs. |
| src/globe.js | D3 orthographic and Natural Earth projections, topology conversion, map controls and node selection. |
| src/data.js | Unified catalog, illustrative networks, route derivation, distances and search normalization. |
| src/content.js | Core material descriptions, articles, regions, references and glossary. |
| src/extended.js | Additional fibers, histories, aliases and reference entries. |
| src/brands.js | Proprietary names, underlying-material links and producer references. |
| src/science.js | Educational science topics, chemistry categories and dimensional calculations. |
| src/legacy.json | Reduced original map data: nodes, edges, geographic labels and initial views. Original app code and review pages are excluded. |
| src/styles.css | Responsive design, focus states, reduced-motion behavior and print styling. |

## Routes

- `#/atlas/:material?journey=:id`
- `#/materials?q=&family=&sort=&page=`
- `#/brands`, `#/saved`
- `#/fiber/:id/:tab`, with overview, history, science, journeys and care tabs
- `#/compare?ids=wool,linen,polyester`
- `#/journeys?q=&fiber=&sort=&page=` and `#/journey/:id`
- `#/regions` and `#/region/:id`
- `#/learn`, `#/article/:id`, `#/science`, `#/history`, `#/glossary`
- `#/sources`, `#/about`, `#/privacy`

Unknown paths show a recovery page. Hash routing works without server rewrite rules, including on GitHub Pages and file URLs. It is a client-rendered educational app; route-specific server metadata and search-engine prerendering are not included.

## State and data flow

Filters and shareable choices live in URL fragments. Bookmarks are a list of known material IDs stored at `fibersOfEarth.saved.v2`. If storage fails, an in-memory collection remains available. Nothing is sent to a project backend.

Views escape interpolated strings before placing them in HTML. Search inputs do not generate executable HTML. Routes select only known material and journey IDs. No original archive scripts are executed.

## Geometry and calculations

D3 projects bundled World Atlas country geometry. Connections are great-circle lines clipped to the visible globe. Pointer dragging and explicit rotation/zoom controls provide separate interaction paths. The flat map shows the entire modeled journey.

Distance uses a 6,371 km spherical Earth radius. The filament model derives cross-sectional area from linear density and mass density. It assumes a solid circular single filament; it is not appropriate for hollow fibers or multifilament yarns without adjustment.
