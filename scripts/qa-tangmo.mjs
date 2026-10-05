import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';

// Page-level QA for tangmo.html: layout, shots, stage tabs, timeline, track, map modes, keyboard, responsive and fallback.
const base=process.env.QA_BASE_URL||'http://localhost:4189';
const browser=await puppeteer.launch({headless:true,pipe:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const errors=[],network={satellite:0,street:0,photoreal:0,thumbnails:0};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const text=(page,selector)=>page.$eval(selector,el=>el.textContent);
try {
  const page=await browser.newPage();
  // Keep credentials and complete external request URLs out of logs.
  if(process.env.QA_VERBOSE)console.log('step: Keep credentials and complete external request URLs out of logs.');
  page.on('pageerror',error=>errors.push(error.message.replace(/https?:\/\/\S+/g,'[url]')));
  page.on('response',response=>{
    if(!response.ok())return;
    const url=new URL(response.url());
    if(url.hostname==='services.arcgisonline.com'&&url.pathname.includes('/tile/'))network.satellite++;
    if(url.hostname==='services.arcgisonline.com'&&url.pathname.endsWith('/export'))network.thumbnails++;
    if(url.hostname==='tile.openstreetmap.org')network.street++;
    if(url.hostname==='tile.googleapis.com'&&url.pathname.includes('/3dtiles/'))network.photoreal++;
  });
  await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
  await page.goto(`${base}/tangmo.html`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#scene canvas');
  await page.waitForFunction(()=>document.querySelector('#map-status')?.dataset.state==='ready',{timeout:60000});
  assert.equal(await page.$eval('#scene-fallback',el=>el.hidden),true);
  assert.equal(await page.$eval('#scene-loading',el=>el.hidden),true,'Loading overlay clears');
  const hasKey=!await page.$eval('[data-map="photoreal"]',el=>el.disabled);
  assert.equal(await page.$eval('#map-status',el=>el.dataset.mode),hasKey?'photoreal':'satellite','Google mesh is the default 3D view when configured');
  assert.match(await text(page,'#map-status'),/ไม่ใช่ภาพคืนเกิดเหตุ|ไม่ทราบวันที่/);

  // Scene gallery and captions.
  if(process.env.QA_VERBOSE)console.log('step: Scene gallery and captions.');
  assert.equal(await page.$$eval('[data-shot]',els=>els.length),10);
  assert.match(await text(page,'#shot-title'),/พิบูลสงคราม/);
  await page.click('[data-shot="rama8"]');
  assert.equal(await text(page,'#shot-time'),'21:56');
  assert.equal(await page.$eval('[data-shot="rama8"]',el=>el.getAttribute('aria-pressed')),'true');
  await page.focus('[data-shot="rama8"]');await page.keyboard.press('ArrowRight');
  assert.match(await text(page,'#shot-title'),/กรุงธน/,'Arrow keys step through viewpoints');
  await page.click('#tour');
  assert.equal(await page.$eval('#tour',el=>el.getAttribute('aria-pressed')),'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('#tour',el=>el.getAttribute('aria-pressed')),'false','Escape stops the tour');

  // Keyboard flight moves the camera on the horizontal plane.
  if(process.env.QA_VERBOSE)console.log('step: Keyboard flight moves the camera on the horizontal plane.');
  await page.click('[data-shot="overview"]');await sleep(2500);
  await page.$eval('#scene canvas',el=>el.focus());await page.evaluate(()=>document.activeElement.blur());
  const before=await page.$eval('#scene',el=>el.dataset.camera);
  await page.keyboard.down('w');await sleep(600);await page.keyboard.up('w');await sleep(1200);
  const after=await page.$eval('#scene',el=>el.dataset.camera);
  assert.notEqual(after,before,'WASD moves the camera');
  const height=(value)=>Number(value.split(',')[2]);
  assert.ok(Math.abs(height(after)-height(before))<5,'W keeps height above the river');

  // Night grade and labels.
  if(process.env.QA_VERBOSE)console.log('step: Night grade and labels.');
  await page.click('#night');
  assert.equal(await page.$eval('#scene',el=>el.dataset.night),'true');
  await page.click('#night');await page.click('#labels');
  assert.equal(await page.$eval('#labels',el=>el.getAttribute('aria-pressed')),'false');
  await page.click('#labels');

  // Timeline: events in the replay window seek it; others fly to a viewpoint.
  if(process.env.QA_VERBOSE)console.log('step: Timeline: events in the replay window seek it; others fly to a viewpoint.');
  await page.click('#side-tab-timeline');
  assert.equal(await page.$$eval('[data-event]',els=>els.length),18,'18 reported events');
  await page.$eval('[data-event="8"]',el=>el.click());
  assert.equal(await text(page,'#replay-clock'),'22:11:00','Booking time seeks the replay');
  assert.match(await text(page,'#event-detail'),/คนขับรถ/);
  assert.match(await text(page,'#event-detail'),/ยังไม่มีพิกัด/);
  await page.$eval('[data-event="0"]',el=>el.click());
  assert.match(await text(page,'#shot-title'),/ภาพรวม/,'Events without a location return to the overview');
  await page.$eval('[data-event="12"]',el=>el.click());
  assert.match(await text(page,'#event-detail .tag'),/ข้อสันนิษฐาน/);
  assert.equal(await text(page,'#replay-clock'),'22:34:10');
  await page.$eval('[data-event="17"]',el=>el.click());
  assert.match(await text(page,'#shot-title'),/ระยะพบร่าง/);
  assert.match(await text(page,'#event-detail'),/13:00–13:10/);
  await page.click('#event-detail [data-locate]');
  assert.match(await text(page,'#shot-title'),/พิบูลสงคราม/);
  assert.ok(await page.$eval('.event-list',el=>{const item=el.querySelector('.selected').getBoundingClientRect(),list=el.getBoundingClientRect();return item.top>=list.top-1&&item.bottom<=list.bottom+1;}),'Selected event stays visible inside the list');

  // Sources tab.
  if(process.env.QA_VERBOSE)console.log('step: Sources tab.');
  await page.click('#side-tab-sources');
  const links=await page.$$eval('.source-card>a',els=>els.map(a=>a.href));
  assert.ok(links.length>=15);assert.equal(new Set(links).size,links.length,'Source display deduplicates URLs');
  assert.ok(links.some(href=>href.includes('openstreetmap.org/node/3542061069')),'Thewet N15 coordinate is cited');
  assert.equal(await page.$$eval('#side-sources .context-card',els=>els.length),6);
  await page.focus('#side-tab-sources');await page.keyboard.press('Home');
  assert.equal(await page.$eval('#side-tab-replay',el=>el.getAttribute('aria-selected')),'true');

  // Stage tabs: track and video.
  if(process.env.QA_VERBOSE)console.log('step: Stage tabs: track and video.');
  await page.click('#stage-tab-track');
  await page.waitForSelector('#stage-track .track-svg');
  assert.equal(await page.$$eval('#stage-track [data-anchor]',els=>els.length),8);
  assert.match(await text(page,'#stage-track'),/ไม่ใช่ GPS/);
  assert.match(await page.$eval('#stage-track .track-anchor.inferred',el=>el.textContent),/22:34:10/);
  await sleep(3500);
  await fs.mkdir('qa-shots/tangmo',{recursive:true});
  await page.screenshot({path:'qa-shots/tangmo/qa-track.jpg',type:'jpeg',quality:88});
  await page.click('#stage-track [data-anchor="5"] .track-label');
  assert.equal(await page.$eval('#stage-scene',el=>el.inert),false,'Track anchor opens the 3D view');
  assert.equal(await text(page,'#replay-clock'),'22:21:00');
  assert.equal(await page.$eval('#scene',el=>el.dataset.perspective),'third');
  await page.click('#stage-tab-video');
  assert.equal(await page.$eval('#stage-scene',el=>el.inert),true);
  await page.click('#load-video');
  assert.match(await page.$eval('#video-stage iframe',el=>el.src),/youtube-nocookie.com\/embed\/Xpv4U2xqLEM/);
  await page.click('#stage-tab-scene');

  // Expand and map modes.
  if(process.env.QA_VERBOSE)console.log('step: Expand and map modes.');
  await page.click('#expand-scene');
  assert.equal(await page.$eval('.app',el=>el.classList.contains('expanded')),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('.app',el=>el.classList.contains('expanded')),false);
  for(const mode of ['street','satellite']) {
    await page.click(`[data-map="${mode}"]`);
    await page.waitForFunction(m=>document.querySelector('#map-status').dataset.mode===m&&document.querySelector('#map-status').dataset.state==='ready',{timeout:30000},mode);
    await sleep(2500);
  }
  assert.equal(await page.$eval('#scene',el=>el.dataset.waterHeight),'0.00','Ellipsoid basemaps put the river at height 0');
  assert.ok(network.street>0&&network.satellite>0,'Real OSM and satellite tiles received');
  if(hasKey) {
    await page.click('[data-map="photoreal"]');
    await page.waitForFunction(()=>document.querySelector('#map-status').dataset.mode==='photoreal',{timeout:30000});
    await page.waitForFunction(()=>Number(document.querySelector('#scene').dataset.waterHeight)<-5,{timeout:30000});
    console.log('Google 3D water height (ellipsoid m):',await page.$eval('#scene',el=>el.dataset.waterHeight));
  }
  await page.click('[data-shot="pibul1"]');await sleep(5000);
  await page.screenshot({path:'qa-shots/tangmo/qa-desktop.jpg',type:'jpeg',quality:88});

  for(const [width,height,name] of [[390,844,'mobile'],[768,1024,'tablet']]) {
    await page.setViewport({width,height,deviceScaleFactor:1});await sleep(1500);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No ${name} overflow`);
    await page.screenshot({path:`qa-shots/tangmo/qa-${name}.jpg`,fullPage:true,type:'jpeg',quality:80});
  }
  assert.ok(network.thumbnails>=5,'Viewpoint thumbnails load from the live imagery export');
  assert.deepEqual(errors,[],'No page errors');

  const fallback=await browser.newPage();
  await fallback.evaluateOnNewDocument(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/i.test(kind)?null:original.call(this,kind,...args);};});
  await fallback.goto(`${base}/tangmo.html`,{waitUntil:'domcontentloaded'});
  await fallback.waitForSelector('#replay-clock');
  assert.equal(await fallback.$eval('#scene-fallback',el=>el.hidden),false,'Reading fallback visible');
  assert.equal(await fallback.$eval('#replay-play',el=>el.disabled),true);
  await fallback.click('#side-tab-timeline');
  await fallback.$eval('[data-event="12"]',el=>el.click());
  assert.match(await fallback.$eval('#event-detail',el=>el.textContent),/สันนิษฐาน/);
  await fallback.click('#stage-tab-track');
  assert.equal(await fallback.$$eval('#stage-track [data-anchor]',els=>els.length),8,'Track view works without WebGL');
  console.log('PASS: default 3D mode, viewpoint gallery/keys/tour, WASD flight, night/labels, timeline↔replay, sources, track/video tabs, expand, map modes, responsive layouts, WebGL fallback.');
  console.log('Successful map responses:',network);
} finally {await browser.close();}
