const {test,expect}=require('@playwright/test');
const url='http://127.0.0.1:8080/';
async function ready(page){
 await page.goto(url);
 await expect.poll(()=>page.evaluate(()=>typeof window.royal3DPerf==='function'&&getComputedStyle(document.getElementById('writer-panel')).display==='none'),{timeout:30000}).toBe(true);
}
test('graphics preference persists without changing game save',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await ready(page);
 const initial=await page.evaluate(()=>{const s=window.royal3DState();return {city:s.city,history:s.history.length,legacy:{...s.legacy}}});
 await page.locator('#game-settings').evaluate(el=>el.open=true);
 const setting=page.locator('#graphics-quality');
 await expect(setting).toHaveValue('auto');
 await setting.selectOption('performance');
 await expect.poll(()=>page.evaluate(()=>window.royal3DPerf().qualityMode)).toBe('performance');
 expect(await page.evaluate(()=>window.royal3DPerf().pixelRatio)).toBeLessThanOrEqual(.65);
 expect(await page.evaluate(()=>{const s=window.royal3DState();return {city:s.city,history:s.history.length,legacy:{...s.legacy}}})).toEqual(initial);
 await page.reload();
 await expect.poll(()=>page.evaluate(()=>window.royal3DPerf?.().qualityMode&&document.getElementById('writer-panel')&&getComputedStyle(document.getElementById('writer-panel')).display==='none')).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.royal3DPerf().qualityMode)).toBe('performance');
 await page.locator('#game-settings').evaluate(el=>el.open=true);
 await expect(setting).toHaveValue('performance');
 await setting.selectOption('quality');
 await expect.poll(()=>page.evaluate(()=>window.royal3DPerf().qualityMode)).toBe('quality');
 expect(await page.evaluate(()=>window.royal3DPerf().pixelRatio)).toBeLessThanOrEqual(1);
 await setting.selectOption('auto');
 await expect.poll(()=>page.evaluate(()=>window.royal3DPerf().qualityMode)).toBe('auto');
 expect(await page.evaluate(()=>localStorage.getItem('royal-graphics-v1'))).toBe('auto');
});
