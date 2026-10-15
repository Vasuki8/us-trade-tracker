import {test,expect,type Page,type Locator} from '@playwright/test';
import {readFile,copyFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {parseCsv} from '../helpers/parse-csv';
const amountTitle='Monthly estimated duties · current USD',shareTitle='Calculated duties as share of import value · %';
const selections=[{key:'world',codes:[] as string[]},{key:'one',codes:['1220']},{key:'three',codes:['2010','1220','4759']}];
const tabTo=async(page:Page,target:Locator)=>{const stops=await page.locator('a[href],button,input,select,textarea,[tabindex]').count();for(let i=0;i<=stops;i++){await page.keyboard.press('Tab');if(await target.evaluate(el=>el===document.activeElement))return;}throw Error('PNG control is not keyboard reachable');};
async function captureSvg(page:Page){
 await page.addInitScript(()=>{const original=XMLSerializer.prototype.serializeToString;XMLSerializer.prototype.serializeToString=function(node:Node){const text=original.call(this,node);if(node instanceof SVGSVGElement&&node.hasAttribute('data-duty-export'))(window as unknown as {lastDutySvg:string}).lastDutySvg=text;return text;};});
}
async function imageAndBounds(page:Page,bytes:Buffer){
 expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');expect(bytes.readUInt32BE(16)).toBe(1920);expect(bytes.readUInt32BE(20)).toBe(1080);
 const result=await page.evaluate(async data=>{
  const image=new Image();image.src=data;await image.decode();const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);const pixels=ctx.getImageData(180,190,1678,366).data;let colored=0;for(let i=0;i<pixels.length;i+=4)if(Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>35)colored++;
  const text=(window as unknown as {lastDutySvg:string}).lastDutySvg;const svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;visibility:hidden;width:960px;height:540px';host.append(document.importNode(svg,true));document.body.append(host);await document.fonts.ready;
  const boxes=[...host.querySelectorAll('text')].map(node=>{const b=node.getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};});
  const outside=boxes.filter(b=>b.x<0||b.y<0||b.x+b.width>960||b.y+b.height>534).length;let overlap=0;for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>0.5&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>0.5)overlap++;}host.remove();return {colored,outside,overlap,text};
 },'data:image/png;base64,'+bytes.toString('base64'));
 expect(result.colored).toBeGreaterThan(50);expect(result.outside).toBe(0);expect(result.overlap).toBe(0);return result.text;
}
for(const code of ['090121','090122'])for(const selection of selections)test(`duty history ${code} ${selection.key} keeps charts, CSV and PNGs aligned`,async({page},info)=>{
 const fixture=JSON.parse(readFileSync(`tests/fixtures/product-release${code==='090121'?'':'-'+code}.json`,'utf8'));
 const errors:string[]=[],outside:string[]=[];page.on('pageerror',error=>errors.push(error.message));const origin=new URL(info.project.use.baseURL as string).origin;await page.route('**/*',route=>{if(new URL(route.request().url()).origin!==origin){outside.push(route.request().url());return route.abort();}return route.continue();});await captureSvg(page);
 const query=selection.codes.length?'?direction=imports&months=12&countries='+selection.codes.join('%2C'):'';await page.goto('/products/'+code+'/'+query+'#duties-heading');await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
 const duties=page.getByRole('region',{name:'Estimated duties'}),codes=selection.codes.length?selection.codes:['-'];
 for(const metric of ['dollars','share'] as const){const f=page.getByRole('figure',{name:metric==='dollars'?amountTitle:shareTitle});await expect(f).toContainText('Jan 2024–Dec 2025');await expect(f.locator('.duty-chart-legend li')).toHaveCount(codes.length);
  const expected=fixture.duties.observations.filter((r:any)=>codes.includes(r.partnerCode)&&r.calculatedDuty.status==='reported'&&(metric==='dollars'||r.consumptionValue.status==='reported'&&r.consumptionValue.valueUsd>0));await expect(f.locator('svg.duty-chart-desktop circle')).toHaveCount(expected.length);
  for(const width of [320,375,1120]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  const b=f.getByRole('button',{name:metric==='dollars'?'Download duty amounts chart PNG':'Download duty share chart PNG'});await tabTo(page,b);const pending=page.waitForEvent('download');await page.keyboard.press('Enter');const file=await pending;expect(file.suggestedFilename()).toBe(`hs-${code}-imports-estimated-duties-monthly-${metric}.png`);const bytes=await readFile(await file.path());const svg=await imageAndBounds(page,bytes);
  for(const text of [code,'CAL_DUT_MO','CON_VAL_MO','SYNTHETIC DEVELOPMENT DATA',fixture.retrievedAt,fixture.codeVersion,'RP70/79','https://us-trade-tracker.pages.dev/methods/'])expect(svg).toContain(text);
  await copyFile(await file.path(),info.outputPath(metric+'.png'));if(selection.key==='three')await f.screenshot({path:info.outputPath(metric+'-desktop.png')});
 }
 const pending=page.waitForEvent('download');await duties.getByRole('button',{name:'Download estimated duties CSV'}).click();const csv=parseCsv(await readFile(await (await pending).path(),'utf8'));expect([...new Set(csv.map(row=>row.partner_code))]).toEqual(codes);expect(csv.filter(r=>r.record_type==='monthly')).toHaveLength(codes.length*24);
 for(const row of csv.filter(r=>r.record_type==='monthly')){const raw=fixture.duties.observations.find((r:any)=>r.month===row.period_start&&r.partnerCode===row.partner_code);expect(row.calculated_duty_usd).toBe(raw?.calculatedDuty.valueUsd===null||!raw?'':String(raw.calculatedDuty.valueUsd));expect(row.denominator_measure).toBe('CON_VAL_MO');}
 const before=await page.getByRole('figure',{name:amountTitle}).locator('.duty-chart-period').textContent();await page.getByLabel('History window').selectOption('60');await expect(page.getByRole('figure',{name:amountTitle})).toContainText(before!);await page.reload();await expect(page.locator('astro-island[ssr]')).toHaveCount(0);await expect(page.getByRole('figure',{name:amountTitle}).locator('.duty-chart-legend li')).toHaveCount(codes.length);
 await page.getByRole('radio',{name:'Exports'}).check();await expect(page.getByRole('region',{name:'Estimated duties'})).toHaveCount(0);expect(errors).toEqual([]);expect(outside).toEqual([]);
});
for(const code of ['090121','090122'])test(`static duty charts ${code} keep world defaults with PNG disabled`,async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(info.project.use.baseURL+`/products/${code}/?direction=exports&countries=1220#duties-heading`);const f=page.getByRole('figure',{name:amountTitle});await expect(f).toContainText('All partner countries');await expect(f.getByRole('button',{name:'Download duty amounts chart PNG'})).toBeDisabled();await expect(page.getByRole('figure',{name:shareTitle}).getByRole('button',{name:'Download duty share chart PNG'})).toBeDisabled();await expect(page.getByText(/Without JavaScript|JavaScript is required|Enable JavaScript/).first()).toBeVisible();await context.close();
});
test('long country names and source metadata wrap safely in the actual export',async({page},info)=>{
 const names={CANADA:'CANADA WITH A LONG REVIEWED SYNTHETIC NAME',ITALY:'ITALY WITH A LONG REVIEWED SYNTHETIC NAME',MEXICO:'MEXICO WITH A LONG REVIEWED SYNTHETIC NAME'};
 await page.route('**/products/090121/**',async route=>{const response=await route.fetch();let html=await response.text();for(const [before,after]of Object.entries(names))html=html.replaceAll(before,after);html=html.replaceAll('synthetic','W'.repeat(80));await route.fulfill({response,body:html});});await captureSvg(page);await page.goto('/products/090121/?countries=2010%2C1220%2C4759#duties-heading');await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download duty share chart PNG'}).click();const file=await pending,svg=await imageAndBounds(page,await readFile(await file.path()));for(const name of Object.values(names))expect(svg).toContain(name);expect(svg).toContain('W'.repeat(80));await copyFile(await file.path(),info.outputPath('long-metadata.png'));await page.setViewportSize({width:320,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
