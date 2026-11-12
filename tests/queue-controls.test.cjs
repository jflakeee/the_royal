const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('queue actions have distinct accessible controls',()=>{for(const id of ['queue-first','queue-cancel'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);assert.match(html,/aria-label="채집 명령 대기열 관리"/)});
test('priority promotes last queued job only when two jobs exist',()=>{assert.match(html,/s\.queue\.length<2/);assert.match(html,/const job=s\.queue\.pop\(\);s\.queue\.unshift\(job\)/)});
test('cancel removes only last waiting job',()=>{assert.match(html,/if\(!s\.queue\.length\)/);assert.match(html,/s\.queue\.pop\(\);log\.textContent='✖️ 마지막 대기 명령 취소'/)});
