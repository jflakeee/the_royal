const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
  await page.waitForSelector('#world',{state:'attached'});
  assert.equal(await page.locator('#royal-3d > #game-hud').count(),1,'title and collection HUD must be inside the 3D host');
  assert.equal(await page.locator('#game-hud #hud').count(),1);
  assert.equal(await page.locator('#game-hud').evaluate(el=>getComputedStyle(el).position),'absolute');
  await page.screenshot({path:'royal-3d-mobile.png',fullPage:true});
  console.log('INFO UI hit test',await page.locator('#game-settings summary').evaluate(el=>{const r=el.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {rect:{x:r.x,y:r.y,width:r.width,height:r.height},hit:top?.tagName,id:top?.id,mainZ:getComputedStyle(document.querySelector('main')).zIndex,hostZ:getComputedStyle(document.querySelector('#royal-3d')).zIndex}}));
  await page.locator('#game-settings summary').click();
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
  assert.equal(await page.locator('#queue-select select').count(),0,'queue must use buttons, not native dropdown');
  // The live update loop dispatches waiting work every frame; freeze only queue
  // consumption during this control test while keeping actual DOM click handling.
  await page.evaluate(()=>{s.autoGather=false;s.minions.forEach(m=>m.job={kind:'gather',type:0,x:m.x+300,y:m.y+300,phase:'travel'});s.queue=[{type:0,x:100,y:100},{type:1,x:200,y:200}];syncQueue()});
  await page.locator('#game-settings summary').click();
  await page.waitForFunction(()=>document.querySelectorAll('#queue-select button').length===2);
  await page.locator('#queue-select button').nth(1).click({timeout:5000});
  assert.equal(await page.locator('#queue-select button').nth(1).getAttribute('aria-pressed'),'true');
  await page.locator('#queue-first').click({timeout:5000});
  assert.equal(await page.evaluate(()=>s.queue[0].type),1);
  await page.locator('#queue-cancel').click({timeout:5000});
  assert.equal(await page.evaluate(()=>s.queue.length),1);
  await page.evaluate(()=>{s.queue=[];s.minions.forEach(m=>m.job=null);syncQueue()});
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
  await page.evaluate(()=>document.getElementById('retry-save').click());
  assert.equal(await page.locator('#save-warning').evaluate(el=>el.classList.contains('visible')),false);
  await page.reload({waitUntil:'load'});
  assert.equal(await page.evaluate(()=>s.stock.wood),23);
  console.log('PASS Chromium injected quota failure, manual retry and reload recovery');
  // 3D-only viewport: no user-facing 2D mode and all controls remain accessible.
  await page.waitForFunction(()=>document.querySelector('#royal-3d canvas')||document.querySelector('#view-toggle').disabled,null,{timeout:15000});
  assert.equal(await page.locator('#view-toggle').isDisabled(),false,'WebGL initialization failed');
  await page.waitForTimeout(1200);
  await page.waitForFunction(()=>/^렌더 \d+\/s \| P95 \d+ms \| 지연 \d+$/.test(document.querySelector('#royal-fps')?.textContent||''),null,{timeout:5000});
  assert.equal(await page.locator('#royal-3d').isVisible(),true);
  const visual=await page.evaluate(()=>{
    const rect=id=>{const r=document.querySelector(id).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,bottom:r.bottom}};
    const canvas=rect('#royal-3d canvas'),host=rect('#royal-3d'),header=rect('#game-hud'),title=rect('#game-hud b'),hud=rect('#hud'),fps=rect('#royal-fps');
    const isVisible=id=>{const el=document.querySelector(id),style=getComputedStyle(el),r=el.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&r.width>0&&r.height>0};
    return {viewport:{width:innerWidth,height:innerHeight},host,canvas,header,title,hud,fps,titleText:document.querySelector('#game-hud b').textContent,hudText:document.querySelector('#hud').textContent,fpsText:document.querySelector('#royal-fps').textContent,visible:{title:isVisible('#game-hud b'),hud:isVisible('#hud'),fps:isVisible('#royal-fps')},fpsHit:document.elementFromPoint(fps.x+fps.width/2,fps.y+fps.height/2)?.id};
  });
  console.log('INFO 3D visual geometry',JSON.stringify(visual));
  assert.ok(Math.abs(visual.host.top)<=1&&Math.abs(visual.canvas.top)<=1,'3D must start at the viewport top');
  assert.ok(visual.host.width>=visual.viewport.width-2&&visual.host.height>=visual.viewport.height-2,'3D host must fill viewport');
  assert.ok(visual.canvas.width>=visual.viewport.width-2&&visual.canvas.height>=visual.viewport.height-2,'3D canvas must fill viewport');
  assert.ok(visual.visible.title&&visual.visible.hud&&visual.visible.fps,'title, collection HUD and frame indicator must be visible');
  assert.equal(await page.locator('#game-hud > #royal-fps').count(),1,'frame output must be inside the 3D HUD');
  const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  assert.equal(overlaps(visual.title,visual.fps),false,'frame output must not overlap game title');
  assert.equal(overlaps(visual.hud,visual.fps),false,'frame output must not overlap collection status');
  assert.ok(visual.titleText.includes('THE ROYAL')&&visual.hudText.trim().length>0,'title and live collection data must contain text');
  assert.ok(visual.header.top>=-1&&visual.header.bottom<=visual.viewport.height&&visual.fps.top>=0&&visual.fps.bottom<=visual.viewport.height,'HUD and FPS must fit inside 3D viewport');
  assert.ok(visual.fps.top>=visual.header.top&&visual.fps.bottom<=visual.header.bottom,'FPS output should stay inside game HUD');
  await page.screenshot({path:'royal-3d-mobile.png',fullPage:true});
  assert.equal(await page.locator('#world').isVisible(),false);
  assert.equal(await page.locator('#view-toggle').isVisible(),false);
  const dimensions=await page.locator('#royal-3d canvas').evaluate(el=>({width:el.clientWidth,height:el.clientHeight}));
  assert.ok(dimensions.width>=380&&dimensions.height>=840,'3D canvas should fill the mobile viewport');
  const perf=await page.evaluate(()=>window.royal3DPerf());
  assert.ok(perf.samples>0&&Number.isFinite(perf.averageMs)&&perf.drawCalls>0,'3D renderer must produce frames');
  const candidate=await page.evaluate(()=>window.royal3DVisibleResources().find(o=>o.type===0)||window.royal3DVisibleResources()[0]);
  assert.ok(candidate,'at least one resource must be visible');
  await page.evaluate(()=>{s.minions.forEach(m=>m.job=null);s.queue=[];s.autoGather=false});
  await page.locator('#royal-3d canvas').click({position:{x:candidate.x,y:candidate.y}});
  assert.ok(await page.evaluate(()=>s.minions.some(m=>m.job&&m.job.type>=0)||s.queue.length>0),'3D click should dispatch gather command');
  // The settings panel is intentionally collapsed after reload; open it before
  // testing visibility of its child controls (instead of asserting while hidden).
  await page.locator('#game-settings summary').click();
  assert.equal(await page.locator('#auto').isVisible(),true);
  assert.equal(await page.locator('#worker').isVisible(),true);
  console.log('PASS fullscreen 3D, resource interaction, in-game HUD and settings');
  for(const width of [320,375,768]){
    await page.setViewportSize({width,height:844});
    const measure=await page.evaluate(()=>({viewport:innerWidth,body:document.body.scrollWidth,hostY:document.querySelector('#royal-3d').getBoundingClientRect().top,hostH:document.querySelector('#royal-3d').getBoundingClientRect().height,screenH:innerHeight,hudChildren:[...document.querySelectorAll('#game-hud > b,#game-hud > #hud,#game-hud > #royal-fps')].map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})}));
    assert.ok(Math.abs(measure.hostY)<=1&&measure.hostH>=measure.screenH-2,'3D must fill viewport at '+width);
    for(let i=0;i<measure.hudChildren.length;i++)for(let j=i+1;j<measure.hudChildren.length;j++)assert.equal(overlaps(measure.hudChildren[i],measure.hudChildren[j]),false,'HUD elements overlap at '+width);
    assert.ok(measure.body<=measure.viewport+2,'responsive overflow '+JSON.stringify(measure));
  }
  console.log('PASS responsive layout at 320, 375, 390 and 768 CSS px');
  // Compare identical viewport and static fixtures; CI software GPU is not a phone benchmark.
  await page.setViewportSize({width:390,height:844});
  const idlePerf=await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,3200));return window.royal3DPerf()});
  await page.evaluate(()=>{window.royalPerfFixture={raids:s.raids,cityLevel:s.cityLevel,autoGather:s.autoGather};s.cityLevel=15;s.autoGather=false;s.raids={wave:0,attackers:[]};RoyalRaids.spawn(s,'zombies')});
  await page.waitForTimeout(3600);
  const wavePerf=await page.evaluate(()=>({count:s.raids.attackers.length,...window.royal3DPerf()}));
  console.log('INFO performance baseline (CI renderer, 390x844)',JSON.stringify({idle:idlePerf,zombies:wavePerf}));
  assert.equal(wavePerf.count,180);
  assert.ok(wavePerf.drawCalls>0&&Number.isFinite(wavePerf.p95Ms)&&wavePerf.samples>0);
  await page.evaluate(()=>{Object.assign(s,window.royalPerfFixture);delete window.royalPerfFixture});
  // Expanded city fixture: 15 buildings and 24 minions, isolated from progression state.
  const expanded=await page.evaluate(async()=>{const old={buildings:s.buildings,minions:s.minions,autoGather:s.autoGather};try{s.autoGather=false;s.buildings=Array.from({length:15},(_,i)=>({id:'perf-'+i,type:'watchtower'}));s.minions=Array.from({length:24},(_,i)=>({...old.minions[0],id:'perf-m-'+i,x:280+(i%6)*40,y:180+Math.floor(i/6)*40,job:null,status:'healthy'}));await new Promise(r=>setTimeout(r,4000));return {buildings:s.buildings.length,minions:s.minions.length,...window.royal3DPerf()}}finally{Object.assign(s,old);save()}});
  console.log('INFO expanded city performance',JSON.stringify(expanded));
  assert.equal(expanded.buildings,15);assert.equal(expanded.minions,24);
  // Final defense: use a controlled state and a low-HP enemy to test progression,
  // not the full combat balance or real-time duration.
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{s.cityLevel=14;s.raids={elapsed:9999,wave:0,attackers:[]};s.autoGather=false;updateRaidButton()});
  assert.equal(await page.locator('#raid-open').isDisabled(),true);
  await page.evaluate(()=>{s.cityLevel=15;updateRaidButton()});
  assert.equal(await page.locator('#raid-open').isDisabled(),false);
  assert.equal(await page.evaluate(()=>s.raids.attackers.length),0);
  await page.locator('#raid-open').click();
  await page.locator('[data-raid-mode="boss"]').click();
  assert.equal(await page.evaluate(()=>s.raids.attackers.length),1);
  assert.equal(await page.locator('#raid-open').isDisabled(),true);
  const city=await page.evaluate(()=>{const city=s.city;s.buildings.push({id:'test-tower',type:'watchtower'});s.raids.attackers[0].x=475;s.raids.attackers[0].y=265;s.raids.attackers[0].hp=.01;update(.1);return city});
  await page.waitForFunction(()=>s.endingComplete);
  assert.equal(await page.evaluate(()=>s.raids.completedCity),city);
  assert.equal(await page.locator('#city-ending .battle-feedback[data-status="clear"]').count(),1);
  assert.equal(await page.locator('#city-ending .battle-share').getAttribute('aria-label'),'감시탑 100%, 사냥꾼 0%');
  assert.equal(await page.locator('#city-ending .raid-rewards span').count(),2);
  assert.match(await page.locator('#city-ending .raid-rewards').innerText(),/목재 \+24/);
  const victoryStock=await page.evaluate(()=>({...s.stock}));
  await page.reload();
  await page.waitForFunction(()=>window.royal3DState?.()?.endingComplete===true);
  assert.equal(await page.locator('#city-continue').isVisible(),true,'saved victory must restore ending UI');
  assert.deepEqual(await page.evaluate(()=>({...s.stock})),victoryStock,'reload must not grant victory reward twice');
  await page.locator('#city-continue').click();
  assert.equal(await page.locator('#city-arrival').isVisible(),true);
  assert.match(await page.locator('#city-arrival').innerText(),/도시 개척/);
  assert.equal(await page.evaluate(()=>s.city),city+1);
  assert.equal(await page.evaluate(()=>RoyalRaids.available(s)),false);
  console.log('PASS expansion unlock, manual raid, controlled clear and next city');
  assert.deepEqual(errors,[]);
  console.log('PASS Chromium reload persistence and 390px mobile layout');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
