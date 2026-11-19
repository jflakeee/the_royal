import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
const canvas2d=document.getElementById('world'),host=document.getElementById('royal-3d'),toggle=document.getElementById('view-toggle');
const state=()=>window.royal3DState?.();
const scene=new THREE.Scene();scene.background=new THREE.Color(0x111c2a);scene.fog=null; // Keep distant terrain clear instead of fading into atmospheric fog.
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(e){toggle.disabled=true;toggle.textContent='3D 사용 불가';host.textContent='이 브라우저에서는 3D 화면을 실행할 수 없습니다. WebGL 지원 여부를 확인해 주세요.';throw e}
const mobileGPU=matchMedia('(max-width: 600px), (pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio,mobileGPU?1:1.25));renderer.shadowMap.enabled=!mobileGPU;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;host.append(renderer.domElement);
host.style.position='relative';const fpsLabel=document.createElement('output');fpsLabel.id='royal-fps';fpsLabel.setAttribute('aria-label','3D 렌더링 호출 및 프레임 간격');fpsLabel.style.cssText='position:absolute;top:calc(72px + env(safe-area-inset-top));right:10px;z-index:2;padding:5px 9px;border-radius:7px;background:transparent;color:#b7f6ce;font:600 13px/1.4 ui-monospace,monospace;pointer-events:none;font-variant-numeric:tabular-nums';fpsLabel.textContent='FPS --';document.getElementById('game-hud').append(fpsLabel);
const camera=new THREE.OrthographicCamera(-36,36,36,-36,.1,400);const yaw=Math.PI/4;let zoom=Math.min(320,Math.max(110,110*innerHeight/Math.max(1,innerWidth))),active=false;
const light=new THREE.HemisphereLight(0xaac5e8,0x23342f,2.4);scene.add(light);
const moon=new THREE.DirectionalLight(0xc6dcff,2.8);moon.position.set(-25,55,-30);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-55;moon.shadow.camera.right=55;moon.shadow.camera.top=55;moon.shadow.camera.bottom=-55;scene.add(moon);
const box=new THREE.BoxGeometry(1,1,1),mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const stone=mat(0x52616d,.62,.22),edge=mat(0x7a8793),moss=mat(0x344b3e),wood=mat(0x584437),leaf=mat(0x396454),gold=mat(0xc3a46b,.35,.55),cloth=mat(0x526b8a),flower=mat(0xe8bd70),berry=mat(0x8173d9),water=new THREE.MeshPhysicalMaterial({color:0x304d5c,roughness:.17,metalness:.35,clearcoat:1,clearcoatRoughness:.09});
const terrain=new THREE.Group(),actors=new THREE.Group();scene.add(terrain,actors);
function cube(parent,x,y,z,w,h,d,m){const o=new THREE.Mesh(box,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function rnd(x,z){const n=Math.sin(x*12.9898+z*78.233)*43758.5453;return n-Math.floor(n)}
cube(terrain,0,-1.1,0,106,2,68,stone);
const wet=new THREE.Mesh(new THREE.PlaneGeometry(106,68),water);wet.rotation.x=-Math.PI/2;wet.position.y=-.065;wet.receiveShadow=true;terrain.add(wet);
// Batch static floor blocks into two instanced draw calls instead of hundreds of meshes.
const floorInstances=[[],[]];
for(let x=-51;x<52;x+=3){for(let z=-32;z<33;z+=3){const r=rnd(x,z);if(r>.28)floorInstances[r>.82?1:0].push([x,.04,z,2.85,.17+r*.15,2.85])}}
const floorTransform=new THREE.Object3D();
floorInstances.forEach((tiles,i)=>{if(!tiles.length)return;const mesh=new THREE.InstancedMesh(box,i?edge:stone,tiles.length);tiles.forEach(([x,y,z,w,h,d],index)=>{floorTransform.position.set(x,y,z);floorTransform.scale.set(w,h,d);floorTransform.updateMatrix();mesh.setMatrixAt(index,floorTransform.matrix)});mesh.instanceMatrix.needsUpdate=true;mesh.receiveShadow=true;mesh.castShadow=false;mesh.computeBoundingSphere();terrain.add(mesh)});
// Merge stationary boundary pillars into two instanced meshes, preserving positions and silhouettes.
const boundaryStone=[],boundaryCaps=[];
for(let x=-52;x<=52;x+=7)for(const z of [-34,34]){const h=2+rnd(x,z)*5;boundaryStone.push([x,h/2,z,3,h,3])}
for(let z=-31;z<=31;z+=7)for(const x of [-53,53]){const h=2+rnd(x,z)*5;boundaryStone.push([x,h/2,z,3,h,3])}
for(let i=0;i<22;i++){const a=i*2.399,r=37+i%5*2,x=Math.cos(a)*r,z=Math.sin(a)*r*.65,h=3+rnd(i,4)*7;boundaryStone.push([x,h/2,z,2,h,2]);boundaryCaps.push([x,h+.25,z,3,.5,3])}
for(const [instances,material] of [[boundaryStone,stone],[boundaryCaps,edge]]){
 const mesh=new THREE.InstancedMesh(box,material,instances.length);
 instances.forEach(([x,y,z,w,h,d],i)=>{floorTransform.position.set(x,y,z);floorTransform.scale.set(w,h,d);floorTransform.updateMatrix();mesh.setMatrixAt(i,floorTransform.matrix)});
 mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=!mobileGPU;mesh.receiveShadow=!mobileGPU;mesh.computeBoundingSphere();terrain.add(mesh);
}
const altar=new THREE.Group();altar.position.set(0,0,-9);terrain.add(altar);cube(altar,0,.7,0,8,1.4,7,stone);cube(altar,0,1.5,0,6,.4,5,edge);cube(altar,0,3.2,0,1.3,3.1,1.3,gold);
const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(1.4),new THREE.MeshStandardMaterial({color:0x72d8c9,emissive:0x3ac4bf,emissiveIntensity:2.8,roughness:.2}));crystal.position.set(0,5,0);altar.add(crystal);const glow=new THREE.PointLight(0x60ded3,35,24);glow.position.set(0,5,0);if(!mobileGPU)altar.add(glow);
const sparks=[];const sparkGeometry=new THREE.BoxGeometry(.12,.12,.12),sparkMaterials=[new THREE.MeshBasicMaterial({color:0x9eece2}),new THREE.MeshBasicMaterial({color:0xffd08c})];for(let i=0;i<30;i++){const o=new THREE.Mesh(sparkGeometry,sparkMaterials[i%2]);o.position.set((rnd(i,1)-.5)*80,1+rnd(i,2)*8,(rnd(i,3)-.5)*54);scene.add(o);sparks.push({o,y:o.position.y,phase:i*.71})}
function xy(x,y){return[(x-400)*.125,(y-240)*.125]}
const resourceBatch=new THREE.Group();actors.add(resourceBatch);function rebuildResourceBatch(){for(const mesh of [...resourceBatch.children]){resourceBatch.remove(mesh);mesh.dispose()}const grouped=new Map();for(const g of resourceObjects){g.updateMatrixWorld(true);for(const child of g.children){if(!grouped.has(child.material))grouped.set(child.material,[]);grouped.get(child.material).push(child.matrixWorld.clone())}g.visible=false}for(const [material,matrices] of grouped){const mesh=new THREE.InstancedMesh(box,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;resourceBatch.add(mesh)}}
function resource(o){const g=new THREE.Group();const [x,z]=xy(o.x,o.y);g.position.set(x,0,z);const kind=o.type;if(kind===0){cube(g,0,1.2,0,.8,2.4,.8,wood);cube(g,0,3.2,0,2.8,2.6,2.8,leaf);cube(g,0,4.5,0,1.6,1.2,1.6,leaf)}else if(kind===1){cube(g,0,.85,0,2,1.7,1.8,stone);cube(g,.7,1.5,-.4,1,1.1,1,edge)}else if(kind===2){cube(g,0,.6,0,.25,1.2,.25,leaf);for(let i=0;i<4;i++)cube(g,Math.sin(i*Math.PI/2)*.5,1.2,Math.cos(i*Math.PI/2)*.5,.65,.4,.65,flower)}else{cube(g,0,1.1,0,.4,2.2,.4,wood);cube(g,0,2.2,0,2.1,1.8,2.1,leaf);for(let i=0;i<4;i++)cube(g,Math.sin(i*1.57)*.8,2.2,Math.cos(i*1.57)*.8,.38,.38,.38,berry)}g.userData.resource=o;actors.add(g);return g}
// Lightweight camera-facing 2D characters, kept in the same 3D depth scene.
function characterTexture(kind){
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=96;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const body=kind==='animal'?'#ba956d':'#537da0',head=kind==='animal'?'#d6b18a':'#e5c69a';
 ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(32,87,18,5,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=body;ctx.fillRect(19,44,26,32);ctx.fillRect(19,74,10,11);ctx.fillRect(35,74,10,11);
 ctx.fillStyle=head;ctx.fillRect(20,18,24,26);
 if(kind==='animal'){ctx.fillRect(21,5,7,19);ctx.fillRect(36,5,7,19)}
 else{ctx.fillStyle='#d6ad64';ctx.fillRect(17,14,30,8)}
 ctx.fillStyle='#23313a';ctx.fillRect(26,33,4,4);ctx.fillRect(36,33,4,4);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;return texture
}
const characterMaterials={minion:new THREE.SpriteMaterial({map:characterTexture('minion'),transparent:true,depthTest:true}),animal:new THREE.SpriteMaterial({map:characterTexture('animal'),transparent:true,depthTest:true})};
const raidBars={};
function raidBarMaterial(hp){
 const step=Math.max(0,Math.min(10,Math.ceil(hp*10)));
 if(raidBars[step])return raidBars[step];
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=12;const c=canvas.getContext('2d');
 c.fillStyle='#1d2028';c.fillRect(0,0,64,12);c.fillStyle=step>5?'#70d67b':step>2?'#f0bf52':'#ef5454';c.fillRect(2,2,60*step/10,8);
 const map=new THREE.CanvasTexture(canvas);map.magFilter=THREE.NearestFilter;return raidBars[step]=new THREE.SpriteMaterial({map,transparent:true,depthTest:true});
}
const raidMaterials={};
function raidMaterial(r){
 const key=r.type==='mages'?'mage-'+(r.element||'fire'):r.type;
 if(raidMaterials[key])return raidMaterials[key];
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=96;
 const c=canvas.getContext('2d'),colors={fire:'#e95c36',water:'#479ce5',wind:'#a4d8c8',earth:'#a88751',lightning:'#d8bf42'};
 const mage=r.type==='mages',boss=r.type==='boss',zombie=r.type==='zombies';
 c.fillStyle='#0005';c.fillRect(13,88,38,5);
 c.fillStyle=boss?'#742b39':zombie?'#527a48':mage?(colors[r.element]||colors.fire):'#8d5a43';
 c.fillRect(17,43,30,35);c.fillRect(17,76,12,12);c.fillRect(35,76,12,12);
 c.fillStyle=zombie?'#9ab879':boss?'#b85c57':'#d5ab82';c.fillRect(19,20,26,27);
 c.fillStyle='#20202a';c.fillRect(24,30,5,5);c.fillRect(36,30,5,5);
 if(boss){c.fillStyle='#e3d3a1';c.fillRect(10,6,8,24);c.fillRect(46,6,8,24);c.fillRect(17,46,30,7)}
 else if(mage){c.fillStyle=colors[r.element]||colors.fire;c.beginPath();c.moveTo(15,22);c.lineTo(32,2);c.lineTo(49,22);c.fill();c.fillRect(51,36,4,48);c.fillRect(47,27,12,12)}
 else if(zombie){c.fillStyle='#77975e';c.fillRect(4,47,15,9);c.fillRect(45,47,15,9)}
 else{c.fillStyle='#b7bcc0';c.fillRect(15,15,34,9);c.fillRect(51,31,5,40);c.fillRect(46,60,15,5)}
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;
 return raidMaterials[key]=new THREE.SpriteMaterial({map,transparent:true,depthTest:true});
}
function character(kind){const sprite=new THREE.Sprite(characterMaterials[kind]);sprite.scale.set(2.5,3.75,1);sprite.position.y=1.85;actors.add(sprite);return sprite}
function minion(m){const sprite=character('minion');const [x,z]=xy(m.x,m.y);sprite.position.set(x,1.85,z);return sprite}
let raiderObjects=[],resourceObjects=[],minionObjects=[],animalObjects=[],focus=new THREE.Vector3(0,1,0),lastSync=0,resourceSignature='';let mapLevel=1,transition=null;
// Transition scenery exists only during the cinematic; completed cities are not retained.
const startingZoom=Math.min(320,Math.max(110,110*innerHeight/Math.max(1,innerWidth)));
function temporaryReveal(){
 const layer=new THREE.Group();scene.add(layer);
 const tiles=[];
 for(let x=-90;x<=90;x+=4)for(let z=-60;z<=60;z+=4){
  if(Math.abs(x)<=54&&Math.abs(z)<=35)continue;
  if(rnd(x+17,z)>.28)tiles.push([x,z]);
 }
 const mesh=new THREE.InstancedMesh(box,moss,tiles.length);
 tiles.forEach(([x,z],i)=>{floorTransform.position.set(x,.03,z);floorTransform.scale.set(3.8,.2,3.8);floorTransform.updateMatrix();mesh.setMatrixAt(i,floorTransform.matrix)});
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();layer.add(mesh);return layer;
}
function finishTransition(){
 if(!transition)return;
 scene.remove(transition.scenery);
 transition.scenery.traverse(o=>{if(o.isInstancedMesh)o.dispose()});
 scene.remove(transition.oldActors);
 transition=null;zoom=startingZoom;focus.set(0,1,0);actors.visible=true;resize();
}
// Batch zombie bodies in a single camera-facing instanced draw.
const zombieGeo=new THREE.PlaneGeometry(1,1),zombiePose=new THREE.Object3D();
let zombieBatch=null;
function syncZombies(list){
 if(!list.length){if(zombieBatch){actors.remove(zombieBatch);zombieBatch.dispose();zombieBatch.material.dispose();zombieBatch=null}return}
 if(!zombieBatch||zombieBatch.instanceMatrix.count<list.length){
  if(zombieBatch){actors.remove(zombieBatch);zombieBatch.dispose();zombieBatch.material.dispose()}
  const mat=new THREE.MeshBasicMaterial({map:raidMaterial(list[0]).map,transparent:false,alphaTest:.5,side:THREE.DoubleSide});
  zombieBatch=new THREE.InstancedMesh(zombieGeo,mat,Math.max(180,list.length));zombieBatch.frustumCulled=false;actors.add(zombieBatch);
 }
 zombieBatch.count=list.length;
 list.forEach((r,i)=>{const [x,z]=xy(r.x,r.y);zombiePose.position.set(x,1.85*.78,z);zombiePose.scale.set(2.5*.78,3.75*.78,1);zombiePose.quaternion.copy(camera.quaternion);zombiePose.updateMatrix();zombieBatch.setMatrixAt(i,zombiePose.matrix)});
 zombieBatch.instanceMatrix.needsUpdate=true;
}
const cityBuildings=new THREE.Group();actors.add(cityBuildings);
let buildingSignature='';
const roofMat=mat(0x995f43),clinicMat=mat(0xd5d1b8),crossMat=mat(0xbd4141);
function syncBuildings(s){
 const list=s.buildings||[],sig=JSON.stringify(list.map(b=>[b.id,b.type,b.x,b.y]));
 if(sig===buildingSignature)return;buildingSignature=sig;cityBuildings.clear();
 let towerIndex=0,slot=0;
 for(const b of list){
  const tower=b.type==='watchtower',i=slot++,angle=i*2.399963,r=12+Math.floor(i/5)*5;
  const fallback=globalThis.RoyalCore?.buildingPosition(b,i);if(tower)towerIndex++;
  const p=Number.isFinite(b.x)&&Number.isFinite(b.y)?xy(b.x,b.y):fallback?xy(fallback.x,fallback.y):[Math.cos(angle)*r,Math.sin(angle)*r*.72];
  const g=new THREE.Group();g.position.set(p[0],0,p[1]);cityBuildings.add(g);
  if(tower){cube(g,0,2.7,0,2,5.4,2,stone);cube(g,0,5.5,0,3.1,.6,3.1,wood);for(const x of [-1.2,1.2])for(const z of [-1.2,1.2])cube(g,x,6, z,.45,.7,.45,edge)}
  else if(b.type==='plaza'){cube(g,0,.2,0,5,.4,5,edge);cube(g,0,1,0,1.5,1.6,1.5,gold)}
  else{const wide=b.type==='warehouse'?5:3.6;cube(g,0,1.4,0,wide,2.8,3.2,b.type==='clinic'?clinicMat:wood);cube(g,0,3,0,wide+.5,.6,3.8,roofMat);cube(g,0,1,-1.65,.85,2,.15,stone);if(b.type==='clinic'){cube(g,0,3.4,0,1.5,.18,.45,crossMat);cube(g,0,3.4,0,.45,.18,1.5,crossMat)}}
 }
}
function sync(){const s=state();if(!s)return;syncBuildings(s);const current=s.objects.filter(o=>o.amount>0);const signature=current.map(o=>[o.type,o.x,o.y].join(':')).join('|');if(signature!==resourceSignature){resourceObjects.forEach(g=>actors.remove(g));resourceObjects=current.map(resource);rebuildResourceBatch();resourceSignature=signature}const live=s.minions.filter(m=>m.status!=='dead');while(minionObjects.length>live.length){actors.remove(minionObjects.pop())}live.forEach((m,i)=>{if(!minionObjects[i])minionObjects[i]=minion(m);const [x,z]=xy(m.x,m.y);minionObjects[i].position.set(x,1.85,z)});const animals=(s.animals||[]).filter(a=>a.hp>0);while(animalObjects.length>animals.length)actors.remove(animalObjects.pop());animals.forEach((a,i)=>{if(!animalObjects[i])animalObjects[i]=character('animal');const [x,z]=xy(a.x,a.y);animalObjects[i].position.set(x,1.7,z)});const allRaiders=s.raids?.attackers||[],maxZombie=(globalThis.RoyalRaids?.MODES.zombies.hp||24)+(s.raids?.wave||0)*3;const raiders=allRaiders.filter(r=>r.type!=='zombies'||r.hp<maxZombie);syncZombies(allRaiders.filter(r=>r.type==='zombies'&&r.hp>=maxZombie));while(raiderObjects.length>raiders.length)actors.remove(raiderObjects.pop());raiders.forEach((r,i)=>{if(!raiderObjects[i]){raiderObjects[i]=new THREE.Group();const body=new THREE.Sprite(raidMaterial(r)),bar=new THREE.Sprite(raidBarMaterial(1));raiderObjects[i].add(body,bar);actors.add(raiderObjects[i])}const group=raiderObjects[i],sprite=group.children[0],bar=group.children[1];sprite.material=raidMaterial(r);const size=r.type==='boss'?2.4:r.type==='zombies'?.78:1;sprite.scale.set(2.5*size,3.75*size,1);sprite.position.set(0,1.85*size,0);const max=(globalThis.RoyalRaids?.MODES[r.type]?.hp||r.hp)+(s.raids.wave||0)*3;bar.material=raidBarMaterial(r.hp/max);bar.scale.set(2.2*size,.32*size,1);bar.position.set(0,3.9*size,0);bar.visible=r.type!=='zombies'||r.hp<max;const [x,z]=xy(r.x,r.y);group.position.set(x,0,z)});}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
const pointers=new Map();let pinchDistance=0;const clampFocus=()=>{const limit=53*Math.max(1,mapLevel);focus.x=THREE.MathUtils.clamp(focus.x,-limit,limit);focus.z=THREE.MathUtils.clamp(focus.z,-limit,limit)};
window.royal3DCamera=()=>({x:focus.x,z:focus.z,zoom,mapLevel});
window.royal3DNextMap=()=>{if(transition)return;
 const oldActors=new THREE.Group();scene.add(oldActors);
 oldActors.add(cityBuildings.clone(true));for(const g of resourceObjects){const copy=g.clone(true);copy.visible=true;oldActors.add(copy)}
 for(const sprite of minionObjects)oldActors.add(sprite.clone());
 for(const sprite of animalObjects)oldActors.add(sprite.clone());
 actors.visible=false;
 const scenery=temporaryReveal();
 transition={start:performance.now(),fromZoom:zoom,toZoom:Math.min(320,zoom*1.55),oldActors,scenery};
 mapLevel=state()?.city||mapLevel+1;
};
renderer.domElement.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});down=pointers.size===1?{x:e.clientX,y:e.clientY,moved:false}:null;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(pointers.size===2){const v=[...pointers.values()],d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);if(pinchDistance)zoom=THREE.MathUtils.clamp(zoom*pinchDistance/d,28,320),resize();pinchDistance=d;down=null;return}if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)down.moved=true;if(down?.moved){const scale=zoom/Math.max(1,host.clientHeight);focus.x-=(dx+dy)*scale*.72;focus.z+=(dx-dy)*scale*.72;clampFocus()}});
renderer.domElement.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);pinchDistance=0;if(!down)return;const d=Math.hypot(e.clientX-down.x,e.clientY-down.y);const moved=down.moved;down=null;if(d>8||moved)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(resourceObjects,true);let g=hits[0]?.object;while(g&&!g.userData.resource)g=g.parent;if(!g){const w=renderer.domElement.clientWidth,h=renderer.domElement.clientHeight;let best=36;for(const candidate of resourceObjects){const p=candidate.position.clone().add(new THREE.Vector3(0,1.4,0)).project(camera);if(p.z>1)continue;const distance=Math.hypot((p.x-pointer.x)*w/2,(p.y-pointer.y)*h/2);if(distance<best){best=distance;g=candidate}}}if(g?.userData.resource)window.royal3DCommand?.(g.userData.resource)});
renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;pinchDistance=0});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.04,28,320);resize()},{passive:false});

function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight),half=zoom*.5;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();if(renderer.domElement.width!==Math.round(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false)}
toggle.addEventListener('click',()=>{active=!active;host.hidden=!active;canvas2d.hidden=active;toggle.setAttribute('aria-pressed',String(active));toggle.textContent=active?'🎮 2D 게임 보기':'✨ 3D 그래픽 보기';if(active){fpsFrames=0;fpsStart=0;fpsLabel.textContent='렌더 -- | P95 --';frameTimes.length=0;resize();sync()}});
// Read-only projection helper for automated browser interaction checks.
window.royal3DVisibleResources=()=>{if(!active)return[];camera.updateMatrixWorld();return resourceObjects.map(g=>{const p=g.position.clone().add(new THREE.Vector3(0,1.4,0)).project(camera);return {x:(p.x+1)*host.clientWidth/2,y:(1-p.y)*host.clientHeight/2,visible:p.z<1&&Math.abs(p.x)<.85&&Math.abs(p.y)<.85,type:g.userData.resource.type,worldX:g.userData.resource.x,worldY:g.userData.resource.y}}).filter(p=>p.visible)};
const raidFx=[],fxColors={fire:0xff6333,water:0x459fff,wind:0xa9ffe4,earth:0xb68b42,lightning:0xffed55,towerFx:0xffe4a0,hunterFx:0x80e6bb};
const fxGeo=new THREE.SphereGeometry(.32,6,4),fxMats={};
window.royal3DRaidFx=e=>{if(e.kind==="defeated"&&e.at){const at=xy(e.at.x,e.at.y),key="defeated",mat=fxMats[key]||(fxMats[key]=new THREE.MeshBasicMaterial({color:0xffcf78}));const count=Math.min(e.type==="boss"?8:4,40-raidFx.length);for(let i=0;i<count;i++){const angle=i*Math.PI*2/count,mesh=new THREE.Mesh(fxGeo,mat);mesh.position.set(at[0],2,at[1]);scene.add(mesh);raidFx.push({mesh,a:at,b:[at[0]+Math.cos(angle)*2,at[1]+Math.sin(angle)*2],age:0,key})}return}if(!e.from||!e.to||raidFx.length>=40)return;const key=e.kind==='towerFx'||e.kind==='hunterFx'?e.kind:e.element||'fire';const mat=fxMats[key]||(fxMats[key]=new THREE.MeshBasicMaterial({color:fxColors[key]||0xff7755}));const mesh=new THREE.Mesh(fxGeo,mat);const a=xy(e.from.x,e.from.y),b=xy(e.to.x,e.to.y);mesh.position.set(a[0],e.kind==='towerFx'?6:2.5,a[1]);scene.add(mesh);raidFx.push({mesh,a,b,age:0,key})};
function tickRaidFx(dt){for(let i=raidFx.length-1;i>=0;i--){const f=raidFx[i];f.age+=Math.max(0,dt);const p=Math.min(1,f.age/(f.key==="defeated"?.42:.32));if(f.key==="defeated")f.mesh.scale.setScalar(Math.max(.01,1-p));f.mesh.position.set(THREE.MathUtils.lerp(f.a[0],f.b[0],p),(f.key==='towerFx'?6-3.5*p:2.5)+Math.sin(p*Math.PI)*(f.key==='earth'?3:1),THREE.MathUtils.lerp(f.a[1],f.b[1],p));if(p>=1){scene.remove(f.mesh);raidFx.splice(i,1)}}}
let prev=0,fpsFrames=0,fpsStart=0;const frameTimes=[];let lastFps=0,lastP95=0,lastStalls=0;window.royal3DPerf=()=>({renderCallFps:lastFps,p95FrameMs:lastP95,stallsOver50Ms:lastStalls,samples:frameTimes.length,averageMs:frameTimes.length?frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length:null,p95Ms:frameTimes.length?[...frameTimes].sort((a,b)=>a-b)[Math.floor((frameTimes.length-1)*.95)]:null,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles});function loop(t){requestAnimationFrame(loop);if(!active){prev=t;return}if(prev){frameTimes.push(t-prev);if(frameTimes.length>180)frameTimes.shift()}const dt=Math.min((t-prev)/1000,.05);prev=t;if(t-lastSync>160){sync();lastSync=t}if(transition){const p=Math.min(1,(t-transition.start)/2400),ease=p*p*(3-2*p);zoom=THREE.MathUtils.lerp(transition.fromZoom,transition.toZoom,ease);resize();if(p>=1)finishTransition()}const elapsed=t*.001;crystal.rotation.y+=dt*.45;crystal.position.y=5+Math.sin(elapsed*1.5)*.22;glow.intensity=30+Math.sin(elapsed*2)*5;sparks.forEach(({o,y,phase})=>o.position.y=y+Math.sin(elapsed*1.4+phase)*.25);const elev=Math.PI/4;camera.position.set(focus.x+Math.sin(yaw)*zoom*Math.cos(elev),focus.y+zoom*Math.sin(elev),focus.z+Math.cos(yaw)*zoom*Math.cos(elev));camera.lookAt(focus);tickRaidFx(dt);renderer.render(scene,camera);if(!fpsStart)fpsStart=t;fpsFrames++;if(t-fpsStart>=1000){const fps=Math.round(fpsFrames*1000/(t-fpsStart));const recent=frameTimes.filter(ms=>ms>0);const sorted=[...recent].sort((a,b)=>a-b);const p95=sorted.length?sorted[Math.floor((sorted.length-1)*.95)]:0;const stalls=recent.filter(ms=>ms>50).length;lastFps=fps;lastP95=Math.round(p95);lastStalls=stalls;fpsLabel.textContent='렌더 '+fps+'/s | P95 '+Math.round(p95)+'ms | 지연 '+stalls;fpsLabel.title='렌더링 호출 빈도(화면 출력 FPS 아님) / 최근 프레임 간격 95백분위 / 50ms 초과 프레임 수';fpsLabel.style.color=p95<=20?'#b7f6ce':p95<=33?'#ffe49a':'#ffaaaa';fpsFrames=0;fpsStart=t}}requestAnimationFrame(loop);
window.addEventListener('resize',()=>{if(active)resize()});
// The Royal now launches directly into the fullscreen 3D view; 2D canvas is internal only.
toggle.click();
