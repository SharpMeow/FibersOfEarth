# Changelog

## 2.3.0 - 2026-09-22

- The site is now a multi-file static build: a small HTML shell with content-hashed script and stylesheet assets, glossary pages that share the stylesheet, and generated research content stored as JSON under `src/data/`. Build output is no longer committed (CI builds and deploys it); `dist/offline.html` remains available as a single-file offline copy.

- Every material gains a reader guide: types and grades, fabrics and products, how to judge quality, advantages and drawbacks, environmental and social footprint, a detailed care guide, an FAQ and notable facts, with references. Profiles reorganize into Overview, Types & fabrics, Buying & care, History, Science, Journeys, Labeling & law and a printable Full profile. Library cards show two key figures, and search covers the new sections (a search for denim finds cotton).
- The mouse wheel zooms the globe toward the pointer; at the zoom limits the page scrolls. Two-finger pinch zooms on touch screens.
- Keyboard control of the globe: arrow keys rotate and tilt, plus and minus zoom, 0 recenters on the route, P pauses motion; a polite live region announces the view. The globe's accessible name includes a spoken summary of the route.
- Display settings (header button): reduce motion, larger text (115% or 130%), high contrast and underlined links, stored in this browser.
- Full-screen map control and a scale bar that tracks zoom.
- Detailed 1:50m and 1:10m coastlines now load on demand from the same site instead of being bundled, cutting the standalone page from about 5.5 MB to about 1.2 MB. Opened from a local file, the globe keeps the bundled 1:110m map.

## 2.2.1 - 2026-09-22

- Each fiber's globe now opens centered on its trade route, zoomed so every stop fits; Reset returns to that view.
- The idle motion sways gently around the route instead of spinning it out of view; it holds still from 1.8x so detailed coastlines stay sharp.
- Zoom range widened to 0.6x to 16x, with ctrl/cmd+wheel, trackpad pinch and double-click zoom.
- Detail rises with zoom: Natural Earth 1:50m coastlines and borders, country names, a 5 degree grid and stage descriptions under place names from 1.8x; 1:10m coastlines from 4x; a 1 degree grid from 8x. Only polygons reaching the visible part of the globe are drawn, and a few reversed-winding 1:10m islets are corrected so they cannot flood the view.
- Home views center each route on the smallest spherical cap holding its stops, so wide routes such as New Zealand to Europe stay on one face of the globe.
- Traveling arrows are placed by one animation loop on the current arc, fixing arrows that flickered on short arcs or stuck in the top-left corner; arcs shorter than 40 px show no arrows.
- Removed the tap highlight, click focus ring and text selection when clicking or dragging the globe (keyboard focus still shows).

## 2.2.0 - 2026-09-22

- Added a research profile to all 100 catalog entries: source and geography, structure and chemistry, processing route, performance in use, identification, labeling law and standards, a deeper history, key figures with conditions, and entry-specific references with an evidence level.
- Expanded the glossary from 32 to 99 terms across fiber science, yarn formation, measurement, construction, coloration, claims and labeling law. Every term now includes "The science and numbers" and "Origins and history" sections and inline-linked references.
- Replaced substring matching with a ranked, offline search engine: field-weighted BM25 scoring, typo tolerance, prefix completion, British and American spelling folding, quoted phrases, exclusions, field filters such as `law:` and `chemistry:`, match snippets and "did you mean" suggestions.
- Added "Cite this profile" (APA and BibTeX), automatic glossary links in profile and glossary prose, research rows in comparisons, and glossary data in the JSON export.
- Added yarn-count (tex, dtex, denier, Nm, Ne) and fabric-weight (g/m2, oz/yd2, momme) converters to the science lab.
- Raised route arcs above the globe with ground shadows, direction chevrons, flowing dashes and traveling arrows, plus a pausable slow globe rotation that respects reduced-motion settings.
- Added an optional `BROWSER_EXECUTABLE` override for browser tests.

## 2.0.0 - 2026-09-22

- Rebuilt the fiber atlas with a responsive editorial interface and four primary navigation sections.
- Expanded the catalog to 100 material and proprietary-technology entries, each with historical context.
- Added 115 named illustrative journeys, route search and sorting, regional views and local JSON exports.
- Added qualitative material comparisons, local bookmarks, global search and direct links to profile tabs.
- Added field notes, a glossary, source methodology and an interactive science lab with weave and filament-diameter models.
- Bundled map data and runtime code for offline use without a build step for readers.
- Added automated data, routing, interaction, responsive-layout and accessibility checks, CI, project documentation and license notices.
- Removed personal branding, original review pages and unsupported live-tracking implications.

## 2.1.0

- Expanded all 32 glossary definitions with explanations, examples, distinctions, related terms and technical references.
- Added alias search, topic and letter filters, and glossary results in global search.
- Added a JavaScript-free reading edition with 33 static pages, unique metadata, structured data and a sitemap.
- Documented research sources and deployment requirements for search discovery.
