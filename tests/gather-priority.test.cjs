const test=require('node:test');const assert=require('node:assert/strict');require('../game-core.js');const C=globalThis.RoyalCore;
function state(){return C.migrate({city:1,stock:{},minions:[{x:100,y:100,job:null}],objects:[{x:110,y:110,type:0,amount:1},{x:400,y:400,type:2,amount:1}],queue:[]})}
test('selected type takes priority over distance',()=>{let s=state();s.gatherFocus=2;assert.equal(C.autoAssign(s,s.minions[0]),true);assert.equal(s.minions[0].job.type,2)});
test('falls back to available resource if priority type depleted',()=>{let s=state();s.gatherFocus=2;s.objects[1].amount=0;C.autoAssign(s,s.minions[0]);assert.equal(s.minions[0].job.type,0)});
test('nearest resource used when priority disabled',()=>{let s=state();s.gatherFocus=-1;C.autoAssign(s,s.minions[0]);assert.equal(s.minions[0].job.type,0)});
test('priority persists in compatible v3 save',()=>{let s=state();s.gatherFocus=3;let m=new Map(),storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};C.save(storage,s);assert.equal(C.load(storage).gatherFocus,3)});
