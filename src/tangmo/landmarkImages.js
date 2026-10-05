// Location context only. Photo dates and authors are from the linked source records.
// The Rama V file's camera geotag is inconsistent; never use it as a camera position.
export const landmarkImages=[
  {locationId:'pibul1',kind:'satellite',title:'บริเวณท่าเรือพิบูลสงคราม 1',
    src:'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=100.50174,13.81592,100.50974,13.82042&bboxSR=4326&imageSR=4326&size=1280,720&format=jpg&f=image',
    width:1280,height:720,capturedAt:null,author:'Esri, Vantor, Earthstar Geographics, and the GIS User Community',
    sourceUrl:'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',license:'เงื่อนไขข้อมูลทั่วไปของ Esri',licenseUrl:'https://www.esri.com/en-us/legal/terms/data-attributions',rightsKind:'provider-service',
    caption:'ภาพดาวเทียมบริเวณท่า ไม่ใช่ภาพคืนเกิดเหตุ ยังไม่มีภาพถ่ายภาคพื้นของท่านี้ที่ตรวจสอบสิทธิ์แล้ว',
    alt:'ภาพดาวเทียมริมแม่น้ำเจ้าพระยาบริเวณท่าเรือพิบูลสงคราม 1',modifications:'Live provider export centred on the sourced landmark; no historical capture date established.'},
  {locationId:'rama7',kind:'photo',title:'สะพานพระราม 7',src:'/images/tangmo/rama7.jpg',width:1280,height:960,capturedAt:'2008-01-05',author:'Erzengel',
    sourceUrl:'https://commons.wikimedia.org/wiki/File:Rama_7_bridge.JPG',originalUrl:'https://upload.wikimedia.org/wikipedia/commons/6/66/Rama_7_bridge.JPG',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
    caption:'ภาพสะพานเพื่อดูรูปลักษณ์และบริบทของสถานที่ ไม่ใช่ภาพคืนเกิดเหตุ',alt:'สะพานพระราม 7 ข้ามแม่น้ำเจ้าพระยา ถ่ายปี 2551',modifications:'Wikimedia 1280px thumbnail; no content edits. Thumbnails may be cropped by layout; full view preserves framing.'},
  {locationId:'rama8',kind:'photo',title:'สะพานพระราม 8',src:'/images/tangmo/rama8.jpg',width:1280,height:720,capturedAt:'2018-02-01',author:'Visanu Euarchukiati',
    sourceUrl:'https://commons.wikimedia.org/wiki/File:Rama_8_Bridge_from_a_boat.jpg',originalUrl:'https://upload.wikimedia.org/wikipedia/commons/f/f0/Rama_8_Bridge_from_a_boat.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
    caption:'ภาพสะพานจากเรือเพื่อดูบริบทสถานที่ ไม่ใช่มุมกล้องหรือภาพจากเรือในคดี',alt:'สะพานพระราม 8 มองจากแม่น้ำ มีเสาสูงและสายเคเบิล ถ่ายปี 2561',modifications:'Wikimedia 1280px thumbnail; no content edits. Thumbnails may be cropped by layout; full view preserves framing.'},
  {locationId:'rama5',kind:'photo',title:'สะพานพระราม 5',src:'/images/tangmo/rama5.jpg',width:960,height:353,capturedAt:'2018-10-14',author:'Supanut Arunoprayote',
    sourceUrl:'https://commons.wikimedia.org/wiki/File:Panoramic_Rama_V_Bridge.jpg',originalUrl:'https://upload.wikimedia.org/wikipedia/commons/6/65/Panoramic_Rama_V_Bridge.jpg',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
    caption:'ภาพมุมกว้างของสะพานตามคำบรรยายต้นทาง ไม่ใช่ภาพคืนเกิดเหตุหรือพิกัดกล้องที่ยืนยันแล้ว',alt:'ภาพมุมกว้างสะพานพระราม 5 และชุมชนริมแม่น้ำ ถ่ายปี 2561',modifications:'Wikimedia 960px thumbnail; no content edits. Thumbnails may be cropped by layout; full view preserves framing.'},
];
export const imageByLocation=id=>landmarkImages.find(image=>image.locationId===id);
