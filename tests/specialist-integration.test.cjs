const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('newly assigned combat jobs bypass gathering movement',()=>{assert.match(html,/if\(m\.job&&\["combat","retreat","rescue"\]\.includes\(m\.job\.kind\)\)continue;if\(!m\.job\)continue/);});
test('automatic treatment skips legacy path while a healthy healer exists',()=>{assert.match(html,/!s\.minions\.some\(m=>m\.role==="healer"&&m\.status==="healthy"\)&&Rescue\.treat\(s\)/);});
test('automatic construction skips legacy path while a healthy builder exists',()=>{assert.match(html,/!s\.minions\.some\(m=>m\.role==="builder"&&m\.status==="healthy"\)&&Core\.build\(s,type\)/);});
