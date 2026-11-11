const test=require('node:test');const assert=require('node:assert/strict');require('../game-core.js');const C=globalThis.RoyalCore;
function state(){return C.migrate({city:1,stock:{wood:0,stone:0,flower:0,berry:0},minions:[{x:415,y:265,job:null}],objects:[{x:100,y:100,type:0,amount:0},{x:300,y:300,type:0,amount:1},{x:250,y:250,type:1,amount:1}],queue:[]})}
test('retarget selects an active node of the same resource type',()=>{let s=state(),j={x:100,y:100,type:0,phase:'work',progress:1};assert.equal(C.retarget(s,j),true);assert.deepEqual([j.x,j.y,j.phase,j.progress],[300,300,'travel',0])});
test('retarget fails when all nodes of requested type are exhausted',()=>{let s=state(),j={x:100,y:100,type:2,phase:'travel'};assert.equal(C.retarget(s,j),false);assert.equal(j.x,100)});
test('retarget does not redirect to another resource type',()=>{let s=state(),j={x:100,y:100,type:0};s.objects[1].amount=0;assert.equal(C.retarget(s,j),false)});
