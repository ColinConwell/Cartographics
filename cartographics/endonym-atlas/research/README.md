# Research Methods and Coverage

## Research Question

Which country names are used in languages within each country, how can those names be represented in local orthography and Latin letters, and which sourced pronunciation recordings can be redistributed with the page?

## Scope and Sources

The country inventory contains 193 UN members, Palestine, Vatican City, Kosovo and Taiwan. It deliberately excludes dependent territories and does not attempt to settle recognition disputes. The inventory is matched to ISO-style country identifiers and Natural Earth geography. Kosovo uses the source database's `UNK` identifier; it is not an official ISO alpha-3 assignment.

The principal source is Wikipedia's [native-name table](https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_and_their_capitals_in_native_languages). The complete table snapshot is retained in `wikipedia-country-names.md` and `.html`, including its editorial notices. The editable name records select common short names where practical, retain some formal names to distinguish the two Congos, and normalize several source spellings. Source row text is preserved in every country record for comparison.

Additional web searches covered endonyms and exonyms, alternative country names, sovereignty/inventory definitions, India, Japan, China, Korea, South Africa's languages, Māori naming of New Zealand, Kiribati pronunciation, Mali's language policy, and native-name cases in Africa and the Middle East. `search-log.json` records saved search results. Supplementary Wikipedia articles are retained as Markdown snapshots.

Individual country pages were also fetched for structured source checks. `country-checks.json` records each attempted page, retrieval outcome and available lead/native-name extracts. A successful HTTP retrieval is **not** equivalent to expert verification of every selected name or pronunciation. Failed direct article fetches do not erase coverage from the primary country-name table. The coverage summary reports actual retrieval counts.

## Names and Language Selection

`data/names.tsv` contains deliberately selected language variants. These include government-language names, community-used names, and selected Indigenous/regional names. No default claims to be the one true national endonym. Bolivia and India are explicitly partial linguistic inventories. South Africa contains the eleven written spoken-language names, with South African Sign Language noted rather than misrepresented as audio. The original source table supplies additional forms beyond the curated selector.

Romanization retains language-specific conventions and diacritics; Latin spelling is preserved when the language already uses it. Editorial English guides are supplementary approximations, not machine transliterations or IPA. They cannot reliably represent all tones, pitch accents, distinctions in vowel quality or regional variants. They should be reviewed by language specialists before use as instructional pronunciation standards.

## Recordings and IPA

For every selected name, the collector attempts the corresponding English Wiktionary entry and inspects the matching language section. It extracts source IPA where found and seeks a real audio element. Mandarin audio filenames must identify Mandarin/Chinese rather than another Chinese topolect. Japanese audio filenames must identify the selected reading, Nihon or Nippon. Rhyming fragments are excluded from the IPA field.

Before downloading a recording, its Commons metadata must provide an author and license. The original Commons page, derivative media URL, author and license are saved. If retrieval, matching or attribution fails, the interface explicitly reports that no verified recording was bundled. This does not mean no recording exists anywhere. Audio is never synthesized as a substitute. A matched source section does not independently verify a speaker's nativeness, dialect or recording quality.

## Dates and Reproducibility

Public web research was performed September 25, 2026. Article content can change after collection. The build script, editable TSV, preserved source rows, check outcomes and audio credits allow corrections without rebuilding the UI. Runtime data are embedded in classic JavaScript files so the site works under `file://` without a fetch server.

## Limitations

- Wikipedia's source list has maintenance warnings; coverage and linguistic precision vary by language.
- The selected 300 variants do not exhaust every native, official, regional or signed language.
- English-style sound guides are editorial and not comprehensively native-speaker-reviewed.
- Source IPA may include several dialects, and recordings may use one particular dialect. Mixed-topolect IPA is omitted from Mandarin entries. Three recordings explicitly identify a non-native speaker in the source; the playback credits disclose this.
- Generalized map boundaries do not represent every dispute or current control.
- Some scripts depend on installed system fonts. The page has no external font dependency.
- A missing label at a given zoom indicates space constraints, not a missing country; search and the browse list expose every entry.

## Final Coverage

All 197 entries match a row of the primary Wikipedia table. Direct country-article retrieval succeeded for 158 of 197 attempts. The final dataset has 300 selected name variants, 223 with source IPA, and 129 with audio using 128 distinct files across 106 places. Every bundled audio file was checked with ffprobe and decoded successfully. Detailed machine-readable counts are in `coverage.json`. Missing recordings and incomplete source lookups are retained in `pronunciations.json` instead of being presented as verified absence.
