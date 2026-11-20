const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
test('automatic play survives repeated saves and reloads',async({page},info)=>{
 test.setTimeout(180000);
 await page.setViewportSize({width:390,height:844});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url='http://127.0.0.1:8080/';
 const read=()=>page.evaluate(()=>{const s=window.royal3DState();return {city:s.city,stock:s.stock,collected:s.lifetimeCollected||{},population:s.minions.length,buildings:s.buildings.length,queue:s.queue.length,perf:window.royal3DPerf?.()||null,saved:!!localStorage.getItem('royal-save-v3')}});
 const total=s=>Object.values(s.collected).reduce((n,v)=>n+v,0);
 const samples=[];
 await page.goto(url);
 await expect.poll(()=>page.evaluate(()=>typeof window.royal3DState==='function'&&typeof window.royal3DPerf==='function'&&getComputedStyle(document.getElementById('writer-panel')).display==='none'),{timeout:30000}).toBe(true);
 const start=await read();
 for(let round=0;round<3;round++){
  await page.waitForTimeout(30000);
  const before=await read();samples.push({round,phase:'before',...before});
  expect(before.saved).toBe(true);
  for(const v of Object.values(before.stock))expect(Number.isFinite(v)&&v>=0).toBe(true);
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>typeof window.royal3DState==='function'&&typeof window.royal3DPerf==='function'),{timeout:30000}).toBe(true);
  const after=await read();samples.push({round,phase:'after',...after});
  expect(after.city).toBe(before.city);
  expect(total(after)).toBeGreaterThanOrEqual(total(before));
 }
 expect(total(samples.at(-1))).toBeGreaterThan(total(start));
 expect(errors).toEqual([]);
 const file=info.outputPath('autoplay.json');await fs.writeFile(file,JSON.stringify(samples,null,2));await info.attach('autoplay',{path:file,contentType:'application/json'});
});
