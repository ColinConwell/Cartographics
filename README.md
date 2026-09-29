# Cartographics

Four independent, interactive atlases of place, identity, geometry, and culinary history.

[Open the collection](cartographics/index.html), or run:

```sh
python3 -m http.server 8000 --directory cartographics
```

Visit `http://localhost:8000`. The collection and all four maps also work directly from their local `index.html` files. No build, API key, account, or runtime network access is required.

## The Collection

| Map | Exploration |
| --- | --- |
| [Endonym Atlas](cartographics/endonym-atlas/index.html) | The existing atlas of country names, language variants, and pronunciation recordings. |
| [The Places They Know](cartographics/regional-endonyms/index.html) | Eight selected regional endonyms, searchable by name, language, or state. Cultural and administrative extents are distinguished and individually sourced. |
| [The Projection Room](cartographics/projection-room/index.html) | Eight mathematically implemented projections, compared side by side with synchronized central meridians and equal-radius geodesic circles. |
| [A World Wanting Flavor](cartographics/spice-routes/index.html) | Five culinary plants, with origin descriptions and 12 selected historical or archaeological episodes revealed through a timeline. |

The landing page offers **Observatory**, **Parchment**, and **Routes** themes. Its real geographic globe rotates, supports dragging, and includes a pause control. Theme preference is remembered locally where browser storage is available. Reduced-motion preferences disable automatic globe rotation.

Each atlas is self-contained within its folder. The new prototypes have different styles and include local vendor libraries, geometry, source records, methodology, and license notices. The Collection link leads to the parent index when the map is used as part of this repository; it is optional when distributing a map alone. External source links need an internet connection, but map functionality does not.

## Research Scope

The new maps are curated prototypes. Regional polygons are coarse editorial sketches, not digitized scholarly boundaries. The records specify the geographic interpretation chosen. Projection circles are finite geodesic circles, not exact infinitesimal Tissot indicatrices. Culinary lines are illustrative connections, not reconstructed shipping routes. Sources and limitations are visible within each map and in its `research/README.md`.

## Build And Validate

Requires Python 3.10+ and Node.js 18+ for validation; neither is needed to view the site.

```sh
python3 scripts/validate_site.py
node scripts/validate_maps.cjs
python3 scripts/build_site.py
python3 scripts/validate_site.py --site _site
python3 -m http.server 8001 --directory _site
```

The builder reads `cartographics/maps.json`, copies the landing page and the four map folders to `_site/`, preserves relative links, adds `.nojekyll`, and records SHA-256 file hashes. It excludes private configuration, agent notes, source-collection scripts, design references, and hidden files. It never copies the whole repository.

## GitHub Pages

The [publishing workflow](.github/workflows/pages.yml) runs on pushes to `main`, pull requests, and manual dispatch. Pull requests validate and build without publishing. A push to `main` or manual run on `main`:

1. Validates the source records and assembles `_site/`.
2. Checks Pages configuration and saves the validated output to the separate `gh-pages` branch, preserving its commit history.
3. Deploys that same build with GitHub’s Pages artifact deployment actions.

**One-time repository setting:** under **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. The `gh-pages` branch is an inspectable publication snapshot; do not also enable branch-based Pages builds. GitHub does not trigger another Pages workflow from a branch push made with `GITHUB_TOKEN`, so deployment is performed explicitly in the same workflow. No personal access token is needed. The repository must allow Actions and grant its workflow permission to write the publishing branch.

The project URL is [colinconwell.github.io/Cartographics/](https://colinconwell.github.io/Cartographics/). See the [GitHub automation index](.github/index.md) for action descriptions and local workflow testing with `nektos/act`.

## Adding Another Map

Create a self-contained folder under `cartographics/`, add its record to `maps.json`, and add a corresponding collection row to `cartographics/index.html`. Use relative links and classic scripts if direct `file://` operation is required. Each new prototype currently has a copy of `assets/geo.js`; synchronize those copies when changing the shared development helper. The validation script detects drift in the current three copies.

## Licensing

The root [GPL-3.0 license](LICENSE) is preserved. New application code follows that license. The existing Endonym Atlas keeps its component-specific terms. Vendor libraries, adapted records, geography, audio, and generated artwork are identified in [collection credits](cartographics/LICENSES.md) and each atlas’s `LICENSES.md`.
