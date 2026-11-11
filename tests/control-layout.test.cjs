const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('all legacy control IDs remain unique',()=>{for(const id of ['reset','heal','auto','focus','worker','role'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id)});
test('controls grouped for automation and minion management',()=>{assert.match(html,/class="controls" aria-label="게임 조작 패널"/);assert.match(html,/aria-label="자동화"/);assert.match(html,/aria-label="미니언 관리"/)});
test('small screens use single-column control layout',()=>{assert.match(html,/max-width:600px/);assert.match(html,/\.controls\{grid-template-columns:minmax\(0,1fr\)/)});
