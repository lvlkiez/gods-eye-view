export const RESEARCH_DATE='2026-10-02';
export const sources=[
{id:'ThaiPBS314905',title:'ลำดับเหตุการณ์จากการแถลงตำรวจ',publisher:'Thai PBS',published:'2022-04-26',url:'https://www.thaipbs.or.th/news/content/314905',kind:'report',note:'ข่าวถ่ายทอดคำแถลง 26 เม.ย. 2565 อ้าง GPS และ CCTV โดยไม่มีไฟล์ต้นฉบับให้ตรวจเอง'},
{id:'Naewna649725',title:'ตำรวจเปิดไทม์ไลน์ละเอียด ภาพถ่าย–เวลา',publisher:'แนวหน้า',published:'2022-04-26',url:'https://www.naewna.com/local/649725',kind:'report',note:'รายงานคำแถลงเดียวกัน ใช้อ้างเวลา 21:33 น. ที่สะพานพระราม 5 ไม่ใช่พยานอีกชุดที่ยืนยันอย่างอิสระ'},
{id:'ThaiPBS313093',title:'ไทม์ไลน์แตงโมสูญหาย 40 ชั่วโมง',publisher:'Thai PBS',published:'2022-02-26',url:'https://www.thaipbs.or.th/news/content/313093',kind:'report',note:'ข่าวร่วมสมัยของการแจ้งเหตุและค้นหา มีเวลาแตกต่างจากคำแถลงภายหลัง'},
{id:'yellowpages-pibul1',title:'ท่าเรือพิบูลสงคราม 1',publisher:'Thailand Yellow Pages',published:null,url:'https://www.yellowpages.co.th/profile/ท่าเรือพิบูลสงคราม-1-nadHa8',kind:'map',note:'landmark'},
{id:'wikidata-rama7',title:'Rama VII Bridge',publisher:'Wikidata',published:null,url:'https://www.wikidata.org/wiki/Q4797664',kind:'map',note:'landmark'},
{id:'wikidata-rama8',title:'Rama VIII Bridge',publisher:'Wikidata',published:null,url:'https://www.wikidata.org/wiki/Q1092231',kind:'map',note:'landmark'},
{id:'wikidata-rama5',title:'Rama V Bridge',publisher:'Wikidata',published:null,url:'https://www.wikidata.org/wiki/Q6637699',kind:'map',note:'landmark'},
{id:'wikidata-krungthon',title:'Krung Thon Bridge',publisher:'Wikidata',published:null,url:'https://www.wikidata.org/wiki/Q1538356',kind:'map',note:'landmark'},
{id:'osm-thewet-n15',title:'เทเวศร์ (N15) ท่าเรือด่วนเจ้าพระยา',publisher:'OpenStreetMap',published:null,url:'https://www.openstreetmap.org/node/3542061069',kind:'map',note:'landmark; © OpenStreetMap contributors, ODbL'},
{id:'osm-parliament',title:'สัปปายะสภาสถาน',publisher:'OpenStreetMap',published:null,url:'https://www.openstreetmap.org/way/665907390',kind:'map',note:'landmark; centroid of building outline; © OpenStreetMap contributors, ODbL'},
{id:'ThaiPBS-video-2022-04-26',title:'ปฏิกิริยาสื่อ กับการแถลงปิดสำนวนคดี แตงโม (26 เม.ย.65)',publisher:'Thai PBS',published:'2022-04-26',url:'https://www.thaipbs.or.th/program/EveningNews/watch/EdqxRY',kind:'video',note:'รายงานข่าวเกี่ยวกับการแถลง ไม่ใช่บันทึกแถลงเต็มหรือไฟล์ CCTV ต้นฉบับ'}];

// Coordinates locate named landmarks only. Decimal precision is not survey accuracy.
export const locations=[
  {id:'rama5',title:'สะพานพระราม 5',lat:13.8324961,lon:100.4953120,sourceId:'wikidata-rama5',precision:'landmark',note:'พิกัดสถานที่ใน Wikidata ไม่ใช่ตำแหน่งเรือหรือผลรังวัด'},
  {id:'pibul1',title:'ท่าเรือพิบูลสงคราม 1',lat:13.81817,lon:100.50574,sourceId:'yellowpages-pibul1',precision:'landmark',note:'พิกัดท่าเรือจากทำเนียบสถานที่ ไม่ใช่จุดตกน้ำ จุดพบร่าง หรือตำแหน่งกล้อง'},
  {id:'rama7',title:'สะพานพระราม 7',lat:13.8143889,lon:100.5142694,sourceId:'wikidata-rama7',precision:'landmark',note:'หมุดสะพานเพื่อดูบริบทพื้นที่ ไม่มีเวลาเรือผ่านจุดนี้ที่ยืนยันในรายการนี้'},
  {id:'parliament',title:'รัฐสภา (สัปปายะสภาสถาน)',lat:13.7959694,lon:100.5173266,sourceId:'osm-parliament',precision:'landmark',note:'จุดกึ่งกลางอาคารจาก OpenStreetMap ไม่ใช่ตำแหน่งเรือหรือจุดตอบข้อความ'},
  {id:'krungthon',title:'สะพานกรุงธน (ซังฮี้)',lat:13.781028,lon:100.502436,sourceId:'wikidata-krungthon',precision:'landmark',note:'พิกัดสะพานใน Wikidata ไม่ใช่ตำแหน่งกล้องที่ตำรวจอ้าง'},
  {id:'thewet',title:'ท่าเรือเทเวศร์ (N15)',lat:13.7720432,lon:100.5000982,sourceId:'osm-thewet-n15',precision:'landmark',note:'ท่าเรือด่วนเจ้าพระยาจาก OpenStreetMap ไม่ใช่ท่าเรือคลองผดุงกรุงเกษมชื่อเดียวกัน และไม่ใช่ตำแหน่งกล้อง'},
  {id:'rama8',title:'สะพานพระราม 8',lat:13.7691694,lon:100.4968111,sourceId:'wikidata-rama8',precision:'landmark',note:'พิกัดสถานที่ใน Wikidata ไม่ใช่พิกัดเรือเมื่อถ่ายภาพ'},
];

const policeEvent=(id,time,title,locationId,description,caveat,sourceId='ThaiPBS314905')=>({
  id,date:'2022-02-24',time,title,description:'ตามคำแถลงตำรวจ 26 เม.ย. 2565: '+description,
  sourceIds:[sourceId],locationId,status:'reported',phase:'journey',caveat,
});
export const events=[
  policeEvent('start-nbc','16:49','เรือออกจากอู่ มุ่งเหนือ',null,'GPS ที่ตำรวจอ้างระบุการเริ่มเคลื่อนเรือ','ยังไม่มีไฟล์ GPS และพิกัดอู่ที่ตรวจสอบได้'),
  policeEvent('fuel','17:01','จอดเติมน้ำมัน',null,'มีการจอดเติมน้ำมันก่อนกลับไปรับผู้ร่วมทาง','ยังไม่ระบุหมุด เพราะไม่มีพิกัดจุดเติมน้ำมัน'),
  policeEvent('baan-tanid','18:24','ถึงร้านอาหารบ้านตานิด',null,'เรือจอดที่ร้านอาหาร','มีชื่อสถานที่ แต่ยังไม่มีพิกัดจุดจอดที่ตรวจสอบแล้ว'),
  policeEvent('restaurant-departure','20:08','ออกจากร้านอาหาร มุ่งใต้',null,'เริ่มเดินทางกลับทางแม่น้ำ','ไม่มีแนวเส้นทางจากข้อมูล GPS ต้นฉบับ'),
  policeEvent('rama5-passage','21:33','ผ่านสะพานพระราม 5','rama5','แนวหน้ารายงานเวลาเรือผ่านสะพาน','หมุดระบุสะพาน ไม่ใช่เรือ ณ เวลานั้น','Naewna649725'),
  policeEvent('pibul1-passage','21:36','ผ่านท่าเรือพิบูลสงคราม 1','pibul1','รายงานเวลาเรือผ่านบริเวณท่าเรือ','หมุดระบุท่าเรือ ไม่ใช่ตำแหน่งเรือ'),
  policeEvent('thewet-passage','21:54','ภาพกล้องบริเวณเทเวศร์','thewet','มีภาพเรือจากกล้องบริเวณท่าเรือ','หมุดระบุท่าเรือ ไม่ใช่ตำแหน่งกล้อง; ยังไม่มีไฟล์ต้นฉบับของกล้อง'),
  policeEvent('rama8-passage','21:56','ภาพถ่ายบริเวณพระราม 8','rama8','ตำรวจเปรียบเทียบภาพถ่ายกับ GPS','เป็นการประเมินเวลาของตำรวจ ไม่ใช่ตรวจไฟล์ภาพต้นฉบับโดยโครงการนี้'),
  policeEvent('booking','22:11','เรียกบริการคนขับรถ',null,'มีการเรียก U drink I drive ให้รับที่อู่','เป็นข้อมูลการติดต่อ ไม่ใช่พิกัดเรือหรือการจองเรือ'),
  policeEvent('sanghi-passage','22:18','ภาพกล้องสะพานซังฮี้','krungthon','รายงานภาพเรือผ่านบริเวณสะพาน','หมุดระบุสะพานกรุงธน ไม่ใช่พิกัดกล้องที่ตรวจสอบได้'),
  policeEvent('parliament-passage','22:21','บริเวณด้านหลังรัฐสภา','parliament','รายงานตำแหน่งบริเวณเรือและการตอบข้อความ','หมุดระบุอาคารรัฐสภา; บันทึกข้อความอย่างเดียวไม่ยืนยันตำแหน่งบุคคล'),
  policeEvent('pibul1-camera-arrival','22:33:51','เริ่มเห็นเรือในกล้องใกล้พิบูลฯ','pibul1','รายงานว่ากล้องเริ่มจับภาพเรือบริเวณท่าเรือพิบูลสงคราม 1','มีเวลาตามคำแถลง แต่ไม่มีพิกัดเรือหรือพิกัดกล้องต้นฉบับ'),
  {...policeEvent('police-inference','22:34:10','เวลาที่ตำรวจสันนิษฐาน','pibul1','ตำรวจตีความเงาที่หายจากภาพเป็นช่วงพลัดตก','ไม่ใช่วินาทีตกน้ำที่ยืนยันอิสระ และหมุดท่าเรือไม่ใช่จุดตกน้ำ'),status:'interpretation',phase:'incident'},
  policeEvent('boat-return-camera','22:37:46','เรือกลับผ่านกล้องเดิม','pibul1','ตำรวจเทียบภาพเรือที่กลับมาบริเวณเดิม','ไม่มีมุมกล้องหรือเส้นทางวนเรือให้ตรวจจากต้นฉบับ'),
  {id:'notification',date:'2022-02-24',time:'22:40',title:'แจ้งเหตุให้เจ้าหน้าที่',description:'ข่าวช่วงแรกของ Thai PBS ระบุเวลาที่เจ้าหน้าที่ได้รับแจ้งเหตุ',sourceIds:['ThaiPBS313093'],locationId:null,status:'reported',phase:'search',caveat:'เวลาแจ้งเหตุ ไม่ใช่เวลาที่ตกน้ำ'},
  {id:'search-pause',date:'2022-02-25',time:'06:30',title:'พักการค้นหาชั่วคราว',description:'ข่าวร่วมสมัยรายงานว่าหยุดภารกิจค้นหาในช่วงเช้า',sourceIds:['ThaiPBS313093'],locationId:null,status:'reported',phase:'search',caveat:'ไม่มีบันทึกปฏิบัติการหรือขอบเขตค้นหาต้นฉบับ'},
  {id:'search-resume',date:'2022-02-25',time:'08:00',title:'เริ่มค้นหาอีกครั้ง',description:'Thai PBS รายงานว่าทีมค้นหากลับมาปฏิบัติงาน',sourceIds:['ThaiPBS313093'],locationId:null,status:'reported',phase:'search',caveat:'ไม่มีแนวเรือค้นหาที่วัดจริงในชุดข้อมูลนี้'},
  {id:'recovery-time',date:'2022-02-26',time:'ประมาณ 13:00–13:10',title:'พบร่างใกล้ท่าเรือพิบูลสงคราม',description:'ข่าวช่วงแรกระบุ 13:10 น. ส่วนรายงานคำแถลงภายหลังระบุราว 13:00 น.',sourceIds:['ThaiPBS313093','ThaiPBS314905'],locationId:'pibul1',status:'conflicting',phase:'search',caveat:'ช่วงนี้สะท้อนข่าวที่ต่างกัน ไม่ใช่ช่วงคลาดเคลื่อนจากเครื่องวัด; หมุดท่าเรือไม่ใช่จุดพบร่าง'},
];
/** Reported recovery distance from Pibulsongkram 1 pier (S1: within 300 m; S2: 235 m). Direction was not reported. */
export const recoveryDistance={metres:[235,300],locationId:'pibul1',sourceIds:['ThaiPBS314905','ThaiPBS313093']};
export const media=[{id:'ThaiPBS-video-2022-04-26',title:'ปฏิกิริยาสื่อ กับการแถลงปิดสำนวนคดี แตงโม (26 เม.ย.65)',publisher:'Thai PBS',published:'2022-04-26',url:'https://www.youtube.com/watch?v=Xpv4U2xqLEM',youtubeId:'Xpv4U2xqLEM',note:'วิดีโอข่าวทางการของ Thai PBS ไม่ใช่ไฟล์ CCTV ดิบ'}];
export const limitations=['ไม่มีพิกัด NBC ที่ยืนยันได้','landmark ไม่ใช่จุดตกน้ำหรือเส้นทางเรือ','เวลาบางรายการเป็นการอนุมาน','ฉาก 3D เป็นภาพปัจจุบันของผู้ให้บริการ ไม่ใช่สภาพคืน 24 ก.พ. 2565','แสงกลางคืนเป็นการปรับภาพเพื่อบรรยากาศ ไม่ใช่การวัดแสงจริง'];
export function sourceById(id){return sources.find(x=>x.id===id)??null}
export function locationById(id){return locations.find(x=>x.id===id)??null}
export function formatDate(iso){return new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeZone:'Asia/Bangkok'}).format(new Date(`${iso}T00:00:00Z`))}
