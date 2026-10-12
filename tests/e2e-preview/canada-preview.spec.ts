import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';
const route='/preview/countries/1220/';
test.beforeEach(async({page})=>{await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname!=='127.0.0.1'&&url.protocol!=='blob:')throw new Error('Unexpected provider/network request');return route.continue();});});
test('fixture page shows default research, switches everything and preserves reference exclusions',async({page},info)=>{
  await page.goto(route);await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
  await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$2,400,000');await expect(page.getByRole('table',{name:'Monthly U.S. imports from Canada · nominal USD'}).getByRole('row')).toHaveCount(25);
  await page.screenshot({path:info.outputPath('desktop.png'),fullPage:true});
  await page.getByRole('radio',{name:'Exports'}).check();await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$4,600,000');await expect(page.getByRole('table',{name:'Selected leading categories · Exports'}).getByRole('row')).toHaveCount(11);
  await expect(page.getByRole('table',{name:'Selected leading categories · Exports'}).getByRole('row',{name:/880000/})).toContainText('Statistical category');await expect(page.getByRole('table',{name:'Retained reference differences · Exports'}).getByRole('row')).toHaveCount(8);await expect(page.getByRole('region',{name:'Sources and revision differences'})).toContainText('17 matched; 7 mismatch');
});
test('downloads direction-specific monthly and product values with qualified provenance',async({page})=>{
  await page.goto(route);await page.getByRole('radio',{name:'Exports'}).check();
  for(const kind of ['monthly','products'] as const){const event=page.waitForEvent('download');await page.getByRole('button',{name:`Download ${kind} CSV`}).click();const download=await event;expect(download.suggestedFilename()).toBe(`canada-1220-exports-2024-09-2026-08-preview-${kind}.csv`);const rows=parseCsv(await readFile((await download.path())!,'utf8'));expect(rows).toHaveLength(kind==='monthly'?24:10);expect(rows[0]).toMatchObject({country_code:'1220',direction:'exports',measure:'ALL_VAL_MO',source:'Synthetic development data',raw_verification:'synthetic'});
    if(kind==='monthly'){expect(rows[0]).toMatchObject({month:'2024-09',value_usd:'300000',original_source_url:''});expect(rows[23]).toMatchObject({month:'2026-08',value_usd:'200000'});await expect(page.getByRole('table',{name:'Monthly U.S. exports to Canada · nominal USD'}).getByRole('row',{name:/Sep 2024/})).toContainText('$300,000');}
    else{expect(rows[0]).toMatchObject({product_code:'988000',current_value_usd:'240000',current_country_total_usd:'4600000',prior_country_total_usd:'3600000',growth_percent:'',classification_status:'statistical-category'});expect(rows[1]).toMatchObject({product_code:'270900',current_value_usd:'216000',prior_value_usd:'108000',growth_percent:'100',current_period_start:'2025-09',prior_period_start:'2024-09'});await expect(page.getByRole('table',{name:'Selected leading categories · Exports'}).getByRole('row',{name:/270900/})).toContainText('$216,000');}
  }
});
test('supports keyboard controls and contained mobile tables',async({page},info)=>{
  await page.setViewportSize({width:375,height:812});await page.goto(route);const imports=page.getByRole('radio',{name:'Imports'});await imports.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();
  const scroll=page.getByRole('region',{name:'Selected country category comparisons'});await scroll.focus();await expect(scroll).toBeFocused();await page.keyboard.press('End');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  const button=page.getByRole('button',{name:'Download monthly CSV'});await button.focus();const event=page.waitForEvent('download');await page.keyboard.press('Enter');expect((await event).suggestedFilename()).toContain('exports');
  await page.screenshot({path:info.outputPath('mobile.png'),fullPage:true});
});
test('provides Imports research and sources without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();const requests:string[]=[];page.on('request',r=>{if(!r.url().startsWith(baseURL!))requests.push(r.url());});await page.goto(baseURL+route);
  await expect(page.getByRole('table',{name:'Monthly U.S. imports from Canada · nominal USD'}).getByRole('row')).toHaveCount(25);await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$2,400,000');await expect(page.locator('noscript p')).toContainText('require JavaScript');await expect(page.getByRole('region',{name:'Sources and revision differences'})).toContainText('Product shares here use totals from the same files');expect(requests).toEqual([]);await context.close();
});
