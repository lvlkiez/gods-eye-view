import { boatAnchors, BOAT_DURATION, sampleBoatRoute, formatBoatTime, replaySeconds } from './boatRoute.js';
import { events, sourceById } from './caseData.js';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusLabels={reported:'ตามคำแถลงตำรวจ',interpretation:'ข้อสันนิษฐานตำรวจ',conflicting:'รายงานต่างกัน'};
/** Reported events whose clock time falls inside the illustrated window become timed captions. */
const captions=events.filter(e=>e.date==='2022-02-24').map(event=>({event,seconds:replaySeconds(event.time)})).filter(c=>c.seconds!==null);
const hudLabels={first:'มุมบนเรือ · ภาพจำลอง ไม่ใช่ภาพจริง',third:'ติดตามเรือ · ภาพจำลอง ไม่ใช่ภาพจริง',free:''};
const perspectives=[['first','บนเรือ','มุมมองบุคคลที่หนึ่ง'],['third','ติดตามเรือ','มุมมองบุคคลที่สาม'],['free','มุมอิสระ','ควบคุมกล้องเอง']];

export function setupReplay({scene,panel,hud,onEvent}) {
  panel.innerHTML=`
    <div class="perspective" role="group" aria-label="มุมกล้องภาพจำลอง">${perspectives.map(([id,label,hint])=>`<button data-perspective="${id}" aria-pressed="false" title="${hint}">${label}</button>`).join('')}</div>
    <div class="replay-card">
      <div class="replay-meta"><span class="eyebrow">ILLUSTRATIVE REPLAY · 24 FEB 2022</span><span id="replay-direction" class="mono"></span></div>
      <output id="replay-clock" class="replay-clock" aria-live="off">21:33:00</output>
      <div id="replay-leg" class="replay-leg"></div>
      <div class="replay-scrubber">
        <input id="replay-timeline" type="range" min="0" max="${BOAT_DURATION}" step="1" value="0" aria-label="เวลาในภาพจำลอง">
        <div class="replay-ticks" aria-hidden="true">${boatAnchors.map(a=>`<i class="${a.positionBasis==='extrapolated'?'inferred':''}" style="left:${a.seconds/BOAT_DURATION*100}%"></i>`).join('')}</div>
      </div>
      <div class="replay-controls">
        <button id="replay-play" class="play-button" aria-label="เล่นภาพจำลอง" aria-pressed="false"></button>
        <button id="replay-restart" class="icon-button" aria-label="เริ่มภาพจำลองใหม่">↺</button>
        <div class="speed" role="group" aria-label="ความเร็วการเล่น">${[30,60,120].map(s=>`<button data-speed="${s}" aria-pressed="${s===60}">${s}×</button>`).join('')}</div>
      </div>
    </div>
    <div class="replay-copy">
      <span class="eyebrow">THE NIGHT, RECONSTRUCTED</span>
      <h2>คืนนั้น จำลองใหม่</h2>
      <p>เรือจำลองแล่นตามเวลาที่ตำรวจแถลงเมื่อ 26 เม.ย. 2565 บนฉาก 3D ของพื้นที่จริง เลือกมุมบนเรือหรือมุมติดตามแล้วกดเล่น</p>
      <p class="caveat">ตำแหน่งระหว่างจุดเวลาเป็นการประมาณตามแนวแม่น้ำ ไม่ใช่ GPS · ไม่มีการจำลองบุคคลหรือการพลัดตก · โมเดลเรือเป็นแบบทั่วไป</p>
    </div>
    <ol class="anchor-list">${boatAnchors.map((a,i)=>{const s=sourceById(a.sourceId);return `<li><button data-anchor="${i}" aria-pressed="false"><time>${a.time}</time><span>${esc(a.label)}${a.positionBasis==='extrapolated'?'<em>ตำแหน่งต่อจากขาก่อนหน้า 19 วินาที</em>':''}</span><small>${esc(s.publisher)}</small></button></li>`;}).join('')}</ol>`;
  hud.innerHTML=`<div class="hud-clock"><button id="hud-play" aria-label="เล่นภาพจำลอง" aria-pressed="false"></button><output id="hud-time">21:33:00</output><span id="hud-speed">60×</span></div><div id="hud-caption" class="hud-caption" hidden></div>`;
  const $=selector=>panel.querySelector(selector)||hud.querySelector(selector);
  let seconds=0,playing=false,speed=60,frameId,lastTime,lastAnchor=-1,lastCaption=-1,captionTimer;

  function showCaption(index) {
    const {event}=captions[index],box=$('#hud-caption');
    box.innerHTML=`<span class="tag ${event.status}">${statusLabels[event.status]}</span><strong><time>${esc(event.time)}</time> ${esc(event.title)}</strong><span>${esc(event.caveat)}</span>`;
    box.hidden=false;box.dataset.status=event.status;
    clearTimeout(captionTimer);captionTimer=setTimeout(()=>{box.hidden=true;},event.status==='interpretation'?9000:5000);
  }
  function sync({immediate=false,announce=false}={}) {
    const frame=sampleBoatRoute(seconds),clock=formatBoatTime(seconds);
    scene?.setBoatFrame(frame,{immediate});
    $('#replay-clock').textContent=clock;$('#hud-time').textContent=clock;
    const slider=$('#replay-timeline');slider.value=String(seconds);slider.style.setProperty('--progress',`${seconds/BOAT_DURATION*100}%`);
    slider.setAttribute('aria-valuetext',`เวลาในภาพจำลอง ${clock}`);
    const from=boatAnchors[frame.legIndex],to=boatAnchors[frame.legIndex+1];
    $('#replay-leg').textContent=`${from.label} → ${to.label}`;
    $('#replay-direction').textContent=frame.direction==='south'?'↓ ล่องใต้':'↑ ขึ้นเหนือ';
    const anchor=boatAnchors.findLastIndex(a=>a.seconds<=seconds);
    if(anchor!==lastAnchor) {
      lastAnchor=anchor;
      panel.querySelectorAll('[data-anchor]').forEach((button,i)=>{button.classList.toggle('active',i===anchor);button.setAttribute('aria-pressed',String(i===anchor));});
    }
    const caption=captions.findLastIndex(c=>c.seconds<=seconds);
    if(caption!==lastCaption) {
      lastCaption=caption;
      if(caption>=0){onEvent?.(captions[caption].event.id);if(announce)showCaption(caption);}
    }
  }
  function setPlayButtons() {
    for(const button of [$('#replay-play'),$('#hud-play')]) {
      button.innerHTML=playing?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>';
      button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'หยุดภาพจำลอง':'เล่นภาพจำลอง');
    }
    hud.dataset.playing=String(playing);
  }
  function play(value) {
    playing=value;cancelAnimationFrame(frameId);lastTime=undefined;
    if(value) {
      if(seconds>=BOAT_DURATION){seconds=0;lastCaption=-1;sync({immediate:true});}
      if(scene?.perspective==='free')setPerspective('third');
      frameId=requestAnimationFrame(tick);
    }
    setPlayButtons();
  }
  function tick(now) {
    if(!playing)return;
    if(lastTime!==undefined)seconds=Math.min(BOAT_DURATION,seconds+Math.min((now-lastTime)/1000,.25)*speed);
    lastTime=now;sync({announce:true});
    if(seconds>=BOAT_DURATION)play(false);else frameId=requestAnimationFrame(tick);
  }
  function showPerspective(next) {
    panel.querySelectorAll('[data-perspective]').forEach(button=>{const active=button.dataset.perspective===next;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    hud.dataset.perspective=next;hud.dataset.label=hudLabels[next];
  }
  function setPerspective(next) {scene?.setPerspective(next);showPerspective(next);}
  function seek(value,{perspective}={}) {
    play(false);seconds=Math.max(0,Math.min(BOAT_DURATION,value));lastCaption=-1;
    if(perspective&&scene?.perspective==='free')setPerspective(perspective);
    sync({immediate:true});
  }

  panel.querySelectorAll('[data-perspective]').forEach(button=>button.addEventListener('click',()=>setPerspective(button.dataset.perspective)));
  panel.querySelectorAll('[data-speed]').forEach(button=>button.addEventListener('click',()=>{
    speed=Number(button.dataset.speed);$('#hud-speed').textContent=`${speed}×`;
    panel.querySelectorAll('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  $('#replay-play').addEventListener('click',()=>play(!playing));
  $('#hud-play').addEventListener('click',()=>play(!playing));
  $('#replay-restart').addEventListener('click',()=>{seek(0);play(true);});
  $('#replay-timeline').addEventListener('input',event=>seek(Number(event.target.value)));
  panel.querySelectorAll('[data-anchor]').forEach(button=>button.addEventListener('click',()=>{
    const i=Number(button.dataset.anchor);seek(boatAnchors[i].seconds,{perspective:'third'});
    const caption=captions.findIndex(c=>c.event.id===boatAnchors[i].eventId);if(caption>=0)showCaption(caption);
  }));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)play(false);});
  window.addEventListener('pagehide',()=>play(false));
  if(!scene)panel.querySelectorAll('button,input').forEach(el=>{el.disabled=true;});
  setPlayButtons();showPerspective('free');sync({immediate:true});

  return {
    pause:()=>play(false),
    toggle:()=>play(!playing),
    get playing(){return playing;},
    seek,
    /** Jump to a reported event if it falls inside the illustrated window. */
    seekToEvent(id) {
      const caption=captions.find(c=>c.event.id===id);
      if(!caption)return false;
      seek(caption.seconds,{perspective:'third'});showCaption(captions.indexOf(caption));return true;
    },
    showPerspective,
  };
}
