# Cartographics Repository Guide

This repository contains `endonym-atlas/`, a portable static world map of country endonyms. Open its `index.html` directly or serve that folder with any static HTTP server. No build or network connection is required for the delivered page.

## Structure And Goals

- `endonym-atlas/data/`: country records and bundled map geometry.
- `endonym-atlas/assets/`: vendored JavaScript and pronunciation recordings.
- `endonym-atlas/research/`: source extracts, provenance, and methodology.
- `endonym-atlas/scripts/`: reproducible data collection and validation helpers.

## Development Gotchas

Keep runtime dependencies local and use classic scripts so `file://` works. Do not present English pronunciation approximations as IPA or exact native pronunciation. Match recordings to the named language and spelling. Preserve source URLs and audio attribution. Native country names are often multilingual; the default label is an editorial choice, not a claim of exclusive official status. Small states must remain searchable even if absent from map geometry.

Preserve the root repository license and the component-specific attribution and licensing notices in `endonym-atlas/LICENSES.md`. The ZIP at the repository root is a portable distribution of the atlas folder.
