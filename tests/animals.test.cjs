const test=require('node:test');const assert=require('node:assert/strict');require('../game-core.js');require('../animal-ai.js');const A=globalThis.RoyalAnimals,C=globalThis.RoyalCore;
const state=()=>{let s=C.migrate({city:1,stock:{wood:0,stone:0,flower:0,berry:0},minions:[{x:700,y:360,job:null}],objects:[],queue:[]});A.init(s);return s};
test('four animal types spawn and persist',()=>{let s=state();assert.deepEqual(s.animals.map(a=>a.type),['rabbit','boar','wolf','bear']);assert.equal(A.init(s).animals.length,4)});
test('explicit animal attack assigns a combat job',()=>{let s=state();assert.equal(A.attack(s,'a3'),true);assert.equal(s.minions[0].job.kind,'combat')});
test('invalid animal cannot be attacked',()=>{let s=state();assert.equal(A.attack(s,'missing'),false)});
test('lethal death roll executes once',()=>{let s=state(),m=s.minions[0];m.hp=5;assert.equal(A.damage(m,10,()=>0),'dead');assert.equal(A.damage(m,10,()=>0),'ignored')});
test('nonfatal lethal roll incapacitates',()=>{let s=state(),m=s.minions[0];m.hp=5;assert.equal(A.damage(m,10,()=>.9),'critical');assert.equal(m.hp,1);assert.equal(m.job,null)});
test('rabbit does not attack idle minion',()=>{let s=state();s.minions[0].x=90;s.minions[0].y=90;let hp=s.minions[0].hp;A.tick(s,1,()=>0);assert.equal(s.minions[0].hp,hp)});
test('wolf reacts near a minion',()=>{let s=state();A.tick(s,.1,()=>.9);assert.equal(s.animals[2].state,'chase')});
