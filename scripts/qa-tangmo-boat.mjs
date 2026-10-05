import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';

// Replay QA: illustrative boat, perspectives, playback controls, captions and pausing rules.
const base=process.env.QA_BASE_URL||'http://localhost:4189';
const browser=await puppeteer.launch({headless:true,pipe:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const errors=[];let modelReceived=false;
try{
  const page=await browser.newPage();
  page.on('pageerror',e=>errors.push(e.message.replace(/https?:\/\/\S+/g,'[url]')));
  page.on('response',r=>{if(new URL(r.url()).pathname==='/models/tangmo-speedboat.glb'&&r.ok())modelReceived=true;});
  await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
  await page.goto(`${base}/tangmo.html`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#map-status')?.dataset.state==='ready',{timeout:60000});
  await sleep(3000);
  assert.ok(modelReceived,'Real GLB model fetched');
  const scene=key=>page.$eval('#scene',(e,key)=>e.dataset[key],key);
  const clock=()=>page.$eval('#replay-clock',e=>e.textContent);
  assert.equal(await scene('boatVisible'),'true');
  assert.equal(await page.$$eval('[data-anchor]',e=>e.length),8);
  assert.match(await page.$eval('#side-replay',e=>e.textContent),/ไม่ใช่ GPS/);
  assert.match(await page.$eval('#side-replay',e=>e.textContent),/ไม่มีการจำลองบุคคลหรือการพลัดตก/);
  assert.equal(await clock(),'21:33:00');
  assert.equal(await scene('perspective'),'free');

  // Play switches a free camera to the follow view, moves the boat, and pause freezes time.
  const position=async()=>[Number(await scene('boatLongitude')),Number(await scene('boatLatitude'))];
  const initial=await position();
  await page.click('[data-speed="120"]');
  assert.equal(await page.$eval('#hud-speed',e=>e.textContent),'120×');
  await page.click('#hud-play');
  assert.equal(await scene('perspective'),'third','Play starts in the follow view');
  await page.waitForFunction(()=>Number(document.querySelector('#scene').dataset.boatTime)>120,{timeout:20000});
  await page.click('#replay-play');
  assert.equal(await page.$eval('#hud-play',e=>e.getAttribute('aria-pressed')),'false');
  const paused=await clock();
  assert.notDeepEqual(await position(),initial,'Boat moves through intermediate positions');
  await sleep(600);assert.equal(await clock(),paused,'Pause freezes time');
  await page.$eval('#replay-timeline',e=>{e.value=600;e.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await clock(),'21:43:00');
  assert.match(await page.$eval('#replay-direction',e=>e.textContent),/ล่องใต้/);

  // Anchors, captions and the return leg.
  await page.click('[data-anchor="4"]');
  assert.equal(await clock(),'22:18:00');
  assert.match(await page.$eval('#replay-direction',e=>e.textContent),/ขึ้นเหนือ/);
  assert.match(await page.$eval('#hud-caption',e=>e.textContent),/ซังฮี้/);
  await page.click('[data-anchor="7"]');
  assert.equal(await clock(),'22:34:10');
  assert.equal(await page.$eval('#hud-caption',e=>e.dataset.status),'interpretation');
  assert.match(await page.$eval('#hud-caption',e=>e.textContent),/ไม่ใช่วินาทีตกน้ำที่ยืนยันอิสระ/);
  assert.match(await page.$eval('[data-anchor="7"]',e=>e.textContent),/ต่อจากขาก่อนหน้า/);
  const seek=value=>page.$eval('#replay-timeline',(e,value)=>{e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));},value);
  await seek(1380);assert.equal(await clock(),'21:56:00');
  await seek(3660);await page.click('#replay-play');
  await page.waitForFunction(()=>document.querySelector('#replay-play').getAttribute('aria-pressed')==='false',{timeout:10000});
  assert.equal(await clock(),'22:34:10','Replay stops at the police inference time');
  const restarted=await page.evaluate(()=>{document.querySelector('#replay-restart').click();const playing=document.querySelector('#replay-play').getAttribute('aria-pressed');document.querySelector('#replay-play').click();return [playing,document.querySelector('#replay-clock').textContent];});
  assert.deepEqual(restarted,['true','21:33:00'],'Restart returns to 21:33 and plays');

  // Perspectives: first person and follow keep control on drag; keyboard flight releases to free.
  await seek(2000);
  for(const view of ['first','third']) {
    await page.click(`#side-replay [data-perspective="${view}"]`);
    assert.equal(await scene('perspective'),view);
    assert.equal(await page.$eval(`#side-replay [data-perspective="${view}"]`,e=>e.getAttribute('aria-pressed')),'true');
    const box=await (await page.$('#scene canvas')).boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
    await page.mouse.move(box.x+box.width/2+80,box.y+box.height/2+20,{steps:5});await page.mouse.up();
    assert.equal(await scene('perspective'),view,'Drag orbits/looks without releasing the view');
    await sleep(4000);
    await fs.mkdir('qa-shots/tangmo',{recursive:true});
    await page.screenshot({path:`qa-shots/tangmo/qa-replay-${view}.jpg`,type:'jpeg',quality:88});
  }
  assert.match(await page.$eval('#replay-hud',e=>e.dataset.label),/ภาพจำลอง ไม่ใช่ภาพจริง/);
  await page.evaluate(()=>document.activeElement.blur());
  await page.keyboard.down('a');await sleep(300);await page.keyboard.up('a');
  assert.equal(await scene('perspective'),'free','Keyboard flight takes the camera');
  assert.equal(await page.$eval('#side-replay [data-perspective="free"]',e=>e.getAttribute('aria-pressed')),'true');

  // Leaving the 3D tab or opening dialogs pauses the replay.
  await page.click('#replay-play');await page.click('#stage-tab-track');
  assert.equal(await page.$eval('#replay-play',e=>e.getAttribute('aria-pressed')),'false','Switching tab pauses');
  await page.click('#stage-tab-scene');await page.click('#replay-play');await page.click('#open-splat');
  assert.equal(await page.$eval('#replay-play',e=>e.getAttribute('aria-pressed')),'false','Gaussian dialog pauses');
  await page.keyboard.press('Escape');
  await page.click('#replay-play');await page.click('#photos');
  assert.equal(await page.$eval('#replay-play',e=>e.getAttribute('aria-pressed')),'false','Photo dialog pauses');
  await page.keyboard.press('Escape');

  await page.setViewport({width:390,height:844,deviceScaleFactor:1});await sleep(1200);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No mobile overflow');
  assert.ok(await page.$eval('.hud-clock',e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),'HUD fits mobile stage');
  await page.screenshot({path:'qa-shots/tangmo/qa-replay-mobile.jpg',fullPage:true,type:'jpeg',quality:80});
  assert.deepEqual(errors,[]);
  console.log('PASS: GLB boat, play/pause/seek/restart/end, anchors and captions, return leg, first/third/free perspectives with drag, keyboard release, tab/dialog pausing, mobile HUD.');
}finally{await browser.close();}
