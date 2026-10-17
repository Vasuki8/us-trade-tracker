import {test,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';

test('selected briefing restores history and downloads matching sourced figures',async({page})=>{
  const errors:string[]=[],censusRequests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(r.url().includes('api.census.gov'))censusRequests.push(r.url());});
  await page.goto('/briefing/portfolio/');await expect(page.getByRole('heading',{name:'Product portfolio briefing'})).toBeVisible();
  await page.getByRole('checkbox',{name:/Synthetic second product/}).uncheck();
  await expect(page.getByRole('checkbox',{name:/Roasted coffee/})).toBeDisabled();
  let downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download summary CSV'}).click();
  const summaryDownload=await downloaded;const summary=parseCsv(await readFile(await summaryDownload.path(),'utf8'));
  expect(summaryDownload.suggestedFilename()).toBe(`product-portfolio-imports-${summary[0].reporting_month}-summary.csv`);
  expect(summary).toHaveLength(2);expect(summary[0]).toMatchObject({product_code:'090121',current_value_usd:'100',previous_value_usd:'50',measure:'GEN_VAL_MO'});expect(summary[1].current_value_usd).toBe('1200');
  downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download partner changes CSV'}).click();
  const partnersDownload=await downloaded;const partners=parseCsv(await readFile(await partnersDownload.path(),'utf8'));expect(partnersDownload.suggestedFilename()).toBe(`product-portfolio-imports-${summary[0].reporting_month}-partners.csv`);expect(partners.length).toBeGreaterThan(0);expect(partners.every(r=>r.product_code==='090121'&&r.direction==='imports'&&r.ranking_metric==='dollars')).toBe(true);
  await page.getByRole('radio',{name:'Exports'}).check();await expect(page).toHaveURL(/direction=exports$/);await expect(page.getByRole('heading',{name:'Estimated duties',exact:true})).toHaveCount(0);
  downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download summary CSV'}).click();
  expect(parseCsv(await readFile(await (await downloaded).path(),'utf8'))[0]).toMatchObject({current_value_usd:'200',measure:'ALL_VAL_MO',current_duty_calculated_duty_usd:''});
  await page.goBack();await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();
  await page.goBack();await expect(page.getByRole('checkbox',{name:/Synthetic second product/})).toBeChecked();
  await page.goForward();await expect(page.getByRole('checkbox',{name:/Synthetic second product/})).not.toBeChecked();
  expect(errors).toEqual([]);expect(censusRequests).toEqual([]);
  const ids=await page.locator('[id]').evaluateAll(elements=>elements.map(e=>e.id));expect(new Set(ids).size).toBe(ids.length);
});

test('saved invalid selection has an explanation and keyboard works at narrow widths',async({page})=>{
  for(const width of [320,375]){
    await page.setViewportSize({width,height:812});await page.goto('/briefing/portfolio/?products=999999&direction=exports');
    await expect(page.getByText(/saved briefing selection could not be restored/)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole('radio',{name:'Exports'}).focus();await page.keyboard.press('Space');await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();
    await page.getByRole('checkbox',{name:/Synthetic second product/}).focus();await page.keyboard.press('Space');await expect(page.getByRole('checkbox',{name:/Synthetic second product/})).not.toBeChecked();
  }
});

test('print includes the selected report and provenance while hiding controls',async({page})=>{
  await page.goto('/briefing/portfolio/?products=090121&direction=exports');await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();
  await expect(page.getByRole('button',{name:'Print / Save PDF'})).toBeEnabled();
  await page.emulateMedia({media:'print'});await expect(page.locator('.portfolio-controls')).toBeHidden();
  await expect(page.locator('.portfolio-selection')).toContainText('Exports');await expect(page.getByRole('heading',{name:'Sources and release'})).toBeVisible();
  await mkdir('test-results/portfolio-visual',{recursive:true});await page.pdf({path:'test-results/portfolio-visual/exports.pdf',format:'A4',printBackground:true});
});

test('without JavaScript the default imports research remains readable and printable',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}});
  try{const page=await context.newPage();await page.goto('/briefing/portfolio/?products=090121&direction=exports');
    await expect(page.getByText(/Enable JavaScript to select products/)).toBeVisible();await expect(page.locator('.portfolio-product')).toHaveCount(2);
    await expect(page.getByRole('heading',{name:'Estimated duties',exact:true})).toHaveCount(2);
    await expect(page.getByRole('button',{name:'Download summary CSV'})).toBeDisabled();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
    await page.emulateMedia({media:'print'});await expect(page.locator('.portfolio-controls')).toBeHidden();await expect(page.getByRole('heading',{name:'Roasted coffee · HS 090121'})).toBeVisible();
  }finally{await context.close();}
});


test('portfolio country drilldowns preserve all product direction and period combinations',async({page})=>{
  for(const code of ['090121','090122'])for(const direction of ['imports','exports'])for(const period of ['monthly','rolling']){
    await page.goto(`/briefing/portfolio/?products=${code}&direction=${direction}`);
    await expect(page.getByRole('button',{name:'Copy briefing link'})).toBeEnabled();
    await page.getByRole('link',{name:period==='monthly'?'Explore latest-month country changes':'Explore rolling country changes',exact:true}).click();
    const route=code==='090121'?'/changes/':'/changes/090122/';
    await expect(page).toHaveURL(new URL(`${route}?direction=${direction}&metric=dollars${period==='monthly'?'&period=monthly':''}#changes-heading`,page.url()).href);
    await expect(page.getByRole('button',{name:'Copy changes link'})).toBeEnabled();
    await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
    await expect(page.getByRole('radio',{name:period==='monthly'?'Latest month versus the same month last year':'Rolling twelve months',exact:true})).toBeChecked();
    await expect(page.getByLabel('Rank changes by')).toHaveValue('dollars');
    await expect(page.locator('.page-heading')).toContainText(`HS ${code}`);
  }
});

test('a no-JavaScript monthly drilldown explains the static destination default',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:812}});
  try{
    const page=await context.newPage();await page.goto('/briefing/portfolio/');
    await page.getByRole('article',{name:'Roasted coffee · HS 090121'}).getByRole('link',{name:'Explore latest-month country changes',exact:true}).click();
    await expect(page.getByRole('radio',{name:'Rolling twelve months',exact:true})).toBeChecked();
    await expect(page.getByRole('radio',{name:'Latest month versus the same month last year',exact:true})).toBeDisabled();
    await expect(page.getByText(/initial view shows U.S. imports ranked by dollar change over rolling twelve months/)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{await context.close();}
});
