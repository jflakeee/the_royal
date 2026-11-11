const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');require('../game-core.js');require('../animal-ai.js');const A=globalThis.RoyalAnimals,C=globalThis.RoyalCore;
function state(hp=100){let s=C.migrate({city:1,stock:{wood:0,stone:0,flower:4,berry:0},minions:[{x:700,y:360,hp,status:hp<=60?'wounded':'healthy',job:null}],objects:[]});A.init(s);return s}
test('HTML inline script parses',()=>{let html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');let js=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);assert.ok(js.length);for(let code of js)new vm.Script(code)});
test('wolf victim defends automatically after being attacked',()=>{let s=state();s.animals[2].x=700;s.animals[2].y=360;A.tick(s,.1,()=>.9);assert.equal(s.minions[0].job.kind,'combat')});
test('low health victim retreats',()=>{let s=state(38);A.tick(s,.1,()=>.9);assert.equal(s.minions[0].job.kind,'retreat')});
test('flowers restore wounded minion',()=>{let s=state(50),m=s.minions[0];assert.equal(C.heal(s,m),true);assert.equal(m.hp,80);assert.equal(s.stock.flower,3)});
test('dead minion cannot be healed',()=>{let s=state(),m=s.minions[0];m.status='dead';assert.equal(C.heal(s,m),false)});
