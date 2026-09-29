# Regional Endonyms: Research And Geometry

## Scope And Selection

This is a deliberately small prototype containing eight examples, selected to contrast cross-border cultural regions with administrative units inside larger states. It is not a representative sample of world regions and is weighted toward Europe. Selection does not imply that an omitted community lacks a homeland or an endonym. Records were reviewed September 25, 2026.

Each record in `../data/regions.js` includes the displayed endonym, named language, English search name, state context, geographic interpretation, source URLs, and geometry method. Source descriptions support the chosen interpretation; they do not certify our coordinates. We have not claimed to read or digitize the full text of the O’Shea monograph: its publisher’s description establishes the relevance of contested perceptions and geography, while the linked reference article provides accessible geographic context.

## What Is Drawn

- **Sápmi:** Northern Sámi form; a broad traditional-settlement sketch across Norway, Sweden, Finland, and Russia, based on the Sámi Information Centre’s description and map context. Different Sámi languages have other forms.
- **Euskal Herria:** seven historical territories across Spain and France, following the Basque Government’s definition. It is not restricted to Euskadi and is not a map of contemporary Basque-language prevalence.
- **Cymru:** approximate administrative Wales, including Anglesey in the coarse polygon. Not a Welsh-speaker distribution map.
- **Breizh:** the historical five-department Brittany, including Loire-Atlantique. The contemporary administrative region has four departments. Bertègn is additionally shown as a Gallo form.
- **Catalunya:** the autonomous community in Spain. The broader Catalan-speaking world is explicitly distinguished.
- **Kurdistan:** a coarse locator outline through parts of Türkiye, Iraq, Iran, and Syria. Its extent varies among authors and political traditions. It is not the Kurdistan Region of Iraq, a current-control map, or a demographic boundary.
- **தமிழ்நாடு:** the Indian administrative state Tamil Nadu. Fine boundary details and Puducherry enclaves are omitted. It is not all Tamil-speaking territory.
- **Kalaallit Nunaat:** generalized Greenland geometry from Natural Earth, within the Kingdom of Denmark. It is not subdivided by Inuit language variety.

Seven outlines were hand-authored as coarse longitude/latitude sketches for this prototype. They are not GIS exports from the cited institutions. A centroid-like point provides a visible label anchor; it is not a capital or a claim to cultural centrality. D3’s spherical polygon winding is normalized to avoid accidentally drawing the rest of the globe.

## Source Access And Attribution

Institutional, governmental, and scholarly-context sources are linked in the record and visible inspector. Text is editorial synthesis. For the three records that also draw on Wikipedia context, credit belongs to the contributors to [Bretagne](https://fr.wikipedia.org/wiki/Bretagne), [Kurdistan](https://en.wikipedia.org/wiki/Kurdistan), and [Tamil Nadu](https://en.wikipedia.org/wiki/Tamil_Nadu). Their History tabs identify contributors and revisions. Adapted records and sketches are offered under CC BY-SA 4.0; linked source documents retain their own licenses.

The eight shapes pass checks for finite coordinates, small spherical area, and inclusion of their label anchors. These are software checks, not validation of cultural consensus. Community review and more careful digitization are appropriate before treating this as a reference atlas.
