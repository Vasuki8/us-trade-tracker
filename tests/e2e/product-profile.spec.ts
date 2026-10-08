import {test,expect} from '@playwright/test';import {readFile,mkdir,copyFile} from 'node:fs/promises';
const openProfile=async(page:import('@playwright/test').Page)=>{await page.goto('/products/090121/');await expect(page.locator('astro-island')).toHaveCount(1);await expect(page.locator('astro-island[ssr]')).toHaveCount(0);};
const tabTo=async(page:import('@playwright/test').Page,control:import('@playwright/test').Locator)=>{
  for(let i=0;i<30;i++){await page.keyboard.press('Tab');if(await control.evaluate(element=>element===document.activeElement))return;}
  throw new Error('Control was not reachable through Tab navigation');
};
test('active filters, downloads and research provenance stay aligned',async({page})=>{
  const censusRequests:string[]=[];page.on('request',request=>{if(request.url().includes('api.census.gov'))censusRequests.push(request.url());});
  await openProfile(page);await expect(page.getByRole('heading',{name:'Roasted coffee'})).toBeVisible();
  await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  await page.getByRole('radio',{name:'Exports'}).check();
  for(const name of ['CANADA','ITALY','MEXICO'])await page.getByRole('checkbox',{name}).check();
  await expect(page.getByRole('checkbox',{name:'GERMANY'})).toBeDisabled();
  await page.getByLabel('History window').selectOption('12');await expect(page.getByRole('row')).toHaveCount(13);
  const csvDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Download data CSV'}).click();
  const csv=await readFile(await (await csvDownload).path(),'utf8');
  expect(csv).toContain('"COFFEE, ROASTED, NOT DECAFFEINATED",exports,1220,CANADA,50,reported,ALL_VAL_MO');
  expect(csv).toContain('Development sample data');expect(csv).toContain('2026-01-01T00:00:00.000Z');
  // This fixture has one CSV record per line; parse quoted commas independently of the exporter.
  const [header,...lines]=csv.trim().split('\r\n');const columns=header.split(',');
  const records=lines.map(line=>Object.fromEntries(line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((value,i)=>[columns[i],value.replace(/^"|"$/g,'').replaceAll('""','"')])));
  expect(records).toHaveLength(36);
  expect([...new Set(records.map(row=>row.month))].sort()).toEqual(Array.from({length:12},(_,i)=>`2025-${String(i+1).padStart(2,'0')}`));
  expect([...new Set(records.map(row=>row.partner_code))].sort()).toEqual(['1220','2010','4759']);
  for(const row of records){expect(row.direction).toBe('exports');expect(row.value_usd).toBe('50');expect(row.measure).toBe('ALL_VAL_MO');}
  await expect(page.getByRole('cell',{name:'$50',exact:true})).toHaveCount(36);
  const pngDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Download chart PNG'}).click();
  const downloaded=await pngDownload;const bytes=await readFile(await downloaded.path());
  expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');expect(bytes.readUInt32BE(16)).toBe(1920);expect(bytes.readUInt32BE(20)).toBe(1080);
  await mkdir('test-results/visual',{recursive:true});await copyFile(await downloaded.path(),'test-results/visual/chart.png');
  expect(censusRequests).toEqual([]);await page.screenshot({path:'test-results/visual/desktop.png',fullPage:true});
});
test('mobile controls work without page overflow and are keyboard accessible',async({page})=>{
  await page.setViewportSize({width:375,height:812});await openProfile(page);
  await expect(page.getByRole('table')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const axis=page.locator('svg:visible text[text-anchor="end"]').first();
  expect(await axis.evaluate(element=>Number(element.getAttribute('font-size'))*(element as SVGGraphicsElement).getScreenCTM()!.a)).toBeGreaterThanOrEqual(10);
  await tabTo(page,page.getByRole('radio',{name:'Imports'}));await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();
  await tabTo(page,page.getByLabel('History window'));await page.keyboard.press('ArrowDown');
  await expect(page.getByLabel('History window')).toHaveValue('12');
  for(const name of ['CANADA','GERMANY','ITALY']){await tabTo(page,page.getByRole('checkbox',{name}));await page.keyboard.press('Space');}
  await expect(page.getByRole('checkbox',{name:'MEXICO'})).toBeDisabled();
  await expect(page.getByRole('row')).toHaveCount(13);
  await tabTo(page,page.getByRole('button',{name:'Download data CSV'}));const csvDownload=page.waitForEvent('download');await page.keyboard.press('Enter');
  expect((await csvDownload).suggestedFilename()).toBe('hs-090121-exports.csv');
  await page.screenshot({path:'test-results/visual/mobile.png',fullPage:true});
  await tabTo(page,page.getByRole('button',{name:'Download chart PNG'}));const download=page.waitForEvent('download');await page.keyboard.press('Enter');
  expect((await download).suggestedFilename()).toBe('hs-090121-exports.png');
});
test('missing partner data is unavailable and leaves a chart gap',async({page})=>{
  await openProfile(page);await page.getByRole('checkbox',{name:'CANADA'}).check();
  await expect(page.getByRole('row').filter({hasText:'Jul 2024'})).toContainText('Unavailable');
  expect(await page.locator('svg:visible circle title').allTextContents()).not.toContain('Jul 2024: $0');
  await expect(page.locator('svg:visible circle')).toHaveCount(23);
});
test('a PNG failure leaves CSV export usable',async({page})=>{
  await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=(()=>null) as typeof HTMLCanvasElement.prototype.getContext;});
  await openProfile(page);await page.getByRole('button',{name:'Download chart PNG'}).click();
  await expect(page.getByRole('alert')).toContainText('still download');
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download data CSV'}).click();
  expect((await downloaded).suggestedFilename()).toMatch(/\.csv$/);
});
test('initial research and methods remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4321/products/090121/');await expect(page.getByRole('table')).toBeVisible();
  await page.getByRole('link',{name:'Source & methods'}).click();await expect(page.getByRole('heading',{name:'Sources & methods'})).toBeVisible();await context.close();
});
