import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import { initializeGeometry, DEFAULTS, STYLES, buildShelf, fitBed, stl, threeMF } from './src/geometry.js';
await initializeGeometry();
await mkdir('/tmp/skadis-verification',{recursive:true});
let count=0;
function verifyExport(m,p) {
  assert(m.watertight&&m.volume>0);
  const binary=stl(m),data=new DataView(binary.buffer),edgeCounts=new Map();
  for(let i=0;i<m.triangles.length;i++){
    const vv=Array.from({length:3},(_,j)=>Array.from({length:3},(_,k)=>data.getFloat32(84+i*50+12+j*12+k*4,true)).join(','));
    assert.equal(new Set(vv).size,3,'Serialized vertices collapsed');
    for(let j=0;j<3;j++){const a=vv[j],b=vv[(j+1)%3],key=a<b?a+'|'+b:b+'|'+a;edgeCounts.set(key,(edgeCounts.get(key)||0)+1);}
  }
  assert([...edgeCounts.values()].every(n=>n===2),'Serialized STL must be watertight');
  const files=unzipSync(threeMF(m,p)),xml=strFromU8(files['3D/3dmodel.model']);
  assert(xml.includes('unit="millimeter"'));assert.equal((xml.match(/<triangle /g)||[]).length,m.triangles.length);
}
for(const style of ['flat','tray','rounded']) {
  for(const width of [55,160,250,350]) {
    for(const braces of [false,true]) {
      for(const compartments of [1,3,5]) {
        const p={...DEFAULTS,style,width,braces,compartments};
        if(style!=='flat' && (width-2*p.wall-(compartments-1)*p.wall)/compartments<12) continue;
        const m=buildShelf(p);
        assert(m.watertight);assert(m.volume>0);assert.equal(m.dims[0],width);
        assert(Math.abs(m.dims[1]-(p.depth+p.board+p.clearance+2.4))<1e-4);
        assert(m.positions.every((x,i)=>i===0||Math.abs(x-m.positions[i-1]-p.pitch)<1e-8));
        const binary=stl(m);assert.equal(binary.length,84+m.triangles.length*50);
        const data=new DataView(binary.buffer);assert.equal(data.getUint32(80,true),m.triangles.length);
        const edgeCounts=new Map();
        for(let i=0;i<m.triangles.length;i++) {
          const vv=Array.from({length:3},(_,j)=>Array.from({length:3},(_,k)=>data.getFloat32(84+i*50+12+j*12+k*4,true)).join(','));
          assert.equal(new Set(vv).size,3,'STL has collapsed vertices');
          for(let j=0;j<3;j++){const a=vv[j],b=vv[(j+1)%3],key=a<b?a+'|'+b:b+'|'+a;edgeCounts.set(key,(edgeCounts.get(key)||0)+1);}
        }
        assert([...edgeCounts.values()].every(n=>n===2),'Serialized STL must remain watertight');
        const zip=unzipSync(threeMF(m,p));assert(zip['[Content_Types].xml']);assert(zip['_rels/.rels']);
        const xml=strFromU8(zip['3D/3dmodel.model']);assert(xml.includes('unit="millimeter"'));
        assert.equal((xml.match(/<triangle /g)||[]).length,m.triangles.length);
        count++;
      }
    }
  }
}
for(const p of [
 {...DEFAULTS,style:'rounded',depth:30,height:5,wall:5,floor:8,radius:30,width:55},
 {...DEFAULTS,style:'rounded',depth:250,height:120,wall:1.6,floor:2,radius:30,compartments:5,width:350},
 {...DEFAULTS,board:2,slot:4,clearance:1,hookDrop:5,pitch:20},
 {...DEFAULTS,board:10,slot:8,clearance:.2,hookDrop:10,pitch:60}
]){assert(buildShelf(p).watertight);count++;}
const p={...DEFAULTS,style:'rounded',compartments:3};const m=buildShelf(p);
await writeFile('/tmp/skadis-verification/shelf.stl',stl(m));await writeFile('/tmp/skadis-verification/shelf.3mf',threeMF(m,p));
const test=buildShelf(DEFAULTS,true);assert.equal(test.hooks,2);assert.equal(test.dims[0],56);
await writeFile('/tmp/skadis-verification/hook-test.stl',stl(test));
assert(fitBed(m,DEFAULTS).fits);assert(!fitBed(buildShelf({...DEFAULTS,width:350}),DEFAULTS).fits);
// Custom build volumes must check each axis, rotation, and brim space.
for(const key of ['bedX','bedY','bedZ']) {
  assert(!fitBed(m,{...DEFAULTS,[key]:20}).fits,`${key} must constrain the model`);
  assert.throws(()=>buildShelf({...DEFAULTS,[key]:NaN}));
  assert.throws(()=>buildShelf({...DEFAULTS,[key]:0}));
  assert.throws(()=>buildShelf({...DEFAULTS,[key]:2001}));
}
const turned=fitBed(m,{...DEFAULTS,bedX:100,bedY:200});
assert(turned.fits&&turned.rotate,'Rectangular beds can require a 90° turn');
const tight=fitBed(m,{...DEFAULTS,bedX:m.dims[0],bedY:m.dims[1],bedZ:m.dims[2]});
assert(tight.fits&&!tight.brimFits,'An exact fit must warn about brim space');
assert(buildShelf({...DEFAULTS,bedX:20,bedY:2000,bedZ:2000}).watertight);
assert.throws(()=>buildShelf({...DEFAULTS,width:NaN}));assert.throws(()=>buildShelf({...DEFAULTS,width:55,pitch:60,hookCount:2}));
assert.throws(()=>buildShelf({...DEFAULTS,width:55,wall:5,compartments:5}));
for(const style of STYLES)for(const hookType of ['standard','tapered','double'])for(const bottomSupports of [false,true])for(const width of [160,250]){
  const p={...DEFAULTS,style,hookType,bottomSupports,width,hookCount:4,compartments:3,supportCount:3,height:style==='cup'?65:style==='openbin'?40:16};
  const m=buildShelf(p);verifyExport(m,p);assert.equal(m.hooks,4);assert.equal(m.rows,hookType==='double'?2:1);assert.equal(m.supports,bottomSupports?3:0);
  if(bottomSupports){assert(m.bounds[0][2]<=-p.supportHeight);assert.equal(m.supportReaches.length,3);}
  const test=buildShelf(p,true);verifyExport(test,p);assert.equal(test.hooks,hookType==='double'?4:2);assert.equal(test.supports,0);
  count++;
}
for(const hookType of ['standard','tapered','double'])for(const hookCount of hookType==='double'?[2,4,6,8]:[1,2,4,6,8]){
  const p={...DEFAULTS,width:350,hookType,hookCount};const m=buildShelf(p);verifyExport(m,p);assert.equal(m.hooks,hookCount);count++;
}
assert.equal(buildShelf({...DEFAULTS,width:55,pitch:60}).hooks,1);
assert.throws(()=>buildShelf({...DEFAULTS,hookType:'double',hookCount:3}));
assert.throws(()=>buildShelf({...DEFAULTS,hookCount:8}));
assert.throws(()=>buildShelf({...DEFAULTS,bottomSupports:true,width:55,supportCount:4,supportThickness:10}));
assert.throws(()=>buildShelf({...DEFAULTS,style:'holder',holeDiameter:100}));
assert.throws(()=>buildShelf({...DEFAULTS,style:'phone',depth:30}));
for(const p of [
 {...DEFAULTS,style:'phone',width:70,depth:40,angle:5,hookCount:1},
 {...DEFAULTS,style:'semicircle',width:55,depth:30,bottomSupports:true,supportCount:1},
 {...DEFAULTS,hookType:'double',rowPitch:60,hookCount:2,bottomSupports:true,supportCount:1},
 {...DEFAULTS,style:'tilted',angle:35,depth:250,bottomSupports:true,supportHeight:120},
 {...DEFAULTS,style:'holder',bottomSupports:true,supportCount:4,holeCount:5,holeDiameter:20}
]){verifyExport(buildShelf(p),p);count++;}
console.log(`Passed ${count} geometry combinations, serialized STL/3MF checks, all hook types/counts, underside brackets, style geometry, and hook fit tests.`);
