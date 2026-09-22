# Testing

Verification date: September 22, 2026.

Run `npm ci`, `npm test`, and `npm run build` (output goes to `dist/`; nothing generated is committed). Install a browser with `npx playwright install chromium`, then run `npm run test:browser`. To use installed Google Chrome locally, set `BROWSER_CHANNEL=chrome`. To use a specific Chromium binary, set `BROWSER_EXECUTABLE=/path/to/chromium`.

The five data tests cover catalog completeness, unique identifiers, source references, valid route coordinates, combined search/filter/sort behavior, distance and filament calculations, and editorial links.

Browser verification covers all 100 material profiles and 115 journey detail routes, profile tabs, globe controls and place details, library filters and sorting, bookmarks across reloads, comparison controls, global search, science tools, unknown routes, escaped input, and opening the standalone HTML offline. It checks 13 main sections at widths of 1440, 768, and 390 pixels for horizontal overflow and runs axe checks for WCAG 2 A/AA and 2.1 AA rules. JavaScript errors and detected accessibility violations fail the run.

The final run passed. Desktop and mobile screenshots were visually reviewed. Automated checks found and helped fix a bundled-script replacement bug, mobile comparison overflow, and insufficient text contrast.

See [browser-results.json](browser-results.json) and [screenshots](screenshots/) for recorded evidence. GitHub Actions repeats the data, build, and browser checks on pushes and pull requests.

These checks are not a full accessibility audit, screen-reader study, scientific peer review, or verification of real-world supply chains. Routes are illustrative and historical summaries have the source limitations described in [CONTENT.md](CONTENT.md).

## Research layer verification

Unit tests require every one of the 100 entries to carry all seven research sections with substantial text, at least two key figures, HTTPS references and an evidence level, with no em or en dashes. Every glossary term must keep the original 32 names, include the science and origins sections, have at least two HTTPS references and valid related terms. Search tests cover edit distance, spelling folding, query parsing, typo recovery, exclusions, field filters, phrases and suggestions. Converter tests compare against exact reference conversions and round trips. Browser tests open research sections, key figures, glossary links and citations, run typo and field searches, exercise the converters, and check raised routes and the spin control.

## Expanded glossary verification

The glossary data test checks preservation of all 32 original terms among the expanded set, references, related terms, substantial explanations, alias search, and combined topic/letter filters. Browser coverage includes every interactive definition route and every static definition page with JavaScript disabled, the static index, relative related-term navigation, canonical URLs, structured-data consistency, sitemap entries, missing-page 404s, mobile layout, and axe checks for both reading modes.
