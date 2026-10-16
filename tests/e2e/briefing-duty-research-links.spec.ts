import {test,expect,type Page,type Locator} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseCsv} from '../helpers/parse-csv';

const labels={monthly:'Explore latest-month estimated-duty changes by country',rolling:'Explore twelve-month estimated-duty changes by country'};
// Original producer pins at 95755a3; rolling pins now include the four synthetic duty revision keys.
// Independent before/after verification found only the existing release-wide revised flag changes.
const csvPins={monthly:'838d3f703bf4c22a3ef3a63febe6737e24516703028027f06cdf6c79eb33f5bb',roasted:'db4ebfc98ade43fd04cdc95960230a1730818480daad2c18502c3f6e5e602477',second:'934fceac916c6347043740f9ef039ff8547b0cadb9c1c6ab0e59986ad9c3a722'};
async function reachByTab(page:Page,target:Locator){
 const count=await page.locator('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]').count()+1;
 for(let n=0;n<count;n++){await page.keyboard.press('Tab');if(await target.evaluate(el=>el===document.activeElement))return;}
 throw new Error('Duty research link is unreachable by keyboard');
}
for(const [code,name,briefing,destination,factor] of [['090121','Roasted coffee','/briefing/','/changes/duties/',1],['090122','Synthetic second product','/briefing/090122/','/changes/duties/090122/',3]] as const){
 for(const entry of ['product','portfolio'] as const)for(const period of ['monthly','rolling'] as const){
  test(`duty research ${code} ${entry} ${period}`,async({page,baseURL})=>{
   const errors:string[]=[],outside:string[]=[],origin=new URL(baseURL!).origin;
   page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin===origin||url.protocol==='blob:')return route.continue();outside.push(url.href);return route.abort();});
   await page.context().grantPermissions(['clipboard-read','clipboard-write'],{origin});
   const start=entry==='product'?briefing:`/briefing/portfolio/?products=${code}&direction=imports`;
   await page.goto(start);
   let card:Locator;
   if(entry==='product'){await expect(page.locator('astro-island')).toHaveCount(0);card=page.getByRole('article',{name:period==='monthly'?'Monthly estimated duties':'Rolling estimated duties'});}
   else{await expect(page.getByRole('button',{name:'Copy briefing link'})).toBeEnabled();card=page.getByRole('article',{name:`${name} · HS ${code}`,exact:true}).getByRole('region',{name:period==='monthly'?'Monthly estimated duties':'Rolling estimated duties',exact:true});}
   const currentDuty=(period==='monthly'?1:30)*factor,currentCon=(period==='monthly'?20:400)*factor,priorDuty=(period==='monthly'?0:10)*factor,priorCon=(period==='monthly'?10:200)*factor;
   const money=(n:number)=>'$'+n.toLocaleString('en-US');
   await expect(card).toContainText(`${entry==='product'?'Calculated duties':'Estimated duties'}: ${money(currentDuty)}`);await expect(card).toContainText(`Consumption value: ${money(currentCon)}`);await expect(card).toContainText(`Duty share: ${period==='monthly'?'5.000':'7.500'}%`);
   if(entry==='portfolio'){await expect(card).toContainText(`Estimated duties: ${money(priorDuty)}`);await expect(card).toContainText(`Consumption value: ${money(priorCon)}`);}
   const link=card.getByRole('link',{name:labels[period],exact:true}),href=`${destination}?direction=imports&period=${period}&metric=share#duties-changes-heading`;
   await expect(link).toHaveAttribute('href',href);
   for(const width of [320,375]){await page.setViewportSize({width,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
   await reachByTab(page,link);await expect(link).toBeFocused();await page.keyboard.press('Enter');
   await expect(page).toHaveURL(origin+href);await expect(page.getByRole('button',{name:'Copy duty changes link'})).toBeEnabled();
   const check=async()=>{
    await expect(page.locator('.page-heading')).toContainText(`HS ${code}`);await expect(page.locator('#duties-changes-heading')).toHaveText('U.S. imports only');
    await expect(page.getByRole('radio',{name:period==='monthly'?'Latest month versus the same month last year':'Rolling twelve months',exact:true})).toBeChecked();await expect(page.getByRole('radio',{name:'Share change in percentage points',exact:true})).toBeChecked();
    const table=page.getByRole('table',{name:'Official world duty figures'}),rows=table.locator('tbody tr');
    await expect(rows.nth(0)).toContainText(`Current · ${period==='monthly'?'Dec 2025':'Jan 2025–Dec 2025'}`);await expect(rows.nth(1)).toContainText(`Prior · ${period==='monthly'?'Dec 2024':'Jan 2024–Dec 2024'}`);
    await expect(rows.nth(0)).toContainText(`${money(currentDuty)} estimated duties`);await expect(rows.nth(0)).toContainText(`${money(currentCon)} consumption value`);await expect(rows.nth(0)).toContainText(`${period==='monthly'?'5.000':'7.500'}% duty share`);
    await expect(rows.nth(1)).toContainText(`${money(priorDuty)} estimated duties`);await expect(rows.nth(1)).toContainText(`${money(priorCon)} consumption value`);await expect(rows.nth(1)).toContainText(`${period==='monthly'?'0.000':'5.000'}% duty share`);
   };
   await check();await page.getByRole('button',{name:'Copy duty changes link'}).click();await expect(page.getByText('Duty changes link copied.',{exact:true})).toBeVisible();expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(origin+href);
   const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download duty changes CSV'}).click();const download=await event;expect(download.suggestedFilename()).toBe(`hs-${code}-imports-estimated-duty-changes-${period}-share.csv`);
   const bytes=await readFile((await download.path())!),rows=parseCsv(bytes.toString('utf8'));
   expect(createHash('sha256').update(bytes).digest('hex')).toBe(period==='monthly'?csvPins.monthly:code==='090121'?csvPins.roasted:csvPins.second);
   if(period==='monthly'){expect(rows).toEqual([]);expect(bytes.toString('utf8')).toMatch(/^feature,ranking_metric,movement,rank,product_code,/);await expect(page.locator('.duty-ranking-counts')).toContainText('4 unchanged');}
   else{expect(rows.every(row=>row.revised==='true')).toBe(true);expect(rows).toHaveLength(3);expect(rows.map(row=>row.partner_code)).toEqual(['4280','4759','2010']);expect(rows[0]).toMatchObject({product_code:code,direction:'imports',comparison_period:'rolling',ranking_metric:'share',current_period_start:'2025-01',current_period_end:'2025-12',previous_period_start:'2024-01',previous_period_end:'2024-12',current_calculated_duty_usd:String(4*factor),previous_calculated_duty_usd:String(2*factor),current_consumption_value_usd:String(100*factor),previous_consumption_value_usd:String(44*factor),numerator_measure:'CAL_DUT_MO',denominator_measure:'CON_VAL_MO',source:'Development sample data',code_version:'synthetic'});}
   expect(await page.content()).not.toContain('"observations"');await page.reload();await expect(page.getByRole('button',{name:'Copy duty changes link'})).toBeEnabled();await check();
   await page.goBack();await expect(page).toHaveURL(origin+start);await expect(link).toHaveAttribute('href',href);await page.goForward();await expect(page.getByRole('button',{name:'Copy duty changes link'})).toBeEnabled();await check();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);expect(outside).toEqual([]);
  });
 }
 for(const entry of ['product','portfolio'] as const)test(`native ${code} ${entry} links explain defaults without JavaScript`,async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:812}}),page=await context.newPage(),origin=new URL(baseURL!).origin,outside:string[]=[];
  await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin===origin)return route.continue();outside.push(url.href);return route.abort();});
  try{
   await page.goto(entry==='product'?briefing:'/briefing/portfolio/');
   const card=entry==='product'?page.getByRole('article',{name:'Monthly estimated duties'}):page.getByRole('article',{name:`${name} · HS ${code}`,exact:true}).getByRole('region',{name:'Monthly estimated duties',exact:true});
   if(entry==='product')await expect(page.locator('astro-island')).toHaveCount(0);else await expect(page.getByText(/Enable JavaScript to select products/)).toBeVisible();
   await card.getByRole('link',{name:labels.monthly,exact:true}).click();await expect(page).toHaveURL(origin+`${destination}?direction=imports&period=monthly&metric=share#duties-changes-heading`);
   await expect(page.getByRole('radio',{name:'Rolling twelve months',exact:true})).toBeChecked();await expect(page.getByRole('radio',{name:'Share change in percentage points',exact:true})).toBeChecked();await expect(page.getByRole('button',{name:'Download duty changes CSV'})).toBeDisabled();await expect(page.getByText(/initial view shows imports, rolling twelve months, ranked by share change/)).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(outside).toEqual([]);
  }finally{await context.close();}
 });
}
