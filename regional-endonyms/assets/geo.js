/* Small shared development helper; identical local copies keep each atlas portable. */
window.Cartography = (() => {
  const world = topojson.feature(ATLAS_WORLD, ATLAS_WORLD.objects.countries);
  const land = topojson.merge(ATLAS_WORLD, ATLAS_WORLD.objects.countries.geometries);
  const borders = topojson.mesh(ATLAS_WORLD, ATLAS_WORLD.objects.countries, (a, b) => a !== b);
  const sphere = {type: 'Sphere'};
  const graticule = d3.geoGraticule10();
  function base(svg, projection, options = {}) {
    const path = d3.geoPath(projection);
    svg.append('path').datum(sphere).attr('class', 'ocean').attr('d', path);
    svg.append('path').datum(land).attr('class', 'land').attr('d', path);
    if (options.borders !== false) svg.append('path').datum(borders).attr('class', 'borders').attr('d', path);
    if (options.graticule !== false) svg.append('path').datum(graticule).attr('class', 'graticule').attr('d', path);
    return path;
  }
  function polygon(coords) {
    const points = coords.map(p => [...p]);
    if (points[0][0] !== points.at(-1)[0] || points[0][1] !== points.at(-1)[1]) points.push([...points[0]]);
    const geometry = {type: 'Polygon', coordinates: [points]};
    // D3 expects clockwise exterior rings on the sphere.
    if (d3.geoArea(geometry) > 2 * Math.PI) points.reverse();
    return geometry;
  }
  function download(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function sourceLinks(sources) {
    return sources.map(s => '<a href="' + s.url + '" target="_blank" rel="noopener noreferrer">' + s.title + ' ↗</a>').join('');
  }
  return {world, land, borders, sphere, graticule, base, polygon, download, sourceLinks};
})();
