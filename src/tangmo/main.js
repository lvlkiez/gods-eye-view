import './style.css';
import { createScene } from './scene.js';
import { setupReplay } from './replay.js';
import { renderTrackMap } from './trackMap.js';
import { setupSplatPanel } from './splatPanel.js';
import { setupPhotoViewer, photoFigure } from './landmarkPhotos.js';
import { landmarkImages } from './landmarkImages.js';
import { shots, shotById, shotForLocation, shotThumbnail, THUMBNAIL_CREDIT } from './shots.js';
import { boatRouteMetadata, boatAnchors, boatRouteLine } from './boatRoute.js';
import { RESEARCH_DATE, sources, locations, events, media, limitations, recoveryDistance, locationById, formatDate } from './caseData.js';
import { contextSources, proceedings, discrepancies } from './researchContext.js';
import { esc, sourceLinks, inReplay, timelineMarkup, eventDetailMarkup, sourcesMarkup } from './caseFile.js';

const svg=path=>`<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const icons={
  play:svg('<path d="m8 5 11 7-11 7Z"/>'),photo:svg('<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>'),
  top:svg('<path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l6 6M20 20l-6-6"/>'),reset:svg('<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>'),
  moon:svg('<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"/>'),tag:svg('<path d="M3 12V4h8l10 10-8 8Z"/><circle cx="7.5" cy="8.5" r="1.3"/>'),
  expand:svg('<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>'),splat:svg('<circle cx="8" cy="10" r="4"/><circle cx="15" cy="8" r="3"/><circle cx="14" cy="16" r="4.5"/>'),
};
const tabs=(name,list)=>list.map(([id,label],i)=>`<button role="tab" id="${name}-tab-${id}" data-${name}="${id}" aria-controls="${name}-${id}" aria-selected="${i===0}" tabindex="${i?-1:0}">${label}</button>`).join('');

document.querySelector('#app').innerHTML=`
  <header class="topbar">
    <a class="brand" href="/" aria-label="กลับ God’s Eye View"><img src="/logo.svg" alt="" width="34" height="23"><span>God’s Eye View</span></a>
    <span class="divider" aria-hidden="true"></span>
    <h1><b>แตงโม</b> Scene Reconstruction <span>· เจ้าพระยา 24 ก.พ. 2565</span></h1>
    <span class="source-dot">ลำดับเวลาจากคำแถลงตำรวจ 26 เม.ย. 2565</span>
  </header>
  <main class="app">
    <section class="stage-col" aria-label="ฉากจำลอง">
      <div class="stage-bar">
        <div class="stage-tabs" role="tablist" aria-label="มุมมองหลัก">${tabs('stage',[['scene','3D Reconstruction'],['video','วิดีโอต้นทาง'],['track','เส้นทางเรือ']])}</div>
        <div class="stage-bar-right">
          <div class="segmented" role="group" aria-label="ชั้นข้อมูลแผนที่"><button data-map="photoreal" aria-pressed="false" title="Google Photorealistic 3D Tiles (เมช ไม่ใช่ Gaussian splat)">เมช 3D</button><button data-map="satellite" aria-pressed="false">ดาวเทียม</button><button data-map="street" aria-pressed="false">ถนน</button></div>
          <button id="expand-scene" class="bar-button" aria-pressed="false">${icons.expand}<span>ขยายฉาก</span></button>
        </div>
      </div>
      <div class="stage" id="stage">
        <div id="stage-scene" class="stage-panel" role="tabpanel" aria-labelledby="stage-tab-scene">
          <div id="scene" aria-label="ฉาก 3D ของแม่น้ำเจ้าพระยา ลากเพื่อเลื่อน ล้อเมาส์เพื่อซูม"></div>
          <div class="scene-vignette"></div>
          <div id="scene-loading" class="scene-loading" role="status"><i></i><strong>LOADING SCENE</strong><span>กำลังโหลดเมช 3D ของพื้นที่จริง</span></div>
          <div class="scene-status"><span id="map-status" role="status">กำลังเตรียมแผนที่…</span></div>
          <div id="shot-caption" class="shot-caption"><span id="shot-time"></span><strong id="shot-title"></strong></div>
          <div id="replay-hud" class="replay-hud"></div>
          <div id="marker-card" class="marker-card" hidden></div>
          <button id="collapse-scene" class="collapse-scene">ย่อฉาก ✕</button>
          <div id="scene-fallback" hidden><h2>โหมดอ่านข้อมูล</h2><p>อุปกรณ์นี้เปิดฉาก WebGL ไม่ได้<br>ยังอ่านลำดับเหตุการณ์ เส้นทางเรือ และแหล่งข้อมูลได้</p></div>
        </div>
        <div id="stage-video" class="stage-panel opaque" role="tabpanel" aria-labelledby="stage-tab-video" hidden>
          <div id="video-stage"><button id="load-video">${icons.play}<span>เปิดวิดีโอข่าว Thai PBS</span><small>โหลดจาก YouTube เมื่อกดเท่านั้น</small></button></div>
          <div class="video-copy"><span class="eyebrow">SOURCE VIDEO · ${esc(media[0].publisher)} · ${formatDate(media[0].published)}</span><h2>${esc(media[0].title)}</h2><p>${esc(media[0].note)} — เป็นข่าวเกี่ยวกับการแถลง ไม่ใช่บันทึกแถลงเต็มหรือภาพ CCTV ต้นฉบับ</p><a href="${esc(media[0].url)}" target="_blank" rel="noopener noreferrer">ดูบน YouTube ↗</a></div>
        </div>
        <div id="stage-track" class="stage-panel opaque" role="tabpanel" aria-labelledby="stage-tab-track" hidden></div>
      </div>
      <div class="scene-toolbar">
        <div class="tools" role="toolbar" aria-label="เครื่องมือฉาก">
          <button id="tour" aria-pressed="false">${icons.play}<span>ทัวร์ฉาก</span></button>
          <button id="photos" data-photo="${landmarkImages[1].locationId}">${icons.photo}<span>ภาพถ่าย</span></button>
          <button id="top-view">${icons.top}<span>มุมบน</span></button>
          <button id="overview">${icons.reset}<span>ภาพรวม</span></button>
          <button id="night" aria-pressed="false">${icons.moon}<span>กลางคืน</span></button>
          <button id="labels" aria-pressed="true">${icons.tag}<span>ป้าย</span></button>
          <button id="open-splat" aria-haspopup="dialog">${icons.splat}<span>Gaussian splat</span></button>
        </div>
        <div class="hints"><span><b>ลาก</b> เลื่อน · <b>Ctrl+ลาก</b> หมุน · <b>ดับเบิลคลิก</b> จัดกึ่งกลาง</span><span><b>WASD</b> เคลื่อน · <b>QE</b> สูงต่ำ · <b>Shift</b> เร็วขึ้น · <b>← →</b> มุมกล้อง</span></div>
      </div>
      <section class="shots" aria-labelledby="shots-title">
        <div class="shots-head"><h2 id="shots-title">สำรวจฉาก</h2><span>${esc(THUMBNAIL_CREDIT)}</span><div><button id="shots-prev" aria-label="มุมกล้องก่อนหน้า">←</button><button id="shots-next" aria-label="มุมกล้องถัดไป">→</button></div></div>
        <div class="shot-strip" id="shot-strip">${shots.map((shot,i)=>`<button class="shot" data-shot="${shot.id}" aria-pressed="false"><span class="shot-thumb"><img src="${esc(shotThumbnail(shot))}" alt="" loading="${i<5?'eager':'lazy'}" decoding="async" width="384" height="216"></span><span class="shot-time">${esc(shot.time)}</span><span class="shot-title">${esc(shot.title)}</span></button>`).join('')}</div>
      </section>
    </section>
    <aside class="side" aria-label="แฟ้มคดี">
      <div class="side-tabs" role="tablist" aria-label="แฟ้มคดี">${tabs('side',[['replay','คืนเกิดเหตุ'],['timeline','ลำดับเหตุการณ์'],['sources','แหล่งข้อมูล']])}</div>
      <section id="side-replay" class="side-panel" role="tabpanel" aria-labelledby="side-tab-replay"></section>
      <section id="side-timeline" class="side-panel" role="tabpanel" aria-labelledby="side-tab-timeline" hidden>${timelineMarkup()}</section>
      <section id="side-sources" class="side-panel" role="tabpanel" aria-labelledby="side-tab-sources" hidden>${sourcesMarkup()}</section>
    </aside>
  </main>
  <footer class="footer"><span>${events.length} เหตุการณ์ · ${locations.length} สถานที่อ้างอิง · ค้นคว้า ${formatDate(RESEARCH_DATE)}</span><span>ภาพจำลองเพื่อสำรวจข้อมูลสาธารณะ ไม่ใช่ข้อสรุปทางคดี</span></footer>`;

const $=selector=>document.querySelector(selector);
let scene,replay,activeShot='pibul1',tourTimer,activeEvent=-1,stageTab='scene';

function setTab(group,id) {
  document.querySelectorAll(`[data-${group}]`).forEach(el=>{const active=el.dataset[group]===id;el.setAttribute('aria-selected',String(active));el.tabIndex=active?0:-1;});
  // The Cesium panel stays laid out (a zero-size canvas cannot render); other stage panels cover it.
  document.querySelectorAll(`[id^="${group}-"][role="tabpanel"]`).forEach(el=>{
    const active=el.id===`${group}-${id}`;
    if(el.id==='stage-scene')el.inert=!active;else el.hidden=!active;
  });
  if(group==='stage') {
    stageTab=id;
    if(id!=='scene'){replay?.pause();stopTour();}
    if(id==='track'&&!$('#stage-track').childElementCount)renderTrackMap($('#stage-track'),{onAnchor:openAnchor});
  }
}
function wireTabs(group) {
  const list=[...document.querySelectorAll(`[data-${group}]`)];
  list.forEach((el,i)=>{
    el.addEventListener('click',()=>setTab(group,el.dataset[group]));
    el.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      const next=event.key==='Home'?0:event.key==='End'?list.length-1:(i+(event.key==='ArrowRight'?1:-1)+list.length)%list.length;
      setTab(group,list[next].dataset[group]);list[next].focus();
    });
  });
}
function showShot(id,{fly=true,instant=false}={}) {
  const shot=shotById(id);if(!shot)return;
  activeShot=id;
  if(fly)scene?.flyToShot(id,{instant});
  $('#shot-time').textContent=shot.time;$('#shot-title').textContent=shot.title;
  const strip=$('#shot-strip');
  document.querySelectorAll('[data-shot]').forEach(el=>{const active=el.dataset.shot===id;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));
    // Scroll the strip only; scrollIntoView would also move the page on narrow screens.
    if(active)strip.scrollTo({left:el.getBoundingClientRect().left-strip.getBoundingClientRect().left+strip.scrollLeft-(strip.clientWidth-el.offsetWidth)/2,behavior:'smooth'});});
  $('#marker-card').hidden=true;
}
function stepShot(direction) {
  const i=shots.findIndex(s=>s.id===activeShot);
  showShot(shots[(i+direction+shots.length)%shots.length].id);
}
function stopTour() {clearInterval(tourTimer);tourTimer=undefined;$('#tour').setAttribute('aria-pressed','false');}
function startTour() {
  replay?.pause();setTab('stage','scene');
  $('#tour').setAttribute('aria-pressed','true');stepShot(1);
  tourTimer=setInterval(()=>stepShot(1),6500);
}
function selectMarker(id) {
  const l=locationById(id);if(!l)return;
  stopTour();
  const shot=shotForLocation(id);if(shot)showShot(shot.id);
  const card=$('#marker-card');card.hidden=false;
  card.innerHTML=`<button class="close" aria-label="ปิดรายละเอียดสถานที่">×</button><span class="tag model">LANDMARK REFERENCE</span><h3>${esc(l.title)}</h3><p class="mono">${l.lat.toFixed(5)}° N, ${l.lon.toFixed(5)}° E</p><p>${esc(l.note)}</p>${sourceLinks([l.sourceId])}${photoFigure(l.id)}`;
  card.querySelector('.close').addEventListener('click',()=>{card.hidden=true;});
}
function highlightEvent(index,{scroll=true}={}) {
  activeEvent=index;
  document.querySelectorAll('[data-event]').forEach((el,i)=>{el.classList.toggle('selected',i===index);el.setAttribute('aria-pressed',String(i===index));});
  $('#event-detail').innerHTML=index>=0?eventDetailMarkup(index):'';
  const list=$('.event-list'),selected=list.querySelector('.selected');
  if(scroll&&selected&&!$('#side-timeline').hidden)list.scrollTop=Math.max(0,selected.offsetTop-list.offsetTop-list.clientHeight/2+selected.offsetHeight/2);
}
function selectEvent(index) {
  const e=events[index];stopTour();highlightEvent(index);setTab('stage','scene');
  if(inReplay(e)&&replay?.seekToEvent(e.id))return;
  const shot=e.phase==='search'&&e.locationId?shotById('search'):shotForLocation(e.locationId);
  showShot(shot?.id??'overview');
}
function openAnchor(i) {
  setTab('stage','scene');stopTour();replay?.seek(boatAnchors[i].seconds,{perspective:'third'});
}
function setStatus(status) {
  const label=$('#map-status');label.textContent=status.text;label.dataset.state=status.state;label.dataset.mode=status.mode;
  if(status.state!=='loading')$('#scene-loading').hidden=true;
  document.querySelectorAll('[data-map]').forEach(el=>{const active=el.dataset.map===status.mode;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));el.dataset.loading=String(status.state==='loading'&&status.requested===el.dataset.map);});
}
function expandScene(value) {
  $('.app').classList.toggle('expanded',value);
  const button=$('#expand-scene');button.setAttribute('aria-pressed',String(value));button.querySelector('span').textContent=value?'ย่อฉาก':'ขยายฉาก';
  document.body.style.overflow=value?'hidden':'';
}
const toggle=(button,value)=>{button.setAttribute('aria-pressed',String(value));return value;};

try {
  scene=createScene('scene',{onSelect:selectMarker,onStatus:setStatus,onPerspective:next=>replay?.showPerspective(next)});
  const photoreal=$('[data-map="photoreal"]');
  photoreal.disabled=!scene.hasPhotorealKey;
  if(!scene.hasPhotorealKey)photoreal.title='ยังไม่ได้ตั้งค่า GOOGLE_MAPS_API_KEY';
  scene.basemap(scene.hasPhotorealKey?'photoreal':'satellite');
  scene.setBoatVisible(true);
} catch {
  scene=undefined;
  $('#scene-fallback').hidden=false;$('#scene-loading').hidden=true;
  setStatus({mode:'none',state:'error',text:'ไม่รองรับ WebGL · อ่านข้อมูลประกอบได้'});
  document.querySelectorAll('[data-map],.tools button:not(#photos),[data-shot],#shots-prev,#shots-next').forEach(el=>{el.disabled=true;});
}
replay=setupReplay({scene,panel:$('#side-replay'),hud:$('#replay-hud'),onEvent:id=>highlightEvent(events.findIndex(e=>e.id===id),{scroll:false})});
showShot('pibul1',{fly:false});
wireTabs('stage');wireTabs('side');

document.querySelectorAll('[data-shot]').forEach(el=>el.addEventListener('click',()=>{stopTour();showShot(el.dataset.shot);}));
$('#shots-prev').addEventListener('click',()=>{stopTour();stepShot(-1);});
$('#shots-next').addEventListener('click',()=>{stopTour();stepShot(1);});
$('#tour').addEventListener('click',()=>tourTimer?stopTour():startTour());
$('#top-view').addEventListener('click',()=>{stopTour();scene?.topDown();});
$('#overview').addEventListener('click',()=>{stopTour();showShot('overview');});
$('#night').addEventListener('click',event=>scene?.setNight(toggle(event.currentTarget,event.currentTarget.getAttribute('aria-pressed')!=='true')));
$('#labels').addEventListener('click',event=>scene?.setLabels(toggle(event.currentTarget,event.currentTarget.getAttribute('aria-pressed')!=='true')));
document.querySelectorAll('[data-map]').forEach(el=>el.addEventListener('click',()=>scene?.basemap(el.dataset.map)));
$('#expand-scene').addEventListener('click',()=>{setTab('stage','scene');expandScene(!$('.app').classList.contains('expanded'));});
$('#collapse-scene').addEventListener('click',()=>expandScene(false));
$('#scene').addEventListener('pointerdown',stopTour);
document.querySelectorAll('[data-event]').forEach(el=>el.addEventListener('click',()=>selectEvent(Number(el.dataset.event))));
$('#side-timeline').addEventListener('click',event=>{
  const play=event.target.closest('[data-replay-event]'),locate=event.target.closest('[data-locate]');
  if(play){setTab('stage','scene');replay.seekToEvent(play.dataset.replayEvent);}
  if(locate){setTab('stage','scene');const shot=shotForLocation(locate.dataset.locate);if(shot)showShot(shot.id);}
});
$('#load-video').addEventListener('click',()=>{
  const frame=document.createElement('iframe');
  Object.assign(frame,{src:`https://www.youtube-nocookie.com/embed/${media[0].youtubeId}?autoplay=1`,title:media[0].title,allow:'autoplay; encrypted-media; picture-in-picture; fullscreen',allowFullscreen:true,referrerPolicy:'strict-origin-when-cross-origin'});
  $('#video-stage').replaceChildren(frame);
});
$('#export-data').addEventListener('click',()=>{
  const data={researchDate:RESEARCH_DATE,scope:'Reported events and landmark references with a separately labeled illustrative boat route; no raw GPS, camera position or fall position.',
    events,locations,recoveryDistance,landmarkImages,shots:shots.map(({thumbSpan,...shot})=>shot),
    boatIllustration:{...boatRouteMetadata,anchors:boatAnchors,authoredRoute:boatRouteLine},
    sources:[...sources,...contextSources],proceedings,discrepancies,limitations};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=`tangmo-scene-${RESEARCH_DATE}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

// Keyboard flight (WASD/QE/Shift), shot stepping and replay toggle while the 3D tab is in front.
const keys=new Set();let keyFrame,keyTime;
const typing=target=>target.closest?.('input,select,textarea,[contenteditable],dialog,iframe,[role="tab"]');
function flyLoop(now) {
  if(!keys.size||!scene){keyFrame=undefined;return;}
  const seconds=keyTime===undefined?0:Math.min((now-keyTime)/1000,.1);keyTime=now;
  const axis=(plus,minus)=>(keys.has(plus)?1:0)-(keys.has(minus)?1:0);
  scene.nudge({forward:axis('w','s'),right:axis('d','a'),up:axis('e','q')},seconds,keys.has('shift'));
  keyFrame=requestAnimationFrame(flyLoop);
}
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){expandScene(false);stopTour();return;}
  if(stageTab!=='scene'||typing(event.target)||event.ctrlKey||event.metaKey||event.altKey)return;
  const key=event.key.toLowerCase();
  if('wasdqe'.includes(key)&&key.length===1||key==='shift') {
    if(key!=='shift'){event.preventDefault();stopTour();}
    keys.add(key);if(!keyFrame&&key!=='shift'){keyTime=undefined;keyFrame=requestAnimationFrame(flyLoop);}
  } else if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
    if(event.target.closest('button,a')&&!event.target.closest('.shot,.tools'))return;
    event.preventDefault();stopTour();stepShot(event.key==='ArrowLeft'?-1:1);
  } else if(event.key===' '&&!event.target.closest('button,a')) {
    event.preventDefault();replay.toggle();
  }
});
document.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopTour();keys.clear();}});
window.addEventListener('pagehide',event=>{stopTour();if(!event.persisted)scene?.destroy();});

const pauseAll=()=>{replay.pause();stopTour();expandScene(false);};
setupSplatPanel($('#open-splat'),pauseAll);
setupPhotoViewer(pauseAll);
