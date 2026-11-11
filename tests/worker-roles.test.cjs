const test=require('node:test');const assert=require('node:assert/strict');require('../game-core.js');const C=globalThis.RoyalCore;
function state(){return C.migrate({city:1,stock:{},minions:[{x:100,y:100,job:null}],objects:[{x:110,y:110,type:0,amount:1},{x:400,y:400,type:2,amount:1}],queue:[]})}
test('specialized worker prioritizes their assigned resource',()=>{let s=state(),m=s.minions[0];assert.equal(C.setRole(m,'flower'),true);assert.equal(C.autoAssign(s,m),true);assert.equal(m.job.type,2)});
test('worker falls back when specialized resource is depleted',()=>{let s=state(),m=s.minions[0];C.setRole(m,'flower');s.objects[1].amount=0;C.autoAssign(s,m);assert.equal(m.job.type,0)});
test('invalid role cannot be assigned',()=>{let m=state().minions[0];assert.equal(C.setRole(m,'combat'),false);assert.equal(m.role,'general')});
test('experience improves gathering speed with a floor',()=>{let m=state().minions[0],initial=C.gatherTime(m);m.gatherXp=20;assert.ok(C.gatherTime(m)<initial);m.gatherXp=100000;assert.equal(C.gatherTime(m),.55)});
test('role and experience persist in v3 save',()=>{let s=state();C.setRole(s.minions[0],'wood');s.minions[0].gatherXp=42;let map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};C.save(storage,s);let restored=C.load(storage);assert.equal(restored.minions[0].role,'wood');assert.equal(restored.minions[0].gatherXp,42)});
