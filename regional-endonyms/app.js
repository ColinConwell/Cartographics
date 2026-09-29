(() => {
 const C=Cartography, data=REGIONS.map(d=>({...d,geometry:d.featureId?C.world.features.find(f=>f.id===d.featureId).geometry:C.polygon(d.outline)}));
 const svg=d3.select('#map'),layer=svg.append('g'),projection=d3.geoNaturalEarth1().fitExtent([[14,16],[936,545]],C.sphere),path=C.base(layer,projection);
 const extents=layer.append('g'),pins=layer.append('g'),labels=layer.append('g');
 let selected=data[0], visible=data, zoomLevel=1;
 const zoom=d3.zoom().scaleExtent([1,18]).translateExtent([[0,0],[950,565]]).on('zoom',e=>{layer.attr('transform',e.transform);zoomLevel=e.transform.k;updatePins();});
 svg.call(zoom).on('dblclick.zoom',null);
 function updatePins(){const unit=Math.max(1,950/(svg.node().getBoundingClientRect().width||950));pins.selectAll('circle').attr('r',d=>(d.id===selected.id?6:4.5)*unit/zoomLevel);labels.selectAll('text').style('font-size',15*unit/zoomLevel+'px').attr('dx',10*unit/zoomLevel).attr('dy',-9*unit/zoomLevel).style('stroke-width',3*unit/zoomLevel+'px');}
 function renderMap(){
   extents.selectAll('path').data(visible,d=>d.id).join('path').attr('d',d=>path(d.geometry)).attr('class',d=>'extent'+(d.id===selected.id?' selected':'')).attr('fill',d=>d.color).attr('stroke',d=>d.color).on('click',(e,d)=>select(d,true));
   pins.selectAll('circle').data(visible,d=>d.id).join('circle').attr('class','region-pin').attr('cx',d=>projection(d.center)[0]).attr('cy',d=>projection(d.center)[1]).attr('fill',d=>d.color).attr('tabindex',0).attr('role','button').attr('aria-label',d=>'Explore '+d.name).on('click',(e,d)=>select(d,true)).on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(d,true);}}).selectAll('title').data(d=>[d]).join('title').text(d=>d.name+' · '+d.language);
   labels.selectAll('text').data(visible.filter(d=>d.id===selected.id)).join('text').attr('class','map-label').attr('x',d=>projection(d.center)[0]).attr('y',d=>projection(d.center)[1]).text(d=>d.name);
   updatePins();
 }
 function renderDetail(){
   const d=selected;
   document.querySelector('#detail').innerHTML='<h2 lang="'+d.lang+'">'+d.name+'</h2>'+(d.alternate?'<p class="name-alt">'+d.alternate+'</p>':'')+'<div class="language">'+d.language+' · '+d.type+'</div><p class="states">'+d.states.join(' / ')+'</p><p class="description">'+d.description+'</p><section class="detail-section"><h3>Approximate Extent</h3><svg class="inset" viewBox="0 0 120 95" aria-hidden="true"></svg><p>'+d.extent+'</p></section><section class="detail-section source-links"><h3>Sources &amp; Context</h3>'+C.sourceLinks(d.sources)+'</section>';
   const p=d3.geoMercator().fitExtent([[10,10],[110,85]],d.geometry);p.clipExtent([[0,0],[120,95]]);
   const inset=d3.select('.inset'),smallPath=C.base(inset,p,{graticule:false});inset.append('path').attr('d',smallPath(d.geometry)).attr('fill',d.color).attr('fill-opacity',.5).attr('stroke',d.color).attr('stroke-dasharray','3 2');
 }
 function renderList(){
   d3.select('#places').selectAll('button').data(visible,d=>d.id).join('button').attr('aria-pressed',d=>String(d.id===selected.id)).style('--swatch',d=>d.color).html(d=>'<span class="swatch" aria-hidden="true"></span><span lang="'+d.lang+'">'+d.name+'</span>').on('click',(e,d)=>select(d,true));
   document.querySelector('#result-count').textContent=visible.length+' of '+data.length+' Regions';document.querySelector('#empty').hidden=visible.length>0;
 }
 function select(d,focus){selected=d;renderMap();renderList();renderDetail();if(focus){const b=path.bounds(d.geometry),k=Math.min(14,.78/Math.max((b[1][0]-b[0][0])/950,(b[1][1]-b[0][1])/565));const x=(b[0][0]+b[1][0])/2,y=(b[0][1]+b[1][1])/2;svg.call(zoom.transform,d3.zoomIdentity.translate(475,282).scale(Math.max(1,k)).translate(-x,-y));}}
 function filter(){const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const query=normalize(document.querySelector('#search').value),type=document.querySelector('#type').value;visible=data.filter(d=>(type==='all'||d.type===type)&&normalize([d.name,d.english,d.alternate,d.language,...d.states].join(' ')).includes(query));if(visible.length){if(!visible.includes(selected))selected=visible[0];renderDetail();}else{document.querySelector('#detail').innerHTML='<h2>No Matching Region</h2><p class="description">Change the search or region type to explore another record.</p>';}renderMap();renderList();svg.call(zoom.transform,d3.zoomIdentity);}
 document.querySelector('#search').addEventListener('input',filter);document.querySelector('#type').addEventListener('change',filter);
 document.querySelector('#reset').addEventListener('click',()=>{document.querySelector('#search').value='';document.querySelector('#type').value='all';filter();});
 document.querySelector('#zoom-in').addEventListener('click',()=>svg.call(zoom.scaleBy,1.6));document.querySelector('#zoom-out').addEventListener('click',()=>svg.call(zoom.scaleBy,1/1.6));
 document.querySelector('#download').addEventListener('click',()=>C.download('regional-endonyms.json',JSON.stringify(REGIONS,null,2),'application/json'));
 new ResizeObserver(updatePins).observe(svg.node());
 select(selected,false);
})();
