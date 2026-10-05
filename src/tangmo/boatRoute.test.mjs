import test from 'node:test';
import assert from 'node:assert/strict';
import {boatAnchors,boatRouteMetadata,BOAT_DURATION,sampleBoatRoute,formatBoatTime,anchorPosition,replaySeconds,routeLegs} from './boatRoute.js';
import {events,locationById} from './caseData.js';

const metres=([lon1,lat1],[lon2,lat2])=>Math.hypot((lon2-lon1)*Math.cos(lat1*Math.PI/180),lat2-lat1)*111320;

test('illustration anchors resolve to reported events and end at the labelled police inference',()=>{
  for(const anchor of boatAnchors){
    const event=events.find(e=>e.id===anchor.eventId);
    assert.ok(event,anchor.eventId);assert.ok(event.sourceIds.includes(anchor.sourceId));
    assert.ok(anchor.time.startsWith(event.time));
    assert.equal(event.locationId,anchor.locationId);
    assert.equal(formatBoatTime(anchor.seconds),anchor.time);
  }
  assert.equal(boatRouteMetadata.kind,'illustrative');
  const last=boatAnchors.at(-1);
  assert.equal(formatBoatTime(BOAT_DURATION),'22:34:10');
  assert.equal(last.positionBasis,'extrapolated');
  assert.equal(events.find(e=>e.id===last.eventId).status,'interpretation');
  assert.ok(boatAnchors.slice(0,-1).every(a=>a.positionBasis==='nearest-river-point'));
});

test('located anchors sit on the river close to their landmark, never on the landmark pin itself',()=>{
  boatAnchors.forEach((anchor,i)=>{
    if(anchor.positionBasis!=='nearest-river-point')return;
    const l=locationById(anchor.locationId),distance=metres([l.lon,l.lat],anchorPosition(i));
    assert.ok(distance<700,`${anchor.label} is ${distance.toFixed(0)} m from its landmark`);
  });
  const extrapolated=anchorPosition(boatAnchors.length-1),camera=anchorPosition(boatAnchors.length-2);
  assert.ok(metres(camera,extrapolated)<120,'19 s of extrapolation stays short');
});

test('joins are continuous and the bow turns at the southern end',()=>{
  for(const {seconds} of boatAnchors.slice(1,-1)){
    const before=sampleBoatRoute(seconds-.001),after=sampleBoatRoute(seconds+.001);
    assert.ok(Math.hypot(before.lon-after.lon,before.lat-after.lat)<.000001);
  }
  const turn=boatAnchors.find(a=>a.locationId==='rama8').seconds;
  const out=sampleBoatRoute(turn-1),back=sampleBoatRoute(turn+1);
  assert.equal(out.direction,'south');assert.equal(back.direction,'north');
  const delta=((out.heading-back.heading+540)%360)-180;
  assert.ok(Math.abs(Math.abs(delta)-180)<20,'Bow reverses for the return leg');
  assert.equal(sampleBoatRoute(BOAT_DURATION).direction,'north');
});

test('sampling clamps invalid time and stays finite throughout both directions',()=>{
  assert.equal(sampleBoatRoute(-1).time,0);assert.equal(sampleBoatRoute(NaN).time,0);
  assert.equal(sampleBoatRoute(BOAT_DURATION+500).time,BOAT_DURATION);
  for(let time=0;time<=BOAT_DURATION;time+=7){
    const frame=sampleBoatRoute(time);
    assert.ok(frame.lon>100.49&&frame.lon<100.52&&frame.lat>13.76&&frame.lat<13.84);
    assert.ok(Number.isFinite(frame.heading)&&frame.heading>=0&&frame.heading<360);
    assert.ok(metres(frame.trail.at(-1),[frame.lon,frame.lat])<.01);
  }
  assert.ok(routeLegs.south.length>2&&routeLegs.north.length>2);
});

test('replay clock maps only times inside the illustrated window',()=>{
  assert.equal(replaySeconds('21:33'),0);assert.equal(replaySeconds('22:11'),38*60);
  assert.equal(replaySeconds('22:34:10'),BOAT_DURATION);
  assert.equal(replaySeconds('22:37:46'),null);assert.equal(replaySeconds('16:49'),null);
  assert.equal(replaySeconds('ประมาณ 13:00–13:10'),null);
});
