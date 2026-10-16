import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';
for(const code of ['090121','090122']){
 test(`monthly duty revisions ${code} world labels, CSV and direction isolation`,async({page})=>{
  await page.goto(`/products/${code}/`);
  const download=page.getByRole('button',{name:'Download estimated duties CSV',exact:true});await expect(download).toBeEnabled();
  const table=page.getByRole('table',{name:'Monthly estimated duties · All partner countries'});
  const zero=table.getByRole('row',{name:/Feb 2024/}),denominator=table.getByRole('row',{name:/Feb 2025/});
  await expect(zero.getByRole('cell').nth(0)).toHaveText('$0 Revised');await expect(zero.getByRole('cell').nth(2)).toContainText('Revised input');
  await expect(denominator.getByRole('cell').nth(0).getByText('Revised',{exact:true})).toHaveCount(0);
  await expect(denominator.getByRole('cell').nth(1)).toContainText('Revised');await expect(denominator.getByRole('cell').nth(2)).toContainText('Revised input');
  await expect(page.getByRole('table',{name:'Rolling estimated duties · All partner countries'}).getByText(/^Revised(?: input)?$/)).toHaveCount(0);
  const pending=page.waitForEvent('download');await download.click();const file=await pending;expect(file.suggestedFilename()).toBe(`hs-${code}-imports-estimated-duties.csv`);
  const rows=parseCsv(await readFile(await file.path(),'utf8'));
  expect(rows.find(r=>r.record_type==='monthly'&&r.period_start==='2024-02')).toMatchObject({calculated_duty_usd:'0',recorded_revision_inputs:'CAL_DUT_MO',recorded_revision_scope:'monthly_inputs',revised_scope:'estimated_duty_release',revised:'true'});
  expect(rows.find(r=>r.record_type==='monthly'&&r.period_start==='2025-02')!.recorded_revision_inputs).toBe('CON_VAL_MO');
  expect(rows.filter(r=>r.record_type.startsWith('rolling')).every(r=>r.recorded_revision_scope==='not_assessed'&&r.recorded_revision_inputs==='')).toBe(true);
  await page.getByRole('radio',{name:'Exports',exact:true}).click();await expect(page.getByRole('region',{name:'Estimated duties'})).toHaveCount(0);
  await page.getByRole('radio',{name:'Imports',exact:true}).click();await expect(table).toBeVisible();await expect(zero).toContainText('Revised input');
 });
 test(`monthly duty revisions ${code} restored country includes missing row and coverage`,async({page})=>{
  await page.goto(`/products/${code}/?direction=imports&months=12&countries=1220`);
  const download=page.getByRole('button',{name:'Download estimated duties CSV',exact:true});await expect(download).toBeEnabled();
  const table=page.getByRole('table',{name:'Monthly estimated duties · CANADA'}),removed=table.getByRole('row',{name:/Jul 2024/}),coverage=table.getByRole('row',{name:/Aug 2024/});
  await expect(removed.getByRole('cell').nth(3)).toHaveText('Unavailable Revised');await expect(removed.getByRole('cell').nth(4)).toContainText('Revised input');
  await expect(removed.getByRole('cell').nth(2).getByText('Revised input',{exact:true})).toHaveCount(0);
  await expect(coverage.getByRole('cell').nth(4)).toContainText('Revised input');
  const pending=page.waitForEvent('download');await download.click();const rows=parseCsv(await readFile(await (await pending).path(),'utf8'));
  expect(rows.find(r=>r.record_type==='monthly'&&r.period_start==='2024-07')).toMatchObject({dutiable_value_usd:'',dutiable_value_status:'missing',recorded_revision_inputs:'DUT_VAL_MO'});
  expect(rows.find(r=>r.record_type==='monthly'&&r.period_start==='2024-08')!.recorded_revision_inputs).toBe('coverage');
  await page.getByRole('button',{name:'Show U.S. total',exact:true}).click();await expect(page.getByRole('table',{name:'Monthly estimated duties · All partner countries'})).toBeVisible();
 });
 test(`monthly duty revisions ${code} static default remains readable`,async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});try{const page=await context.newPage();await page.goto(baseURL+`/products/${code}/?direction=exports&countries=1220`);
   const table=page.getByRole('table',{name:'Monthly estimated duties · All partner countries'});await expect(table.getByRole('row',{name:/Feb 2024/})).toContainText('$0 Revised');
   await expect(page.getByText(/Without JavaScript|JavaScript is required|Enable JavaScript/).first()).toBeVisible();
   await expect(page.getByRole('button',{name:'Download duty amounts chart PNG',exact:true})).toBeDisabled();
  }finally{await context.close();}
 });
}
for(const width of [320,375])test(`monthly duty revisions ${width}px keyboard and scroll region`,async({page})=>{
 await page.setViewportSize({width,height:850});await page.goto('/products/090121/?countries=1220');await expect(page.getByRole('button',{name:'Copy view link',exact:true})).toBeEnabled();
 const region=page.getByRole('region',{name:'Scrollable monthly estimated duties · CANADA'});await region.focus();await expect(region).toBeFocused();await page.keyboard.press('ArrowRight');
 await expect(region.getByText('Revised',{exact:true})).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
