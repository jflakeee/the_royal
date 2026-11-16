const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
  await page.waitForSelector('#world');
  await page.selectOption('#focus','2');
  await page.selectOption('#role','wood');
  await page.evaluate(()=>{s.autoGather=false;s.stock.wood=17;s.city=3;save()});
  const before=await page.evaluate(()=>({city:s.city,wood:s.stock.wood,focus:s.gatherFocus,role:s.minions[0].role,saved:!!localStorage.getItem('royal-save-v3')}));
  assert.deepEqual(before,{city:3,wood:17,focus:2,role:'wood',saved:true});
  await page.reload({waitUntil:'load'});
  const after=await page.evaluate(()=>({city:s.city,wood:s.stock.wood,focus:s.gatherFocus,role:s.minions[0].role}));
  assert.deepEqual(after,{city:3,wood:17,focus:2,role:'wood'});
  const layout=await page.evaluate(()=>({viewport:innerWidth,body:document.body.scrollWidth,queue:!!document.querySelector('#queue-select'),warning:!!document.querySelector('#save-warning')}));
  assert.ok(layout.body<=layout.viewport+2,'horizontal overflow: '+JSON.stringify(layout));
  assert.ok(layout.queue&&layout.warning);
  // Force localStorage writes to fail in the actual page, then recover.
  const failure=await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(){throw new DOMException('Storage full','QuotaExceededError')};
    s.stock.wood=23;
    const saved=save();
    const warning=document.getElementById('save-warning').classList.contains('visible');
    const previous=JSON.parse(localStorage.getItem('royal-save-v3')).stock.wood;
    Storage.prototype.setItem=original;
    return {saved,warning,previous};
  });
  assert.deepEqual(failure,{saved:false,warning:true,previous:17});
  await page.getByRole('button',{name:'다시 저장'}).click();
  assert.equal(await page.locator('#save-warning').evaluate(el=>el.classList.contains('visible')),false);
  await page.reload({waitUntil:'load'});
  assert.equal(await page.evaluate(()=>s.stock.wood),23);
  console.log('PASS Chromium injected quota failure, manual retry and reload recovery');
  if(await page.locator('#view-toggle').count()){
    await page.waitForFunction(()=>document.querySelector('#royal-3d canvas')||document.querySelector('#view-toggle').disabled,{timeout:15000});
    assert.equal(await page.locator('#view-toggle').isDisabled(),false,'WebGL initialization failed');
    await page.locator('#view-toggle').click();
    await page.waitForTimeout(1200);
    await page.waitForFunction(()=>/^FPS \\d+$/.test(document.querySelector('#royal-fps')?.textContent||''),{timeout:5000});
    const liveFps=await page.locator('#royal-fps').textContent();
    console.log('INFO actual rendered frames per second in headless Chromium: '+liveFps);
    assert.equal(await page.locator('#royal-3d').isVisible(),true);
    assert.equal(await page.locator('#world').isVisible(),false);
    assert.equal(await page.locator('#royal-3d canvas').count(),1);
    const perf=await page.evaluate(()=>window.royal3DPerf());
    assert.ok(perf.samples>0&&Number.isFinite(perf.averageMs)&&perf.drawCalls>0,'3D renderer must produce measurable frames');
    console.log('INFO headless Chromium 3D performance (not physical mobile FPS): '+JSON.stringify(perf));
    const dimensions=await page.locator('#royal-3d canvas').evaluate(el=>({width:el.clientWidth,height:el.clientHeight}));
    assert.ok(dimensions.width>=300&&dimensions.height>=300,'3D canvas must fit mobile viewport');
    const candidate=await page.evaluate(()=>window.royal3DVisibleResources().find(o=>o.type===0)||window.royal3DVisibleResources()[0]);
    assert.ok(candidate,'at least one resource must be visible in 3D');
    await page.evaluate(()=>{s.minions.forEach(m=>m.job=null);s.queue=[];s.autoGather=false});
    await page.locator('#royal-3d canvas').click({position:{x:candidate.x,y:candidate.y}});
    const commanded=await page.evaluate(()=>s.minions.some(m=>m.job&&m.job.type>=0)||s.queue.length>0);
    assert.ok(commanded,'3D resource click should create a real gathering command');
    const snapshot=await page.evaluate(()=>({city:s.city,wood:s.stock.wood,role:s.minions[0].role}));
    await page.locator('#view-toggle').click();
    assert.equal(await page.locator('#world').isVisible(),true);
    assert.deepEqual(await page.evaluate(()=>({city:s.city,wood:s.stock.wood,role:s.minions[0].role})),snapshot);
    console.log('PASS 3D toggle and WebGL canvas initialization');
  }
  for(const width of [320,375,768]){
    await page.setViewportSize({width,height:844});
    const measure=await page.evaluate(()=>({viewport:innerWidth,body:document.body.scrollWidth}));
    assert.ok(measure.body<=measure.viewport+2,'responsive overflow '+JSON.stringify(measure));
  }
  console.log('PASS responsive layout at 320, 375, 390 and 768 CSS px');
  assert.deepEqual(errors,[]);
  console.log('PASS Chromium reload persistence and 390px mobile layout');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
