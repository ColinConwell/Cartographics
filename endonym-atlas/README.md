# Endonym Atlas

A portable interactive world map of country names used within those countries. Open **index.html** in a modern web browser. No installation, account, API key, build step, or internet connection is needed to explore the map or play the bundled audio.

## Features

- 197 countries and separately administered places: 193 UN members, Palestine, Vatican City, Kosovo, and Taiwan.
- 300 selected language-and-name variants, with the original script, Latin-letter Romanization, and an approximate English pronunciation guide.
- Language selectors for multilingual entries; multiple readings of the same spelling are separate variants.
- 128 bundled audio clips, used by 129 name variants across 106 places; source IPA for 223 variants. Recordings have language matches and reuse credits.
- Country and language search, regional browsing, a recording filter, zoom/pan, island markers, and keyboard navigation.
- Per-country Wikipedia sources, Wiktionary pronunciation links, individual audio credits, source extracts and editable datasets.

## Open or Host

Double-click `index.html`. If your file-preview application does not execute JavaScript, open the file in Safari, Firefox, Chrome, or another full browser.

To serve locally, run from this folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000`. The entire folder can also be uploaded to any static website host. Keep the relative directory structure intact.

## Controls

Choose **Native Script**, **Romanized**, or **Pronunciation** to change map labels. Click a country or search by its English name, endonym, Romanization, or language. A country's language selector changes its map label and detail panel together. **Browse Countries** provides an accessible list, region filters, and a recording filter.

Drag or use the mouse wheel to navigate. With the map focused, arrow keys pan, `+`/`−` zoom, and `Home` restores the world view. `/` focuses search. Search supports arrow keys, Enter, and Escape. The target button in the detail panel zooms to the selected country. The URL fragment preserves the selected country, language variant, and label mode.

## Interpretation

An endonym is a name used within a place. A country may have many. The map's default language is an editorial selection, not an assertion of legal priority or a claim to represent every resident. Country coverage is complete within the stated scope; language coverage is selective. The original Wikipedia row is available under **More Names in the Source**.

Romanization is not an English translation. Latin-script names usually stay unchanged. English pronunciation guides are editorial approximations, **not IPA**, and have not all been reviewed by native speakers. They do not reliably encode tone, pitch accent, nasalization or every regional sound. Source IPA and recordings are provided separately when available. A recording's language is matched to its source section; speaker nativeness and dialect representativeness are not independently certified. Missing recordings are stated explicitly; no browser speech synthesis is substituted.

Some political boundaries and naming conventions are contested. The Natural Earth map is generalized; it does not depict all territorial claims or current control. Territories and other out-of-scope areas are shown in a lighter color. The projection is Natural Earth I, and labels appear progressively as space becomes available. No inference about sovereignty should be drawn from a label or polygon.

## Files

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | Complete static application |
| `data/names.tsv` | Editable language, native spelling, Romanization and English-guide records |
| `data/countries.json`, `data/countries.js` | Structured country records, provenance, IPA and audio metadata |
| `data/world-50m.json`, `data/world.js` | Local TopoJSON world geometry |
| `assets/audio/` | Bundled recordings, with credits in each country record |
| `assets/vendor/` | Pinned D3 and TopoJSON libraries and licenses |
| `research/` | Sources, research methods, coverage reports and design reference |
| `scripts/` | Data collection, build and validation code |
| `LICENSES.md` | Code, data, source and audio reuse terms |

## Rebuild the Data

The delivered website needs no Python packages. Rebuilding research data requires Python 3, `beautifulsoup4`, `curl`, and a network connection:

```sh
python3 -m venv .venv
.venv/bin/pip install beautifulsoup4
.venv/bin/python scripts/build_data.py
```

The collector caches public responses in `/tmp/endonym-atlas-cache`. It checks matching Wiktionary language sections, requires an author and license before bundling a recording, and separately identifies the Japanese readings Nihon and Nippon. For a local-only data rebuild after editing names, use `--skip-research --skip-audio`. Variant ordering supplies stable keys; changing that order requires re-collecting pronunciation metadata rather than reusing the old keys.

Source links require internet access. Local Noto subsets support Tibetan, Thaana and Tifinagh; other scripts rely on the multilingual fonts available on your device. There are no remote fonts, network map tiles, analytics, cookies, or runtime API calls.
