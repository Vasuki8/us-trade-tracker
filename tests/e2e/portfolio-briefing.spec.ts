import {test,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';

test('selected briefing restores history and downloads matching sourced figures',async({page})=>{
  const errors:string[]=[],censusRequests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(r.url().includes('api.census.gov'))censusRequests.push(r.url());});
  await page.goto('/briefing/portfolio/');await expect(page.getByRole('heading',{name:'Coffee portfolio briefing'})).toBeVisible();
  await page.getByRole('checkbox',{name:/Synthetic second product/}).uncheck();
  await expect(page.getByRole('checkbox',{name:/Roasted coffee/})).toBeDisabled();
  let downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download summary CSV'}).click();
  const summary=parseCsv(await readFile(await (await downloaded).path(),'utf8'));
  expect(summary).toHaveLength(2);expect(summary[0]).toMatchObject({product_code:'090121',current_value_usd:'100',previous_value_usd:'50',measure:'GEN_VAL_MO'});expect(summary[1].current_value_usd).toBe('1200');
  downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download partner changes CSV'}).click();
  const partners=parseCsv(await readFile(await (await downloaded).path(),'utf8'));expect(partners.length).toBeGreaterThan(0);expect(partners.every(r=>r.product_code==='090121'&&r.direction==='imports'&&r.ranking_metric==='dollars')).toBe(true);
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
