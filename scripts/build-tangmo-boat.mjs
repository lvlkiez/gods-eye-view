import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Original generic illustration, not measured case-vessel geometry. Y-up, +Z bow.
const items=[];
function geometry(name,positions,color){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions.flat(2),3));g.computeVertexNormals();items.push({name,g,color});}
function box(name,center,size,color){const g=new THREE.BoxGeometry(...size).toNonIndexed();g.translate(...center);items.push({name,g,color});}
const outline=[[-1.1,-3.4],[1.1,-3.4],[1.25,.6],[.85,2.35],[0,3.8],[-.85,2.35],[-1.25,.6]];
const upper=outline.map(([x,z])=>[x,.25,z]),lower=outline.map(([x,z])=>[x*.72,-.52,z*.92]);
const hull=[],deck=[];
for(let i=0;i<outline.length;i++){
  const j=(i+1)%outline.length;
  hull.push(upper[i],lower[i],upper[j],upper[j],lower[i],lower[j]);
  hull.push([0,-.65,0],lower[j],lower[i]);
  deck.push([0,.25,0],upper[i],upper[j]);
}
geometry('ivory-v-hull',hull,[.86,.91,.88,1]);geometry('deck',deck,[.72,.76,.73,1]);
box('dark-cockpit',[0,.29,-.45],[1.93,.08,3.55],[.07,.14,.16,1]);
box('bow-cushion',[0,.40,1.55],[1.04,.22,1.30],[.93,.85,.70,1]);
box('transom-bench',[0,.50,-2.25],[1.8,.38,.64],[.87,.82,.70,1]);
box('bench-back',[0,.85,-2.54],[1.8,.50,.15],[.92,.88,.78,1]);
for(const x of [-.52,.52]){box('seat',[x,.54,-.65],[.62,.40,.70],[.9,.84,.72,1]);box('seat-back',[x,.93,-.96],[.62,.60,.16],[.91,.86,.75,1]);}
const glass=[[-.98,.55,.60],[.98,.55,.60],[.79,1.19,.13],[-.79,1.19,.13]];
geometry('windshield',[glass[0],glass[1],glass[2],glass[0],glass[2],glass[3]],[.10,.34,.39,1]);
box('windshield-rail',[0,1.22,.13],[1.70,.055,.07],[.76,.81,.8,1]);
box('console',[.60,.56,.08],[.52,.45,.5],[.24,.31,.32,1]);
box('outboard',[0,.31,-3.72],[.66,.86,.73],[.055,.08,.09,1]);box('engine-leg',[0,-.39,-3.91],[.21,.65,.24],[.10,.13,.14,1]);

const chunks=[],bufferViews=[],accessors=[],materials=[],meshes=[];
let byteOffset=0;
function attribute(array,type){
  const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),index=bufferViews.length;
  bufferViews.push({buffer:0,byteOffset,byteLength:bytes.length,target:34962});chunks.push(bytes);byteOffset+=bytes.length;
  const count=array.length/3,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<array.length;i++){assert.ok(Number.isFinite(array[i]));min[i%3]=Math.min(min[i%3],array[i]);max[i%3]=Math.max(max[i%3],array[i]);}
  accessors.push({bufferView:index,componentType:5126,count,type,...(type==='VEC3'?{min,max}:{})});return accessors.length-1;
}
for(const {name,g,color} of items){
  const position=attribute(g.attributes.position.array,'VEC3'),normal=attribute(g.attributes.normal.array,'VEC3');
  materials.push({name,pbrMetallicRoughness:{baseColorFactor:color,metallicFactor:.08,roughnessFactor:.65},doubleSided:true});
  meshes.push({name,primitives:[{attributes:{POSITION:position,NORMAL:normal},material:materials.length-1,mode:4}]});
}
const bin=Buffer.concat(chunks),gltf={asset:{version:'2.0',generator:'GodEye generic speedboat; original authored model'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'GenericSpeedboat',children:meshes.map((_,i)=>i+1)},...meshes.map((mesh,i)=>({name:mesh.name,mesh:i}))],meshes,materials,buffers:[{byteLength:bin.length}],bufferViews,accessors,extras:{purpose:'Illustrative speedboat, not a scan of the incident vessel',axes:'Y-up; +Z bow'}};
function chunk(type,bytes,padding){const padded=Buffer.alloc(Math.ceil(bytes.length/4)*4,padding);bytes.copy(padded);const header=Buffer.alloc(8);header.writeUInt32LE(padded.length,0);header.writeUInt32LE(type,4);return Buffer.concat([header,padded]);}
const body=Buffer.concat([chunk(0x4e4f534a,Buffer.from(JSON.stringify(gltf)),0x20),chunk(0x004e4942,bin,0)]),header=Buffer.alloc(12);
header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(body.length+12,8);
const output=Buffer.concat([header,body]);
assert.equal(output.readUInt32LE(8),output.length);
assert.equal(output.readUInt32LE(12)%4,0);
const parsed=JSON.parse(output.subarray(20,20+output.readUInt32LE(12)).toString());
for(const child of parsed.nodes[0].children)assert.ok(parsed.nodes[child]?.mesh>=0);
for(const mesh of parsed.meshes){const a=mesh.primitives[0].attributes;assert.equal(parsed.accessors[a.POSITION].count,parsed.accessors[a.NORMAL].count);assert.equal(parsed.accessors[a.POSITION].count%3,0);}
const target=path.resolve('public/models/tangmo-speedboat.glb');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,output);
console.log('Verified generic GLB:',output.length,'bytes,',meshes.length,'parts; Y-up, +Z bow.');
