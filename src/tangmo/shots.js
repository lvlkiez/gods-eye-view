/**
 * Camera viewpoints for the scene gallery, in journey order. Targets are river or
 * landmark points at water level; heading/pitch/range frame the view. A viewpoint
 * is a way to look at present-day map data, not a camera position from the case.
 */
export const shots=[
  {id:'overview',title:'ภาพรวมเส้นทาง',time:'21:33–22:34',lon:100.5062,lat:13.8005,heading:345,pitch:-42,range:8200,thumbSpan:4600},
  {id:'rama5',title:'สะพานพระราม 5',time:'21:33',locationId:'rama5',eventId:'rama5-passage',lon:100.49531,lat:13.8325,heading:160,pitch:-22,range:650},
  {id:'pibul1',title:'ท่าเรือพิบูลสงคราม 1',time:'21:36',locationId:'pibul1',eventId:'pibul1-passage',lon:100.5054,lat:13.8175,heading:15,pitch:-24,range:420},
  {id:'thewet',title:'ท่าเรือเทเวศร์',time:'21:54',locationId:'thewet',eventId:'thewet-passage',lon:100.4993,lat:13.7724,heading:100,pitch:-22,range:460},
  {id:'rama8',title:'สะพานพระราม 8',time:'21:56',locationId:'rama8',eventId:'rama8-passage',lon:100.49681,lat:13.76917,heading:20,pitch:-18,range:900},
  {id:'krungthon',title:'สะพานกรุงธน (ซังฮี้)',time:'22:18',locationId:'krungthon',eventId:'sanghi-passage',lon:100.50244,lat:13.78103,heading:150,pitch:-22,range:650},
  {id:'parliament',title:'หลังรัฐสภา',time:'22:21',locationId:'parliament',eventId:'parliament-passage',lon:100.5148,lat:13.7973,heading:75,pitch:-25,range:820},
  {id:'pibul-water',title:'หน้าท่าพิบูลฯ ระดับน้ำ',time:'22:33:51',locationId:'pibul1',eventId:'pibul1-camera-arrival',lon:100.50574,lat:13.81817,heading:20,pitch:-7,range:240,thumbSpan:320},
  {id:'search',title:'ระยะพบร่างที่รายงาน',time:'26 ก.พ.',locationId:'pibul1',eventId:'recovery-time',lon:100.50574,lat:13.81817,heading:0,pitch:-62,range:1500,ring:true},
  {id:'rama7',title:'สะพานพระราม 7',time:'บริบท',locationId:'rama7',lon:100.51427,lat:13.81439,heading:300,pitch:-20,range:700},
];
export const shotById=id=>shots.find(shot=>shot.id===id)??null;
export const shotForLocation=id=>shots.find(shot=>shot.locationId===id)??null;
export const THUMBNAIL_CREDIT='ภาพย่อ: Esri World Imagery · ไม่ทราบวันที่ถ่าย · ไม่ใช่ภาพคืนเกิดเหตุ';

/** Live top-down Esri export around a viewpoint; nothing is stored in the repository. */
export function shotThumbnail(shot) {
  const halfWidth=(shot.thumbSpan??Math.max(320,shot.range*.9))/2,halfHeight=halfWidth*9/16;
  const dLon=halfWidth/(111320*Math.cos(shot.lat*Math.PI/180)),dLat=halfHeight/111320;
  const bbox=[shot.lon-dLon,shot.lat-dLat,shot.lon+dLon,shot.lat+dLat].map(value=>value.toFixed(6)).join(',');
  return `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&bboxSR=4326&imageSR=3857&size=384,216&format=jpg&f=image`;
}
