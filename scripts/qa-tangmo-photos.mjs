import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';
import {landmarkImages} from '../src/tangmo/landmarkImages.js';

const base=process.env.QA_BASE_URL||'http://localhost:4189';
const browser=await puppeteer.launch({headless:true,pipe:true});
const errors=[];
try{
  const page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message.replace(/https?:\/\/\S+/g,'[url]')));
  await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
  await page.goto(`${base}/tangmo.html`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#photos');
  const location=()=>page.$eval('#photo-content figure',el=>el.dataset.photoLocation);
  // The toolbar opens the location photographs; arrows walk every credited image.
  await page.click('#photos');
  await page.waitForFunction(()=>document.querySelector('#photo-dialog').open);
  const seen=[];
  for(let i=0;i<landmarkImages.length;i++){
    await page.waitForFunction(()=>document.querySelector('#photo-content img')?.naturalWidth>100,{timeout:25000});
    const id=await location(),photo=landmarkImages.find(p=>p.locationId===id);
    seen.push(id);
    const caption=await page.$eval('#photo-content figcaption',el=>el.textContent);
    assert.ok(caption.includes(photo.author));assert.ok(caption.includes(photo.license));
    const links=await page.$$eval('#photo-content a',els=>els.map(el=>el.href));
    assert.ok(links.includes(photo.sourceUrl));assert.ok(links.includes(photo.licenseUrl));
    if(id==='pibul1'){assert.match(caption,/ภาพดาวเทียม/);assert.match(caption,/ไม่ทราบวันที่/);}
    await fs.mkdir('qa-shots/tangmo',{recursive:true});
    await page.screenshot({path:`qa-shots/tangmo/photo-${id}.jpg`,type:'jpeg',quality:88});
    await page.keyboard.press('ArrowRight');
  }
  assert.deepEqual([...seen].sort(),landmarkImages.map(p=>p.locationId).sort(),'All four images reachable');
  await page.click('#photo-previous');await page.click('#photo-next');
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('#photo-dialog',el=>el.open),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'photos','Focus returns to opener');
  // Event details show the landmark image or say none is verified.
  await page.click('#side-tab-timeline');
  await page.$eval('[data-event="7"]',el=>el.click());
  assert.equal(await page.$eval('#event-detail figure',el=>el.dataset.photoLocation),'rama8');
  await page.click('#event-detail [data-photo="rama8"]');
  assert.equal(await location(),'rama8');await page.keyboard.press('Escape');
  await page.$eval('[data-event="6"]',el=>el.click());
  assert.match(await page.$eval('#event-detail .photo-missing',el=>el.textContent),/ยังไม่มีภาพ/,'Thewet has no verified photograph');
  await page.$eval('[data-event="8"]',el=>el.click());
  assert.equal(await page.$('#event-detail figure'),null,'Unlocated event shows no landmark image');
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});
  await page.click('#photos');
  assert.ok(await page.$eval('#photo-dialog',el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight+1;}),'Mobile modal fits viewport');
  await page.screenshot({path:'qa-shots/tangmo/photos-mobile-dialog.jpg',type:'jpeg',quality:88});
  await page.click('#photo-close');
  // A failed image must retain an understandable fallback and working source link.
  const fallback=await browser.newPage();await fallback.setRequestInterception(true);
  fallback.on('request',r=>r.url().includes('/images/tangmo/rama7.jpg')?r.abort():r.continue());
  await fallback.goto(`${base}/tangmo.html`,{waitUntil:'domcontentloaded'});
  await fallback.click('#photos');
  await fallback.waitForSelector('#photo-content .photo-unavailable');
  assert.match(await fallback.$eval('#photo-content .photo-error',el=>el.textContent),/โหลดภาพไม่ได้/);
  assert.match(await fallback.$eval('#photo-content .photo-credit a',el=>el.href),/commons.wikimedia.org/);
  assert.deepEqual(errors,[]);
  console.log('PASS: four credited images via toolbar and arrows, Escape/focus, event-detail images and missing states, mobile dialog, failed-image fallback.');
}finally{await browser.close();}
