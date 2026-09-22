# Architecture

FibersOfEarth is a local-first static application. ES modules are bundled with esbuild into an IIFE inside a standalone HTML file. No runtime CDN, font, tracking, geocoding or API dependency is required.

## Modules

| File | Responsibility |
| --- | --- |
| src/app.js | Hash router, page rendering, search, filtering, saved materials, downloads and dialogs. |
| src/globe.js | D3 orthographic and Natural Earth projections, topology conversion, raised 3D route arcs, direction-of-travel animation, auto-rotation, map controls and node selection. |
| src/data.js | Unified catalog, research details, illustrative networks, route derivation, distances and the material search index. |
| src/search.js | Offline ranked search engine: tokenizer, spelling folding, BM25 scoring, typo tolerance, query syntax, suggestions and snippets. |
| src/guide.js | Generated reader guide per entry: types, fabrics, quality cues, pros and cons, footprint, care, FAQ, notable facts and references. |
| src/details.js | Generated research profiles for every catalog entry, with key figures, references and evidence levels. |
| src/glossary.js, src/glossary-extended.js, src/glossary-render.js | Glossary data, research additions, ranked term search, shared HTML rendering and automatic term links. |
| src/content.js | Core material descriptions, articles, regions, references and glossary. |
| src/extended.js | Additional fibers, histories, aliases and reference entries. |
| src/brands.js | Proprietary names, underlying-material links and producer references. |
| src/science.js | Educational science topics, chemistry categories, dimensional calculations and unit converters. |
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

## Search

`src/search.js` builds an in-memory inverted index when a search first runs. Documents and queries share one normalizer: accent folding, British to American spelling (fibre, colour, woollen, -isation), light plural stemming and stop words. Scoring is field-weighted BM25 (k1 1.2, b 0.75): each field saturates separately and is then weighted, so a name or alias match outranks many mentions deep in long research paragraphs. The last query term also matches as a prefix while typing. A term missing from the vocabulary expands to vocabulary words within Damerau-Levenshtein distance 1 (4 to 7 letters) or 2 (8 or more) at reduced weight. Every positive term must match. Quoted phrases must match contiguously, `-term` excludes, and `field:term` restricts a term to one field (for example `law:cites`, `chemistry:keratin`, `history:dupont`, `family:plant`). Results carry the fields they matched, which drive the highlighted snippets. With no results, the engine suggests the closest vocabulary correction.

## Geometry and calculations

D3 projects bundled World Atlas country geometry. Connections are drawn twice: a faint great-circle ground track clipped to the visible globe, and a raised arc. The raised arc samples the great circle, lifts each sample by a height proportional to sin(pi t) and to the route's angular length, and projects it orthographically. A raised point is hidden only when it is behind the globe and inside its silhouette. Animated dashes and a traveling arrow follow each arc from origin to destination, and a chevron marks direction without animation. Each globe opens on its journey's home view: the center of the smallest spherical cap holding every stop (Badoiu-Clarkson iterations from the centroid), zoomed so the farthest stop sits about 190 px from the center (between 1x and 1.75x). The idle motion sways 18 degrees either side of that view over 40 seconds, pauses while hovered or focused, holds still from 1.8x, and does not start when the reader prefers reduced motion. One animation loop drives the sway and places each traveling arrow on its arc's current geometry, hiding arrows behind the globe or on arcs shorter than 40 px. Zoom runs from 0.6x to 16x (buttons, mouse wheel and trackpad toward the pointer, two-finger pinch, double-click, keyboard plus and minus). Wheel and pinch repaint light geometry while the gesture runs and render full detail 180 ms after it settles. The 1:50m and 1:10m files are copied to `dist/geo/` by the build and fetched once on first need; a failed or file-protocol fetch leaves the best loaded tier in place. Level of detail follows zoom: Natural Earth 1:110m below 1.8x; 1:50m, country labels, a 5 degree grid and stage sub-labels from 1.8x; 1:10m from 4x; a 1 degree grid from 8x. Detailed tiers split countries into single polygons with bounding caps and draw only those reaching the visible cap of the globe; grids are generated for the visible patch only. Polygons whose ring winding would cover more than a hemisphere are reversed. While dragging, 1:110m geometry is used below 8x and culled 1:50m above, and the static render restores full detail. Projections clip to a frame wider than the viewBox so wide panels show the map edge to edge. Pointer dragging and explicit rotation/zoom controls provide separate interaction paths. The flat map shows the entire modeled journey.

Distance uses a 6,371 km spherical Earth radius. The filament model derives cross-sectional area from linear density and mass density. It assumes a solid circular single filament; it is not appropriate for hollow fibers or multifilament yarns without adjustment. Count conversions pass through tex: Nm = 1000/tex and Ne = 590.54/tex (840-yard hanks per pound). Fabric weight uses 1 oz/yd2 = 33.906 g/m2 and 1 momme = 4.340 g/m2 (one pound per 45 in by 100 yd piece).
