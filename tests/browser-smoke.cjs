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
  assert.deepEqual(errors,[]);
  console.log('PASS Chromium reload persistence and 390px mobile layout');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
