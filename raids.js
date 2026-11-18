(function(root){"use strict";
const RESOURCE_KEYS=["wood","stone","flower","berry","meat"];
function init(s){if(!s.raids||typeof s.raids!=="object")s.raids={elapsed:0,wave:0,attackers:[],stolen:0,defeated:0};const r=s.raids;r.elapsed=Number.isFinite(r.elapsed)?Math.max(0,r.elapsed):0;r.wave=Number.isFinite(r.wave)?Math.max(0,Math.floor(r.wave)):0;r.attackers=Array.isArray(r.attackers)?r.attackers:[];r.stolen=Number.isFinite(r.stolen)?Math.max(0,r.stolen):0;r.defeated=Number.isFinite(r.defeated)?Math.max(0,r.defeated):0;return r}
const MODES={boss:{label:"👹 보스 몬스터",count:1,hp:1800,speed:12,damage:4},raiders:{label:"⚔️ 대량 약탈자",count:48,hp:48,speed:28,damage:1},mages:{label:"🔥 원소 마법사",count:5,hp:320,speed:20,damage:3},zombies:{label:"🧟 초대량 좀비떼",count:180,hp:24,speed:15,damage:1}};
const REWARDS={boss:24,raiders:28,mages:22,zombies:44};
function available(s){const r=init(s);return (root.RoyalCore?.cityCoverage(s)??(Math.max(s.cityLevel||0,(s.buildings||[]).length)/15))>=1&&!r.attackers.length&&r.completedCity!==s.city&&!s.endingComplete}
function spawn(s,mode){const r=init(s),spec=MODES[mode];if(!spec||!available(s))return null;
 r.wave++;r.battleTime=0;r.stats={towerDamage:0,hunterDamage:0,receivedDamage:0};r.mode=mode;r.stolen=0;r.defeated=0; r.fxCooldown=0;r.lootBudget=Math.ceil(RESOURCE_KEYS.reduce((sum,k)=>sum+Math.max(0,Number(s.stock?.[k])||0),0)*.15);const count=spec.count;
 r.attackers=Array.from({length:count},(_,i)=>{const angle=2*Math.PI*i/count;return {id:mode+"-"+r.wave+"-"+i,type:mode,x:415+Math.cos(angle)*550,y:265+Math.sin(angle)*410,hp:spec.hp+r.wave*3,cooldown:0,element:mode==="mages"?["fire","water","wind","earth","lightning"][i%5]:null}});
 return {kind:"start",wave:r.wave,count,mode,label:spec.label}}
const TOWER_RANGE=240;
function towerPosition(b,i){if(Number.isFinite(b.x)&&Number.isFinite(b.y))return {x:b.x,y:b.y};const angle=i*Math.PI/3;return {x:415+Math.cos(angle)*60,y:265+Math.sin(angle)*60}}
function tick(s,dt){const r=init(s),events=[];if(s.endingComplete)return events;dt=Math.max(0,Math.min(.1,Number(dt)||0));
for(const m of s.minions||[]){if(m.raidSlow>0)m.raidSlow=Math.max(0,m.raidSlow-dt);if(m.raidStun>0)m.raidStun=Math.max(0,m.raidStun-dt)}
const before=r.attackers.length;
if(before){r.stats??={towerDamage:0,hunterDamage:0,receivedDamage:0};r.battleTime=(Number(r.battleTime)||0)+dt}
function result(status){r.lastBattle={status,mode:r.mode,wave:r.wave,seconds:r.battleTime||0,defeated:r.defeated,stolen:r.stolen,wounded:(s.minions||[]).filter(m=>m.status==='wounded').length,critical:(s.minions||[]).filter(m=>m.status==='critical').length,...r.stats}}
for(const m of s.minions||[]){if(m.role!=='hunter'||m.status!=='wounded'||m.job||m.raidStun>0)continue;const dx=415-m.x,dy=265-m.y,d=Math.hypot(dx,dy);if(d>5){const step=Math.min(d,65*dt*(m.raidSlow>0?.45:1));m.x+=dx/d*step;m.y+=dy/d*step}}
const towers=(s.buildings||[]).filter(b=>b.type==='watchtower').slice(0,6);
const hunters=(s.minions||[]).filter(m=>m.status==='healthy'&&m.role==='hunter');
const towerDamage=new Map();
let towerFx=null;
for(let i=0;i<towers.length;i++){
 const t=root.RoyalCore?.buildingPosition(towers[i],s.buildings.indexOf(towers[i]))||towerPosition(towers[i],i);
 let best=null,dist=TOWER_RANGE*TOWER_RANGE;
 for(const a of r.attackers){if(a.hp<=0||a.hp<=(towerDamage.get(a)||0)*dt)continue;const d=(a.x-t.x)**2+(a.y-t.y)**2;if(d<dist){best=a;dist=d}}
 if(best){towerDamage.set(best,(towerDamage.get(best)||0)+24);if(!towerFx)towerFx={from:t,to:best}}
}
const hunterTargets=new Map();
for(const m of hunters){
 if(m.raidStun>0)continue;
 let best=null,dist=Infinity;
 for(const a of r.attackers){if(a.hp<=0||a.hp<=((towerDamage.get(a)||0)+35*(hunterTargets.get(a)?.length||0))*dt)continue;const d=(m.x-a.x)**2+(m.y-a.y)**2;if(d<dist){best=a;dist=d}}
 if(best&&!m.job){const dx=best.x-m.x,dy=best.y-m.y,d=Math.hypot(dx,dy);if(d>115){const step=Math.min(d-115,65*dt*(m.raidSlow>0?.45:1));m.x=Math.max(20,Math.min(780,m.x+dx/d*step));m.y=Math.max(20,Math.min(460,m.y+dy/d*step))}}
 if(best&&(m.x-best.x)**2+(m.y-best.y)**2<22500){if(!hunterTargets.has(best))hunterTargets.set(best,[]);hunterTargets.get(best).push(m)}
}
for(const a of r.attackers){if(a.hp<=0)continue;const spec=MODES[a.type]||MODES.raiders;
 const dx=415-a.x,dy=265-a.y,d=Math.hypot(dx,dy);
 const range=a.type==='mages'?175:a.type==='boss'?42:24;
 if(d>range){const speed=spec.speed*dt;a.x+=dx/d*Math.min(d-range,speed);a.y+=dy/d*Math.min(d-range,speed)}
 else{a.cooldown-=dt;if(a.cooldown<=0){
  a.cooldown=a.type==='mages'?2.4:a.type==='boss'?4:a.type==='zombies'?4.5:3;
  if(a.type==='raiders'){const key=RESOURCE_KEYS.find(k=>s.stock?.[k]>0);if(key){const amount=Math.min(s.stock[key],spec.damage,Math.max(0,(r.lootBudget??Infinity)-r.stolen));if(amount>0){s.stock[key]-=amount;r.stolen+=amount;events.push({kind:"stolen",key,amount})}}}
  else{const targets=(s.minions||[]).filter(m=>m.status==='healthy'||m.status==='wounded').sort((m,n)=>Math.hypot(m.x-a.x,m.y-a.y)-Math.hypot(n.x-a.x,n.y-a.y));
   const maxTargets=a.type==='boss'?3:a.type==='mages'?2:1;
   const radius=a.type==='mages'?230:a.type==='boss'?130:90;
   for(const m of targets.filter(m=>Math.hypot(m.x-a.x,m.y-a.y)<=radius).slice(0,maxTargets)){
    const hit=a.type==='boss'?20:a.type==='mages'?(a.element==='fire'?16:a.element==='earth'?14:12):4;
    const previousHp=Number(m.hp)||100;m.hp=Math.max(1,previousHp-hit);r.stats.receivedDamage+=Math.max(0,previousHp-m.hp);if(a.type==='mages'&&a.element==='water')m.raidSlow=Math.max(m.raidSlow||0,3);
    if(a.type==='mages'&&a.element==='wind'){const vx=m.x-415,vy=m.y-265,len=Math.hypot(vx,vy)||1;m.x+=vx/len*16;m.y+=vy/len*16}
    if(a.type==='mages'&&a.element==='lightning')m.raidStun=Math.max(m.raidStun||0,1.5);
    if(m.hp<=25){m.status='critical';if(root.RoyalRescue)root.RoyalRescue.requeue(s,m);else m.job=null}else if(m.hp<=60)m.status='wounded';
    events.push({kind:"hit",type:a.type,element:a.element,damage:hit,from:{x:a.x,y:a.y},to:{x:m.x,y:m.y}})
   }
  }
 }}
 const guards=(hunterTargets.get(a)||[]).filter(m=>m.status==='healthy'&&!(m.raidStun>0)).length;
 const towerHit=towerDamage.get(a)||0;
 const defense=35*guards+towerHit;
 if(defense>0){const actual=Math.min(a.hp,defense*dt);r.stats.towerDamage+=actual*towerHit/defense;r.stats.hunterDamage+=actual*35*guards/defense;a.hp-=defense*dt;if(a.hp<=0){r.defeated++;events.push({kind:"defeated"})}}
}
if(towerFx){r.fxCooldown=(r.fxCooldown||0)-dt;if(r.fxCooldown<=0){r.fxCooldown=.35;events.push({kind:"towerFx",from:towerFx.from,to:{x:towerFx.to.x,y:towerFx.to.y}})}}
r.attackers=r.attackers.filter(a=>a.hp>0);
if(before>0&&!r.attackers.length){r.completed=(r.completed||0)+1;r.completedCity=s.city;
 const reward=(REWARDS[r.mode]||8)+Math.max(0,r.wave-1-(r.failed||0))*2;
 if(!r.lastRewardedWave||r.lastRewardedWave<r.wave){r.lastRewardedWave=r.wave;s.stock.wood=(s.stock.wood||0)+reward;s.stock.stone=(s.stock.stone||0)+Math.ceil(reward/2);events.push({kind:"reward",wood:reward,stone:Math.ceil(reward/2)})}
 result("clear");events.push({kind:"clear",mode:r.mode,wave:r.wave,defeated:r.defeated,stolen:r.stolen})}
if(r.attackers.length){if(r.battleTime>=300){r.failed=(r.failed||0)+1;r.attackers=[];result('failed');events.push({kind:'failed',mode:r.mode,wave:r.wave,stolen:r.stolen})}}
return events}
root.RoyalRaids={MODES,REWARDS,init,tick,spawn,available,towerPosition,TOWER_RANGE};
})(typeof globalThis!=="undefined"?globalThis:this);
