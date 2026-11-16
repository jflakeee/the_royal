// Identical seeded scene data for all renderers. Metrics are measured on the client, not simulated.
const stage=document.querySelector('#stage'),stats=document.querySelector('#stats');
const params=new URLSearchParams(location.search);
for(const id of ['units','resources','buildings']){if(params.has(id))document.getElementById(id).value=params.get(id)}
document.getElementById('restart').onclick=()=>{const q=new URLSearchParams();for(const id of ['units','resources','buildings'])q.set(id,document.getElementById(id).value);location.search=q.toString()};
function data(){let seed=17;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);const count=id=>Math.max(0,Math.min(Number(document.getElementById(id).max),Number(document.getElementById(id).value)||0));const make=(n)=>Array.from({length:count(n)},(_,i)=>({x:rand()*900-450,y:rand()*600-300,phase:rand()*6.28,id:i}));return {units:make('units'),resources:make('resources'),buildings:make('buildings')}}
function meter(extra=()=>({})){let last=0,start=0,frames=0,dt=[];return function(t){if(last){dt.push(t-last);if(dt.length>240)dt.shift()}last=t;frames++;if(!start)start=t;if(t-start>=2000){const sorted=[...dt].sort((a,b)=>a-b);const p95=sorted[Math.floor((sorted.length-1)*.95)]||0;const e=extra();stats.textContent='렌더 호출/초: '+(frames*1000/(t-start)).toFixed(1)+' | P95: '+p95.toFixed(1)+'ms | 지연>50ms: '+dt.filter(x=>x>50).length+' / '+dt.length+'\n'+JSON.stringify(e)+'\n동일 시드·수량 / 2초 갱신 / 기기별 직접 비교 필요';start=t;frames=0}}}
const sceneData=data();
import {Application,Container,Graphics} from 'https://cdn.jsdelivr.net/npm/pixi.js@8.6.6/dist/pixi.mjs';
document.querySelector('#engine').textContent='PixiJS 8 · WebGL · 2.5D';
const app=new Application();await app.init({resizeTo:stage,background:'#192c39',antialias:false,resolution:Math.min(devicePixelRatio,1),preference:'webgl'});stage.append(app.canvas);
const world=new Container();app.stage.addChild(world);
const all=[sceneData.units,sceneData.resources,sceneData.buildings];const objects=all.map((items,k)=>items.map(p=>{const g=new Graphics();const color=[0x6ba16f,0x9fbc6b,0xc7a26d][k];const size=k===2?9:k===1?5:3;g.rect(-size,-size,size*2,size*2).fill(color);world.addChild(g);return g}));
function layout(t){world.position.set(stage.clientWidth/2,stage.clientHeight/2);const scale=Math.min(stage.clientWidth/1100,stage.clientHeight/740);world.scale.set(scale);all.forEach((items,k)=>items.forEach((p,i)=>{const g=objects[k][i];const x=p.x+(k===0?Math.sin(t*.001+p.phase)*5:0);g.position.set(x-p.y*.22,(x+p.y)*.38)}))}
const tick=meter(()=>({units:all[0].length,resources:all[1].length,buildings:all[2].length,drawCalls:'renderer-dependent'}));
app.ticker.add(t=>{layout(performance.now());tick(performance.now())});