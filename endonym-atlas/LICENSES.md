# Licenses and Attribution

## Original Interface Code — MIT License

Copyright (c) 2026 Endonym Atlas contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Wikipedia and Wiktionary Text and Adapted Names

Wikipedia/Wiktionary source extracts, adapted name data, and editorial pronunciation guides in this project are distributed under [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/). This project edits, selects, normalizes, combines and annotates source material. It does not imply Wikimedia endorsement.

Attribution belongs to the contributors of the articles identified by each record's `source`, `sourceTable`, and `pronunciationSource` URLs. Contributor histories are accessible through the History tab of each linked article, or by adding `?action=history` to the article URL. Full country/article provenance is in `data/countries.json`, `research/country-checks.json`, and `research/pronunciations.json`. Wikipedia source snapshots retained in `research/` link to their source pages and contributors.

The primary names reference is [List of countries and dependencies and their capitals in native languages](https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_and_their_capitals_in_native_languages), retrieved September 25, 2026. Supplementary articles are identified in the research notes and country records.

## Pronunciation Audio

Each file in `assets/audio/` retains its **individual Wikimedia Commons license**. Do not assume the application MIT license covers recordings. The `audio` object in each matching name record contains the exact Commons filename, original URL, author, license name and license URL. The interface displays those credits beside playback. See `research/audio-credits.json` for the consolidated manifest. Audio files are copied from the source's playable derivative without editing their contents. Some recordings are public domain; others require attribution and share-alike reuse.

## Geographic Data

The map uses [world-atlas 2.0.2 countries-50m.json](https://github.com/topojson/world-atlas), derived from [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/). Natural Earth data are in the public domain. Boundaries are generalized and are not a statement of legal sovereignty or current territorial control.

Identifiers, region fields, coordinates and area estimates use [mledoze/countries](https://github.com/mledoze/countries), under the [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). The source database is preserved as `research/country-identifiers.json`. This attribution and ODbL obligations remain applicable to those database components when redistributing or modifying the combined dataset.

## Bundled Libraries

- D3 7.9.0 — ISC; Mike Bostock and contributors. See `assets/vendor/D3-LICENSE`.
- topojson-client 3.1.0 — ISC; Mike Bostock. See `assets/vendor/TOPOJSON-LICENSE`.

## Bundled Font Subsets

Noto Serif Tibetan, Noto Sans Thaana and Noto Sans Tifinagh are locally bundled subsets under the SIL Open Font License 1.1. Their copyright and license notices are in `assets/fonts/*-OFL.txt`; source URLs and subset characters are recorded in `research/font-credits.json`. These support scripts with inconsistent operating-system fallback coverage. Other scripts use system fonts.

## Design Reference

`research/design/concept.png` was generated with the built-in OpenAI image-generation tool as an interface design reference. The running application uses real geographic data and code-native text; the concept is not used as a map asset.
