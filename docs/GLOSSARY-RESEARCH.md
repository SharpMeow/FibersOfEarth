# Glossary research and search discovery

Research date: September 22, 2026. Scope: expand all 32 original glossary entries while preserving their names and offline availability, then extend the glossary to 99 terms (edition 2.2). Definitions have a short answer, an explanation, an original practical example, distinctions, related terms and linked references. No outside reviewer or scientific peer review is claimed.

## Research method

Technical terminology was checked against primary institutional and industry sources: Cotton Incorporated's CottonWorks encyclopedia and manufacturing guides; Woolmark and the International Wool Textile Organisation; the Alliance for European Flax-Linen & Hemp; BISFA terminology; the Cashmere and Camel Hair Manufacturers Institute; Textile Exchange; NC State's textile comfort research center; and the Craft Yarn Council. Lenzing and The LYCRA Company support descriptions of their respective production technologies and brand terminology. Manufacturer claims are not treated as independent comparative evidence.

Each entry links its applicable references in the reading view. The complete source registry is in `src/glossary.js`. Practical examples are teaching scenarios, not verified product claims. Numeric denier and micron examples are dimensional calculations. The glossary distinguishes yarn linear density from fiber diameter, regenerated cellulose from recycled content, and traceability from certification. Pre-consumer material guidance points to 2026 policy updates rather than presenting an older toolkit as a current certification decision.

## Search architecture

The interactive application retains its hash routes for standalone use. A shared renderer also generates a glossary index and 32 full HTML definition pages. These contain the actual text and normal links before JavaScript runs. The root HTML includes a glossary link in its no-JavaScript fallback.

Each static definition has a distinct title, description, canonical URL, Open Graph metadata, DefinedTerm structured data and BreadcrumbList structured data. The index uses DefinedTermSet. Structured descriptions match visible definitions. No FAQ rich-result eligibility or ranking improvement is promised. `sitemap.xml` lists the 33 glossary URLs without hash fragments.

This follows [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) and [crawlable-link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable). Readable content and descriptive internal links are the foundation; the implementation does not use keyword stuffing or hidden definitions.

## Deployment boundary

The default canonical base is `https://sharpmeow.github.io/FibersOfEarth/`. Set `SITE_URL` before building if the actual hosting address differs. GitHub Pages has been enabled with GitHub Actions as its deployment source. Committing HTML alone does not deploy it; run the Deploy site workflow after merging. Deploy the complete `dist/` directory, verify the production address, then submit its sitemap through the site's search-console account if desired. Search-engine indexing and rankings are external decisions.

For an offline copy, open root `index.html` for the interactive app or `glossary/index.html` for the reading edition. Keep the glossary directory with the latter. No external scripts, fonts or services are required to read definitions.

## Edition 2.2 expansion

The glossary grew from 32 to 99 terms: fiber science (cellulose, keratin, fibroin, crystallinity, glass transition, moisture regain, tenacity and more), yarn formation and processing (spinning systems, twist, drafting, melt and solution spinning, texturing, degumming, mercerization, felting, nonwovens), measurement and construction (tex, yarn count systems, fabric weight, momme, thread count, Super S numbers, plain weave, twill, satin, jersey), coloration (reactive, disperse and vat dyes, mordants, colorfastness, solution dyeing) and claims and labeling law (generic fiber names, the Textile Fiber Products Identification Act, the Wool Products Labeling Act, Regulation (EU) No 1007/2011, the FTC Green Guides, mass balance, transaction certificates, organic content claims, mulesing, life cycle assessment, fiber fragment release, biodegradability claims and regenerative agriculture).

Every term, including the original 32, now has two further sections: "The science and numbers" (mechanisms, formulas, test methods and typical values with conditions) and "Origins and history" (verified dates, people and places). Each entry lists at least two HTTPS references. 95 of the 99 entries are labeled verified; Fill power, Fulling, Sanforizing and the Worsted depth section are editorial, meaning their historical notes rest on standard textbook knowledge that could not be tied to a primary source during this pass. Legal entries describe what an instrument covers and name its citation; they are not legal advice. The same evidence method described in [CONTENT.md](CONTENT.md) applies.

Profile and glossary prose links the first mention of each glossary term to its definition, excluding everyday-word terms (hand, top) and known false friends (a keratin "intermediate filament" is not a textile filament).
