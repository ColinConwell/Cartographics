/* Meaningful data and spherical geometry checks. No npm dependencies needed. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../cartographics');
const context = vm.createContext({window: {}, console});
function run(file) { vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}); }
run('assets/vendor/d3.min.js');run('assets/vendor/topojson-client.min.js');run('projection-room/assets/vendor/d3-geo-projection.min.js');
run('assets/data/world.js');context.ATLAS_WORLD=context.window.ATLAS_WORLD;
run('assets/geo.js');run('regional-endonyms/data/regions.js');run('projection-room/data/projections.js');run('spice-routes/data/ingredients.js');
const {Cartography:C,REGIONS,PROJECTIONS,INGREDIENTS} = context.window;
const d3=context.d3;
assert.equal(REGIONS.length,8);assert.equal(PROJECTIONS.length,8);assert.equal(INGREDIENTS.length,5);
for(const folder of ['regional-endonyms','projection-room','spice-routes']){
  assert.equal(fs.readFileSync(path.join(root,folder,'assets/geo.js'),'utf8'),fs.readFileSync(path.join(root,'assets/geo.js'),'utf8'),'Portable geo helper drift');
  assert.equal(fs.readFileSync(path.join(root,folder,'data/world.js'),'utf8'),fs.readFileSync(path.join(root,'assets/data/world.js'),'utf8'),'Portable world data drift');
}
function coordinates(point){assert.equal(point.length,2);assert(point.every(Number.isFinite));assert(Math.abs(point[0])<=180&&Math.abs(point[1])<=90);}
function source(s){assert(s.title&&s.url.startsWith('https://'));}
for(const r of REGIONS){
  coordinates(r.center);r.sources.forEach(source);assert(r.description&&r.extent&&r.geometryMethod);
  const geometry=r.featureId?C.world.features.find(f=>f.id===r.featureId).geometry:C.polygon(r.outline);
  assert(d3.geoArea(geometry)>0&&d3.geoArea(geometry)<1,r.name+' must be a small region, not its spherical complement');
  assert(d3.geoContains(geometry,r.center),r.name+' label anchor must be inside its chosen extent');
}
for(const spec of PROJECTIONS){
  for(const longitude of [-180,-90,0,90,180]){
    const projection=d3[spec.factory]().rotate([-longitude,0]).fitExtent([[14,18],[646,418]],C.sphere);
    const mapPath=d3.geoPath(projection)(C.land);
    assert(mapPath&&mapPath.length>500&&!/NaN|Infinity/.test(mapPath),spec.name+' invalid projected geometry');
  }
}
for(const ingredient of INGREDIENTS){
  coordinates(ingredient.origin);source(ingredient.source);let prior=-Infinity;
  for(const event of ingredient.events){
    assert(event.year>=prior,'Timeline records must be chronological');prior=event.year;
    assert(event.year>=-4000&&event.year<=1900);coordinates(event.point);source(event.source);
    assert(event.kind&&event.date&&event.text);if(event.from)coordinates(event.from);
  }
}
const p=d3.geoEqualEarth().scale(100);
const areas=[0,30,60].map(lat=>d3.geoPath(p).area(d3.geoCircle().center([0,lat]).radius(5).precision(.5)()));
assert(Math.max(...areas)/Math.min(...areas)<1.005,'Equal-area test circles should retain equal area');
console.log('PASS: 8 regional geometries, 40 projection/meridian combinations, 5 ingredient chronologies, equal-area invariant, and portable copies');
