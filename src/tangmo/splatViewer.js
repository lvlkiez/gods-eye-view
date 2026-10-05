import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';

/** Dedicated Gaussian renderer; it has no map, vessel, or incident coordinates. */
export function createSplatViewer(container,onError) {
  const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.setClearColor('#111b20');
  renderer.domElement.setAttribute('aria-label','ฉาก Gaussian splat จากไฟล์ที่เลือก ลากเพื่อหมุน เลื่อนเพื่อซูม');
  container.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,1,0.01,100);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=false;
  controls.minDistance=.03;controls.maxDistance=30;
  let active=true,disposed=false,pendingFrame,mesh,loadId=0;
  function requestFrame() {
    if(!active||disposed||pendingFrame)return;
    pendingFrame=requestAnimationFrame(()=>{
      pendingFrame=undefined;
      if(disposed||!active)return;
      try{renderer.render(scene,camera);}catch{active=false;onError('แสดง Gaussian ไม่สำเร็จ กรุณาลองไฟล์ขนาดเล็กลงหรือเบราว์เซอร์ที่รองรับ WebGL2');}
    });
  }
  const spark=new SparkRenderer({renderer,onDirty:requestFrame,enableLod:false});
  scene.add(spark);
  controls.addEventListener('change',requestFrame);
  function resize() {
    const {width,height}=container.getBoundingClientRect();
    if(!width||!height||disposed)return;
    renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();requestFrame();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);
  function fit(direction='front') {
    const distance=2.5/Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/Math.min(camera.aspect,1);
    camera.up.set(0,1,0);
    if(direction==='top')camera.position.set(0,distance,.001);
    else camera.position.set(0,.2*distance,distance);
    controls.target.set(0,0,0);controls.update();requestFrame();
  }
  resize();fit();
  return {
    async load(file,type) {
      const id=++loadId;
      const bytes=await file.arrayBuffer();
      if(disposed||id!==loadId)return;
      const candidate=new SplatMesh({fileBytes:bytes,fileType:type,fileName:file.name,editable:false,raycastable:false,lod:false});
      try {
        await candidate.initialized;
        if(disposed||id!==loadId){candidate.dispose();return;}
        if(!candidate.numSplats)throw new Error('empty');
        const box=candidate.getBoundingBox(false),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
        if(box.isEmpty()||![...center.toArray(),...size.toArray()].every(Number.isFinite))throw new Error('bounds');
        const scale=2/Math.max(size.x,size.y,size.z,.001);
        candidate.scale.setScalar(scale);candidate.position.copy(center).multiplyScalar(-scale);
        if(mesh){scene.remove(mesh);mesh.dispose();}
        mesh=candidate;scene.add(mesh);fit();requestFrame();
        return {count:mesh.numSplats,format:type.toUpperCase()};
      } catch(error) {candidate.dispose();throw error;}
    },
    fit,
    flip(){if(mesh){mesh.rotation.x+=Math.PI;mesh.position.y*=-1;mesh.position.z*=-1;requestFrame();}},
    setActive(value){active=value;if(value){resize();requestFrame();}else{cancelAnimationFrame(pendingFrame);pendingFrame=undefined;}},
    clear(){loadId++;if(mesh){scene.remove(mesh);mesh.dispose();mesh=undefined;}requestFrame();},
    destroy(){disposed=true;loadId++;cancelAnimationFrame(pendingFrame);resizeObserver.disconnect();controls.dispose();mesh?.dispose();spark.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();},
  };
}
