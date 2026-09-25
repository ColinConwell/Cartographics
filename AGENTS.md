# Cartographics Repository Guide

This repository contains `cartographics/`, a portable static collection of four interactive atlases. Open `cartographics/index.html` directly or serve that folder with a static HTTP server. No build or network connection is required to view the maps.

## Structure And Goals

- `cartographics/index.html`, `styles.css`, `app.js`: collection landing page and three cartographic themes.
- `cartographics/maps.json`: build registry; keep it consistent with the landing page links.
- `cartographics/endonym-atlas/`: original country endonyms, audio, data, research, and collection scripts.
- `cartographics/regional-endonyms/`: eight sourced regional records and approximate extents.
- `cartographics/projection-room/`: eight side-by-side projections with distortion circles.
- `cartographics/spice-routes/`: five culinary plants and dated historical evidence.
- Each atlas owns local `assets/`, `data/`, `research/`, and licensing notices.
- `scripts/`: dependency-free Python site assembly, local-link validation, Node spherical-geometry checks, and publishing helper.
- `.github/workflows/pages.yml`: validates PRs; on main, snapshots the site to `gh-pages` and deploys the same artifact to Pages.
- `_site/`: ignored generated public tree. Never edit generated files directly.

## Development Gotchas

Keep runtime dependencies local and use classic scripts so `file://` works. Do not present English pronunciation approximations as IPA or exact native pronunciation. Match recordings to the named language and spelling. Preserve source URLs and audio attribution. Native country names are often multilingual; the default label is an editorial choice, not a claim of exclusive official status. Small states must remain searchable even if absent from map geometry.

Preserve the root repository license and all component-specific licenses. New code uses GPL-3.0; the original atlas retains its own terms. No ZIP is currently present in the working tree.

The three new atlases contain identical copies of `cartographics/assets/geo.js` and the 110m world data for portability. Synchronize copies when editing the helper. D3 requires clockwise spherical exterior rings; use the helper’s polygon normalization rather than rendering a region’s spherical complement. Region outlines are explicitly approximate editorial sketches, not digitized scholarly boundaries. Culinary dates include broad display anchors; lines are schematic. Do not infer exact routes or ethnic boundaries from these records.

Run `python3 scripts/validate_site.py`, `node scripts/validate_maps.cjs`, `python3 scripts/build_site.py`, and `python3 scripts/validate_site.py --site _site` before publishing. Verify mobile layouts and interactive state in a browser. GitHub Pages uses Actions as its configured source; the gh-pages snapshot does not trigger a second deployment. Never publish `.env*`, `mcp.json`, or agent notes.
