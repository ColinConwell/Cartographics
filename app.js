(() => {
  const C = Cartography, svg = d3.select('#globe');
  const projection = d3.geoOrthographic().scale(191).translate([270,232]).rotate([25,-19]);
  svg.append('ellipse').attr('class','orbit').attr('cx',270).attr('cy',232).attr('rx',222).attr('ry',148).attr('transform','rotate(-36 270 232)');
  svg.append('circle').attr('class','orbit').attr('cx',270).attr('cy',232).attr('r',210);
  const globe = svg.append('g'); C.base(globe, projection);
  const routeGeometry = [
    {type:'LineString',coordinates:[[126,-4],[57,-20],[18,-34],[-9,39]]},
    {type:'LineString',coordinates:[[-96,19],[-15,25],[73,15]]},
    {type:'LineString',coordinates:[[-78,-4],[-3,40],[100,14]]}
  ];
  const routes = globe.append('g').attr('class','routes');
  routes.selectAll('path').data(routeGeometry).join('path').attr('class','globe-route');
  const dot = routes.append('path').attr('class','route-dot');
  let theme='observatory', paused=matchMedia('(prefers-reduced-motion: reduce)').matches, angle=25, phase=0, last=0;
  const motion=document.querySelector('#motion');
  function draw(){
    const path=d3.geoPath(projection); globe.selectAll('path').attr('d',path);
    routes.style('display',theme==='routes'?null:'none');
    const point=d3.geoInterpolate([126,-4],[-9,39])(phase);
    dot.datum(d3.geoCircle().center(point).radius(1.5)()).attr('d',path);
  }
  function motionLabel(){motion.textContent=paused?'Resume Motion':'Pause Motion';motion.setAttribute('aria-pressed',String(paused));}
  function setTheme(value){
    theme=['observatory','parchment','routes'].includes(value)?value:'observatory';
    document.documentElement.dataset.theme=theme;
    document.querySelectorAll('[data-theme][aria-pressed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===theme)));
    try{localStorage.setItem('cartographics-theme',theme);}catch{}
    draw();
  }
  try{theme=localStorage.getItem('cartographics-theme')||theme;}catch{}
  document.querySelectorAll('button[data-theme]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.theme)));
  motion.addEventListener('click',()=>{paused=!paused;motionLabel();});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches){paused=true;motionLabel();}});
  svg.call(d3.drag().on('start',()=>{paused=true;motionLabel();}).on('drag',e=>{angle+=e.dx*.4;projection.rotate([angle,Math.max(-70,Math.min(70,projection.rotate()[1]-e.dy*.4))]);draw();}));
  let visible=true;new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(svg.node());
  d3.timer(elapsed=>{const dt=Math.min(elapsed-last,50);last=elapsed;if(paused||document.hidden||!visible)return;angle+=dt*.003;phase=(phase+dt*.00004)%1;projection.rotate([angle,projection.rotate()[1]]);draw();});
  setTheme(theme);motionLabel();
  d3.selectAll('.preview').each(function(){
    const s=d3.select(this),kind=this.dataset.preview;
    if(kind==='projections'){
      [d3.geoOrthographic().rotate([-20,-15]),d3.geoNaturalEarth1(),d3.geoEqualEarth()].forEach((p,i)=>{p.fitExtent([[i*76+4,10],[i*76+73,90]],C.sphere);C.base(s.append('g'),p,{borders:false});});return;
    }
    const p=d3.geoNaturalEarth1().fitExtent([[3,3],[227,97]],C.sphere),path=C.base(s,p);
    if(kind==='endonyms')s.append('g').selectAll('path').data(C.world.features).join('path').attr('d',path).attr('fill',(_,i)=>['#9aaf85','#d2b580','#bc805e','#749f9a'][i%4]).attr('stroke','var(--bg)').attr('stroke-width',.2);
    if(kind==='regions')s.selectAll('.pin').data([[20,67],[-3,43],[-3,52],[43,37],[78,11],[-42,71]]).join('circle').attr('cx',d=>p(d)[0]).attr('cy',d=>p(d)[1]).attr('r',3).attr('fill','#ca8863');
    if(kind==='spices')s.selectAll('.route').data(routeGeometry).join('path').attr('d',path).attr('fill','none').attr('stroke','#df9c62').attr('stroke-width',1);
  });
})();
