import {landmarkImages,imageByLocation} from './landmarkImages.js';
import {formatDate} from './caseData.js';
import './photos.css';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typeLabel=photo=>photo.kind==='satellite'?'ภาพดาวเทียมบริเวณสถานที่':'ภาพถ่ายสถานที่';
const dateLabel=photo=>photo.capturedAt?`ถ่าย ${formatDate(photo.capturedAt)}`:'ไม่ทราบวันที่ถ่ายภาพ';
export function photoVisual(id,{lazy=true}={}){
  const photo=imageByLocation(id);if(!photo)return '';
  return `<span class="photo-visual"><img data-landmark-image="${id}" src="${esc(photo.src)}" width="${photo.width}" height="${photo.height}" alt="${esc(photo.alt)}" loading="${lazy?'lazy':'eager'}" decoding="async"><span class="photo-error">โหลดภาพไม่ได้ · ดูต้นทางจากลิงก์เครดิต</span></span>`;
}
export function photoFigure(id,{enlarge=true,lazy=true}={}){
  const photo=imageByLocation(id);if(!photo)return '<p class="photo-missing">ยังไม่มีภาพสถานที่ที่ตรวจสอบได้สำหรับเหตุการณ์นี้</p>';
  const visual=photoVisual(id,{lazy});
  return `<figure class="location-photo" data-photo-location="${id}">${enlarge?`<button class="photo-expand" data-photo="${id}" aria-label="ขยายภาพ ${esc(photo.title)}">${visual}<span class="photo-open-hint">ขยายภาพ ↗</span></button>`:visual}<figcaption><div class="photo-kind">${typeLabel(photo)} · ${dateLabel(photo)}</div><p>${esc(photo.caption)}</p><div class="photo-credit"><a href="${esc(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(photo.author)} ↗</a> · <a href="${esc(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a></div></figcaption></figure>`;
}
export function setupPhotoViewer(onOpen){
  const dialog=document.createElement('dialog');dialog.id='photo-dialog';dialog.setAttribute('aria-labelledby','photo-title');
  dialog.innerHTML='<header><div><span class="section-label">LOCATION REFERENCE</span><h2 id="photo-title"></h2></div><button id="photo-close" aria-label="ปิดภาพประกอบ">×</button></header><div id="photo-content"></div><footer><button id="photo-previous" aria-label="ภาพสถานที่ก่อนหน้า">← ก่อนหน้า</button><span id="photo-count"></span><button id="photo-next" aria-label="ภาพสถานที่ถัดไป">ถัดไป →</button></footer>';
  dialog.querySelector('#photo-title').setAttribute('aria-live','polite');
  document.body.append(dialog);let index=0,opener;
  function render(){const photo=landmarkImages[index];dialog.querySelector('#photo-title').textContent=photo.title;dialog.querySelector('#photo-content').innerHTML=photoFigure(photo.locationId,{enlarge:false,lazy:false});dialog.querySelector('#photo-count').textContent=`${index+1} / ${landmarkImages.length}`;}
  function open(id,trigger){const next=landmarkImages.findIndex(p=>p.locationId===id);if(next<0)return;index=next;opener=trigger;onOpen();render();dialog.showModal();document.body.classList.add('has-photo-dialog');dialog.querySelector('#photo-close').focus();}
  function step(direction){index=(index+direction+landmarkImages.length)%landmarkImages.length;render();}
  document.addEventListener('click',event=>{const button=event.target.closest('[data-photo]');if(button)open(button.dataset.photo,button);});
  dialog.querySelector('#photo-close').addEventListener('click',()=>dialog.close());
  dialog.querySelector('#photo-previous').addEventListener('click',()=>step(-1));dialog.querySelector('#photo-next').addEventListener('click',()=>step(1));
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?-1:1);}});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('has-photo-dialog');if(opener?.isConnected)opener.focus({preventScroll:true});});
  const failed=image=>{if(image.matches?.('img[data-landmark-image]'))image.closest('.photo-visual').classList.add('photo-unavailable');};
  document.addEventListener('error',event=>failed(event.target),true);
  document.querySelectorAll('img[data-landmark-image]').forEach(image=>{if(image.complete&&!image.naturalWidth)failed(image);});
}
