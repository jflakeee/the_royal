import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
const canvas2d=document.getElementById('world'),host=document.getElementById('royal-3d'),toggle=document.getElementById('view-toggle');
const state=()=>window.royal3DState?.();
const scene=new THREE.Scene();scene.background=new THREE.Color(0x111c2a);scene.fog=new THREE.FogExp2(0x182b35,.023);
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(e){toggle.disabled=true;toggle.textContent='3D 사용 불가';return}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;host.append(renderer.domElement);
const camera=new THREE.PerspectiveCamera(43,1,.1,400);let yaw=.8,zoom=56,active=false;
const light=new THREE.HemisphereLight(0xaac5e8,0x23342f,2.4);scene.add(light);
const moon=new THREE.DirectionalLight(0xc6dcff,2.8);moon.position.set(-25,55,-30);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-55;moon.shadow.camera.right=55;moon.shadow.camera.top=55;moon.shadow.camera.bottom=-55;scene.add(moon);
const box=new THREE.BoxGeometry(1,1,1),mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const stone=mat(0x52616d,.62,.22),edge=mat(0x7a8793),moss=mat(0x344b3e),wood=mat(0x584437),leaf=mat(0x396454),gold=mat(0xc3a46b,.35,.55),cloth=mat(0x526b8a),flower=mat(0xe8bd70),berry=mat(0x8173d9),water=new THREE.MeshPhysicalMaterial({color:0x304d5c,roughness:.17,metalness:.35,clearcoat:1,clearcoatRoughness:.09});
const terrain=new THREE.Group(),actors=new THREE.Group();scene.add(terrain,actors);
function cube(parent,x,y,z,w,h,d,m){const o=new THREE.Mesh(box,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function rnd(x,z){const n=Math.sin(x*12.9898+z*78.233)*43758.5453;return n-Math.floor(n)}
cube(terrain,0,-1.1,0,106,2,68,stone);
const wet=new THREE.Mesh(new THREE.PlaneGeometry(106,68),water);wet.rotation.x=-Math.PI/2;wet.position.y=-.065;wet.receiveShadow=true;terrain.add(wet);
for(let x=-51;x<52;x+=3){for(let z=-32;z<33;z+=3){const r=rnd(x,z);if(r>.28)cube(terrain,x,.04,z,2.85,.17+r*.15,2.85,r>.82?edge:stone)}}
for(let x=-52;x<=52;x+=7){for(const z of [-34,34]){const h=2+rnd(x,z)*5;cube(terrain,x,h/2,z,3,h,3,stone)}}
for(let z=-31;z<=31;z+=7){for(const x of [-53,53]){const h=2+rnd(x,z)*5;cube(terrain,x,h/2,z,3,h,3,stone)}}
for(let i=0;i<22;i++){const a=i*2.399,r=37+i%5*2,x=Math.cos(a)*r,z=Math.sin(a)*r*.65,h=3+rnd(i,4)*7;cube(terrain,x,h/2,z,2,h,2,stone);cube(terrain,x,h+.25,z,3,.5,3,edge)}
const altar=new THREE.Group();altar.position.set(0,0,-9);terrain.add(altar);cube(altar,0,.7,0,8,1.4,7,stone);cube(altar,0,1.5,0,6,.4,5,edge);cube(altar,0,3.2,0,1.3,3.1,1.3,gold);
const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(1.4),new THREE.MeshStandardMaterial({color:0x72d8c9,emissive:0x3ac4bf,emissiveIntensity:2.8,roughness:.2}));crystal.position.set(0,5,0);altar.add(crystal);const glow=new THREE.PointLight(0x60ded3,35,24);glow.position.set(0,5,0);altar.add(glow);
const sparks=[];for(let i=0;i<30;i++){const o=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),new THREE.MeshBasicMaterial({color:i%2?0xffd08c:0x9eece2}));o.position.set((rnd(i,1)-.5)*80,1+rnd(i,2)*8,(rnd(i,3)-.5)*54);scene.add(o);sparks.push({o,y:o.position.y,phase:i*.71})}
function xy(x,y){return[(x-400)*.125,(y-240)*.125]}
function resource(o){const g=new THREE.Group();const [x,z]=xy(o.x,o.y);g.position.set(x,0,z);const kind=o.type;if(kind===0){cube(g,0,1.2,0,.8,2.4,.8,wood);cube(g,0,3.2,0,2.8,2.6,2.8,leaf);cube(g,0,4.5,0,1.6,1.2,1.6,leaf)}else if(kind===1){cube(g,0,.85,0,2,1.7,1.8,stone);cube(g,.7,1.5,-.4,1,1.1,1,edge)}else if(kind===2){cube(g,0,.6,0,.25,1.2,.25,leaf);for(let i=0;i<4;i++)cube(g,Math.sin(i*Math.PI/2)*.5,1.2,Math.cos(i*Math.PI/2)*.5,.65,.4,.65,flower)}else{cube(g,0,1.1,0,.4,2.2,.4,wood);cube(g,0,2.2,0,2.1,1.8,2.1,leaf);for(let i=0;i<4;i++)cube(g,Math.sin(i*1.57)*.8,2.2,Math.cos(i*1.57)*.8,.38,.38,.38,berry)}g.userData.resource=o;actors.add(g);return g}
function minion(m){const g=new THREE.Group();const [x,z]=xy(m.x,m.y);g.position.set(x,0,z);cube(g,0,.95,0,.85,1.3,.55,cloth);cube(g,0,1.88,0,.72,.72,.7,gold);cube(g,-.22,.25,0,.28,.5,.4,stone);cube(g,.22,.25,0,.28,.5,.4,stone);cube(g,-.55,1,0,.3,.85,.3,stone);cube(g,.55,1,0,.3,.85,.3,stone);actors.add(g);return g}
let resourceObjects=[],minionObjects=[],focus=new THREE.Vector3(),lastSync=0;
function sync(){const s=state();if(!s)return;resourceObjects.forEach(g=>actors.remove(g));minionObjects.forEach(g=>actors.remove(g));resourceObjects=s.objects.filter(o=>o.amount>0).map(resource);minionObjects=s.minions.filter(m=>m.status!=='dead').map(minion);const leader=s.minions.find(m=>m.status!=='dead');if(leader){const [x,z]=xy(leader.x,leader.y);focus.lerp(new THREE.Vector3(x,1,z),.2)}}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,last:e.clientX};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!down)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)yaw-=(e.clientX-down.last)*.008;down.last=e.clientX});
renderer.domElement.addEventListener('pointerup',e=>{if(!down)return;const d=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(d>8)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(resourceObjects,true);if(!hits.length)return;let g=hits[0].object;while(g&&!g.userData.resource)g=g.parent;if(g?.userData.resource)window.royal3DCommand?.(g.userData.resource)});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.04,24,105)},{passive:false});
let pinch=0;renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length===2){const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(pinch)zoom=THREE.MathUtils.clamp(zoom+(pinch-d)*.05,24,105);pinch=d}},{passive:true});renderer.domElement.addEventListener('touchend',()=>pinch=0);
function resize(){const w=host.clientWidth,h=host.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
toggle.addEventListener('click',()=>{active=!active;host.hidden=!active;canvas2d.hidden=active;toggle.setAttribute('aria-pressed',String(active));toggle.textContent=active?'🎮 2D 게임 보기':'✨ 3D 그래픽 보기';if(active){resize();sync()}});
let prev=0;function loop(t){requestAnimationFrame(loop);if(!active)return;const dt=Math.min((t-prev)/1000,.05);prev=t;if(t-lastSync>160){sync();lastSync=t}const elapsed=t*.001;crystal.rotation.y+=dt*.45;crystal.position.y=5+Math.sin(elapsed*1.5)*.22;glow.intensity=30+Math.sin(elapsed*2)*5;sparks.forEach(({o,y,phase})=>o.position.y=y+Math.sin(elapsed*1.4+phase)*.25);const elev=.74;camera.position.set(focus.x+Math.sin(yaw)*zoom*Math.cos(elev),focus.y+zoom*Math.sin(elev),focus.z+Math.cos(yaw)*zoom*Math.cos(elev));camera.lookAt(focus);renderer.render(scene,camera)}requestAnimationFrame(loop);
window.addEventListener('resize',()=>{if(active)resize()});
