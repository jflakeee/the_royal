const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('reset asks confirmation before mutating state',()=>{assert.match(html,/id\('reset'\)\.onclick=\(\)=>\{if\(!confirm\(/);assert.match(html,/계속할까요\?'\)\)return;s=Core\.migrate\(newGame\(\)\)/)});
test('queue status reports waiting and active gather jobs',()=>{assert.match(html,/id="queue-status"/);assert.match(html,/s\.queue\.length\+'건 · 진행 중 '/)});
test('mobile HUD uses compact resource and population summary',()=>{assert.match(html,/window\.innerWidth<=600\)hud\.textContent=/)});
