(function(root){"use strict";
const INTERVAL=300, MAX_ATTACKERS=72, RESOURCE_KEYS=["wood","stone","flower","berry","meat"];
function init(s){if(!s.raids||typeof s.raids!=="object")s.raids={elapsed:0,wave:0,attackers:[],stolen:0,defeated:0};const r=s.raids;r.elapsed=Number.isFinite(r.elapsed)?Math.max(0,r.elapsed):0;r.wave=Number.isFinite(r.wave)?Math.max(0,Math.floor(r.wave)):0;r.attackers=Array.isArray(r.attackers)?r.attackers:[];r.stolen=Number.isFinite(r.stolen)?Math.max(0,r.stolen):0;r.defeated=Number.isFinite(r.defeated)?Math.max(0,r.defeated):0;return r}
function spawn(r){r.wave++;const count=Math.min(MAX_ATTACKERS,18+r.wave*6);r.attackers=Array.from({length:count},(_,i)=>{const angle=2*Math.PI*i/count;return {id:"raider-"+r.wave+"-"+i,x:415+Math.cos(angle)*550,y:265+Math.sin(angle)*410,hp:30+r.wave*5,cooldown:0}});return {kind:"start",wave:r.wave,count}}
function tick(s,dt){const r=init(s),events=[];if(s.endingComplete)return events;dt=Math.max(0,Math.min(.1,Number(dt)||0));r.elapsed+=dt;
if(!r.attackers.length&&r.elapsed>=INTERVAL){r.elapsed-=INTERVAL;events.push(spawn(r))}
for(const a of r.attackers){if(a.hp<=0)continue;const dx=415-a.x,dy=265-a.y,d=Math.hypot(dx,dy);if(d>24){const speed=(17+Math.min(25,r.wave*2))*dt;a.x+=dx/d*Math.min(d-24,speed);a.y+=dy/d*Math.min(d-24,speed)}else{a.cooldown-=dt;if(a.cooldown<=0){a.cooldown=3;const key=RESOURCE_KEYS.find(k=>s.stock?.[k]>0);if(key){s.stock[key]--;r.stolen++;events.push({kind:"stolen",key})}}}
const guard=(s.minions||[]).find(m=>m.status==="healthy"&&m.role==="hunter"&&Math.hypot(m.x-a.x,m.y-a.y)<90);if(guard){a.hp-=35*dt;if(a.hp<=0){r.defeated++;events.push({kind:"defeated"})}}
}
r.attackers=r.attackers.filter(a=>a.hp>0);
return events}
root.RoyalRaids={INTERVAL,init,tick,spawn};
})(typeof globalThis!=="undefined"?globalThis:this);
