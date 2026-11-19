const {test,expect}=require('@playwright/test');
const url='http://127.0.0.1:8080/';
const key='royal-save-v3';
async function ready(page){await page.goto(url);await expect(page.getByText('저장 권한 확인 중…',{exact:true})).toBeHidden();await expect.poll(()=>page.evaluate(()=>!!window.royal3DState)).toBe(true);}
test('second tab cannot overwrite active writer',async({page,context})=>{
 await ready(page);
 await expect.poll(()=>page.evaluate(k=>!!localStorage.getItem(k),key)).toBe(true);
 const other=await context.newPage();await other.goto(url);
 await expect(other.getByText(/다른 탭에서 게임이 실행 중입니다/)).toBeVisible();
 await page.close();await other.reload();
 await expect(other.getByRole('button',{name:'다시 접속',exact:true})).toBeHidden();
});
test('failed write pauses simulation and retry persists state',async({page})=>{
 await page.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='royal-save-v3'&&window.failSave)throw new DOMException('injected','QuotaExceededError');return original.call(this,k,v)}});
 await ready(page);await expect.poll(()=>page.evaluate(k=>!!localStorage.getItem(k),key)).toBe(true);
 await page.evaluate(()=>{window.failSave=true;document.querySelector('#game-settings').open=true;document.querySelector('#auto').click()});
 await expect(page.locator('#save-warning')).toBeVisible();
 const before=await page.evaluate(()=>window.royal3DState().autoGather);
 await page.evaluate(()=>document.querySelector('#auto').click());
 expect(await page.evaluate(()=>window.royal3DState().autoGather)).toBe(before);
 await page.evaluate(()=>{window.failSave=false});await page.locator('#retry-save').click();
 await expect(page.locator('#save-warning')).toBeHidden();
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).autoGather,key)).toBe(before);
 await page.reload();await expect.poll(()=>page.evaluate(()=>window.royal3DState?.().autoGather)).toBe(before);
});
