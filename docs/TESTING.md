# Testing

Verification date: September 22, 2026.

Run `npm ci`, `npm test`, and `npm run build`. Install a browser with `npx playwright install chromium`, then run `npm run test:browser`. To use installed Google Chrome locally, set `BROWSER_CHANNEL=chrome`.

The five data tests cover catalog completeness, unique identifiers, source references, valid route coordinates, combined search/filter/sort behavior, distance and filament calculations, and editorial links.

Browser verification covers all 100 material profiles and 115 journey detail routes, profile tabs, globe controls and place details, library filters and sorting, bookmarks across reloads, comparison controls, global search, science tools, unknown routes, escaped input, and opening the standalone HTML offline. It checks 13 main sections at widths of 1440, 768, and 390 pixels for horizontal overflow and runs axe checks for WCAG 2 A/AA and 2.1 AA rules. JavaScript errors and detected accessibility violations fail the run.

The final run passed. Desktop and mobile screenshots were visually reviewed. Automated checks found and helped fix a bundled-script replacement bug, mobile comparison overflow, and insufficient text contrast.

See [browser-results.json](browser-results.json) and [screenshots](screenshots/) for recorded evidence. GitHub Actions repeats the data, build, and browser checks on pushes and pull requests.

These checks are not a full accessibility audit, screen-reader study, scientific peer review, or verification of real-world supply chains. Routes are illustrative and historical summaries have the source limitations described in [CONTENT.md](CONTENT.md).
