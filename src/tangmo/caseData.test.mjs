import test from 'node:test';
import assert from 'node:assert/strict';
import { RESEARCH_DATE,sources,locations,events,media,sourceById,locationById,formatDate } from './caseData.js';
import { contextSources, proceedings, discrepancies } from './researchContext.js';
test('source references resolve',()=>{for(const e of events) for(const id of e.sourceIds) assert.equal(sourceById(id)?.id,id); for(const l of locations) assert.equal(locationById(l.id)?.precision,'landmark');});
test('chronology and safeguards',()=>{const key=e=>`${e.date} ${e.time.replace('ประมาณ ','').replace('–','')}`; for(let i=1;i<events.length;i++) assert.ok(key(events[i])>=key(events[i-1])); assert.equal(events.find(e=>e.id==='police-inference').status,'interpretation'); assert.equal(events.find(e=>e.id==='recovery-time').status,'conflicting'); assert.ok(events.every(e=>e.locationId===null||locationById(e.locationId)));});
test('landmarks and date',()=>{assert.equal(RESEARCH_DATE,'2026-10-02'); assert.equal(media[0].youtubeId,'Xpv4U2xqLEM'); for(const l of locations) assert.ok(l.lat>13.7&&l.lat<13.9&&l.lon>100.4&&l.lon<100.6); assert.match(formatDate('2022-02-24'),/2565/);});

test('context, media and coordinate citations resolve to dated or explicitly undated sources',()=>{
  const all=[...sources,...contextSources], ids=new Set(all.map(s=>s.id));
  assert.equal(ids.size,all.length,'Source IDs are unique even when URLs overlap');
  for(const record of [...events,...proceedings,...discrepancies]) {
    assert.ok(record.sourceIds.length>0);
    for(const id of record.sourceIds) assert.ok(ids.has(id),`Missing source ${id}`);
  }
  for(const record of [...locations,...media]) assert.ok(ids.has(record.sourceId||record.id));
  for(const source of all) {
    assert.equal(new URL(source.url).protocol,'https:');
    assert.ok(source.published===null||/^\d{4}-\d{2}-\d{2}$/.test(source.published));
  }
});

test('attribution does not conflate departure sources, transport booking, or fall inference',()=>{
  assert.deepEqual(events.find(e=>e.id==='start-nbc').sourceIds,['ThaiPBS314905']);
  assert.deepEqual(events.find(e=>e.id==='rama5-passage').sourceIds,['Naewna649725']);
  const booking=events.find(e=>e.id==='booking');
  assert.match(booking.title,/คนขับรถ/);assert.equal(booking.locationId,null);
  assert.match(events.find(e=>e.id==='police-inference').caveat,/ไม่ใช่.*ยืนยัน/);
  const recovery=events.find(e=>e.id==='recovery-time');
  assert.equal(recovery.sourceIds.length,2);assert.match(recovery.time,/13:00–13:10/);
  assert.ok(events.every(e=>!('lat' in e)&&!('lon' in e)&&!('speed' in e)),'Event records do not invent measured vessel positions');
});
