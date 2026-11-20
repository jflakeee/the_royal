const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
test('mobile raid stress keeps visual pools bounded',async({page},info)=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:8080/');
 await expect.poll(()=>page.evaluate(()=>typeof window.royal3DPerf==='function'&&document.querySelector('[role="alert"]')?.style.display==='none'),{timeout:30000}).toBe(true);
 const samples=[];
 for(let round=0;round<3;round++){
  await page.evaluate(()=>{const s=window.royal3DState();s.endingComplete=false;s.cityLevel=15;s.raids.attackers=[];delete s.raids.completedCity;globalThis.RoyalRaids.spawn(s,'zombies');for(const a of s.raids.attackers)a.hp=10;});
  await expect.poll(()=>page.evaluate(()=>window.royal3DPerf().samples)).toBeGreaterThan(10);
  for(let i=0;i<5;i++){
   await page.evaluate(()=>{for(let j=0;j<100;j++)window.royal3DRaidFx({kind:'hit',element:'fire',from:{x:400,y:250},to:{x:430,y:280}})});
   const p=await page.evaluate(()=>window.royal3DPerf());samples.push({round,...p});
   expect(p.activeFx+p.pooledFx).toBeLessThanOrEqual(24);
   expect(p.pooledResources).toBeLessThanOrEqual(128);
   await page.waitForTimeout(500);
  }
  await page.evaluate(()=>{window.royal3DState().raids.attackers=[]});
  await page.waitForTimeout(600);
 }
 const file=info.outputPath('mobile-perf.json');await fs.writeFile(file,JSON.stringify(samples,null,2));await info.attach('mobile-perf',{path:file,contentType:'application/json'});
});
