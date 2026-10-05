import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSplatFile, MAX_SPLAT_BYTES } from './splatFile.js';

test('ordinary mesh and point-cloud PLY are not passed off as Gaussian splats',async()=>{
  const points='ply\nformat ascii 1.0\nelement vertex 1\nproperty float x\nproperty float y\nproperty float z\nend_header\n0 0 0';
  await assert.rejects(validateSplatFile(new File([points],'points.ply')),/Gaussian splat/);
  await assert.rejects(validateSplatFile(new File([points.replace('end_header','element face 1\nproperty list uchar int vertex_indices\nend_header')],'mesh.ply')),/Gaussian splat/);
});
test('accepts Gaussian PLY attributes and standard binary SPLAT layout',async()=>{
  const fields=['x','y','z','f_dc_0','f_dc_1','f_dc_2','opacity','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3'];
  const header='ply\nformat binary_little_endian 1.0\nelement vertex 1\n'+fields.map(f=>'property float '+f).join('\n')+'\nend_header\n';
  assert.equal(await validateSplatFile(new File([header,new Uint8Array(56)],'scan.PLY')),'ply');
  assert.equal(await validateSplatFile(new File([new Uint8Array(32)],'scan.splat')),'splat');
});
test('rejects empty, oversized, unsupported and truncated input before decoding',async()=>{
  await assert.rejects(validateSplatFile(new File([],'empty.spz')),/ไม่มีข้อมูล/);
  await assert.rejects(validateSplatFile({name:'large.splat',size:MAX_SPLAT_BYTES+1}),/256 MB/);
  await assert.rejects(validateSplatFile(new File(['abc'],'scan.obj')),/เลือกไฟล์/);
  await assert.rejects(validateSplatFile(new File([new Uint8Array(31)],'truncated.splat')),/32/);
});
