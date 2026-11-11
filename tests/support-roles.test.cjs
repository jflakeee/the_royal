const test=require('node:test');const assert=require('node:assert/strict');require('../game-core.js');const C=globalThis.RoyalCore;
function state(){return C.migrate({city:1,stock:{wood:30,stone:30,flower:5},minions:[{id:'a',x:415,y:265,job:null},{id:'b',x:415,y:265,job:null,status:'wounded',hp:40}],objects:[{x:100,y:100,type:2,amount:1}],queue:[]})}
test('builder autonomously constructs an affordable building',()=>{let s=state(),m=s.minions[0];C.setRole(m,'builder');assert.equal(C.autoBuild(s,m),true);assert.equal(s.buildings.length,1);assert.equal(C.autoAssign(s,m),false)});
test('builder respects automation toggle',()=>{let s=state(),m=s.minions[0];C.setRole(m,'builder');s.autoGather=false;assert.equal(C.autoBuild(s,m),false)});
test('healer treats wounded ally at town',()=>{let s=state(),m=s.minions[0];C.setRole(m,'healer');assert.equal(C.autoHeal(s,m),true);assert.equal(s.minions[1].status,'healthy');assert.equal(s.stock.flower,4)});
test('healer does not treat patient away from town',()=>{let s=state(),m=s.minions[0];C.setRole(m,'healer');s.minions[1].x=100;assert.equal(C.autoHeal(s,m),false)});
test('healer prioritizes flowers when gathering',()=>{let s=state(),m=s.minions[0];C.setRole(m,'healer');assert.equal(C.autoAssign(s,m),true);assert.equal(m.job.type,2)});
test('new roles persist in v3 saves',()=>{let s=state();C.setRole(s.minions[0],'builder');C.setRole(s.minions[1],'healer');let map=new Map(),store={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};C.save(store,s);assert.deepEqual(C.load(store).minions.map(m=>m.role),['builder','healer'])});
