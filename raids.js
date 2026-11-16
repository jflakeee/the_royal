(function(root){"use strict";
const INTERVAL=300, MAX_ATTACKERS=72, RESOURCE_KEYS=["wood","stone","flower","berry","meat"];
function init(s){if(!s.raids||typeof s.raids!=="object")s.raids={elapsed:0,wave:0,attackers:[],stolen:0,defeated:0};const r=s.raids;r.elapsed=Number.isFinite(r.elapsed)?Math.max(0,r.elapsed):0;r.wave=Number.isFinite(r.wave)?Math.max(0,Math.floor(r.wave)):0;r.attackers=Array.isArray(r.attackers)?r.attackers:[];r.stolen=Number.isFinite(r.stolen)?Math.max(0,r.stolen):0;r.defeated=Number.isFinite(r.defeated)?Math.max(0,r.defeated):0;return r}
const MODES={boss:{label:"👹 보스 몬스터",count:1,hp:1800,speed:12,damage:4},raiders:{label:"⚔️ 대량 약탈자",count:48,hp:48,speed:28,damage:1},mages:{label:"🔥 원소 마법사",count:5,hp:320,speed:20,damage:3},zombies:{label:"🧟 초대량 좀비떼",count:180,hp:24,speed:15,damage:1}};
function available(s){const r=init(s);return r.elapsed>=INTERVAL&&!r.attackers.length}
function spawn(s,mode){const r=init(s),spec=MODES[mode];if(!spec||!available(s))return null;
 r.elapsed=0;r.wave++;r.mode=mode;const count=spec.count;
 r.attackers=Array.from({length:count},(_,i)=>{const angle=2*Math.PI*i/count;return {id:mode+"-"+r.wave+"-"+i,type:mode,x:415+Math.cos(angle)*550,y:265+Math.sin(angle)*410,hp:spec.hp+r.wave*3,cooldown:0}});
 return {kind:"start",wave:r.wave,count,mode,label:spec.label}}
function tick(s,dt){const r=init(s),events=[];if(s.endingComplete)return events;dt=Math.max(0,Math.min(.1,Number(dt)||0));r.elapsed+=dt;

for(const a of r.attackers){if(a.hp<=0)continue;const dx=415-a.x,dy=265-a.y,d=Math.hypot(dx,dy);if(d>24){const speed=(MODES[a.type]?.speed||20)*dt;a.x+=dx/d*Math.min(d-24,speed);a.y+=dy/d*Math.min(d-24,speed)}else{a.cooldown-=dt;if(a.cooldown<=0){a.cooldown= a.type==='mages'?1.5:3;const key=RESOURCE_KEYS.find(k=>s.stock?.[k]>0);if(key){s.stock[key]=Math.max(0,s.stock[key]-(MODES[a.type]?.damage||1));r.stolen++;events.push({kind:"stolen",key})}}}
const guard=(s.minions||[]).find(m=>m.status==="healthy"&&m.role==="hunter"&&Math.hypot(m.x-a.x,m.y-a.y)<90);if(guard){a.hp-=35*dt;if(a.hp<=0){r.defeated++;events.push({kind:"defeated"})}}
}
r.attackers=r.attackers.filter(a=>a.hp>0);
return events}
root.RoyalRaids={INTERVAL,MODES,init,tick,spawn,available};
})(typeof globalThis!=="undefined"?globalThis:this);
