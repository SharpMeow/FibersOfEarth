# Glossary research and search discovery

Research date: September 22, 2026. Scope: expand all 32 existing glossary entries while preserving their names and offline availability. Definitions have a short answer, an explanation, an original practical example, distinctions, related terms and linked references. No outside reviewer or scientific peer review is claimed.

## Research method

Technical terminology was checked against primary institutional and industry sources: Cotton Incorporated's CottonWorks encyclopedia and manufacturing guides; Woolmark and the International Wool Textile Organisation; the Alliance for European Flax-Linen & Hemp; BISFA terminology; the Cashmere and Camel Hair Manufacturers Institute; Textile Exchange; NC State's textile comfort research center; and the Craft Yarn Council. Lenzing and The LYCRA Company support descriptions of their respective production technologies and brand terminology. Manufacturer claims are not treated as independent comparative evidence.

Each entry links its applicable references in the reading view. The complete source registry is in `src/glossary.js`. Practical examples are teaching scenarios, not verified product claims. Numeric denier and micron examples are dimensional calculations. The glossary distinguishes yarn linear density from fiber diameter, regenerated cellulose from recycled content, and traceability from certification. Pre-consumer material guidance points to 2026 policy updates rather than presenting an older toolkit as a current certification decision.

## Search architecture

The interactive application retains its hash routes for standalone use. A shared renderer also generates a glossary index and 32 full HTML definition pages. These contain the actual text and normal links before JavaScript runs. The root HTML includes a glossary link in its no-JavaScript fallback.

Each static definition has a distinct title, description, canonical URL, Open Graph metadata, DefinedTerm structured data and BreadcrumbList structured data. The index uses DefinedTermSet. Structured descriptions match visible definitions. No FAQ rich-result eligibility or ranking improvement is promised. `sitemap.xml` lists the 33 glossary URLs without hash fragments.

This follows [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) and [crawlable-link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable). Readable content and descriptive internal links are the foundation; the implementation does not use keyword stuffing or hidden definitions.

## Deployment boundary

The default canonical base is `https://sharpmeow.github.io/FibersOfEarth/`. Set `SITE_URL` before building if the actual hosting address differs. GitHub Pages was not enabled when this change was prepared. Committing HTML to GitHub does not publish an indexable website at the canonical address. Deploy the complete `dist/` directory, verify the production address, then submit its sitemap through the site's search-console account if desired. Search-engine indexing and rankings are external decisions.

For an offline copy, open root `index.html` for the interactive app or `glossary/index.html` for the reading edition. Keep the glossary directory with the latter. No external scripts, fonts or services are required to read definitions.
