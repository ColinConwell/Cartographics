/* Endonym Atlas — original interface code, MIT. Data licenses: see LICENSES.md. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const countries = window.ATLAS_COUNTRIES;
  const byId = new Map(countries.map(c => [c.id, c]));
  const byNumeric = new Map(countries.map(c => [+c.numeric, c]));
  const features = topojson.feature(window.ATLAS_WORLD, window.ATLAS_WORLD.objects.countries).features.filter(f => f.id !== '010');
  const featureById = new Map();
  features.forEach(f => { const c = byNumeric.get(+f.id) || (f.properties.name === 'Kosovo' ? byId.get('UNK') : null); f.atlas = c; if(c) featureById.set(c.id, f); });
  let selected = byId.get('JPN'), mode = 'native', width = 1000, height = 600, transform = d3.zoomIdentity;
  const variants = new Map();
  let player = null, labelFrame = null;
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[’ʻʼʾʿ']/g,'');
  const currentName = c => c.names[variants.get(c.id) || 0];
  const speakerIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 0 : 500;
  const numericFormat = new Intl.NumberFormat('en');
  const audioCount = countries.filter(c=>c.names.some(n=>n.audio)).length;
  const variantCount = countries.reduce((sum,c)=>sum+c.names.length,0);
  $('coverage-button').textContent = `${countries.length} Places · ${variantCount} Names · ${audioCount} With Audio`;
  $('coverage-description').textContent = `There are ${countries.length} entries: 193 UN member states, Palestine, Vatican City, Kosovo and Taiwan. The dataset includes ${variantCount} selected language-and-name variants; ${audioCount} places have at least one bundled recording. Coverage of countries is comprehensive within this scope; coverage of languages and recordings is selective.`;

  const svg = d3.select('#map');
  const geometry = svg.append('g').attr('class','geometry');
  const projection = d3.geoNaturalEarth1();
  const path = d3.geoPath(projection);
  const graticule = geometry.append('path').datum(d3.geoGraticule().extent([[-180,-58],[180,84]]).step([30,20])()).attr('class','graticule');
  const paths = geometry.append('g').selectAll('path').data(features).join('path')
    .attr('class',f=>'country'+(f.atlas?'':' context')).attr('data-country',f=>f.atlas?.id||'')
    .attr('fill',f=>f.atlas ? (['Asia','Americas'].includes(f.atlas.region)?'#a5b59a':'#afbea3'):'#c5d0c4')
    .on('click',(event,f)=>{if(f.atlas)selectCountry(f.atlas.id,false);})
    .on('pointermove',(event,f)=>showTooltip(event,f.atlas,f.properties.name))
    .on('pointerleave',hideTooltip);
  paths.append('title').text(f=>f.atlas?`${f.atlas.english} — ${currentName(f.atlas).native}`:`${f.properties.name} — geographic context`);
  const oceanLayer = svg.append('g').attr('aria-hidden','true');
  const oceanData = [{text:'Pacific Ocean',p:[-142,-4]},{text:'Atlantic Ocean',p:[-34,10]},{text:'Indian Ocean',p:[76,-31]},{text:'Arctic Ocean',p:[0,79]}];
  const oceans = oceanLayer.selectAll('text').data(oceanData).join('text').attr('class','ocean-label').text(d=>d.text);
  const dots = svg.append('g').selectAll('circle').data(countries.filter(c=>c.area<14000||!featureById.has(c.id))).join('circle')
    .attr('class','country-dot').attr('r',3).on('click',(event,c)=>selectCountry(c.id,false))
    .on('pointermove',(event,c)=>showTooltip(event,c)).on('pointerleave',hideTooltip);
  const labelLayer = svg.append('g').attr('aria-hidden','true');
  const labelElements = labelLayer.selectAll('text').data(countries).join('text').attr('class','map-label')
    .on('click',(event,c)=>selectCountry(c.id,false)).on('pointermove',(event,c)=>showTooltip(event,c)).on('pointerleave',hideTooltip);
  const zoom = d3.zoom().scaleExtent([1,18]).on('zoom',event=>{
    transform=event.transform;geometry.attr('transform',transform);hideTooltip();queueLabels();
  });
  svg.call(zoom).on('dblclick.zoom',null);

  // Use a mainland-oriented anchor where geographic centroids lie offshore or in dependencies.
  const centers = {USA:[-101,39],CAN:[-106,57],RUS:[93,60],FRA:[2,47],NOR:[9,64],NZL:[173,-41],JPN:[139,37],IDN:[117,-3],MYS:[104,4],CHL:[-72,-34],VNM:[108,17],PHL:[123,12],COG:[15,-1],COD:[23,-4],FSM:[158,7],KIR:[173,1.5],TUV:[179,-8],FJI:[178,-17],TON:[-175,-21],WSM:[-172,-14]};
  function point(c){return projection(centers[c.id] || [c.latlng[1],c.latlng[0]]);}
  function screenPoint(c){return transform.apply(point(c));}
  function resize(){
    const box=$('map-panel').getBoundingClientRect();width=box.width;height=box.height;
    svg.attr('viewBox',`0 0 ${width} ${height}`);
    projection.fitExtent([[20,28],[width-20,height-67]],{type:'FeatureCollection',features});
    paths.attr('d',path);graticule.attr('d',path);
    zoom.extent([[0,0],[width,height]]).translateExtent([[-width*.12,-height*.15],[width*1.12,height*1.15]]);
    svg.call(zoom.transform,d3.zoomIdentity);renderLabels();
  }
  function queueLabels(){if(labelFrame)return;labelFrame=requestAnimationFrame(()=>{labelFrame=null;renderLabels();});}
  function renderLabels(){
    const k=transform.k;
    oceans.attr('x',d=>transform.apply(projection(d.p))[0]).attr('y',d=>transform.apply(projection(d.p))[1]).attr('opacity',k>3?0:1);
    dots.attr('cx',c=>screenPoint(c)[0]).attr('cy',c=>screenPoint(c)[1]).attr('r',c=>c.id===selected.id?4:2.5)
      .classed('selected',c=>c.id===selected.id).attr('opacity',c=>k>1.6||c.area<800||c.id===selected.id?1:.35);
    const font = width<700 ? 11.5 : 14;
    labelElements.text(c=>currentName(c)[mode]).style('font-size',`${font}px`).classed('selected',c=>c.id===selected.id)
      .attr('x',c=>screenPoint(c)[0]).attr('y',c=>screenPoint(c)[1]-(c.area<14000?11:0)).attr('display','none');
    const occupied=[];
    if(k<=3)oceans.each(function(){const b=this.getBBox();occupied.push({x:b.x-6,y:b.y-4,w:b.width+12,h:b.height+8});});
    const ordered=[...countries].sort((a,b)=>(b.id===selected.id)-(a.id===selected.id)||b.area-a.area);
    const nodes=new Map();labelElements.each(function(c){nodes.set(c.id,this);});
    ordered.forEach(c=>{
      const n=nodes.get(c.id), p=screenPoint(c);p[1]-=c.area<14000?11:0;
      if(p[0]<8||p[0]>width-8||p[1]<15||p[1]>height-42)return;
      if(c.id!==selected.id && c.area<22000/(k*k) && k<2)return;
      n.removeAttribute('display');
      const b=n.getBBox(), pad=mode==='phonetic'?5:4;
      const box={x:b.x-pad,y:b.y-3,w:b.width+2*pad,h:b.height+6};
      if(box.x<2||box.x+box.w>width-2 || occupied.some(o=>box.x<o.x+o.w&&box.x+box.w>o.x&&box.y<o.y+o.h&&box.y+box.h>o.y))n.setAttribute('display','none');
      else occupied.push(box);
    });
  }
  function showTooltip(event,c,fallback){
    const el=$('tooltip');el.innerHTML=c?`<strong dir="auto">${esc(currentName(c).native)}</strong>${esc(c.english)} · ${esc(currentName(c).language)}`:`${esc(fallback)} · geographic context`;
    const box=$('map-panel').getBoundingClientRect();el.hidden=false;
    el.style.left=Math.max(5,Math.min(event.clientX-box.left+14,width-el.offsetWidth-10))+'px';
    el.style.top=Math.max(5,Math.min(event.clientY-box.top+14,height-el.offsetHeight-10))+'px';
  }
  function hideTooltip(){$('tooltip').hidden=true;}
  function zoomTo(c){
    const p=point(c), k=Math.max(2.6,Math.min(9,8-Math.log10(Math.max(c.area,1))*.8));
    const t=d3.zoomIdentity.translate(width/2-k*p[0],height/2-k*p[1]).scale(k);
    svg.transition().duration(duration).call(zoom.transform,t);
  }
  function selectCountry(id,focusMap=false,nameIndex){
    const previousId=selected.id;
    selected=byId.get(id)||selected;
    if(nameIndex!==undefined)variants.set(id,nameIndex);
    renderDetail();renderLabels();paths.classed('selected',f=>f.atlas?.id===selected.id);
    if(previousId!==selected.id)$('country-detail').scrollTop=0;
    closeSearch();hideTooltip();
    $('announcement').textContent=`${selected.english}: ${currentName(selected).native}, ${currentName(selected).language}`;
    if(focusMap)zoomTo(selected);
    writeHash();
  }
  function writeHash(){
    const hash=`${selected.id}/${variants.get(selected.id)||0}/${mode}`;
    try{history.replaceState(null,'','#'+hash);}catch{/* file viewers may restrict history */}
  }
  function renderDetail(){
    if(player){player.pause();player=null;}
    const c=selected,n=currentName(c);
    $('english-name').textContent=c.english;
    $('status-line').textContent=c.status==='UN member'?c.subregion:c.status;
    $('native-name').textContent=n.native;
    const chars=[...n.native].length;
    $('native-name').style.setProperty('--name-size',(chars<5?96:chars<10?52:chars<18?39:29)+'px');
    $('roman-name').textContent=n.romanized;
    $('roman-name').hidden=n.native===n.romanized;
    $('native-value').textContent=n.native;$('roman-value').textContent=n.romanized;$('phonetic-value').textContent=n.phonetic;
    $('language').innerHTML=c.names.map((v,i)=>`<option value="${i}">${esc(v.language)}${c.names.filter(z=>z.language===v.language).length>1?' — '+esc(v.romanized):''}</option>`).join('');
    $('language').value=String(variants.get(c.id)||0);
    $('language-hint').textContent=c.names.length>1?`${c.names.length} included variants · Selection updates the map label`:'One selected form · Other local names may exist';
    $('country-note').textContent=c.note;$('country-note').hidden=!c.note;
    $('ipa-row').hidden=!n.ipa?.length;
    $('ipa-row').innerHTML=n.ipa?.length?`<span class="fine">SOURCE IPA</span> <span>${esc(n.ipa.join(' · '))}</span>`:'';
    $('source-names').textContent=c.sourceNames;$('source-languages').textContent=c.sourceLanguages;
    $('more-names').open=false;
    $('source-links').innerHTML=`<a class="source-link" target="_blank" rel="noopener" href="${esc(c.source)}">Wikipedia · ${esc(c.english)} ↗</a><a class="source-link" target="_blank" rel="noopener" href="${esc(c.sourceTable)}">Wikipedia · Native-Name Table ↗</a>`+(n.pronunciationSource?`<a class="source-link" target="_blank" rel="noopener" href="${esc(n.pronunciationSource)}">Wiktionary · Pronunciation Lookup ↗</a>`:'');
    const root=$('recording');
    if(n.audio){
      const a=n.audio;
      root.innerHTML=`<button class="play-button" id="play-audio">${speakerIcon}<span>Listen to Pronunciation</span></button><p class="audio-credit">${esc(n.language)} recording · <a href="${esc(a.source)}" target="_blank" rel="noopener">${esc(a.author)}</a> · <a href="${esc(a.licenseUrl||a.source)}" target="_blank" rel="noopener">${esc(a.license)}</a>${a.speakerNote?'<br>'+esc(a.speakerNote):''}</p><p id="audio-status" class="fine" aria-live="polite"></p>`;
      player=new Audio(a.file);player.preload='metadata';
      const thisPlayer=player,button=$('play-audio');
      function idle(){button.innerHTML=speakerIcon+'<span>Listen to Pronunciation</span>';button.setAttribute('aria-label',`Play ${n.native} in ${n.language}`);}
      idle();
      button.addEventListener('click',async()=>{
        if(!thisPlayer.paused){thisPlayer.pause();idle();return;}
        try{button.disabled=true;await thisPlayer.play();button.innerHTML=pauseIcon+'<span>Playing · Pause</span>';button.setAttribute('aria-label','Pause pronunciation');$('audio-status').textContent='';}
        catch{$('audio-status').innerHTML=`Playback is unavailable in this browser. <a href="${esc(a.file)}">Open the audio file</a>.`;idle();}
        finally{button.disabled=false;}
      });
      thisPlayer.addEventListener('ended',idle);
      thisPlayer.addEventListener('error',()=>{if(player===thisPlayer)$('audio-status').textContent='The recording could not be loaded. The original is linked in its credit.';});
    }else root.innerHTML='<div class="no-audio">No verified recording bundled for this name.</div>';
  }
  function matches(query,c){
    if(!query)return true;
    return norm([c.english,c.id,...c.names.flatMap(n=>[n.native,n.romanized,n.language,n.phonetic])].join(' ')).includes(query);
  }
  function closeSearch(){$('search-results').hidden=true;$('search').setAttribute('aria-expanded','false');}
  function search(){
    const q=norm($('search').value.trim());const root=$('search-results');
    if(!q){closeSearch();return;}
    const found=countries.filter(c=>matches(q,c)).sort((a,b)=>Number(norm(b.english).startsWith(q))-Number(norm(a.english).startsWith(q))).slice(0,14);
    root.innerHTML=found.length?found.map(c=>{
      const i=c.names.findIndex(n=>norm([n.native,n.romanized,n.language,n.phonetic].join(' ')).includes(q));
      const n=c.names[Math.max(0,i)];
      return `<button data-id="${c.id}" data-variant="${Math.max(0,i)}"><span>${esc(c.english)}<br><small>${esc(n.language)}</small></span><strong dir="auto">${esc(n.native)}</strong></button>`;
    }).join(''):'<p>No matching countries or languages.</p>';
    root.hidden=false;$('search').setAttribute('aria-expanded','true');
  }
  function browse(){
    const q=norm($('browse-search').value),region=$('region').value,onlyAudio=$('audio-only').checked;
    const found=countries.filter(c=>matches(q,c)&&(!region||c.region===region)&&(!onlyAudio||c.names.some(n=>n.audio)));
    $('result-count').textContent=`${found.length} of ${countries.length} places`;
    $('country-list').innerHTML=found.length?found.map(c=>{
      const i=q?c.names.findIndex(n=>norm([n.native,n.romanized,n.language].join(' ')).includes(q)):-1;
      const n=c.names[Math.max(i,0)];
      return `<button class="country-row" data-id="${c.id}" data-variant="${Math.max(0,i)}"><span><strong>${esc(c.english)}</strong><small>${esc(c.region)} · ${c.names.length} ${c.names.length===1?'variant':'variants'}</small></span><span><span class="row-native" dir="auto">${esc(n.native)}</span><small>${esc(n.language)}</small></span>${c.names.some(n=>n.audio)?speakerIcon:'<span></span>'}</button>`;
    }).join(''):'<p>No countries match these filters.</p>';
  }
  function setMode(value){
    if(!['native','romanized','phonetic'].includes(value))return;
    mode=value;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    $('mode-caption').textContent={native:'Local orthography',romanized:'Latin-letter forms',phonetic:'Approximate English pronunciation'}[mode];
    renderLabels();writeHash();
  }
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
  $('language').addEventListener('change',()=>selectCountry(selected.id,false,+$('language').value));
  $('zoom-in').onclick=()=>svg.transition().duration(duration).call(zoom.scaleBy,1.65);
  $('zoom-out').onclick=()=>svg.transition().duration(duration).call(zoom.scaleBy,1/1.65);
  $('reset-map').onclick=()=>svg.transition().duration(duration).call(zoom.transform,d3.zoomIdentity);
  $('locate-button').onclick=()=>zoomTo(selected);
  $('map').addEventListener('keydown',e=>{
    if(['+','=','-','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home'].includes(e.key))e.preventDefault();
    if(e.key==='+'||e.key==='=')$('zoom-in').click();if(e.key==='-')$('zoom-out').click();if(e.key==='Home')$('reset-map').click();
    const delta={ArrowUp:[0,60],ArrowDown:[0,-60],ArrowLeft:[60,0],ArrowRight:[-60,0]}[e.key];
    if(delta)svg.call(zoom.translateBy,delta[0]/transform.k,delta[1]/transform.k);
  });
  $('search').addEventListener('input',search);$('search').addEventListener('focus',search);
  $('search').addEventListener('keydown',e=>{
    if(e.key==='Escape')closeSearch();
    if(e.key==='ArrowDown'){e.preventDefault();$('search-results').querySelector('button')?.focus();}
    if(e.key==='Enter')$('search-results').querySelector('button')?.click();
  });
  $('search-results').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){selectCountry(b.dataset.id,true,+b.dataset.variant);$('search').value='';$('country-detail').focus({preventScroll:true});}});
  $('search-results').addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();e.target.nextElementSibling?.focus();}
    if(e.key==='ArrowUp'){e.preventDefault();(e.target.previousElementSibling||$('search')).focus();}
    if(e.key==='Escape'){closeSearch();$('search').focus();}
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))closeSearch();});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('search').focus();}});
  $('browse-button').onclick=()=>{browse();$('browse-dialog').showModal();};
  $('about-button').onclick=$('coverage-button').onclick=()=>$('about-dialog').showModal();
  document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();}});});
  ['browse-search','region','audio-only'].forEach(id=>$(id).addEventListener('input',browse));
  $('country-list').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){selectCountry(b.dataset.id,true,+b.dataset.variant);$('browse-dialog').close();$('country-detail').focus({preventScroll:true});}});
  function restore(){
    const [id,index,requestedMode]=location.hash.slice(1).split('/');
    if(byId.has(id)){selected=byId.get(id);variants.set(id,Math.max(0,Math.min(selected.names.length-1,parseInt(index)||0)));}
    if(['native','romanized','phonetic'].includes(requestedMode))mode=requestedMode;
  }
  restore();renderDetail();resize();setMode(mode);paths.classed('selected',f=>f.atlas?.id===selected.id);
  new ResizeObserver(resize).observe($('map-panel'));
  window.addEventListener('hashchange',()=>{restore();renderDetail();setMode(mode);paths.classed('selected',f=>f.atlas?.id===selected.id);});
})();
