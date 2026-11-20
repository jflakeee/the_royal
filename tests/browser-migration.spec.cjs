const {test,expect}=require('@playwright/test');
test('ten sequential city migrations preserve legacy and history after reload',async({page})=>{
 test.setTimeout(120000);
 await page.goto('http://127.0.0.1:8080/');
 await expect.poll(()=>page.evaluate(()=>typeof window.royal3DState==='function'&&document.querySelector('[role="alert"]')?.style.display==='none'),{timeout:30000}).toBe(true);
 for(let i=0;i<10;i++){
  const before=await page.evaluate(()=>{const s=window.royal3DState();return {city:s.city,history:s.history.length,valor:s.legacy?.valor||0}});
  await page.evaluate(()=>{const s=window.royal3DState();s.endingComplete=true;s.raids.completedCity=s.city;s.raids.lastBattle={status:'clear',mode:'boss',defeated:1,seconds:1,wounded:0,critical:0,stolen:0};document.getElementById('city-continue').click()});
  await expect.poll(()=>page.evaluate(()=>window.royal3DState().city)).toBe(before.city+1);
  const after=await page.evaluate(()=>{const s=window.royal3DState();return {city:s.city,history:s.history.length,valor:s.legacy.valor}});
  expect(after.history).toBe(before.history+1);
  expect(after.valor).toBe(Math.min(10,before.valor+1));
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>typeof window.royal3DState==='function'),{timeout:30000}).toBe(true);
  expect(await page.evaluate(()=>window.royal3DState().legacy.valor)).toBe(after.valor);
 }
});
