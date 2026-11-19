const test = require('node:test');
const assert = require('node:assert/strict');
require('../game-core.js');
require('../raids.js');
const C = globalThis.RoyalCore, R = globalThis.RoyalRaids;
function state(){return C.migrate({city:1,cityLevel:15,stock:{wood:10,stone:10},minions:[],objects:[],buildings:[{type:'watchtower',x:415,y:265}]});}
function storage(){const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};}
test('victory reward survives reload without duplication',()=>{
 const s=state(), db=storage(); R.spawn(s,'boss');
 Object.assign(s.raids.attackers[0],{x:415,y:265,hp:1});
 const events=R.tick(s,.1); assert.equal(events.filter(e=>e.kind==='reward').length,1);
 C.save(db,s); const restored=C.load(db);
 assert.equal(restored.stock.wood,34); assert.equal(restored.stock.stone,22);
 assert.equal(R.available(restored),false); assert.equal(R.spawn(restored,'boss'),null);
 assert.equal(R.tick(restored,.1).filter(e=>e.kind==='reward').length,0);
 assert.equal(restored.stock.wood,34);
});
test('timeout grants no reward and allows retry after reload',()=>{
 const s=state(),db=storage(); R.spawn(s,'boss'); s.raids.battleTime=299.95;
 assert.ok(R.tick(s,.1).some(e=>e.kind==='failed')); assert.equal(s.stock.wood,10);
 C.save(db,s);const restored=C.load(db);
 assert.equal(restored.raids.lastBattle.status,'failed'); assert.ok(R.available(restored));
 assert.ok(R.spawn(restored,'boss')); assert.equal(restored.raids.wave,2);
 assert.equal(restored.raids.battleTime,0);
});
test('active raid survives save and reload',()=>{
 const s=state(),db=storage();R.spawn(s,'raiders');R.tick(s,.1);
 C.save(db,s);const restored=C.load(db);assert.deepEqual(restored.raids,s.raids);
 assert.equal(R.spawn(restored,'boss'),null);R.tick(restored,.1);
 assert.ok(restored.raids.battleTime>s.raids.battleTime);
});
