import * as C from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { locations, recoveryDistance } from './caseData.js';
import { boatRouteLine, boatAnchors, anchorPosition, sampleBoatRoute } from './boatRoute.js';
import { shotById } from './shots.js';

const color=hex=>C.Color.fromCssColorString(hex);
const rad=C.Math.toRadians;
const googleKey=import.meta.env.GOOGLE_MAPS_API_KEY;
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerpAngle=(from,to,t)=>(from+(((to-from+540)%360)-180)*t+360)%360;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
// Ellipsoid height of the river surface in Google 3D tiles before it is sampled (EGM96 geoid is ~-30 m here).
const FALLBACK_PHOTOREAL_WATER=-28;
const BOAT_DRAFT=.25;
const LABEL_FONT='12px "IBM Plex Sans Thai", Tahoma, sans-serif';

// Moonlit grade applied to the Google mesh only, so labels and the boat stay legible.
const nightShader=new C.CustomShader({fragmentShaderText:`
void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
  float l = dot(material.diffuse, vec3(0.299, 0.587, 0.114));
  material.diffuse = mix(vec3(l), material.diffuse, 0.45) * vec3(0.30, 0.37, 0.52);
}`});

/** Real basemaps, sourced landmarks and a separately labeled illustrative boat. */
export function createScene(container,{onSelect,onStatus,onPerspective}) {
  C.Ion.defaultAccessToken='';
  const viewer=new C.Viewer(container,{
    baseLayer:false,baseLayerPicker:false,geocoder:false,homeButton:false,
    sceneModePicker:false,navigationHelpButton:false,animation:false,timeline:false,
    fullscreenButton:false,infoBox:false,selectionIndicator:false,skyBox:false,
    terrainProvider:new C.EllipsoidTerrainProvider(),requestRenderMode:true,maximumRenderTimeChange:Infinity,
  });
  const {scene,camera}=viewer;
  scene.globe.baseColor=color('#1a262b');
  scene.globe.showGroundAtmosphere=false;
  scene.fog.enabled=false;
  scene.screenSpaceCameraController.minimumZoomDistance=8;
  scene.screenSpaceCameraController.maximumZoomDistance=60000;
  viewer.resolutionScale=Math.min(window.devicePixelRatio||1,1.5);
  viewer.targetFrameRate=60;
  const root=typeof container==='string'?document.getElementById(container):container;
  if(import.meta.env.DEV)window.__tangmoViewer=viewer;
  let disposed=false,requestId=0,mode='none',night=false,labels=true,perspective='free',camHeading=null,camTime=0,dragging=null;
  let satellite,street,tileset,photorealWater=FALLBACK_PHOTOREAL_WATER;
  const pending={},ORBIT={yaw:0,pitch:-12,range:30,lookYaw:0,lookPitch:-10},orbit={...ORBIT};
  const draw=()=>{if(!disposed)scene.requestRender();};
  const water=()=>mode==='photoreal'?photorealWater:0;
  const at=(lon,lat,offset=0)=>C.Cartesian3.fromDegrees(lon,lat,water()+offset);

  let boatFrame=sampleBoatRoute(0),trailPositions=[];
  const boatPosition=new C.ConstantPositionProperty(at(boatFrame.lon,boatFrame.lat,BOAT_DRAFT));
  const boatOrientation=new C.ConstantProperty(C.Quaternion.IDENTITY);
  const route=viewer.entities.add({id:'illustrative-route',show:false,polyline:{positions:[],width:2,arcType:C.ArcType.NONE,
    material:new C.PolylineDashMaterialProperty({color:color('#e9a35a').withAlpha(.75),dashLength:14})}});
  const trail=viewer.entities.add({id:'illustrative-trail',show:false,polyline:{positions:new C.CallbackProperty(()=>trailPositions,false),width:6,arcType:C.ArcType.NONE,
    material:new C.PolylineGlowMaterialProperty({glowPower:.22,color:color('#7fe3d2').withAlpha(.95)})}});
  const boat=viewer.entities.add({id:'illustrative-boat',show:false,position:boatPosition,orientation:boatOrientation,
    model:{uri:'/models/tangmo-speedboat.glb',minimumPixelSize:56,maximumScale:20,shadows:C.ShadowMode.DISABLED},
    label:{text:'เรือจำลอง',font:LABEL_FONT,fillColor:color('#c0f6e9'),showBackground:true,backgroundColor:color('#0d2226').withAlpha(.9),
      pixelOffset:new C.Cartesian2(0,-44),verticalOrigin:C.VerticalOrigin.BOTTOM,disableDepthTestDistance:Infinity},
  });
  const anchorMarks=boatAnchors.map((anchor,i)=>viewer.entities.add({id:'anchor:'+i,show:false,
    point:{pixelSize:7,color:color(anchor.positionBasis==='extrapolated'?'#f08b6b':'#e9a35a'),outlineColor:color('#0c1418'),outlineWidth:2,disableDepthTestDistance:Infinity},
    label:{text:anchor.positionBasis==='extrapolated'?`${anchor.time} · ตำรวจสันนิษฐาน`:anchor.time,font:'11px "Geist Mono", Consolas, monospace',fillColor:color('#f4dcc0'),
      showBackground:true,backgroundColor:color('#121a1e').withAlpha(.82),backgroundPadding:new C.Cartesian2(5,3),
      pixelOffset:new C.Cartesian2(0,-14),verticalOrigin:C.VerticalOrigin.BOTTOM,disableDepthTestDistance:Infinity,
      distanceDisplayCondition:new C.DistanceDisplayCondition(0,14000)},
  }));
  const pins=new Map(locations.map(l=>[l.id,viewer.entities.add({id:'landmark:'+l.id,
    point:{pixelSize:9,color:color('#f1c69c'),outlineColor:color('#192326'),outlineWidth:3,disableDepthTestDistance:Infinity},
    label:{text:l.title,font:LABEL_FONT,fillColor:color('#f6e3cc'),showBackground:true,backgroundColor:color('#152328').withAlpha(.88),
      pixelOffset:new C.Cartesian2(13,0),horizontalOrigin:C.HorizontalOrigin.LEFT,disableDepthTestDistance:Infinity},
  })]));
  const pier=locations.find(l=>l.id===recoveryDistance.locationId),RING_METRES=recoveryDistance.metres;
  const circle=(radius,offset)=>Array.from({length:97},(_,i)=>{const a=i/96*Math.PI*2;
    return at(pier.lon+Math.sin(a)*radius/(111320*Math.cos(rad(pier.lat))),pier.lat+Math.cos(a)*radius/111320,offset);});
  const rings=RING_METRES.map((radius,i)=>viewer.entities.add({id:'recovery-ring:'+radius,show:false,
    polyline:{positions:[],width:i?2.5:1.5,arcType:C.ArcType.NONE,material:new C.PolylineDashMaterialProperty({color:color('#f08b6b').withAlpha(i?.9:.6),dashLength:10})}}));
  const ringLabel=viewer.entities.add({id:'recovery-ring-label',show:false,
    label:{text:'ระยะที่รายงาน ~235–300 ม. จากท่า · ไม่ทราบทิศ',font:LABEL_FONT,fillColor:color('#ffd8c7'),showBackground:true,
      backgroundColor:color('#2a1712').withAlpha(.9),disableDepthTestDistance:Infinity}});

  function refreshHeights() {
    route.polyline.positions=boatRouteLine.map(([lon,lat])=>at(lon,lat,1.2));
    anchorMarks.forEach((mark,i)=>{const [lon,lat]=anchorPosition(i);mark.position=at(lon,lat,4);});
    pins.forEach((pin,id)=>{const l=locations.find(x=>x.id===id);pin.position=at(l.lon,l.lat,38);});
    rings.forEach((ring,i)=>{ring.polyline.positions=circle(RING_METRES[i],1);});
    ringLabel.position=at(pier.lon,pier.lat+RING_METRES[1]/111320,12);
    root.dataset.waterHeight=water().toFixed(2);
    setBoatFrame(boatFrame,{immediate:true});
  }
  function setBoatFrame(frame,{immediate=false}={}) {
    boatFrame=frame;
    const position=at(frame.lon,frame.lat,BOAT_DRAFT);boatPosition.setValue(position);
    // Cesium converts glTF +Z forward to its local +X; HPR zero points east.
    boatOrientation.setValue(C.Transforms.headingPitchRollQuaternion(position,new C.HeadingPitchRoll(rad(frame.heading-90),0,0)));
    trailPositions=frame.trail.map(([lon,lat])=>at(lon,lat,1.6));
    Object.assign(root.dataset,{boatTime:String(frame.time),boatLongitude:String(frame.lon),boatLatitude:String(frame.lat),boatHeading:String(frame.heading)});
    updateCamera(immediate);draw();
  }

  function updateCamera(immediate) {
    if(perspective==='free'||!boat.show)return;
    // Ease the camera toward the bow with a ~0.5 s time constant, independent of frame rate.
    const now=performance.now(),ease=1-Math.exp(-Math.min(now-camTime,250)/500);camTime=now;
    camHeading=immediate||camHeading===null?boatFrame.heading:lerpAngle(camHeading,boatFrame.heading,ease);
    const origin=at(boatFrame.lon,boatFrame.lat,BOAT_DRAFT);
    if(perspective==='first') {
      // Eye above the rear seats of the generic model, looking over the bow.
      const h=rad(camHeading),eye=C.Matrix4.multiplyByPoint(C.Transforms.eastNorthUpToFixedFrame(origin),new C.Cartesian3(-Math.sin(h)*.7,-Math.cos(h)*.7,2.05),new C.Cartesian3());
      camera.lookAtTransform(C.Matrix4.IDENTITY);
      camera.setView({destination:eye,orientation:{heading:rad(camHeading+orbit.lookYaw),pitch:rad(orbit.lookPitch),roll:0}});
    } else {
      camera.lookAt(origin,new C.HeadingPitchRange(rad(camHeading+orbit.yaw),rad(orbit.pitch),orbit.range));
    }
  }
  function setPerspective(next,{notify=true}={}) {
    if(perspective===next&&next!=='free')return;
    perspective=next;camHeading=null;dragging=null;
    Object.assign(orbit,ORBIT);
    const close=next!=='free';
    // Close to the water, far labels pile up on the horizon; keep only nearby ones.
    const range=new C.DistanceDisplayCondition(0,close?1600:20000);
    pins.forEach(pin=>{pin.label.distanceDisplayCondition=range;pin.point.distanceDisplayCondition=range;});
    anchorMarks.forEach(mark=>{mark.label.distanceDisplayCondition=range;mark.point.distanceDisplayCondition=range;});
    boat.model.minimumPixelSize=close?0:56;boat.model.maximumScale=close?1:20;
    boat.label.show=!close&&labels;
    camera.frustum.near=next==='first'?.15:1;
    scene.screenSpaceCameraController.enableInputs=!close;
    if(close)updateCamera(true);else camera.lookAtTransform(C.Matrix4.IDENTITY);
    root.dataset.perspective=next;
    if(notify)onPerspective?.(next);
    draw();
  }
  const release=()=>{if(perspective!=='free')setPerspective('free');};

  const handler=new C.ScreenSpaceEventHandler(scene.canvas);
  handler.setInputAction(event=>{
    const id=scene.pick(event.position)?.id?.id;
    if(typeof id==='string'&&id.startsWith('landmark:'))onSelect(id.slice(9));
  },C.ScreenSpaceEventType.LEFT_CLICK);
  // First person: drag to look around. Third person: drag to orbit, wheel to zoom.
  handler.setInputAction(event=>{if(perspective!=='free')dragging={x:event.position.x,y:event.position.y};},C.ScreenSpaceEventType.LEFT_DOWN);
  handler.setInputAction(()=>{dragging=null;},C.ScreenSpaceEventType.LEFT_UP);
  handler.setInputAction(event=>{
    if(!dragging||perspective==='free')return;
    const dx=event.endPosition.x-dragging.x,dy=event.endPosition.y-dragging.y;dragging={x:event.endPosition.x,y:event.endPosition.y};
    if(perspective==='first'){orbit.lookYaw=(orbit.lookYaw-dx*.18)%360;orbit.lookPitch=clamp(orbit.lookPitch+dy*.15,-60,35);}
    else {orbit.yaw=(orbit.yaw+dx*.3)%360;orbit.pitch=clamp(orbit.pitch-dy*.25,-85,-2);}
    updateCamera(true);draw();
  },C.ScreenSpaceEventType.MOUSE_MOVE);
  handler.setInputAction(delta=>{
    if(perspective!=='third')return;
    orbit.range=clamp(orbit.range*(delta>0?.88:1.14),12,900);updateCamera(true);draw();
  },C.ScreenSpaceEventType.WHEEL);
  const pickPoint=position=>{
    if(scene.pickPositionSupported){const p=scene.pickPosition(position);if(p&&C.Cartesian3.magnitude(p)>6e6)return p;}
    return camera.pickEllipsoid(position)??null;
  };
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(C.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  handler.setInputAction(event=>{
    const point=pickPoint(event.position);if(!point)return;
    release();
    const distance=C.Cartesian3.distance(camera.positionWC,point);
    camera.flyToBoundingSphere(new C.BoundingSphere(point,1),{duration:reducedMotion()?0:1,
      offset:new C.HeadingPitchRange(camera.heading,Math.min(camera.pitch,rad(-12)),clamp(distance*.6,60,20000))});
  },C.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  function highlightPin(id) {
    pins.forEach((pin,pid)=>{pin.point.color=color(pid===id?'#8bf2df':'#f1c69c');pin.point.pixelSize=pid===id?13:9;});
  }
  function setRing(value) {rings.forEach(ring=>{ring.show=value;});ringLabel.show=value&&labels;draw();}
  function flyToShot(id,{instant=false}={}) {
    const shot=shotById(id);if(!shot)return;
    release();setRing(!!shot.ring);highlightPin(shot.locationId);
    camera.flyToBoundingSphere(new C.BoundingSphere(at(shot.lon,shot.lat),1),{duration:instant||reducedMotion()?0:1.6,
      offset:new C.HeadingPitchRange(rad(shot.heading),rad(shot.pitch),shot.range)});
    draw();
  }
  function topDown() {
    release();
    const canvas=scene.canvas,point=pickPoint(new C.Cartesian2(canvas.clientWidth/2,canvas.clientHeight/2))??at(pier.lon,pier.lat);
    const height=camera.positionCartographic.height-water();
    camera.flyToBoundingSphere(new C.BoundingSphere(point,1),{duration:reducedMotion()?0:1.2,
      offset:new C.HeadingPitchRange(camera.heading,rad(-89.9),clamp(height*1.2,400,30000))});
  }
  /** Keyboard flight on the local horizontal plane; speed scales with height above the river. */
  function nudge({forward=0,right=0,up=0},seconds,fast=false) {
    release();camera.lookAtTransform(C.Matrix4.IDENTITY);
    const normal=C.Ellipsoid.WGS84.geodeticSurfaceNormal(camera.positionWC,new C.Cartesian3());
    const flat=vector=>{const out=C.Cartesian3.subtract(vector,C.Cartesian3.multiplyByScalar(normal,C.Cartesian3.dot(vector,normal),new C.Cartesian3()),new C.Cartesian3());
      return C.Cartesian3.magnitude(out)<1e-3?out:C.Cartesian3.normalize(out,out);};
    let ahead=flat(camera.directionWC);if(C.Cartesian3.magnitude(ahead)<.5)ahead=flat(camera.upWC);
    const height=Math.max(4,camera.positionCartographic.height-water());
    const step=clamp(height*.8,10,2500)*(fast?4:1)*seconds,move=new C.Cartesian3();
    C.Cartesian3.add(move,C.Cartesian3.multiplyByScalar(ahead,forward*step,new C.Cartesian3()),move);
    C.Cartesian3.add(move,C.Cartesian3.multiplyByScalar(flat(camera.rightWC),right*step,new C.Cartesian3()),move);
    C.Cartesian3.add(move,C.Cartesian3.multiplyByScalar(normal,up*step,new C.Cartesian3()),move);
    camera.position=C.Cartesian3.add(camera.position,move,new C.Cartesian3());
    draw();
  }
  function setNight(value) {
    night=value;
    if(tileset)tileset.customShader=value?nightShader:undefined;
    if(satellite)Object.assign(satellite,{brightness:value?.3:.85,saturation:value?.35:.85,contrast:value?1.15:1});
    if(street)street.brightness=value?.35:.75;
    scene.skyAtmosphere.show=!value;
    scene.backgroundColor=color(value?'#05090f':'#101719');
    root.dataset.night=String(value);draw();
  }
  function setLabels(value) {
    labels=value;
    pins.forEach(pin=>{pin.show=value;});
    anchorMarks.forEach(mark=>{mark.label.show=value;});
    boat.label.show=value&&perspective==='free';ringLabel.show=value&&rings[0].show;draw();
  }

  async function sampleWater() {
    if(!scene.sampleHeightSupported)return;
    try {
      const points=[8,18,28].map(i=>C.Cartographic.fromDegrees(...boatRouteLine[i]));
      const result=await scene.sampleHeightMostDetailed(points,[boat,route,trail,...anchorMarks,...pins.values(),...rings]);
      const heights=result.map(p=>p.height).filter(h=>Number.isFinite(h)&&h>-60&&h<20).sort((a,b)=>a-b);
      if(!heights.length||disposed)return;
      photorealWater=heights[Math.floor(heights.length/2)];
      if(mode==='photoreal')refreshHeights();
    } catch {/* keep the fallback water height */}
  }
  function applyMode(next) {
    mode=next;
    if(satellite)satellite.show=next==='satellite';
    if(street)street.show=next==='street';
    if(tileset)tileset.show=next==='photoreal';
    scene.globe.show=next!=='photoreal';
    refreshHeights();setNight(night);
    onStatus({mode:next,state:'ready',text:{satellite:'Esri World Imagery · ภาพปัจจุบัน ไม่ทราบวันที่ถ่าย',street:'OpenStreetMap · แผนที่ปัจจุบัน',photoreal:'Google 3D · เมชปัจจุบัน ไม่ใช่ภาพคืนเกิดเหตุ'}[next]});
    if(next==='photoreal')sampleWater();
  }
  async function load(next) {
    if(next==='satellite'&&!satellite) {
      const provider=await C.ArcGisMapServerImageryProvider.fromUrl('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',{enablePickFeatures:false});
      if(disposed)return;
      satellite=viewer.imageryLayers.addImageryProvider(provider);satellite.show=false;
      let errors=0;
      provider.errorEvent.addEventListener(()=>{if(++errors===5&&mode==='satellite')basemap('street');});
    } else if(next==='street'&&!street) {
      const provider=new C.UrlTemplateImageryProvider({url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',maximumLevel:19,
        credit:new C.Credit('© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',true)});
      street=viewer.imageryLayers.addImageryProvider(provider);street.show=false;
      let errors=0;
      provider.errorEvent.addEventListener(()=>{if(++errors===5&&!disposed&&mode==='street')onStatus({mode:'street',state:'error',text:'ภาพแผนที่บางส่วนโหลดไม่ได้ · ลองเปลี่ยนชั้นแผนที่'});});
    } else if(next==='photoreal'&&!tileset) {
      if(!googleKey)throw new Error('key-not-configured');
      // No geocoding service is used; landmark records are cited separately.
      const created=await C.createGooglePhotorealistic3DTileset({key:googleKey,onlyUsingWithGoogleGeocoder:true},{
        maximumScreenSpaceError:window.innerWidth<900?24:12,cacheBytes:256*1024*1024,maximumCacheOverflowBytes:128*1024*1024,
      });
      if(disposed){created.destroy();return;}
      tileset=scene.primitives.add(created);tileset.show=false;
      let errors=0;
      tileset.tileFailed.addEventListener(()=>{if(++errors===5&&mode==='photoreal')basemap('satellite');});
    }
  }
  async function basemap(next) {
    const id=++requestId;
    onStatus({mode,requested:next,state:'loading',text:'กำลังโหลดข้อมูลพื้นที่…'});
    let timeout;
    try {
      pending[next]||=load(next).finally(()=>{delete pending[next];});
      await Promise.race([pending[next],new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('timeout')),15000);})]);
      if(disposed||id!==requestId)return;
      applyMode(next);
    } catch {
      if(disposed||id!==requestId)return;
      if(mode!=='none')onStatus({mode,state:'error',text:'ชั้นภาพที่เลือกไม่พร้อม · คงแผนที่เดิม'});
      else if(next==='photoreal')await basemap('satellite');
      else if(next!=='street')await basemap('street');
      else onStatus({mode:'none',state:'error',text:'โหลดแผนที่ไม่ได้ · อ่านข้อมูลและแหล่งอ้างอิงได้ตามปกติ'});
    } finally {clearTimeout(timeout);}
  }

  camera.moveEnd.addEventListener(()=>{
    const c=camera.positionCartographic;
    root.dataset.camera=[C.Math.toDegrees(c.longitude).toFixed(6),C.Math.toDegrees(c.latitude).toFixed(6),(c.height-water()).toFixed(1)].join(',');
  });
  root.dataset.perspective=perspective;
  refreshHeights();
  flyToShot('pibul1',{instant:true});
  return {
    hasPhotorealKey:!!googleKey,basemap,flyToShot,topDown,nudge,setNight,setLabels,setRing,highlightPin,setBoatFrame,
    setPerspective(next){setPerspective(next,{notify:false});},
    get perspective(){return perspective;},
    setBoatVisible(value) {
      boat.show=value;route.show=value;trail.show=value;anchorMarks.forEach(mark=>{mark.show=value;});
      root.dataset.boatVisible=String(value);
      if(!value)setPerspective('free',{notify:false});
      draw();
    },
    destroy(){disposed=true;requestId++;handler.destroy();viewer.destroy();},
  };
}
