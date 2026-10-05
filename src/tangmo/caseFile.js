import { RESEARCH_DATE, sources, events, limitations, locationById, formatDate } from './caseData.js';
import { contextSources, proceedings, discrepancies } from './researchContext.js';
import { replaySeconds } from './boatRoute.js';
import { photoFigure } from './landmarkPhotos.js';
import { THUMBNAIL_CREDIT } from './shots.js';

export const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13"/></svg>';
export const sourceIndex=new Map([...sources,...contextSources].map(s=>[s.id,s]));
export const uniqueSources=[...new Map([...sources,...contextSources].map(s=>[s.url,s])).values()];
export const statusLabels={reported:'ตามรายงาน',interpretation:'ข้อสันนิษฐานตำรวจ',conflicting:'รายงานเวลาต่างกัน'};
export const inReplay=event=>event.date==='2022-02-24'&&replaySeconds(event.time)!==null;

export const sourceLinks=ids=>`<div class="citation-links">${ids.map(id=>{const s=sourceIndex.get(id);
  return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.publisher)}${s.published?` · ${formatDate(s.published)}`:''} ${arrow}</a>`;}).join('')}</div>`;

export function timelineMarkup() {
  return `<div class="panel-intro"><span class="tag reported">SOURCE-LINKED TIMELINE</span><h2>ลำดับเหตุการณ์ตามรายงาน</h2>
      <p>เวลาจากรายงานข่าวคำแถลงตำรวจและข่าวร่วมสมัย ไม่ได้ตรวจจากไฟล์ GPS หรือ CCTV ต้นฉบับ</p></div>
    <ol class="event-list">${events.map((e,i)=>`<li><button class="event" data-event="${i}" data-status="${e.status}" aria-pressed="false">
      <span class="event-time">${esc(e.time)}</span><span class="event-body"><span class="event-date">${formatDate(e.date)}${inReplay(e)?' · <b>ในภาพจำลอง</b>':''}</span><span>${esc(e.title)}</span></span></button></li>`).join('')}</ol>
    <article class="event-detail" id="event-detail" aria-live="polite"></article>`;
}

export function eventDetailMarkup(index) {
  const e=events[index],location=locationById(e.locationId);
  return `<div class="detail-top"><span class="tag ${e.status}">${statusLabels[e.status]}</span><span class="mono">${String(index+1).padStart(2,'0')} / ${events.length}</span></div>
    <h3><time>${esc(e.time)}</time> ${esc(e.title)}</h3><p>${esc(e.description)}</p><p class="caveat">${esc(e.caveat)}</p>
    <div class="detail-actions">${inReplay(e)?`<button class="chip-button" data-replay-event="${e.id}">▶ ดูในภาพจำลอง</button>`:''}${location?`<button class="chip-button" data-locate="${location.id}">◎ ${esc(location.title)}</button>`:'<span class="event-location">ยังไม่มีพิกัดอ้างอิงสำหรับเหตุการณ์นี้</span>'}</div>
    ${sourceLinks(e.sourceIds)}${location?photoFigure(location.id):''}`;
}

export function sourcesMarkup() {
  return `<div class="panel-intro"><span class="tag reported">${uniqueSources.length} TRACEABLE SOURCES</span><h2>ตรวจสอบย้อนกลับ</h2><p>ค้นคว้าล่าสุด ${formatDate(RESEARCH_DATE)} · วันเผยแพร่ข่าวแยกจากวันเกิดเหตุ</p></div>
    ${uniqueSources.map(s=>`<article class="source-card"><div class="source-publisher">${esc(s.publisher)}<span>${s.published?formatDate(s.published):'ไม่ระบุวันเผยแพร่'}</span></div><h3>${esc(s.title)}</h3>${s.note&&!s.note.startsWith('landmark')?`<p>${esc(s.note)}</p>`:''}<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">เปิดต้นทาง ${arrow}</a></article>`).join('')}
    <div class="panel-intro"><span class="tag interpretation">SOURCE DIFFERENCES</span><h2>ประเด็นที่ต้องอ่านคู่กัน</h2></div>
    ${discrepancies.map(d=>`<article class="context-card"><h3>${esc(d.title)}</h3><p>${esc(d.description)}</p>${sourceLinks(d.sourceIds)}</article>`).join('')}
    <div class="panel-intro"><h2>กระบวนการภายหลัง</h2><p>สถานะตามแหล่งข่าวที่ค้นพบ ไม่ใช่คำวินิจฉัยคดีใหม่</p></div>
    ${proceedings.map(p=>`<article class="context-card"><time>${formatDate(p.date)}</time><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><p class="caveat">${esc(p.caveat)}</p>${sourceLinks(p.sourceIds)}</article>`).join('')}
    <div class="panel-intro"><span class="tag model">METHOD</span><h2>อ่านฉากนี้อย่างไร</h2></div>
    <div class="method-list">
      <article><span>01</span><div><h3>ฉาก 3D คือพื้นที่จริงในปัจจุบัน</h3><p>เมช Google Photorealistic 3D, ภาพดาวเทียม Esri และ OpenStreetMap เป็นข้อมูลปัจจุบันของผู้ให้บริการ ไม่ใช่ภาพคืน 24 ก.พ. 2565 และไม่ใช่ Gaussian splat ที่สร้างจากภาพหลักฐาน</p></div></article>
      <article><span>02</span><div><h3>เวลาเป็นของรายงาน ตำแหน่งเป็นของภาพจำลอง</h3><p>จุดเวลา 8 จุดผูกกับจุดกลางแม่น้ำที่ใกล้สถานที่ซึ่งตำรวจกล่าวถึงที่สุด ระหว่างจุดเรือแล่นด้วยความเร็วคงที่ ไม่มี GPS ความเร็ว จุดจอด หรือการเลี้ยวที่วัดได้</p></div></article>
      <article><span>03</span><div><h3>22:34:10 เป็นข้อสันนิษฐาน</h3><p>ภาพจำลองหยุดที่เวลาที่ตำรวจสันนิษฐาน ตำแหน่งเรือ ณ เวลานั้นต่อจากขาก่อนหน้า 19 วินาที ไม่มีการจำลองบุคคลหรือการพลัดตก</p></div></article>
      <article><span>04</span><div><h3>วงระยะไม่ใช่จุดตก</h3><p>วงแดงแสดงระยะ 235–300 ม. จากท่าพิบูลสงคราม 1 ตามรายงานการพบร่าง ทิศทางไม่ได้รายงาน จึงไม่ปักหมุดจุดใดจุดหนึ่ง</p></div></article>
      <article><span>05</span><div><h3>แสงกลางคืนเป็นการปรับภาพ</h3><p>โหมดกลางคืนปรับสีเมชเพื่อบรรยากาศ ไม่ใช่การจำลองแสงหรือทัศนวิสัยที่วัดได้ในคืนเกิดเหตุ</p></div></article>
    </div>
    <div class="limitations">${limitations.map(l=>`<p>• ${esc(l)}</p>`).join('')}</div>
    <p class="credit-note">${esc(THUMBNAIL_CREDIT)} · พิกัดสถานที่: Wikidata, OpenStreetMap (© OpenStreetMap contributors, ODbL), Thailand Yellow Pages · ภาพถ่ายสะพาน: Wikimedia Commons ตามสัญญาอนุญาตในแต่ละภาพ</p>
    <button class="outline-button export-button" id="export-data">ดาวน์โหลดข้อมูลพร้อมแหล่งอ้างอิง (JSON) ↓</button>
    <a class="inspiration-link" href="https://www.youtube.com/watch?v=rVlRQakpOME" target="_blank" rel="noopener noreferrer">แนวคิด: “I Built a God’s Eye View of Time” · Bilawal Sidhu ${arrow}</a>`;
}
