import { boatAnchors, anchorPosition, routeLegs } from './boatRoute.js';
import { locationById, recoveryDistance } from './caseData.js';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=6378137,rad=d=>d*Math.PI/180;
const BOUNDS={west:100.4835,east:100.5285,south:13.7635,north:13.8385};
const mercator=([lon,lat])=>[R*rad(lon),R*Math.log(Math.tan(Math.PI/4+rad(lat)/2))];
const [x0,y0]=mercator([BOUNDS.west,BOUNDS.south]),[x1,y1]=mercator([BOUNDS.east,BOUNDS.north]);
const VIEW={width:1500,height:1000},MAP_H=VIEW.height,MAP_W=Math.round(MAP_H*(x1-x0)/(y1-y0)),MAP_X=Math.round((VIEW.width-MAP_W)/2);
const project=point=>{const [x,y]=mercator(point);return [MAP_X+(x-x0)/(x1-x0)*MAP_W,(y1-y)/(y1-y0)*MAP_H];};
const metresToPx=(metres,lat)=>metres/Math.cos(rad(lat))*MAP_H/(y1-y0);
const imageUrl=`https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${[x0,y0,x1,y1].map(v=>v.toFixed(1)).join(',')}&bboxSR=3857&imageSR=3857&size=${Math.round(MAP_W*1.5)},${MAP_H*1.5}&format=jpg&f=image`;

/** Shift a screen polyline sideways so the two travel directions do not overlap. */
function offset(points,distance) {
  return points.map((p,i)=>{
    const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
    return [p[0]-dy/len*distance,p[1]+dx/len*distance];
  });
}
const path=points=>points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
/** Give each label row a y position at least `gap` below the previous one. */
function spread(items,gap) {
  let previous=-Infinity;
  const sorted=[...items].sort((a,b)=>a.y-b.y);
  for(const item of sorted){item.labelY=Math.max(item.y,previous+gap);previous=item.labelY;}
  const overflow=previous-(VIEW.height-60);
  if(overflow>0)sorted.forEach(item=>{item.labelY-=overflow;});
}

export function renderTrackMap(container,{onAnchor}) {
  const items=boatAnchors.map((anchor,i)=>{const [x,y]=project(anchorPosition(i));return {anchor,i,x,y,side:i<4?'left':'right'};});
  for(const side of ['left','right'])spread(items.filter(item=>item.side===side),70);
  const pier=locationById(recoveryDistance.locationId),[px,py]=project([pier.lon,pier.lat]);
  const rama7=locationById('rama7'),[r7x,r7y]=project([rama7.lon,rama7.lat]);
  const km=metresToPx(1000,13.8);
  const labels=items.map(({anchor,i,x,y,side,labelY})=>{
    const inferred=anchor.positionBasis==='extrapolated',lx=side==='left'?MAP_X-30:MAP_X+MAP_W+30,anchorX=side==='left'?lx+8:lx-8;
    const textX=side==='left'?lx-14:lx+14,align=side==='left'?'end':'start';
    return `<g class="track-anchor${inferred?' inferred':''}" data-anchor="${i}" role="button" tabindex="0" aria-label="${esc(`${anchor.time} ${anchor.label} · เปิดในภาพจำลอง`)}">
      <rect class="track-hit" x="${side==='left'?lx-360:lx}" y="${(labelY-36).toFixed(1)}" width="360" height="66" rx="6"/>
      <polyline points="${x.toFixed(1)},${y.toFixed(1)} ${anchorX},${labelY.toFixed(1)} ${lx},${labelY.toFixed(1)}"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9"/>
      <text x="${textX}" y="${(labelY-6).toFixed(1)}" text-anchor="${align}" class="track-time">${anchor.time}</text>
      <text x="${textX}" y="${(labelY+22).toFixed(1)}" text-anchor="${align}" class="track-label">${esc(anchor.label)}${inferred?' · ตำแหน่งต่อจากขาก่อนหน้า':''}</text>
    </g>`;
  }).join('');
  container.innerHTML=`<div class="track-map">
    <svg class="track-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-labelledby="track-title track-desc">
      <title id="track-title">เส้นทางเรือจำลองและเวลาตามคำแถลงตำรวจ</title>
      <desc id="track-desc">แผนที่แม่น้ำเจ้าพระยาจากสะพานพระราม 5 ถึงสะพานพระราม 8 แสดงจุดเวลาประมาณ 8 จุด เส้นทางวาดตามแนวแม่น้ำ ไม่ใช่ GPS</desc>
      <rect width="${VIEW.width}" height="${VIEW.height}" class="track-bg"/>
      <image href="${imageUrl}" x="${MAP_X}" y="0" width="${MAP_W}" height="${MAP_H}" preserveAspectRatio="none" class="track-image"/>
      <rect x="${MAP_X}" y="0" width="${MAP_W}" height="${MAP_H}" class="track-shade"/>
      <circle cx="${px}" cy="${py}" r="${metresToPx(recoveryDistance.metres[0],pier.lat).toFixed(1)}" class="track-ring inner"/>
      <circle cx="${px}" cy="${py}" r="${metresToPx(recoveryDistance.metres[1],pier.lat).toFixed(1)}" class="track-ring"/>
      <path d="${path(offset(routeLegs.south.map(project),-5))}" class="track-leg south"/>
      <path d="${path(offset(routeLegs.north.map(project),5))}" class="track-leg north"/>
      <g class="track-landmark"><rect x="${r7x-6}" y="${r7y-6}" width="12" height="12" transform="rotate(45 ${r7x} ${r7y})"/><text x="${r7x+16}" y="${r7y+6}">สะพานพระราม 7</text></g>
      ${labels}
      <g class="track-north" transform="translate(${MAP_X+MAP_W-48} 54)"><circle r="26"/><path d="M0 -17 7 8 0 3 -7 8Z"/><text y="-32" text-anchor="middle">N</text></g>
      <g class="track-scale" transform="translate(${MAP_X+24} ${MAP_H-34})"><path d="M0 0H${km.toFixed(1)}M0 -8V0M${km.toFixed(1)} -8V0"/><text x="${(km/2).toFixed(1)}" y="-14" text-anchor="middle">1 กม.</text></g>
    </svg>
    <div class="track-heading"><span class="eyebrow">BOAT TRACK · APPROXIMATE EVENT POSITIONS</span><h2>เส้นทางเรือ · ตำแหน่งเหตุการณ์โดยประมาณ</h2><p>กดเวลาเพื่อเปิดจุดนั้นในภาพจำลอง 3D</p></div></div>
    <div class="track-foot"><ul class="track-legend">
      <li><i class="south"></i>ขาล่องใต้ 21:33–21:56</li>
      <li><i class="north"></i>ขากลับขึ้นเหนือ 21:56–22:34:10</li>
      <li><i class="ring"></i>ระยะพบร่างที่รายงาน 235–300 ม. จากท่า (ไม่ทราบทิศ)</li>
    </ul>
    <p class="track-credit">ภาพ: Esri, Vantor, Earthstar Geographics · ไม่ทราบวันที่ถ่าย · เส้นทางวาดตามแนวแม่น้ำ ไม่ใช่ GPS · เวลา: คำแถลงตำรวจ 26 เม.ย. 2565 ผ่าน Thai PBS / แนวหน้า</p></div>`;
  const image=container.querySelector('.track-image');
  image.addEventListener('error',()=>container.classList.add('image-failed'),{once:true});
  container.querySelectorAll('[data-anchor]').forEach(group=>{
    const open=()=>onAnchor(Number(group.dataset.anchor));
    group.addEventListener('click',open);
    group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
  });
}
