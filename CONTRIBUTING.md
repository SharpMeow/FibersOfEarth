# Contributing

Use Node.js 22+. Install with `npm ci`, then run `npm test`, `npm run build` and `npm run test:browser`. Install the test browser once with `npx playwright install chromium`.

Keep changes focused and describe the user-visible outcome. Update a regression test for a behavioral fix. Check desktop, tablet and phone layouts, keyboard focus, empty results, direct routes and offline operation. Build output in `dist/` is not committed; run `npm run build` to check it locally.

For content, follow [the editorial methodology](docs/CONTENT.md). Prefer primary references, distinguish brand names from generic fiber types, and label route evidence honestly. Never infer certifications or actual supplier connections from a geographic model. Do not reproduce long passages from source sites.

Use the project name or the creator's pseudonym, **Chaos**, in public attribution. Do not add personal names, local filesystem paths, credentials, original private archive contents or unrelated projects to the repository.

Update CHANGELOG.md and the relevant documentation when behavior, data, storage or deployment changes. Preserve third-party license notices. Use a pull request and allow the automated checks to pass before merging.
