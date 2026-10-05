import { locationById } from './caseData.js';

/** Authored illustration traced along river imagery; NONE of these vertices is boat GPS. */
export const boatRouteMetadata={
  kind:'illustrative',
  timingBasis:'Reported passage times from the 26 Apr 2022 police briefing (via Thai PBS and Naewna); positions between anchors are interpolated at constant speed along the river line.',
  geometryBasis:'Authored center-of-river control points from Esri imagery viewed 2026-10-02. Each anchor is the river point nearest its named landmark, not a camera or GPS coordinate.',
  extrapolation:'The 22:34:10 position continues the previous leg at the same speed for 19 s. It is not a reported location, and no person or fall is depicted.',
  imageryUrl:'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
  notice:'เรือและเส้นทางประมาณ · ไม่ใช่ข้อมูล GPS',
};
/** North (Rama V) to south (Rama VIII). */
const river=[[100.4956038,13.8324188],[100.4971637,13.8301763],[100.4983825,13.8279825],[100.4993087,13.8256425],[100.4999425,13.8234488],[100.5007225,13.820865],[100.50199,13.8188175],[100.5038912,13.817355],[100.5060362,13.81638],[100.50823,13.8155025],[100.5110575,13.8147225],[100.5134463,13.8137475],[100.5152013,13.8121875],[100.5164688,13.8102863],[100.5172975,13.8080925],[100.5174437,13.80585],[100.5172,13.80351],[100.5165175,13.8012188],[100.51564,13.7989275],[100.5143725,13.7965875],[100.5129587,13.7943938],[100.5114475,13.792395],[100.509595,13.7901525],[100.50745,13.788105],[100.5055,13.786155],[100.5036475,13.7844],[100.5025263,13.7823038],[100.5016488,13.7799638],[100.500625,13.777575],[100.4994062,13.7748938],[100.4983825,13.772505],[100.4974075,13.770555],[100.4968225,13.76919]];
export const boatRouteLine=river;

const START=21*3600+33*60;
const radians=degrees=>degrees*Math.PI/180;
const metres=(a,b)=>[(b[0]-a[0])*Math.cos(radians((a[1]+b[1])/2))*111320,(b[1]-a[1])*111320];
const stations=river.reduce((list,point,i)=>{if(i)list.push(list.at(-1)+Math.hypot(...metres(river[i-1],point)));return list;},[0]);
export const RIVER_LENGTH=stations.at(-1);

/** Distance along the river line (metres from Rama V) of the point nearest a coordinate. */
export function riverStation(lon,lat) {
  let best={distance:Infinity,station:0};
  for(let i=1;i<river.length;i++) {
    const [ax,ay]=metres(river[i-1],river[i]),[px,py]=metres(river[i-1],[lon,lat]);
    const t=Math.max(0,Math.min(1,(px*ax+py*ay)/(ax*ax+ay*ay)));
    const distance=Math.hypot(px-ax*t,py-ay*t);
    if(distance<best.distance)best={distance,station:stations[i-1]+t*(stations[i]-stations[i-1])};
  }
  return best.station;
}
export function pointAtStation(station) {
  const s=Math.max(0,Math.min(RIVER_LENGTH,station));
  let i=stations.findIndex(value=>value>=s);
  if(i<1)i=1;
  const f=(s-stations[i-1])/(stations[i]-stations[i-1]||1),a=river[i-1],b=river[i];
  return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];
}
/** River vertices from one station to another, in travel order, including both ends. */
function pathBetween(from,to) {
  const inner=stations.map((s,i)=>[s,i]).filter(([s])=>s>Math.min(from,to)&&s<Math.max(from,to)).map(([,i])=>river[i]);
  return [pointAtStation(from),...(to>=from?inner:inner.reverse()),pointAtStation(to)];
}

const toSeconds=time=>{const [h,m,s=0]=time.split(':').map(Number);return h*3600+m*60+s-START;};
const anchor=(time,label,locationId,eventId,sourceId='ThaiPBS314905')=>{
  const l=locationById(locationId);
  return {seconds:toSeconds(time),time,label,locationId,eventId,sourceId,positionBasis:'nearest-river-point',station:riverStation(l.lon,l.lat)};
};
const located=[
  anchor('21:33:00','สะพานพระราม 5','rama5','rama5-passage','Naewna649725'),
  anchor('21:36:00','ท่าพิบูลสงคราม 1','pibul1','pibul1-passage'),
  anchor('21:54:00','ท่าเทเวศร์','thewet','thewet-passage'),
  anchor('21:56:00','สะพานพระราม 8','rama8','rama8-passage'),
  anchor('22:18:00','สะพานกรุงธน (ซังฮี้)','krungthon','sanghi-passage'),
  anchor('22:21:00','หลังรัฐสภา','parliament','parliament-passage'),
  anchor('22:33:51','กล้องท่าพิบูลฯ','pibul1','pibul1-camera-arrival'),
];
const [before,last]=located.slice(-2),inference=toSeconds('22:34:10');
const speed=(last.station-before.station)/(last.seconds-before.seconds);
export const boatAnchors=[...located,{
  seconds:inference,time:'22:34:10',label:'เวลาที่ตำรวจสันนิษฐาน',locationId:'pibul1',eventId:'police-inference',sourceId:'ThaiPBS314905',
  positionBasis:'extrapolated',station:last.station+speed*(inference-last.seconds),
}];
export const BOAT_DURATION=boatAnchors.at(-1).seconds;

const legs=boatAnchors.slice(1).map((end,i)=>{const start=boatAnchors[i];return {start,end,path:pathBetween(start.station,end.station)};});
export const anchorPosition=i=>pointAtStation(boatAnchors[i].station);
/** The two directions of travel, for drawing: southbound to Rama VIII, then northbound back. */
export const routeLegs={
  south:pathBetween(boatAnchors[0].station,boatAnchors[3].station),
  north:pathBetween(boatAnchors[3].station,boatAnchors.at(-1).station),
};

export function sampleBoatRoute(seconds) {
  const time=Math.max(0,Math.min(BOAT_DURATION,Number.isFinite(seconds)?seconds:0));
  let legIndex=legs.findIndex(leg=>time<leg.end.seconds);
  if(legIndex<0)legIndex=legs.length-1;
  const {start,end}=legs[legIndex],fraction=(time-start.seconds)/(end.seconds-start.seconds);
  const station=start.station+(end.station-start.station)*fraction,direction=Math.sign(end.station-start.station)||1;
  const [lon,lat]=pointAtStation(station),behind=pointAtStation(station-direction*20),ahead=pointAtStation(station+direction*20);
  const [dx,dy]=metres(behind,ahead);
  const heading=(Math.atan2(dx,dy)*180/Math.PI+360)%360;
  const trail=legs.slice(0,legIndex).flatMap(leg=>leg.path.slice(0,-1)).concat(pathBetween(start.station,station));
  return {time,lon,lat,heading,station,legIndex,fraction,direction:direction>0?'south':'north',trail,kind:'illustrative'};
}
export function formatBoatTime(seconds) {
  const s=START+Math.round(Math.max(0,Math.min(BOAT_DURATION,Number.isFinite(seconds)?seconds:0)));
  return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(value=>String(value).padStart(2,'0')).join(':');
}
/** Seconds into the replay for a clock string such as '22:11' or '22:33:51'; null outside the replay. */
export function replaySeconds(time) {
  if(!/^\d{2}:\d{2}(:\d{2})?$/.test(time))return null;
  const seconds=toSeconds(time);
  return seconds>=0&&seconds<=BOAT_DURATION?seconds:null;
}
