import { validateSplatFile } from './splatFile.js';
import './splat.css';

export function setupSplatPanel(openButton,onOpen) {
  const dialog=document.createElement('dialog');
  dialog.id='splat-dialog';dialog.setAttribute('aria-labelledby','splat-title');
  dialog.innerHTML=`
    <header class="splat-header"><div><span class="section-label">GAUSSIAN SPLATTING</span><h2 id="splat-title">สำรวจไฟล์สแกน</h2></div><button id="splat-close" aria-label="ปิด Gaussian splat">×</button></header>
    <div class="splat-layout">
      <div class="splat-stage-wrap"><div id="splat-stage"></div>
        <div id="splat-empty"><div class="splat-symbol" aria-hidden="true"><i></i><i></i><i></i></div><span class="tag model">CASE SCAN NOT AVAILABLE</span><h3>ยังไม่มีสแกนพื้นที่คดี</h3><p>เปิดไฟล์ Gaussian splat ที่สร้างจากภาพหลายมุม<br>เพื่อสำรวจสแกนจริงในตัวแสดงนี้</p><button id="splat-choose-main" class="splat-primary">เลือกไฟล์สแกนจากเครื่อง</button><span class="splat-formats">.PLY / .SPLAT / .SPZ / .KSPLAT · สูงสุด 256 MB</span></div>
        <div id="splat-scan-badge" hidden>ไฟล์ที่เลือก · ยังไม่ยืนยันสถานที่และวันที่ถ่าย</div>
        <div class="splat-stage-tools" hidden><button id="splat-fit">จัดภาพ</button><button id="splat-top">มุมบน</button><button id="splat-flip">กลับด้าน</button></div>
      </div>
      <aside class="splat-info"><span class="tag reported">REAL SPLAT RENDERER</span><h3>ข้อมูลของสแกน</h3><p>ตัวแสดงนี้ใช้ Gaussian splatting โดยตรง แยกจากเมช 3D ของ Google Maps</p>
        <div id="splat-status" role="status" data-state="empty">ยังไม่ได้เลือกไฟล์</div>
        <dl id="splat-details" hidden><dt>ไฟล์</dt><dd id="splat-filename"></dd><dt>จำนวน Gaussian</dt><dd id="splat-count"></dd><dt>รูปแบบ</dt><dd id="splat-format"></dd></dl>
        <input id="splat-file" type="file" accept=".ply,.splat,.spz,.ksplat" hidden>
        <button id="splat-choose" class="outline-button">เลือก / เปลี่ยนไฟล์</button><button id="splat-clear" hidden>นำไฟล์ออก</button>
        <p class="splat-local">ไฟล์ประมวลผลในเบราว์เซอร์ ไม่อัปโหลดไปยังเซิร์ฟเวอร์</p>
        <div class="splat-info-note"><h4>สำหรับสแกนพื้นที่คดี</h4><p>ต้องทราบสถานที่ วันที่ถ่าย ผู้สร้าง และสิทธิ์ใช้งานก่อนเชื่อมกับสถานที่อ้างอิง ขณะนี้ยังไม่ผูกไฟล์กับหมุดหรือไทม์ไลน์</p><p>สแกนปัจจุบันไม่แสดงสภาพคืนเกิดเหตุ และไม่ยืนยันตำแหน่งเรือ</p></div>
      </aside>
    </div><div class="splat-footer">ลากเพื่อหมุน · เลื่อนเพื่อซูม · ลากด้วยปุ่มขวาเพื่อเลื่อนภาพ <span>Spark · Gaussian renderer</span></div>`;
  document.body.appendChild(dialog);
  const find=selector=>dialog.querySelector(selector);
  let viewer,loading=false,loaded=false,disposed=false;
  function status(text,state) {find('#splat-status').textContent=text;find('#splat-status').dataset.state=state;}
  function setLoading(value) {loading=value;for(const selector of ['#splat-file','#splat-choose','#splat-choose-main','#splat-clear'])find(selector).disabled=value;}
  function displayLoaded(value) {
    loaded=value;find('#splat-empty').hidden=value;find('#splat-details').hidden=!value;
    find('#splat-clear').hidden=!value;find('#splat-scan-badge').hidden=!value;find('.splat-stage-tools').hidden=!value;
  }
  async function loadFile(file) {
    if(!file||loading||disposed)return;
    setLoading(true);status('กำลังตรวจและอ่านไฟล์…','loading');
    try {
      const format=await validateSplatFile(file);
      if(!viewer){const {createSplatViewer}=await import('./splatViewer.js');if(disposed)return;viewer=createSplatViewer(find('#splat-stage'),message=>status(message,'error'));}
      viewer.setActive(dialog.open&&!document.hidden);
      status('กำลังถอดรหัส Gaussian…','loading');
      const result=await viewer.load(file,format);
      if(!result||disposed)return;
      find('#splat-filename').textContent=file.name;find('#splat-count').textContent=result.count.toLocaleString('en-US');find('#splat-format').textContent=result.format;
      displayLoaded(true);status('เปิด Gaussian splat แล้ว · แหล่งที่มายังไม่ตรวจสอบ','ready');
    } catch(error) {
      if(disposed)return;
      const known=/เลือกไฟล์|ไฟล์นี้|ตัวแสดงนี้|PLY|ขนาดไฟล์/.test(error.message);
      status((known?error.message:'เปิดไฟล์ไม่ได้ ตรวจสอบว่าเป็น Gaussian splat ที่สมบูรณ์ และอุปกรณ์รองรับ WebGL2')+(loaded?' · ยังคงแสดงไฟล์เดิม':''),'error');
    } finally {setLoading(false);find('#splat-file').value='';}
  }
  openButton.addEventListener('click',()=>{onOpen();dialog.showModal();document.body.classList.add('has-splat-dialog');viewer?.setActive(!document.hidden);});
  find('#splat-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{viewer?.setActive(false);document.body.classList.remove('has-splat-dialog');openButton.focus();});
  for(const selector of ['#splat-choose','#splat-choose-main'])find(selector).addEventListener('click',()=>find('#splat-file').click());
  find('#splat-file').addEventListener('change',event=>loadFile(event.target.files[0]));
  dialog.addEventListener('dragover',event=>{event.preventDefault();});
  dialog.addEventListener('drop',event=>{event.preventDefault();if(event.dataTransfer.files.length!==1){status('เลือกไฟล์สแกนครั้งละหนึ่งไฟล์','error');return;}loadFile(event.dataTransfer.files[0]);});
  find('#splat-clear').addEventListener('click',()=>{viewer?.clear();displayLoaded(false);status('ยังไม่ได้เลือกไฟล์','empty');});
  find('#splat-fit').addEventListener('click',()=>viewer?.fit());find('#splat-top').addEventListener('click',()=>viewer?.fit('top'));find('#splat-flip').addEventListener('click',()=>viewer?.flip());
  document.addEventListener('visibilitychange',()=>viewer?.setActive(dialog.open&&!document.hidden));
  window.addEventListener('pagehide',event=>{if(!event.persisted){disposed=true;viewer?.destroy();}});
}
