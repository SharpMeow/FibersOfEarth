# Privacy

The app has no accounts, analytics, advertising, remote fonts or application backend. Application content and the base 1:110m map are bundled. When the site is hosted and you zoom the globe in, detailed Natural Earth coastline files (1:50m and 1:10m) are requested from the same site; opened from a local file, the globe keeps the bundled map.

Saved material IDs are stored in browser local storage under `fibersOfEarth.saved.v2`, and Display settings (motion, text size, contrast, link underlines) under `fibersOfEarth.display.v1`. Restore defaults in Display settings removes the latter. They can be removed individually or cleared through the Privacy page. Storage failures fall back to the current session. Search and filter choices run locally; shareable choices appear in URL fragments.

A hosting provider receives normal requests when the site is opened online and may maintain its own logs. External links visit independent reference sites under their policies. Downloads are generated locally. Clipboard writing occurs only after selecting Share. A file-based view shares only the route fragment, never its local filesystem path.

No user content is sent to an AI service. No telemetry is included in tests or application code. Automated browser tests use temporary browser profiles.
