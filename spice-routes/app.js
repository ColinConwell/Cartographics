(() => {
 const C=Cartography,svg=d3.select('#map'),layer=svg.append('g'),p=d3.geoNaturalEarth1().fitExtent([[15,15],[945,430]],C.sphere),path=C.base(layer,p),routes=layer.append('g'),markers=layer.append('g'),labels=layer.append('g');
 const eras=[-4000,-3000,500,1500,1650,1800,1900],range=document.getElementById('era');
 let ingredient=INGREDIENTS[0],playing=false,timer=null,active=-1,zoomLevel=1,lastDetailId=null;
 const zoom=d3.zoom().scaleExtent([1,8]).translateExtent([[0,0],[960,450]]).on('zoom',e=>{layer.attr('transform',e.transform);zoomLevel=e.transform.k;sizeMapDetails();});
 svg.call(zoom).on('dblclick.zoom',null);
 const mapTools=d3.select('.map-frame').append('div').attr('class','map-tools');
 mapTools.append('button').attr('aria-label','Zoom in').text('+').on('click',()=>svg.call(zoom.scaleBy,1.6));
 mapTools.append('button').attr('aria-label','Zoom out').text('−').on('click',()=>svg.call(zoom.scaleBy,1/1.6));
 mapTools.append('button').attr('aria-label','Reset map view').text('↺').on('click',()=>svg.call(zoom.transform,d3.zoomIdentity));
 function sizeMapDetails(){const unit=Math.max(1,960/(svg.node().getBoundingClientRect().width||960));markers.selectAll('.origin').attr('r',7*unit/zoomLevel);markers.selectAll('.event-dot').attr('r',5*unit/zoomLevel);labels.selectAll('text').style('font-size',12*unit/zoomLevel+'px').style('stroke-width',3*unit/zoomLevel+'px').style('display',e=>unit>1.8&&!e.origin&&e.index!==active?'none':null);}
 const formatYear=y=>y<0?Math.abs(y)+' BCE':y+' CE';
 d3.select('#ingredients').selectAll('button').data(INGREDIENTS).join('button').attr('aria-pressed',d=>String(d===ingredient)).html(d=>'<span class="specimen" aria-hidden="true" style="--position:'+d.art*25+'%"></span>'+d.name).on('click',(e,d)=>{ingredient=d;active=-1;render();});
 function detail(){const d=ingredient;document.querySelector('#ingredient-detail').innerHTML='<h2>'+d.name+'</h2><p class="latin">'+d.latin+'</p><span class="specimen" aria-hidden="true" style="--position:'+d.art*25+'%"></span><h3>'+d.originKind+'</h3><p class="origin-label">'+d.originLabel+'</p><p>'+d.description+'</p>'+C.sourceLinks([d.source]);}
 function highlight(index){active=index;markers.selectAll('.event-dot').classed('active',d=>d.index===index);d3.selectAll('.event').classed('active',d=>d.index===index);sizeMapDetails();}
 function render(){
   const year=eras[+range.value],d=ingredient,events=d.events.map((e,index)=>({...e,index})).filter(e=>e.year<=year);
   document.getElementById('period').value='Through '+formatYear(year);range.setAttribute('aria-valuetext','Through '+formatYear(year));
   d3.select('#ingredients').selectAll('button').attr('aria-pressed',x=>String(x===ingredient));if(lastDetailId!==d.id){detail();lastDetailId=d.id;}
   routes.selectAll('path').data(events.filter(e=>e.connect)).join('path').attr('class','connection').attr('d',e=>path({type:'LineString',coordinates:[e.from||d.origin,e.point]}));
   markers.selectAll('.origin').data([d]).join('circle').attr('class','origin').attr('cx',p(d.origin)[0]).attr('cy',p(d.origin)[1]).attr('r',8).selectAll('title').data([d]).join('title').text(d.originKind+': '+d.originLabel);
   markers.selectAll('.event-dot').data(events,e=>e.index).join('circle').attr('class','event-dot').attr('r',5).attr('cx',e=>p(e.point)[0]).attr('cy',e=>p(e.point)[1]).attr('tabindex',0).attr('role','button').attr('aria-label',e=>e.title+', '+e.date).on('click',(event,e)=>highlight(e.index)).on('keydown',(event,e)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();highlight(e.index);}}).selectAll('title').data(e=>[e]).join('title').text(e=>e.place+' · '+e.date);
   const labelData=[{point:d.origin,text:d.originLabel,origin:true},...events.filter(e=>d3.geoDistance(e.point,d.origin)>.025).map(e=>({point:e.point,text:e.place,origin:false,index:e.index}))];
   labels.selectAll('text').data(labelData).join('text').attr('class','map-label').attr('x',e=>p(e.point)[0]).attr('y',e=>p(e.point)[1]).attr('dx',e=>p(e.point)[0]>760?-10:10).attr('dy',e=>e.origin?-11:18).attr('text-anchor',e=>p(e.point)[0]>760?'end':'start').text(e=>e.text);
   document.getElementById('event-status').textContent=events.length+' of '+d.events.length+' selected episodes shown through '+formatYear(year)+'.';
   const container=d3.select('#events');container.selectAll('.no-events').remove();
   container.selectAll('article').data(events,e=>d.id+'-'+e.index).join('article').attr('class','event').html(e=>'<span class="date">'+e.date+'</span><h3>'+e.title+'</h3><span class="kind">'+e.kind+'</span><p>'+e.text+'</p>'+C.sourceLinks([e.source])+'<br><button type="button">Highlight on Map</button>').select('button').on('click',(event,e)=>highlight(e.index));
   if(!events.length)container.append('p').attr('class','no-events').text('No dated episodes in this collection fall before this cutoff. Move the timeline forward to reveal them.');
   highlight(active);
 }
 function stop(){playing=false;clearInterval(timer);timer=null;document.getElementById('play').textContent='Play Timeline';}
 document.getElementById('play').addEventListener('click',()=>{if(playing){stop();return;}playing=true;range.value=0;active=-1;render();document.getElementById('play').textContent='Pause Timeline';timer=setInterval(()=>{if(+range.value===6){stop();return;}range.value=+range.value+1;render();},1600);});
 range.addEventListener('input',()=>{stop();active=-1;render();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 document.getElementById('download').addEventListener('click',()=>C.download('culinary-evidence.json',JSON.stringify(INGREDIENTS,null,2),'application/json'));
 new ResizeObserver(sizeMapDetails).observe(svg.node());
 render();
})();
