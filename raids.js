(function(root){"use strict";
const INTERVAL=300, MAX_ATTACKERS=72, RESOURCE_KEYS=["wood","stone","flower","berry","meat"];
function init(s){if(!s.raids||typeof s.raids!=="object")s.raids={elapsed:0,wave:0,attackers:[],stolen:0,defeated:0};const r=s.raids;r.elapsed=Number.isFinite(r.elapsed)?Math.max(0,r.elapsed):0;r.wave=Number.isFinite(r.wave)?Math.max(0,Math.floor(r.wave)):0;r.attackers=Array.isArray(r.attackers)?r.attackers:[];r.stolen=Number.isFinite(r.stolen)?Math.max(0,r.stolen):0;r.defeated=Number.isFinite(r.defeated)?Math.max(0,r.defeated):0;return r}
const MODES={boss:{label:"👹 보스 몬스터",count:1,hp:1800,speed:12,damage:4},raiders:{label:"⚔️ 대량 약탈자",count:48,hp:48,speed:28,damage:1},mages:{label:"🔥 원소 마법사",count:5,hp:320,speed:20,damage:3},zombies:{label:"🧟 초대량 좀비떼",count:180,hp:24,speed:15,damage:1}};
function available(s){const r=init(s);return r.elapsed>=INTERVAL&&!r.attackers.length}
function spawn(s,mode){const r=init(s),spec=MODES[mode];if(!spec||!available(s))return null;
 r.elapsed=0;r.wave++;r.mode=mode;const count=spec.count;
 r.attackers=Array.from({length:count},(_,i)=>{const angle=2*Math.PI*i/count;return {id:mode+"-"+r.wave+"-"+i,type:mode,x:415+Math.cos(angle)*550,y:265+Math.sin(angle)*410,hp:spec.hp+r.wave*3,cooldown:0,element:mode==="mages"?["fire","water","wind","earth","lightning"][i%5]:null}});
 return {kind:"start",wave:r.wave,count,mode,label:spec.label}}
function tick(s,dt){const r=init(s),events=[];if(s.endingComplete)return events;dt=Math.max(0,Math.min(.1,Number(dt)||0));r.elapsed+=dt;
const before=r.attackers.length;
for(const a of r.attackers){if(a.hp<=0)continue;const spec=MODES[a.type]||MODES.raiders;
 const dx=415-a.x,dy=265-a.y,d=Math.hypot(dx,dy);
 const range=a.type==='mages'?175:a.type==='boss'?42:24;
 if(d>range){const speed=spec.speed*dt;a.x+=dx/d*Math.min(d-range,speed);a.y+=dy/d*Math.min(d-range,speed)}
 else{a.cooldown-=dt;if(a.cooldown<=0){
  a.cooldown=a.type==='mages'?2.4:a.type==='boss'?4:a.type==='zombies'?4.5:3;
  if(a.type==='raiders'){const key=RESOURCE_KEYS.find(k=>s.stock?.[k]>0);if(key){const amount=Math.min(s.stock[key],spec.damage);s.stock[key]-=amount;r.stolen+=amount;events.push({kind:"stolen",key,amount})}}
  else{const targets=(s.minions||[]).filter(m=>m.status==='healthy'||m.status==='wounded').sort((m,n)=>Math.hypot(m.x-a.x,m.y-a.y)-Math.hypot(n.x-a.x,n.y-a.y));
   const maxTargets=a.type==='boss'?3:a.type==='mages'?2:1;
   const radius=a.type==='mages'?230:a.type==='boss'?130:90;
   for(const m of targets.filter(m=>Math.hypot(m.x-a.x,m.y-a.y)<=radius).slice(0,maxTargets)){
    const hit=a.type==='boss'?20:a.type==='mages'?(a.element==='fire'?16:a.element==='earth'?14:12):4;
    m.hp=Math.max(1,(Number(m.hp)||100)-hit);if(a.type==='mages'&&a.element==='water')m.raidSlow=Math.max(m.raidSlow||0,3);if(a.type==='mages'&&a.element==='wind')m.raidDisplaced=(m.raidDisplaced||0)+1;
    if(m.hp<=25){m.status='critical';m.job=null}else if(m.hp<=60)m.status='wounded';
    events.push({kind:"hit",type:a.type,element:a.element,damage:hit})
   }
  }
 }}
 const guards=(s.minions||[]).filter(m=>m.status==='healthy'&&m.role==='hunter'&&Math.hypot(m.x-a.x,m.y-a.y)<90);
 if(guards.length){a.hp-=35*dt*Math.min(3,guards.length);if(a.hp<=0){r.defeated++;events.push({kind:"defeated"})}}
}
r.attackers=r.attackers.filter(a=>a.hp>0);
if(before>0&&!r.attackers.length){r.completed=(r.completed||0)+1;
 const reward=Math.max(2,Math.floor((MODES[r.mode]?.count||1)/8)+r.wave*2);
 if(!r.lastRewardedWave||r.lastRewardedWave<r.wave){r.lastRewardedWave=r.wave;s.stock.wood=(s.stock.wood||0)+reward;s.stock.stone=(s.stock.stone||0)+Math.ceil(reward/2);events.push({kind:"reward",wood:reward,stone:Math.ceil(reward/2)})}
 events.push({kind:"clear",mode:r.mode,wave:r.wave,defeated:r.defeated,stolen:r.stolen})}
return events}
root.RoyalRaids={INTERVAL,MODES,init,tick,spawn,available};
})(typeof globalThis!=="undefined"?globalThis:this);
