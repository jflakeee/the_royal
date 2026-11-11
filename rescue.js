(function(root){"use strict";
const HOME={x:415,y:265};
function requeue(s,m){if(!m.job)return;const j=m.job;if(j.kind!=="combat"&&j.kind!=="retreat"&&j.kind!=="rescue"&&!j.got&&Number.isFinite(j.x)&&Number.isFinite(j.y))s.queue.unshift({...j,phase:"travel",progress:0});m.job=null}
function stabilize(s){for(const m of s.minions){if(m.status==="dead"){requeue(s,m);continue}if(m.status==="critical"&&m.job&&m.job.kind!=="rescue")requeue(s,m)}}
function rescue(s,dt){stabilize(s);const events=[];for(const patient of s.minions){if(patient.status!=="critical"||patient.job?.kind==="rescue")continue;const d=Math.hypot(patient.x-HOME.x,patient.y-HOME.y);if(d<40)continue;const helper=s.minions.find(m=>m!==patient&&m.status==="healthy"&&!m.job);if(helper){helper.job={kind:"rescue",patientId:patient.id};events.push({kind:"rescue-start",patientId:patient.id})}}
for(const helper of s.minions){const j=helper.job;if(!j||j.kind!=="rescue")continue;const patient=s.minions.find(m=>m.id===j.patientId);if(!patient||patient.status!=="critical"){helper.job=null;continue}let target=j.carrying?HOME:patient;let d=Math.hypot(target.x-helper.x,target.y-helper.y);if(d>5){let step=Math.min(d,65*dt);helper.x+=(target.x-helper.x)/d*step;helper.y+=(target.y-helper.y)/d*step;if(j.carrying){patient.x=helper.x-10;patient.y=helper.y+5}}else if(!j.carrying){j.carrying=true;events.push({kind:"rescue-carry",patientId:patient.id})}else{patient.x=HOME.x;patient.y=HOME.y;helper.job=null;events.push({kind:"rescue-done",patientId:patient.id})}}
return events}
function treat(s){let count=0;for(const m of s.minions){if((m.status==="wounded"||m.status==="critical")&&Math.hypot(m.x-HOME.x,m.y-HOME.y)<40){if(root.RoyalCore.heal(s,m))count++}}return count}
root.RoyalRescue={HOME,requeue,stabilize,rescue,treat};
})(typeof globalThis!=="undefined"?globalThis:this);
