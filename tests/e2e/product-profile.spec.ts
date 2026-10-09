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
  await page.getByLabel('History window').selectOption('12');await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'}).getByRole('row')).toHaveCount(13);
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
  await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const axis=page.locator('svg:visible text[text-anchor="end"]').first();
  expect(await axis.evaluate(element=>Number(element.getAttribute('font-size'))*(element as SVGGraphicsElement).getScreenCTM()!.a)).toBeGreaterThanOrEqual(10);
  await tabTo(page,page.getByRole('radio',{name:'Imports'}));await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();
  await tabTo(page,page.getByLabel('History window'));await page.keyboard.press('ArrowDown');
  await expect(page.getByLabel('History window')).toHaveValue('12');
  for(const name of ['CANADA','GERMANY','ITALY']){await tabTo(page,page.getByRole('checkbox',{name}));await page.keyboard.press('Space');}
  await expect(page.getByRole('checkbox',{name:'MEXICO'})).toBeDisabled();
  await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'}).getByRole('row')).toHaveCount(13);
  await tabTo(page,page.getByRole('button',{name:'Download data CSV'}));const csvDownload=page.waitForEvent('download');await page.keyboard.press('Enter');
  expect((await csvDownload).suggestedFilename()).toBe('hs-090121-exports.csv');
  await page.screenshot({path:'test-results/visual/mobile.png',fullPage:true});
  await tabTo(page,page.getByRole('button',{name:'Download chart PNG'}));const download=page.waitForEvent('download');await page.keyboard.press('Enter');
  expect((await download).suggestedFilename()).toBe('hs-090121-exports.png');
});
test('missing partner data is unavailable and leaves a chart gap',async({page})=>{
  await openProfile(page);await page.getByRole('checkbox',{name:'CANADA'}).check();
  await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'}).getByRole('row').filter({hasText:'Jul 2024'})).toContainText('Unavailable');
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
test('initial research and methods remain available without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();
  await page.goto('/products/090121/');await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).toBeVisible();
  await expect(page.getByRole('region',{name:'What changed?',exact:true}).getByRole('table',{name:'Largest increases · dollar change'})).toBeVisible();
  // Playwright's text locator deliberately excludes noscript elements.
  await expect(page.locator('noscript p').first()).toBeVisible();
  await expect(page.locator('noscript p')).toContainText(['Enable JavaScript to change the ranking, trade direction or download a CSV.','Enable JavaScript to select countries, change trade direction or download the estimated duties CSV.']);
  await page.getByRole('link',{name:'Source & methods'}).click();await expect(page.getByRole('heading',{name:'Sources & methods'})).toBeVisible();await context.close();
});

test('changes rankings and downloaded CSV match the direction and ranking measure',async({page})=>{
  await openProfile(page);const changes=page.getByRole('region',{name:'What changed?',exact:true});
  await expect(changes).toContainText('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
  await expect(changes.getByRole('status')).toContainText('1 country excluded');
  await expect(changes.getByRole('row',{name:/CANADA/})).toHaveCount(0);
  await changes.getByLabel('Rank changes by').selectOption('share');
  const decreases=changes.getByRole('table',{name:'Largest decreases · country share change'});
  await expect(decreases.getByRole('row',{name:/GERMANY/})).toContainText('-3.0 pp');
  const initial=await changes.getByRole('table').allTextContents();
  await page.getByRole('checkbox',{name:'ITALY'}).check();await page.getByLabel('History window').selectOption('12');
  expect(await changes.getByRole('table').allTextContents()).toEqual(initial);
  const downloaded=page.waitForEvent('download');await changes.getByRole('button',{name:'Download changes CSV'}).click();
  const file=await downloaded;expect(file.suggestedFilename()).toBe('hs-090121-imports-changes-share.csv');
  const csv=await readFile(await file.path(),'utf8');
  const [header,...lines]=csv.trim().split('\r\n');const columns=header.split(',');
  const records=lines.map(line=>Object.fromEntries(line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((value,i)=>[columns[i],value.replace(/^"|"$/g,'').replaceAll('""','"')])));
  expect(records.map(row=>row.partner_code)).toEqual(['4759','2010','4280']);
  expect(records.slice(0,2).map(row=>Number(row.share_change_percentage_points))).toEqual([1,1]);
  expect(Number(records[2].share_change_percentage_points)).toBeCloseTo(-3);
  for(const row of records){expect(row.ranking_metric).toBe('share');expect(row.direction).toBe('imports');expect(row.current_period_start).toBe('2025-01');expect(row.previous_period_end).toBe('2024-12');expect(row.source).toBe('Development sample data');expect(row.measure).toBe('GEN_VAL_MO');}
  await page.getByRole('radio',{name:'Exports'}).check();await expect(changes.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
  await expect(changes.getByRole('status')).toContainText('4 countries have no change');
  await changes.getByLabel('Rank changes by').selectOption('dollars');
  await expect(changes.getByRole('row',{name:/CANADA/})).toContainText('$600');
  const exported=page.waitForEvent('download');await changes.getByRole('button',{name:'Download changes CSV'}).click();
  const exportCsv=await readFile(await (await exported).path(),'utf8');
  expect(exportCsv).toContain('exports,1220,CANADA,600,300,300,100,25,25,0');expect(exportCsv).toContain('ALL_VAL_MO');
  await changes.screenshot({path:'test-results/visual/changes-desktop.png'});
});

test('changes controls and horizontal tables are usable by keyboard on mobile',async({page})=>{
  await page.setViewportSize({width:375,height:812});await openProfile(page);
  const changes=page.getByRole('region',{name:'What changed?',exact:true});
  await tabTo(page,changes.getByLabel('Rank changes by'));await page.keyboard.press('ArrowDown');
  await expect(changes.getByLabel('Rank changes by')).toHaveValue('share');
  await tabTo(page,changes.getByRole('button',{name:'Download changes CSV'}));
  const downloaded=page.waitForEvent('download');await page.keyboard.press('Enter');
  expect((await downloaded).suggestedFilename()).toBe('hs-090121-imports-changes-share.csv');
  const scrolling=changes.getByRole('region',{name:'Scrollable largest increases · country share change'});
  await tabTo(page,scrolling);for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');
  await expect.poll(()=>scrolling.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await changes.screenshot({path:'test-results/visual/changes-mobile.png'});
});
test('estimated duties use matching monthly and rolling consumption values and follow country selection',async({page})=>{
 await openProfile(page);const duties=page.getByRole('region',{name:'Estimated duties',exact:true});await expect(duties).toContainText('7.500%');await expect(duties).toContainText('+2.500 pp');await expect(duties).toContainText('RP70/79');
 await expect(duties.getByRole('table',{name:'Monthly estimated duties · All partner countries'}).getByRole('row')).toHaveCount(25);
 const downloaded=page.waitForEvent('download');await duties.getByRole('button',{name:'Download estimated duties CSV'}).click();const csv=await readFile(await (await downloaded).path(),'utf8');
 const [header,...lines]=csv.trim().split('\r\n'),columns=header.split(',');const records=lines.map(line=>Object.fromEntries(line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((value,index)=>[columns[index],value.replace(/^"|"$/g,'').replaceAll('""','"')])));
 expect(records).toHaveLength(26);const current=records.find(row=>row.record_type==='rolling_current')!;expect(current.calculated_duty_usd).toBe('30');expect(current.consumption_value_usd).toBe('400');expect(current.duty_share_percent).toBe('7.5');expect(current.affected_dutiable_value_usd).toBe('100');expect(current.duty_share_change_percentage_points).toBe('2.5');expect(current.denominator_measure).toBe('CON_VAL_MO');
 await page.getByRole('checkbox',{name:'CANADA'}).check();await expect(duties.getByRole('heading',{name:'CANADA',exact:true})).toBeVisible();await expect(duties).toContainText('comparisons are unavailable');await page.getByRole('radio',{name:'Exports'}).check();await expect(duties).toHaveCount(0);
});
test('estimated duties tables and download are keyboard accessible on mobile without page overflow',async({page})=>{
 await page.setViewportSize({width:375,height:812});await openProfile(page);const duties=page.getByRole('region',{name:'Estimated duties',exact:true});const scrolling=duties.getByRole('region',{name:'Scrollable monthly estimated duties · All partner countries'});
 await tabTo(page,scrolling);for(let index=0;index<8;index++)await page.keyboard.press('ArrowRight');await expect.poll(()=>scrolling.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
 await tabTo(page,duties.getByRole('button',{name:'Download estimated duties CSV'}));const downloaded=page.waitForEvent('download');await page.keyboard.press('Enter');expect((await downloaded).suggestedFilename()).toBe('hs-090121-imports-estimated-duties.csv');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await duties.screenshot({path:'test-results/visual/duties-mobile.png'});
});
