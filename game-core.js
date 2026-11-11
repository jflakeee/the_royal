(function(root){
"use strict";
const RECIPES={hut:{wood:5,stone:2},warehouse:{wood:8,stone:5},clinic:{wood:6,stone:8},watchtower:{wood:7,stone:10},plaza:{wood:15,stone:15}};
const START_HOUSING=3;
function num(v,d=0){return Number.isFinite(v)?Math.max(0,v):d}
function stock(v){return Object.fromEntries(["wood","stone","flower","berry","meat"].map(k=>[k,num(v&&v[k])]))}
function migrate(old){if(!old||typeof old!=="object"||!Array.isArray(old.minions)||!Array.isArray(old.objects))throw Error("invalid legacy save");
const s=JSON.parse(JSON.stringify(old));s.version=3;s.city=Math.max(1,Math.floor(num(s.city,1)));s.stock=stock(s.stock);s.cityLevel=Math.floor(num(s.cityLevel));s.buildings=Array.isArray(s.buildings)?s.buildings:[];s.history=Array.isArray(s.history)?s.history:[];s.queue=Array.isArray(s.queue)?s.queue:[];s.migration=num(s.migration);s.nextId=Math.max(1,Math.floor(num(s.nextId,1)));
s.minions=s.minions.map(m=>{m.id=m.id||"m"+s.nextId++;m.hp=num(m.hp,100);m.maxHp=num(m.maxHp,100)||100;m.status=m.status||"healthy";m.x=Number.isFinite(m.x)?m.x:415;m.y=Number.isFinite(m.y)?m.y:265;return m});
s.objects=s.objects.map(o=>({...o,amount:num(o.amount),x:Number.isFinite(o.x)?o.x:100,y:Number.isFinite(o.y)?o.y:100}));return s}
function canAfford(s,cost){return Object.keys(cost).every(k=>num(s.stock[k])>=cost[k])}
function spend(s,cost){if(!canAfford(s,cost))return false;for(const k of Object.keys(cost))s.stock[k]-=cost[k];return true}
function housing(s){return START_HOUSING+s.buildings.filter(b=>b.type==="hut").length*2}
function living(s){return s.minions.filter(m=>m.status!=="dead").length}
function recruit(s,resource="berry"){const cost=resource==="meat"?{meat:3}:{berry:5};if(living(s)>=housing(s)||!spend(s,cost))return false;let id="m"+s.nextId++;s.minions.push({id,x:415,y:265,hp:100,maxHp:100,status:"healthy",job:null});return true}
function recruitAvailable(s){let meat=0,berry=0;while(living(s)<housing(s)){if(recruit(s,"meat")){meat++;continue}if(recruit(s,"berry")){berry++;continue}break}return {meat,berry,total:meat+berry}}
function heal(s,m){if(!m||m.status==="dead"||m.status==="healthy")return false;const critical=m.status==="critical";if(!spend(s,{flower:critical?3:1}))return false;m.hp=critical?60:80;m.status="healthy";return true}
function build(s,type){let cost=RECIPES[type];if(!cost||!spend(s,cost))return false;s.buildings.push({id:"b"+s.nextId++,type});s.cityLevel=s.buildings.length;return true}
function migrationReady(s){return s.buildings.length>=8&&living(s)>=10&&s.buildings.some(b=>b.type==="clinic")&&s.buildings.some(b=>b.type==="plaza")&&s.minions.filter(m=>m.status==="healthy").length>=3}
function nextBuilding(s){if(s.minions.some(m=>m.status==="critical"||m.status==="wounded")&&!s.buildings.some(b=>b.type==="clinic"))return "clinic";if(housing(s)<=living(s))return "hut";if(!s.buildings.some(b=>b.type==="clinic"))return "clinic";if(!s.buildings.some(b=>b.type==="warehouse"))return "warehouse";if(!s.buildings.some(b=>b.type==="plaza"))return "plaza";if(housing(s)<10)return "hut";if(!s.buildings.some(b=>b.type==="watchtower"))return "watchtower";return "hut"}
function retarget(s,job){const active=s.objects.filter(o=>o.amount>0&&o.type===job.type);if(!active.length)return false;active.sort((a,b)=>Math.hypot(a.x-job.x,a.y-job.y)-Math.hypot(b.x-job.x,b.y-job.y));job.x=active[0].x;job.y=active[0].y;job.phase="travel";job.progress=0;return true}
function harvest(s,job){const o=s.objects.find(o=>o.x===job.x&&o.y===job.y&&o.type===job.type&&o.amount>0);if(!o)return false;o.amount=0;o.regen=0;o.respawnAmount=1;o.respawnDelay=8+Math.random()*7;return true}
function replenish(s,dt,rng=Math.random){for(const o of s.objects){if(o.amount>0)continue;o.regen=(Number.isFinite(o.regen)?o.regen:0)+dt;if(o.regen<(o.respawnDelay||15))continue;const oldX=o.x,oldY=o.y;for(let i=0;i<40;i++){const x=40+Math.floor(rng()*720),y=45+Math.floor(rng()*380);if(Math.hypot(x-oldX,y-oldY)<65||Math.hypot(x-415,y-265)<105||s.objects.some(p=>p!==o&&p.amount>0&&Math.hypot(p.x-x,p.y-y)<38))continue;o.x=x;o.y=y;break}if(o.x===oldX&&o.y===oldY)continue;o.amount=o.respawnAmount||4;o.regen=0;o.respawnDelay=0}}
function load(storage){let v3=storage.getItem("royal-save-v3");if(v3){try{return migrate(JSON.parse(v3))}catch(e){}}let v1=storage.getItem("royal-save-v1");if(v1){try{return migrate(JSON.parse(v1))}catch(e){}}return null}
function save(storage,s){storage.setItem("royal-save-v3",JSON.stringify(migrate(s)))}
root.RoyalCore={RECIPES,migrate,stock,canAfford,spend,housing,living,recruit,recruitAvailable,heal,build,nextBuilding,migrationReady,retarget,harvest,replenish,load,save};
})(typeof globalThis!=="undefined"?globalThis:this);
