# Verification Report

## Functional Verification

The running static page was tested in the Codex in-app browser at the normal 1280 × 720 viewport, the concept's native 1536 × 1024 dimensions, and a 390 × 844 phone viewport. No Playwright Chromium fallback was used; the browser's own locator API supported the interaction tests.

| Workflow | Observed Result |
| --- | --- |
| Native Script → Romanized → Pronunciation | Button states and map labels changed; Japan's phonetic label became `nee-hohn`. |
| Country search | Switzerland selected the correct country and zoomed to it. |
| Multilingual selection | French changed Switzerland to `Suisse` in the detail panel and map. |
| Native-script search | `العراق` found Iraq and displayed Arabic with correct right-to-left direction. |
| Empty search | An unmatched query displayed a clear no-results message. |
| Regional browse | Oceania returned 14 entries; Tuvalu was selectable despite lacking a polygon. |
| Audio filter | The list returned 106 places with at least one recording. |
| Japanese readings | Nihon and Nippon selected different data and audio; both played successfully. |
| Map navigation | Zoom changed the geometry transform; reset restored the world view. |
| Methodology dialog | Opened and closed with the scope, limitations and sources visible. |
| Mobile width | The viewport and document width both measured 390 px; no horizontal overflow. |
| Browser diagnostics | No warnings or errors were reported in the tested workflows. |
| Audio data | All 128 distinct files passed ffprobe decoding and duration checks. |
| Data coverage | 197 unique entries; 193 UN members; 300 populated name variants; valid local asset references. |

Direct `file://` navigation could not be tested through the automation browser because its URL policy blocks local-file navigation. No workaround was attempted. The delivered implementation uses only local classic scripts, styles, fonts and audio, with no `fetch`, module imports, remote tiles or runtime API calls. Local HTTP testing verifies the same packaged assets. Source hyperlinks intentionally require internet access.

## Concept Comparison

The reference is `concept.png`, generated with the built-in image-generation tool. The original prompt is recorded in `prompt.txt`. Screenshots were captured through the in-app browser, and both the concept and the final desktop screenshot were inspected with `view_image` at 1536 × 1024. The phone screenshot was also inspected.

| Comparison Point | Evidence and Resolution |
| --- | --- |
| Structure | Both images use a slim title band, label toolbar, large map, narrow detail rail and footer. The implementation preserves this composition. |
| Palette | The ivory page, teal ocean, sage countries, forest ink and terracotta selection follow the specified tokens. |
| Typography | Serif title, large native name, italic Romanization and serif geographic labels are preserved. Functional controls deliberately follow the brief's sans-serif specification. |
| Components | The three label controls, search, language selector, pronunciation facts, playback and source section are implemented as real controls. |
| Map geometry | The implementation uses the mathematically defined Natural Earth I projection and real borders. Its proportions and label placement differ intentionally from the generated image, which is not reliable geographic data. |
| Label readability | Collision handling, zoom-dependent density and fixed screen-size labels replace the concept's invented or overlapping labels. Ocean-label overlap was reduced. |
| Responsive layout | The rail becomes a section below the map on phones; button wrapping and excessive mobile map height were corrected. |
| Source and audio wording | The button says “Listen to Pronunciation.” It does not assert independently verified speaker nativeness. Credits and pronunciation-approximation notices are intentionally added. |
| Detail scrolling | Long entries scroll within the desktop rail. Selecting another country now resets the rail to its top. |

The above-the-fold copy was compared with the concept and requirements. Title, subtitle, main modes, search purpose and country facts are preserved. Intentional additions are Browse Countries, geographic context, variant counts, audio licensing, pronunciation caveats and coverage statistics. “Language” became “Language & Name” to distinguish multiple readings in one language. Dataset values supersede the concept's illustrative map text.

The final implementation was faithfully verified against the reference's visual system and interaction layout, with the geographic, accessibility and research-driven deviations documented above. No unresolved clipping or horizontal-overflow defects were observed in the final checked layouts. This is a usable atlas with disclosed research limitations; it is not a claim of expert linguistic certification.
