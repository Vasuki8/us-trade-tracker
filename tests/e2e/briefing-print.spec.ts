import {test,expect,type Page} from '@playwright/test';
const reports=[{path:'/briefing/',code:'090121',current:'$100'},{path:'/briefing/090122/',code:'090122',current:'$300'}];
async function retainedReport(page:Page,current:string){
 await expect(page.getByRole('region',{name:'Monthly imports'})).toContainText('Current value: '+current);
 await expect(page.getByRole('region',{name:'Sources and release'})).toContainText('2026-01-01T00:00:00.000Z');
 await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
 await expect(page.locator('astro-island')).toHaveCount(0);
}
for(const report of reports){
 test(report.code+' print control invokes the native boundary once by keyboard without changing the report',async({page,baseURL})=>{
  const errors:string[]=[],outside:string[]=[];page.on('pageerror',()=>errors.push('page-error'));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(baseURL!).origin)outside.push(r.url());});
  await page.addInitScript(()=>{window.print=()=>{document.documentElement.dataset.printCalls=String(Number(document.documentElement.dataset.printCalls??0)+1);};});
  await page.goto(report.path);await retainedReport(page,report.current);const before=await page.locator('.briefing').innerText();
  const button=page.getByRole('button',{name:'Print / Save PDF',exact:true});await expect(button).toBeVisible();await button.focus();await expect(button).toBeFocused();await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-print-calls','1');await expect(button).toBeFocused();expect(await page.locator('.briefing').innerText()).toBe(before);expect(errors).toEqual([]);expect(outside).toEqual([]);
 });
 test(report.code+' remains readable with a hidden inactive control and browser-print help without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}});
  try{const page=await context.newPage();await page.goto(report.path);const button=page.locator('[data-briefing-print]');await expect(button).toHaveCount(1);await expect(button).toBeHidden();await expect(page.getByText('Use your browser’s Print command to print or save a PDF.',{exact:true})).toBeVisible();await retainedReport(page,report.current);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}finally{await context.close();}
 });
 for(const failure of ['missing','throwing'])test(report.code+' native printing '+failure+' preserves report and usable fallback',async({page})=>{
  await page.addInitScript(failure=>{Object.defineProperty(window,'print',{configurable:true,writable:true,value:failure==='missing'?undefined:()=>{throw Error('native-print-unavailable');}});},failure);
  await page.goto(report.path);await retainedReport(page,report.current);const before=await page.locator('.briefing').innerText(),button=page.locator('[data-briefing-print]');await expect(button).toHaveCount(1);
  if(failure==='missing')await expect(button).toBeHidden();else{await expect(button).toBeVisible();await button.focus();await page.keyboard.press('Enter');await expect(page.getByRole('status')).toContainText('Printing could not open.');await expect(button).toBeFocused();}
  await expect(page.getByText('Use your browser’s Print command to print or save a PDF.',{exact:true})).toBeVisible();expect(await page.locator('.briefing').innerText()).toBe(before);
 });
}

for(const report of reports){
 test(report.code+' print layout hides navigation and controls while retaining a single sourced report column',async({page})=>{
  await page.goto(report.path);const before=await page.locator('.briefing').textContent();await expect(page.getByRole('button',{name:'Print / Save PDF',exact:true})).toBeVisible();
  await page.emulateMedia({media:'print'});for(const selector of ['.site-header','.skip-link','.briefing-products','.briefing-print-controls'])await expect(page.locator(selector)).toBeHidden();
  await retainedReport(page,report.current);await expect(page.locator('.page-heading')).toContainText('HS '+report.code);await expect(page.locator('.briefing')).toContainText('RP70/79 report dutiable value without calculating duties.');await expect(page.locator('.site-footer')).toContainText('not endorsed or certified by the Census Bureau.');await expect(page.locator('.site-footer p').last()).toBeVisible();
  const cards=await page.locator('.briefing-grid').first().locator('.briefing-card').evaluateAll(nodes=>nodes.map(n=>({top:n.getBoundingClientRect().top,bottom:n.getBoundingClientRect().bottom})));expect(cards[1].top).toBeGreaterThanOrEqual(cards[0].bottom);
  expect(await page.locator('.briefing-card p:not(.chart-note)').first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(12);expect(await page.locator('.briefing .provenance>p').first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(10.6);expect(await page.locator('.briefing').textContent()).toBe(before);
  await page.emulateMedia({media:'screen'});await expect(page.locator('.site-header')).toBeVisible();await expect(page.getByRole('navigation',{name:'Briefing products'})).toBeVisible();await expect(page.getByRole('button',{name:'Print / Save PDF',exact:true})).toBeVisible();expect(await page.locator('.briefing').textContent()).toBe(before);
 });
 test(report.code+' static print keeps fixture warning duty qualifications and the Census notice',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false});try{const page=await context.newPage();await page.goto(report.path);await page.emulateMedia({media:'print'});await expect(page.locator('.site-header')).toBeHidden();await expect(page.locator('.briefing-print-controls')).toBeHidden();await retainedReport(page,report.current);await expect(page.locator('.briefing')).toContainText('Reported zero duties do not prove duty-free trade.');await expect(page.locator('.site-footer p').last()).toBeVisible();}finally{await context.close();}
 });
}
