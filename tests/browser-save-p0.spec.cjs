const {test,expect}=require('@playwright/test');
const url='http://127.0.0.1:8080/';
const key='royal-save-v3';
async function ready(page){await page.goto(url);await expect.poll(()=>page.evaluate(()=>typeof window.royal3DState==='function'&&document.getElementById('writer-panel')!==null&&getComputedStyle(document.getElementById('writer-panel')).display==='none'),{timeout:30000}).toBe(true);}
test('second tab cannot overwrite active writer',async({page,context})=>{
 await ready(page);
 await expect.poll(()=>page.evaluate(k=>!!localStorage.getItem(k),key)).toBe(true);
 const other=await context.newPage();await other.goto(url);
 await expect(other.getByText(/다른 탭에서 게임이 실행 중입니다/)).toBeVisible();
 await page.close();await other.reload();
 await expect.poll(()=>other.evaluate(()=>typeof window.royal3DState==='function'&&document.getElementById('writer-panel')!==null&&getComputedStyle(document.getElementById('writer-panel')).display==='none'),{timeout:30000}).toBe(true);
 await expect.poll(()=>other.evaluate(k=>!!localStorage.getItem(k),key)).toBe(true);
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

test('mobile legacy preview and migration persist across reload',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(k=>{if(sessionStorage.getItem('legacy-fixture'))return;sessionStorage.setItem('legacy-fixture','1');localStorage.setItem(k,JSON.stringify({city:1,cityLevel:15,stock:{wood:100,stone:100},minions:[],objects:[],buildings:[],legacy:{valor:2}}))},key);
 await ready(page);
 const choices=page.locator('#raid-choices');
 await expect(choices).toBeHidden();
 await page.evaluate(()=>{const s=window.royal3DState();s.cityLevel=15;document.querySelector('[aria-controls="raid-choices"]')?.click()});
 if(!await choices.isVisible())await page.getByRole('button',{name:/약탈 모드 선택 가능/}).click();
 await expect(choices.locator('[data-raid-mode="boss"]')).toContainText('Lv.2 → 3');
 await page.locator('#raid-close').click();await expect(choices).toBeHidden();
 await page.evaluate(()=>{const s=window.royal3DState();s.raids.completedCity=s.city;s.raids.lastBattle={status:'clear',mode:'boss',wave:1,seconds:1,defeated:1,stolen:0,wounded:0,critical:0}});
 await expect(page.locator('#city-continue')).toBeVisible();
 await page.locator('#city-continue').click();
 await expect.poll(()=>page.evaluate(()=>window.royal3DState().legacy.valor)).toBe(3);
 await page.reload();await ready(page);
 await expect.poll(()=>page.evaluate(()=>window.royal3DState().city)).toBe(2);
 expect(await page.evaluate(()=>window.royal3DState().legacy.valor)).toBe(3);
 await page.evaluate(()=>document.querySelector('#game-settings').open=true);
 await expect(page.locator('#legacy-grid')).toContainText('Lv.3/10');
 await expect(page.locator('#legacy-grid')).toContainText('방어전 공격력 +15%');
 await page.evaluate(()=>document.querySelector('#city-history').open=true);
 await expect(page.locator('#history-list')).toContainText('제1도시');
});
