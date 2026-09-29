(() => {
 const C=Cartography, selectors=['left','right'],circleData=[];
 for(let lat=-60;lat<=60;lat+=30)for(let lon=-165;lon<180;lon+=30)circleData.push(d3.geoCircle().center([lon,lat]).radius(5).precision(2)());
 selectors.forEach((side,i)=>{const select=document.getElementById(side);PROJECTIONS.forEach(p=>select.add(new Option(p.name,p.id)));select.value=i?'mercator':'equal-earth';select.addEventListener('change',draw);});
 function draw(){
   const meridian=+document.querySelector('#meridian').value;
   document.querySelector('#longitude').value=meridian===0?'0°':Math.abs(meridian)+'° '+(meridian<0?'W':'E');
   const circles=document.querySelector('#circles').checked,grid=document.querySelector('#graticule').checked;
   document.querySelector('#circle-note').hidden=!circles;
   selectors.forEach(side=>{
     const spec=PROJECTIONS.find(p=>p.id===document.getElementById(side).value);
     const p=d3[spec.factory]().rotate([-meridian,spec.id==='orthographic'?-20:0]).precision(.3);
     p.fitExtent([[14,18],[646,358]],C.sphere);
     const svg=d3.select('#'+side+'-map');svg.selectAll('*').remove();
     svg.attr('aria-label',spec.name+' projection, central meridian '+meridian+' degrees'+(circles?', with equal-radius geodesic circles':''));
     const path=C.base(svg,p,{graticule:grid});
     if(circles)svg.append('g').selectAll('path').data(circleData).join('path').attr('class','distortion').attr('d',path);
     document.querySelector('#'+side+'-caption').innerHTML='<span class="classification">'+spec.property+'</span><h2>'+spec.headline+'</h2><p>'+spec.description+'</p>';
   });
 }
 ['meridian','graticule','circles'].forEach(id=>document.getElementById(id).addEventListener('input',draw));
 document.querySelector('#swap').addEventListener('click',()=>{const left=document.getElementById('left'),right=document.getElementById('right'),saved=left.value;left.value=right.value;right.value=saved;draw();});
 document.querySelector('#reset').addEventListener('click',()=>{document.getElementById('left').value='equal-earth';document.getElementById('right').value='mercator';document.querySelector('#meridian').value=0;document.querySelector('#graticule').checked=true;document.querySelector('#circles').checked=false;draw();});
 draw();
})();
