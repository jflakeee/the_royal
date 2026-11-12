const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('queue actions have distinct accessible controls',()=>{for(const id of ['queue-first','queue-cancel','queue-select'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);assert.match(html,/aria-label="채집 명령 대기열 관리"/)});
test('priority promotes selected queued job',()=>{assert.match(html,/s\.queue\.splice\(i,1\)\[0\];s\.queue\.unshift\(job\)/);assert.match(html,/i<1\|\|i>=s\.queue\.length/)});
test('cancel removes only selected waiting job',()=>{assert.match(html,/s\.queue\.splice\(i,1\);syncQueue\(\)/);assert.match(html,/i<0\|\|i>=s\.queue\.length/)});
test('queue selector updates only when queue contents change',()=>{assert.match(html,/if\(signature===queueSignature\)return/);assert.match(html,/queueSelect\.disabled=!s\.queue\.length/)});
