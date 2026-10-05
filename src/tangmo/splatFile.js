export const MAX_SPLAT_BYTES=256*1024*1024;
const formats=new Set(['ply','splat','spz','ksplat']);

/** Reject ordinary mesh/point-cloud PLYs instead of silently calling them splats. */
export async function validateSplatFile(file) {
  const extension=file.name.split('.').at(-1).toLowerCase();
  if(!formats.has(extension))throw new Error('เลือกไฟล์ Gaussian .ply, .splat, .spz หรือ .ksplat');
  if(!file.size)throw new Error('ไฟล์นี้ไม่มีข้อมูล');
  if(file.size>MAX_SPLAT_BYTES)throw new Error('ตัวแสดงนี้รองรับไฟล์ไม่เกิน 256 MB กรุณาตัดพื้นที่หรือบีบอัดสแกนก่อน');
  if(extension==='ply') {
    const text=await file.slice(0,65536).text();
    const end=text.indexOf('end_header');
    if(!text.startsWith('ply')||end<0)throw new Error('อ่านส่วนหัว PLY ไม่ได้');
    const header=text.slice(0,end);
    const properties=new Set([...header.matchAll(/^property\s+\S+\s+(\S+)\s*$/gm)].map(match=>match[1]));
    const standard=['x','y','z','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3','opacity','f_dc_0','f_dc_1','f_dc_2'];
    const compressed=['packed_position','packed_rotation','packed_scale','packed_color'];
    if(!standard.every(p=>properties.has(p))&&!compressed.every(p=>properties.has(p)))throw new Error('PLY นี้ไม่มีคุณสมบัติ Gaussian splat (scale, rotation, opacity) ไฟล์เมชหรือ point cloud ทั่วไปใช้แทนไม่ได้');
    if(!/^element vertex [1-9]\d*\s*$/m.test(header))throw new Error('ไม่พบ Gaussian ในไฟล์ PLY');
  }
  if(extension==='splat'&&file.size%32!==0)throw new Error('ขนาดไฟล์ .splat ไม่ตรงกับรูปแบบมาตรฐาน 32 ไบต์ต่อ Gaussian');
  return extension;
}
