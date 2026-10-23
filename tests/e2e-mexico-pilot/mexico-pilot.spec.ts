import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';
const path='/countries/2010/';
async function open(page:Page){expect((await page.goto(path))?.status()).toBe(200);await expect(page.getByRole('button',{name:'Download monthly CSV'})).toBeEnabled();}
async function download(page:Page,name:string){const [file]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name}).click()]);return {name:file.suggestedFilename(),rows:parseCsv(await readFile((await file.path())!,'utf8'))};}
test('both directions have exact cards and sourced monthly/summary CSVs',async({page})=>{
 await open(page);await expect(page.getByRole('heading',{name:'Mexico — all-goods trade'})).toBeVisible();await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
 for(const direction of ['imports','exports'] as const){
  await page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports'}).check();const factor=direction==='imports'?1:2;
  await expect(page.getByLabel('Current twelve-month total')).toContainText(direction==='imports'?'$33,000':'$66,000');
  const monthly=await download(page,'Download monthly CSV');expect(monthly.rows).toHaveLength(24);expect(monthly.rows[0]).toMatchObject({direction,value_usd:String(1000*factor),original_source_url:'',publication_status:'synthetic-public-pilot-fixture',publication_scope:'all-goods-only',acceptance_scope:'synthetic-local'});
  const summary=await download(page,'Download summary CSV');expect(summary.rows).toHaveLength(1);expect(summary.rows[0]).toMatchObject({current_total_usd:String(33000*factor),prior_total_usd:String(18600*factor),product_comparisons_available:'false'});
  expect(summary.name).toContain('mexico-2010-'+direction+'-2024-09-2026-08-public-pilot-fixture-summary.csv');
 }
});
test('keyboard-only switching, disclosure and CSV download work',async({page})=>{
 await open(page);await page.getByRole('radio',{name:'Imports'}).focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();
 await page.keyboard.press('Tab');const details=page.locator('summary',{hasText:'Monthly values and sources'});await expect(details).toBeFocused();await page.keyboard.press('Space');
 await expect(page.getByRole('table',{name:'Monthly U.S. exports to Mexico — nominal USD'})).toBeVisible();await page.keyboard.press('Tab');await expect(page.getByRole('region',{name:'Monthly Mexico values'})).toBeFocused();
 await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Download monthly CSV'})).toBeFocused();
 const [file]=await Promise.all([page.waitForEvent('download'),page.keyboard.press('Enter')]);expect(file.suggestedFilename()).toContain('-exports-');
});
test('mobile history and qualifications stay usable without document overflow',async({page})=>{
 await page.setViewportSize({width:375,height:812});await open(page);await expect(page.locator('.mx-chart-mobile')).toBeVisible();await expect(page.locator('.mx-chart-desktop')).toBeHidden();
 await page.locator('summary',{hasText:'Monthly values and sources'}).click();await expect(page.getByRole('table')).toBeVisible();
 await page.locator('summary',{hasText:'Sources and snapshot qualifications'}).click();await expect(page.getByText(/whole-snapshot counts across Imports and Exports/)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('history uses visible light and dark theme colours',async({page})=>{
 await open(page);const line=page.locator('.mx-chart-desktop [data-monthly-line]');const light=await line.evaluate(e=>getComputedStyle(e).stroke);expect(light).not.toBe('none');
 await page.getByRole('switch',{name:'Dark theme'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 const dark=await line.evaluate(e=>getComputedStyle(e).stroke);expect(dark).not.toBe(light);expect(dark).not.toBe('none');await expect(line).toBeVisible();
});
test('no-JavaScript Imports, figures and native details remain readable',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false});try{const page=await context.newPage();await page.goto(path);
 await expect(page.getByLabel('Current twelve-month total')).toContainText('$33,000');await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();await expect(page.getByRole('button',{name:'Download monthly CSV'})).toBeDisabled();
 await page.locator('summary',{hasText:'Monthly values and sources'}).click();await expect(page.getByRole('table')).toBeVisible();await expect(page.getByRole('table').getByRole('row')).toHaveCount(25);
 await expect(page.getByText(/Direction switching and CSV downloads require JavaScript/)).toBeVisible();
 }finally{await context.close();}
});
test('controls stay disabled before hydration and enable only when ready',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});await page.route(/\/_astro\/.*\.js(?:\?.*)?$/,async route=>{await gate;await route.continue();});
 try{await page.goto(path,{waitUntil:'commit'});await expect(page.getByRole('heading',{name:'Mexico — all-goods trade'})).toBeVisible();await expect(page.getByRole('radio',{name:'Exports'})).toBeDisabled();await expect(page.getByRole('button',{name:'Download summary CSV'})).toBeDisabled();}finally{release();}
 await expect(page.getByRole('radio',{name:'Exports'})).toBeEnabled();await expect(page.getByRole('button',{name:'Download summary CSV'})).toBeEnabled();
});
test('download failures remain visible and a retry succeeds',async({page})=>{
 await open(page);await page.evaluate(()=>{const original=URL.createObjectURL;let failed=false;URL.createObjectURL=function(blob){if(!failed){failed=true;throw Error('simulated browser denial');}return original.call(this,blob);};});
 await page.getByRole('button',{name:'Download monthly CSV'}).click();await expect(page.getByRole('alert')).toContainText('Download unavailable. Please try again.');
 const file=await download(page,'Download monthly CSV');expect(file.rows).toHaveLength(24);await expect(page.getByRole('alert')).toHaveCount(0);
});

test('public synthetic metadata, withheld comparisons and distinct country navigation are honest',async({page})=>{
 await open(page);await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/Synthetic Mexico.*no accepted Mexico release/);
 await expect(page.getByText('COUNTRY RESEARCH / HISTORICAL SNAPSHOT')).toBeVisible();
 await expect(page.getByText(/Synthetic development sample · No accepted Mexico release/)).toBeVisible();
 await expect(page.getByText(/local preview|unpublished/i)).toHaveCount(0);
 await expect(page.getByText(/Product comparisons are unavailable pending classification verification/)).toBeVisible();
 await expect(page.getByRole('combobox')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:/products|categories|duties|rankings/i})).toHaveCount(0);
 await page.locator('summary',{hasText:'Sources and snapshot qualifications'}).click();
 await expect(page.getByText(/17 ordinary classification pairs remain unverified/)).toBeVisible();
 await expect(page.getByText(/16 matches and 32 differences/)).toBeVisible();
 await page.getByRole('link',{name:'Canada historical snapshot',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Canada historical snapshot',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Mexico — all-goods trade'})).toHaveCount(0);
 await page.getByRole('link',{name:'Mexico all-goods snapshot',exact:true}).click();await expect(page.getByRole('heading',{name:'Mexico — all-goods trade'})).toBeVisible();
 await page.goto('/');await expect(page.getByRole('link',{name:'Canada historical snapshot',exact:true})).toHaveCount(1);
 await expect(page.getByRole('link',{name:'Mexico all-goods snapshot',exact:true})).toHaveCount(1);
 await page.goto('/methods/');await expect(page.getByRole('heading',{name:'Mexico snapshot'})).toBeVisible();await expect(page.getByText(/32 of 48 dated publication checks differ/)).toBeVisible();
 for(const privatePath of ['/preview/mexico/2010/','/preview/countries/2010/','/preview/accepted/countries/2010/','/data/countries/2010/processed/current.json'])expect((await page.goto(privatePath))?.status()).toBe(404);
});
for(const width of [320,390])for(const theme of ['light','dark'])test('public history and disclosures fit '+width+'px in '+theme,async({page})=>{
 await page.setViewportSize({width,height:812});await open(page);
 if(theme==='dark')await page.getByRole('switch',{name:'Dark theme'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 await page.locator('summary',{hasText:'Sources and snapshot qualifications'}).click();
 await page.locator('summary',{hasText:'Monthly values and sources'}).click();
 await expect(page.getByRole('table')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
