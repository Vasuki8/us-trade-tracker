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
