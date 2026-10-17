import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';
const table=(page:import('@playwright/test').Page)=>page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'});
test.beforeEach(async({page,baseURL})=>{
 await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(baseURL!).origin?route.continue():route.abort());
});
for(const code of ['090121','090122']){
 test(`${code} recorded revisions follow selected identities, saved links and direction`,async({page,context})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`/products/${code}/?direction=imports&months=60`);await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await expect(table(page).getByRole('row',{name:/Jan 2025/})).toContainText('Revised');
  await expect(page.locator('.desktop-chart circle title').filter({hasText:'Recorded revision'})).toHaveCount(1);
  await expect(page.locator('.desktop-chart')).toContainText('Open circles: recorded revisions');
  const bounds=await page.locator('.desktop-chart text').evaluateAll(elements=>elements.map(e=>{const b=(e as SVGGraphicsElement).getBBox();return {text:e.textContent,right:b.x+b.width};}));
  expect(bounds.filter(b=>b.text?.includes('Open circles'))[0].right).toBeLessThanOrEqual(926);
  await page.getByRole('checkbox',{name:'CANADA',exact:true}).check();
  await expect(table(page).getByRole('row',{name:/Jul 2024/})).toContainText('Unavailable Revised');
  await expect(table(page).getByText('Revised',{exact:true})).toHaveCount(1);
  await expect(page.locator('.desktop-chart circle title').filter({hasText:'Recorded revision'})).toHaveCount(0);
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download data CSV',exact:true}).click();const file=await pending;
  expect(file.suggestedFilename()).toBe(`hs-${code}-imports.csv`);const rows=parseCsv(await readFile((await file.path())!,'utf8'));
  expect(rows.filter(r=>r.observation_recorded_revision==='true')).toEqual([expect.objectContaining({month:'2024-07',partner_code:'1220',value_usd:'',value_status:'unavailable',revised:'true',revised_scope:'merchandise_release'})]);
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.getByRole('button',{name:'Copy view link'}).click();await expect(page.getByRole('status').filter({hasText:'View link copied.'})).toBeVisible();
  const saved=await page.evaluate(()=>navigator.clipboard.readText());await page.goto(saved);await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await expect(page.getByRole('checkbox',{name:'CANADA',exact:true})).toBeChecked();await expect(table(page).getByText('Revised',{exact:true})).toHaveCount(1);
  await page.reload();await expect(page.locator('astro-island[ssr]')).toHaveCount(0);await expect(table(page).getByText('Revised',{exact:true})).toHaveCount(1);
  await page.getByLabel('History window').selectOption('12');await expect(table(page).getByText('Revised',{exact:true})).toHaveCount(0);
  await expect(page.locator('.provenance')).toContainText('Merchandise release revisions: yes');
  await page.getByRole('radio',{name:'Exports'}).check();await expect(table(page).getByText('Revised',{exact:true})).toHaveCount(0);
  await expect(page.locator('.provenance')).toContainText('Merchandise release revisions: yes');expect(errors).toEqual([]);
 });
 test(`${code} marks are present in static research without JavaScript`,async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();
  await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(baseURL!).origin?route.continue():route.abort());
  await page.goto(`/products/${code}/`);await expect(table(page).getByRole('row',{name:/Jan 2025/})).toContainText('Revised');
  await expect(page.getByText(/No mark does not mean never revised or final/)).toBeVisible();
  await expect(page.getByRole('button',{name:'Download data CSV',exact:true})).toBeDisabled();await context.close();
 });
}
for(const width of [320,375])test(`recorded revision labels remain readable at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:812});await page.goto('/products/090121/');await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
 await expect(table(page).getByRole('row',{name:/Jan 2025/})).toContainText('Revised');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const control=page.getByLabel('History window');await expect(control).toBeEnabled();await control.focus();await page.keyboard.press('ArrowDown');await expect(control).toHaveValue('12');await expect(table(page).getByText('Revised',{exact:true})).toHaveCount(1);
 await page.getByRole('checkbox',{name:'CANADA',exact:true}).check();await expect(table(page).getByText('Revised',{exact:true})).toHaveCount(0);
 const scroll=page.getByRole('region',{name:'Scrollable monthly data'});await scroll.focus();await expect(scroll).toBeFocused();
});
