import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';
const route='/preview/countries/1220/';
async function expectReadableCountryChart(page:import('@playwright/test').Page,title:string){
  const image=page.getByRole('img',{name:title});await expect(image).toHaveCount(1);
  const sizes=await image.evaluate(element=>{
    const visible=Array.from(element instanceof SVGSVGElement?[element]:element.querySelectorAll('svg')).find(el=>el.getBoundingClientRect().width>0)!;
    return Array.from(visible.querySelectorAll('text')).map(label=>parseFloat(getComputedStyle(label).fontSize)*visible.getBoundingClientRect().width/visible.viewBox.baseVal.width);
  });
  expect(sizes.length).toBeGreaterThan(0);for(const size of sizes)expect(size).toBeGreaterThanOrEqual(12);
}
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
  await page.setViewportSize({width:375,height:812});await page.goto(route);const imports=page.getByRole('radio',{name:'Imports'});await expect(imports).toBeEnabled();await imports.focus();await expect(imports).toBeFocused();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();
  const scroll=page.getByRole('region',{name:'Selected country category comparisons'});await scroll.focus();await expect(scroll).toBeFocused();await page.keyboard.press('End');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  const references=page.getByRole('region',{name:'Country reference differences'});
  const monthWidth=await references.getByRole('columnheader',{name:'Month',exact:true}).evaluate(el=>el.getBoundingClientRect().width);
  expect(monthWidth).toBeLessThan(await references.evaluate(el=>el.clientWidth/2));
  const button=page.getByRole('button',{name:'Download monthly CSV'});await button.focus();const event=page.waitForEvent('download');await page.keyboard.press('Enter');expect((await event).suggestedFilename()).toContain('exports');
  await page.screenshot({path:info.outputPath('mobile.png'),fullPage:true});
});
test('keeps chart labels readable across phone and desktop widths in both directions',async({page},info)=>{
  await page.goto(route);
  for(const width of [320,375,680,681,1024]){
    await page.setViewportSize({width,height:812});
    for(const direction of ['Imports','Exports']){
      await page.getByRole('radio',{name:direction}).check();
      await expectReadableCountryChart(page,direction==='Imports'?'Monthly U.S. imports from Canada':'Monthly U.S. exports to Canada');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    if(width===375)await page.getByRole('region',{name:'All-goods history'}).screenshot({path:info.outputPath('readable-mobile-chart.png')});
  }
});
test('provides Imports research and sources without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});const page=await context.newPage();const requests:string[]=[];page.on('request',r=>{if(!r.url().startsWith(baseURL!))requests.push(r.url());});await page.goto(baseURL+route);
  const imports=page.getByRole('radio',{name:'Imports'}),exports=page.getByRole('radio',{name:'Exports'});
  await expect(imports).toBeDisabled();await expect(exports).toBeDisabled();
  await expect(page.getByRole('button',{name:'Download monthly CSV'})).toBeDisabled();await expect(page.getByRole('button',{name:'Download products CSV'})).toBeDisabled();
  await exports.click({force:true});await expect(imports).toBeChecked();await expect(exports).not.toBeChecked();
  await expect(page.getByRole('table',{name:'Monthly U.S. imports from Canada · nominal USD'}).getByRole('row')).toHaveCount(25);await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$2,400,000');await expect(page.locator('noscript p')).toContainText('require JavaScript');await expect(page.getByRole('region',{name:'Sources and revision differences'})).toContainText('Product shares here use totals from the same files');await expectReadableCountryChart(page,'Monthly U.S. imports from Canada');expect(requests).toEqual([]);await context.close();
});
test('keeps SSR controls read-only until delayed JavaScript is ready',async({page})=>{
  let releaseScripts!:()=>void;const held=new Promise<void>(resolve=>{releaseScripts=resolve;});
  await page.route('**/_astro/*.js',async route=>{await held;await route.continue();});
  try{
    await page.goto(route,{waitUntil:'commit'});
    await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();await expect(page.getByRole('radio',{name:'Exports'})).toBeDisabled();
    await expect(page.getByRole('button',{name:'Download monthly CSV'})).toBeDisabled();await expect(page.getByRole('button',{name:'Download products CSV'})).toBeDisabled();
    await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$2,400,000');
    releaseScripts();await expect(page.getByRole('radio',{name:'Exports'})).toBeEnabled();
    await page.getByRole('radio',{name:'Exports'}).check();await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$4,600,000');
    const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download products CSV'}).click();expect((await event).suggestedFilename()).toContain('exports');
  }finally{releaseScripts();}
});
