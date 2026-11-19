const assert=require('node:assert/strict');require('../animal-ai.js');require('../rescue.js');const A=globalThis.RoyalAnimals,R=globalThis.RoyalRescue;
const m={id:'m',x:100,y:100,hp:100,status:'healthy',raidStun:1,job:{kind:'retreat'}};
const s={minions:[m],animals:[],stock:{},queue:[]};A.tick(s,.1);assert.equal(m.x,100);m.raidStun=0;A.tick(s,.1);assert.ok(m.x>100);
const p={id:'p',x:200,y:100,status:'critical'};m.x=100;m.y=100;m.raidStun=1;m.job=null;s.minions.push(p);R.rescue(s,.1);assert.equal(m.job,null);m.job={kind:'rescue',patientId:'p'};R.rescue(s,.1);assert.equal(m.x,100);m.raidStun=0;R.rescue(s,.1);assert.ok(m.x>100);m.status='critical';R.rescue(s,.1);assert.equal(m.job,null);console.log('PASS stun and rescue ownership');
