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
function character(kind){const sprite=new THREE.Sprite(characterMaterials[kind]);sprite.scale.set(2.5,3.75,1);sprite.position.y=1.85;actors.add(sprite);return sprite}
function minion(m){const sprite=character('minion');const [x,z]=xy(m.x,m.y);sprite.position.set(x,1.85,z);return sprite}
let resourceObjects=[],minionObjects=[],animalObjects=[],focus=new THREE.Vector3(0,1,0),lastSync=0,resourceSignature='';let mapLevel=1,transition=null;
const expansionLayers=[],archives=[];
function archiveVillage(snapshot){
 if(!snapshot)return;
 const group=new THREE.Group();group.name='completed-village-'+snapshot.city;scene.add(group);
 const level=Math.max(1,snapshot.city||1),offset=-(level-1)*62;
 const marker=cube(group,offset,.45,0,12,.9,9,gold);marker.castShadow=false;
 const buildings=Math.min(80,Array.isArray(snapshot.buildings)?snapshot.buildings.length:0);
 for(let i=0;i<buildings;i++){const a=i*2.399,r=8+Math.sqrt(i)*3;const x=offset+Math.cos(a)*r,z=Math.sin(a)*r*.68;const house=cube(group,x,1.2,z,2.6,2.4,2.6,wood);house.castShadow=false}
 archives.push(group);
}
function restoreWorld(s){
 const target=Math.max(1,Math.min(8,Math.floor(s?.city||1)));
 if(target<=mapLevel)return;
 for(let level=mapLevel+1;level<=target;level++){const layer=revealNewTerrain(level);layer.visible=true}
 for(const snapshot of (s.history||[]).slice(0,7))archiveVillage(snapshot);
 mapLevel=target;zoom=Math.min(320,Math.max(zoom,110*Math.pow(1.3,target-1)));resize();
}

function revealNewTerrain(level){
 const layer=new THREE.Group();layer.visible=false;scene.add(layer);
 const tiles=[];const inner=level===2?54:54+(level-2)*38,outer=inner+38;
 for(let x=-outer;x<=outer;x+=4)for(let z=-outer*.66;z<=outer*.66;z+=4){
  if(Math.abs(x)<=inner&&Math.abs(z)<=inner*.66)continue;
  if(rnd(x+level*19,z)>.25)tiles.push([x,z]);
 }
 const mesh=new THREE.InstancedMesh(box,stone,tiles.length);
 tiles.forEach(([x,z],i)=>{floorTransform.position.set(x,.03,z);floorTransform.scale.set(3.8,.2+rnd(x,z)*.12,3.8);floorTransform.updateMatrix();mesh.setMatrixAt(i,floorTransform.matrix)});
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();layer.add(mesh);
 const ground=cube(layer,0,-1.2,0,outer*2,1.8,outer*1.32,moss);ground.visible=false;
 expansionLayers.push({layer,mesh,level});return layer;
}
function sync(){const s=state();if(!s)return;if(mapLevel===1&&s.city>1)restoreWorld(s);const current=s.objects.filter(o=>o.amount>0);const signature=current.map(o=>[o.type,o.x,o.y].join(':')).join('|');if(signature!==resourceSignature){resourceObjects.forEach(g=>actors.remove(g));resourceObjects=current.map(resource);resourceSignature=signature}const live=s.minions.filter(m=>m.status!=='dead');while(minionObjects.length>live.length){actors.remove(minionObjects.pop())}live.forEach((m,i)=>{if(!minionObjects[i])minionObjects[i]=minion(m);const [x,z]=xy(m.x,m.y);minionObjects[i].position.set(x,1.85,z)});const animals=(s.animals||[]).filter(a=>a.hp>0);while(animalObjects.length>animals.length)actors.remove(animalObjects.pop());animals.forEach((a,i)=>{if(!animalObjects[i])animalObjects[i]=character('animal');const [x,z]=xy(a.x,a.y);animalObjects[i].position.set(x,1.7,z)});}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
const pointers=new Map();let pinchDistance=0;const clampFocus=()=>{const limit=53*Math.max(1,mapLevel);focus.x=THREE.MathUtils.clamp(focus.x,-limit,limit);focus.z=THREE.MathUtils.clamp(focus.z,-limit,limit)};
window.royal3DCamera=()=>({x:focus.x,z:focus.z,zoom,mapLevel});
window.royal3DNextMap=snapshot=>{if(transition)return;const next=mapLevel+1;
 archiveVillage(snapshot||{city:mapLevel,buildings:[]});
 const layer=revealNewTerrain(next);layer.visible=true;
 transition={start:performance.now(),fromZoom:zoom,toZoom:Math.min(320,zoom*1.45),layer};mapLevel=next;};
renderer.domElement.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});down=pointers.size===1?{x:e.clientX,y:e.clientY,moved:false}:null;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(pointers.size===2){const v=[...pointers.values()],d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);if(pinchDistance)zoom=THREE.MathUtils.clamp(zoom*pinchDistance/d,28,320),resize();pinchDistance=d;down=null;return}if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)down.moved=true;if(down?.moved){const scale=zoom/Math.max(1,host.clientHeight);focus.x-=(dx+dy)*scale*.72;focus.z+=(dx-dy)*scale*.72;clampFocus()}});
renderer.domElement.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);pinchDistance=0;if(!down)return;const d=Math.hypot(e.clientX-down.x,e.clientY-down.y);const moved=down.moved;down=null;if(d>8||moved)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(resourceObjects,true);let g=hits[0]?.object;while(g&&!g.userData.resource)g=g.parent;if(!g){const w=renderer.domElement.clientWidth,h=renderer.domElement.clientHeight;let best=36;for(const candidate of resourceObjects){const p=candidate.position.clone().add(new THREE.Vector3(0,1.4,0)).project(camera);if(p.z>1)continue;const distance=Math.hypot((p.x-pointer.x)*w/2,(p.y-pointer.y)*h/2);if(distance<best){best=distance;g=candidate}}}if(g?.userData.resource)window.royal3DCommand?.(g.userData.resource)});
renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;pinchDistance=0});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.04,28,320);resize()},{passive:false});

function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight),half=zoom*.5;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();if(renderer.domElement.width!==Math.round(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false)}
toggle.addEventListener('click',()=>{active=!active;host.hidden=!active;canvas2d.hidden=active;toggle.setAttribute('aria-pressed',String(active));toggle.textContent=active?'🎮 2D 게임 보기':'✨ 3D 그래픽 보기';if(active){fpsFrames=0;fpsStart=0;fpsLabel.textContent='렌더 -- | P95 --';frameTimes.length=0;resize();sync()}});
// Read-only projection helper for automated browser interaction checks.
window.royal3DVisibleResources=()=>{if(!active)return[];camera.updateMatrixWorld();return resourceObjects.map(g=>{const p=g.position.clone().add(new THREE.Vector3(0,1.4,0)).project(camera);return {x:(p.x+1)*host.clientWidth/2,y:(1-p.y)*host.clientHeight/2,visible:p.z<1&&Math.abs(p.x)<.85&&Math.abs(p.y)<.85,type:g.userData.resource.type,worldX:g.userData.resource.x,worldY:g.userData.resource.y}}).filter(p=>p.visible)};
let prev=0,fpsFrames=0,fpsStart=0;const frameTimes=[];let lastFps=0,lastP95=0,lastStalls=0;window.royal3DPerf=()=>({renderCallFps:lastFps,p95FrameMs:lastP95,stallsOver50Ms:lastStalls,samples:frameTimes.length,averageMs:frameTimes.length?frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length:null,p95Ms:frameTimes.length?[...frameTimes].sort((a,b)=>a-b)[Math.floor((frameTimes.length-1)*.95)]:null,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles});function loop(t){requestAnimationFrame(loop);if(!active){prev=t;return}if(prev){frameTimes.push(t-prev);if(frameTimes.length>180)frameTimes.shift()}const dt=Math.min((t-prev)/1000,.05);prev=t;if(t-lastSync>160){sync();lastSync=t}if(transition){const p=Math.min(1,(t-transition.start)/2400),ease=p*p*(3-2*p);zoom=THREE.MathUtils.lerp(transition.fromZoom,transition.toZoom,ease);resize();if(p>=1)transition=null}const elapsed=t*.001;crystal.rotation.y+=dt*.45;crystal.position.y=5+Math.sin(elapsed*1.5)*.22;glow.intensity=30+Math.sin(elapsed*2)*5;sparks.forEach(({o,y,phase})=>o.position.y=y+Math.sin(elapsed*1.4+phase)*.25);const elev=Math.PI/4;camera.position.set(focus.x+Math.sin(yaw)*zoom*Math.cos(elev),focus.y+zoom*Math.sin(elev),focus.z+Math.cos(yaw)*zoom*Math.cos(elev));camera.lookAt(focus);renderer.render(scene,camera);if(!fpsStart)fpsStart=t;fpsFrames++;if(t-fpsStart>=1000){const fps=Math.round(fpsFrames*1000/(t-fpsStart));const recent=frameTimes.filter(ms=>ms>0);const sorted=[...recent].sort((a,b)=>a-b);const p95=sorted.length?sorted[Math.floor((sorted.length-1)*.95)]:0;const stalls=recent.filter(ms=>ms>50).length;lastFps=fps;lastP95=Math.round(p95);lastStalls=stalls;fpsLabel.textContent='렌더 '+fps+'/s | P95 '+Math.round(p95)+'ms | 지연 '+stalls;fpsLabel.title='렌더링 호출 빈도(화면 출력 FPS 아님) / 최근 프레임 간격 95백분위 / 50ms 초과 프레임 수';fpsLabel.style.color=p95<=20?'#b7f6ce':p95<=33?'#ffe49a':'#ffaaaa';fpsFrames=0;fpsStart=t}}requestAnimationFrame(loop);
window.addEventListener('resize',()=>{if(active)resize()});
// The Royal now launches directly into the fullscreen 3D view; 2D canvas is internal only.
toggle.click();
