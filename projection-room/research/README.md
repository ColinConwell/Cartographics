# Projection Room: Mathematics And Reading Notes

## Implemented Projections

The interface implements Equal Earth, Mercator, Natural Earth 1, Equirectangular, Orthographic, Mollweide, Robinson, and Sinusoidal using bundled D3 7.9.0 and d3-geo-projection 4.0.0. Geographic data are Natural Earth 1:110 million, distributed in world-atlas 2.0.2.

Equal Earth, Mollweide, and Sinusoidal preserve relative areas. Mercator is conformal: it preserves infinitesimal angles but enlarges high latitudes. Natural Earth and Robinson are compromises. Equirectangular preserves scale along meridians and, with its default standard parallel, the equator; it is not globally distance-preserving. Orthographic is a parallel perspective of the near hemisphere.

## Comparison Method

Both panels receive the same central meridian, land geometry, borders, and 10-degree graticule. Each projection independently fits its whole drawable domain to its frame. Thus the overall scale differs across panels; absolute pixel area is not comparable. Mercator’s mathematical poles are infinite and its default D3 clipping limits are near ±85.05 degrees. Orthographic uses a 20-degree viewing latitude and excludes the far hemisphere. Other projections use their ordinary equatorial aspect.

The optional shapes are spherical circles with a five-degree angular radius. Centres are placed at 30-degree longitude and latitude intervals, excluding the poles. They are finite-area teaching aids, not infinitesimal Tissot indicatrices. The equal-area numerical check compares projected areas at 0, 30, and 60 degrees latitude, with a 0.5% tolerance for sampling and path resampling.

## Sources

- John P. Snyder (1987), [Map Projections: A Working Manual, USGS Professional Paper 1395](https://pubs.usgs.gov/pp/1395/report.pdf).
- [D3 Geo projection documentation](https://d3js.org/d3-geo/projection), including spherical clipping, rotation, fitting and resampling.
- [D3 Geo Projection](https://github.com/d3/d3-geo-projection), including mathematical implementations and references for Mollweide, Robinson and Sinusoidal.
- The user-supplied [List of Map Projections](https://en.wikipedia.org/wiki/List_of_map_projections) provided the overview and links for further exploration. Mathematical rendering is from D3, rather than copied map images.

Sources and implementation choices were reviewed September 25, 2026. No projection eliminates all forms of distortion; these views use a spherical Earth, not an ellipsoidal geodetic survey model.
