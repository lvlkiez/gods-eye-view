import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

// Procedural format fixtures ONLY. These are never shipped as a case-area scan.
const directory=path.resolve('qa-shots/tangmo/splat');
await fs.mkdir(directory,{recursive:true});
const count=1600,bytes=Buffer.alloc(count*32),plyBytes=Buffer.alloc(count*56);
for(let i=0;i<count;i++) {
  const t=i/count*Math.PI*10,position=[Math.cos(t)*.65,(i/count-.5)*1.7,Math.sin(t)*.65],rgb=[Math.round(70+170*i/count),190,Math.round(230-150*i/count)];
  position.forEach((value,j)=>{bytes.writeFloatLE(value,i*32+j*4);plyBytes.writeFloatLE(value,i*56+j*4);});
  [.034,.014,.022].forEach((value,j)=>{bytes.writeFloatLE(value,i*32+12+j*4);plyBytes.writeFloatLE(Math.log(value),i*56+28+j*4);});
  rgb.forEach((value,j)=>{bytes[i*32+24+j]=value;plyBytes.writeFloatLE((value/255-.5)/.28209479177387814,i*56+12+j*4);});
  bytes[i*32+27]=230;bytes[i*32+28]=255;bytes.fill(128,i*32+29,i*32+32);
  plyBytes.writeFloatLE(2.2,i*56+24);plyBytes.writeFloatLE(1,i*56+40);
}
const fields=['x','y','z','f_dc_0','f_dc_1','f_dc_2','opacity','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3'];
const header='ply\nformat binary_little_endian 1.0\nelement vertex '+count+'\n'+fields.map(f=>'property float '+f).join('\n')+'\nend_header\n';
await fs.writeFile(path.join(directory,'qa-generated-gaussians.splat'),bytes);
await fs.writeFile(path.join(directory,'qa-generated-gaussians.ply'),Buffer.concat([Buffer.from(header),plyBytes]));
await fs.writeFile(path.join(directory,'ordinary-points.ply'),'ply\nformat ascii 1.0\nelement vertex 1\nproperty float x\nproperty float y\nproperty float z\nend_header\n0 0 0');

const browser=await puppeteer.launch({headless:true,pipe:true}),errors=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try {
  const page=await browser.newPage();
  page.on('pageerror',error=>errors.push(error.message.replace(/https?:\/\/\S+/g,'[url]')));
  await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
  await page.goto((process.env.QA_BASE_URL||'http://localhost:4189')+'/tangmo.html',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#open-splat');
  assert.match(await page.$eval('[data-map="photoreal"]',el=>el.textContent),/เมช/);
  await page.click('#open-splat');
  assert.equal(await page.$eval('#splat-dialog',el=>el.open),true);
  assert.match(await page.$eval('#splat-empty',el=>el.textContent),/ยังไม่มีสแกนพื้นที่คดี/);
  await page.screenshot({path:path.join(directory,'empty-state.jpg'),type:'jpeg',quality:85});
  const upload=async name=>{
    await(await page.$('#splat-file')).uploadFile(path.join(directory,name));
    await page.waitForFunction(()=>['ready','error'].includes(document.querySelector('#splat-status').dataset.state),{timeout:45000});
  };
  await upload('qa-generated-gaussians.splat');
  assert.equal(await page.$eval('#splat-status',el=>el.dataset.state),'ready',await page.$eval('#splat-status',el=>el.textContent));
  assert.equal(await page.$eval('#splat-count',el=>el.textContent),'1,600');
  await sleep(1800);
  const canvas=await page.$('#splat-stage canvas');
  const before=await canvas.screenshot();
  const stats=await sharp(before).stats();
  assert.ok(stats.channels.slice(0,3).some(channel=>channel.stdev>5),'Gaussian pixels were drawn, not just a success label');
  await page.click('#splat-top');await sleep(700);
  assert.notDeepEqual(await canvas.screenshot(),before,'Camera changes the rendered scene');
  await page.click('#splat-fit');
  await page.screenshot({path:path.join(directory,'gaussian-renderer-qa-fixture.jpg'),type:'jpeg',quality:90});
  await upload('ordinary-points.ply');
  assert.equal(await page.$eval('#splat-status',el=>el.dataset.state),'error');
  assert.match(await page.$eval('#splat-status',el=>el.textContent),/ไม่มีคุณสมบัติ Gaussian splat/);
  assert.match(await page.$eval('#splat-filename',el=>el.textContent),/qa-generated-gaussians.splat/,'Failed replacement preserves prior scene metadata');
  await upload('qa-generated-gaussians.ply');
  assert.equal(await page.$eval('#splat-status',el=>el.dataset.state),'ready');
  assert.equal(await page.$eval('#splat-format',el=>el.textContent),'PLY');
  await page.click('#splat-flip');await page.click('#splat-flip');
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('#splat-dialog',el=>el.open),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'open-splat');
  await page.click('#open-splat');
  assert.equal(await page.$eval('#splat-filename',el=>el.textContent),'qa-generated-gaussians.ply');
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});await sleep(700);
  assert.ok(await page.$eval('#splat-dialog',el=>el.scrollWidth<=el.clientWidth),'No mobile dialog overflow');
  await page.screenshot({path:path.join(directory,'mobile-gaussian-qa-fixture.jpg'),type:'jpeg',quality:85});
  await page.click('#splat-clear');
  assert.equal(await page.$eval('#splat-empty',el=>el.hidden),false);
  await page.click('#splat-close');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No mobile toolbar overflow');
  assert.deepEqual(errors,[]);
  console.log('PASS: real Gaussian renderer draws SPLAT and Gaussian PLY fixtures; rejects ordinary point clouds; camera/reset/flip, replace, modal lifecycle and mobile layout.');
  console.log('Fixture is synthetic format-test data, NOT a case-area scan. No case scan is bundled.');
} finally {await browser.close();}
