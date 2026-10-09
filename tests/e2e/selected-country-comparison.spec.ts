import {test,expect,type Page,type Locator} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';

const open=async(page:Page)=>{await page.goto('/products/090121/?direction=imports&months=12&countries=4759%2C1220');await expect(page.getByRole('button',{name:'Copy view link'})).toBeEnabled();};
const summary=(page:Page)=>page.getByRole('region',{name:'Selected country comparison',exact:true});
const csv=async(page:Page)=>{const downloaded=page.waitForEvent('download');await summary(page).getByRole('button',{name:'Download selected countries CSV'}).click();const download=await downloaded;expect(download.suggestedFilename()).toMatch(/^hs-090121-(imports|exports)-selected-countries.csv$/);return readFile(await download.path(),'utf8');};
const records=(text:string)=>{const [header,...lines]=text.trim().split('\r\n'),columns=header.split(',');return lines.map(line=>Object.fromEntries(line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((value,i)=>[columns[i],value.replace(/^"|"$/g,'').replaceAll('""','"')])));};
const tabTo=async(page:Page,control:Locator)=>{for(let i=0;i<40;i++){await page.keyboard.press('Tab');if(await control.evaluate(element=>element===document.activeElement))return;}throw new Error('Control was not reachable through Tab navigation');};

test('selected annual comparisons and CSV survive chart filters and saved links, then follow country and direction changes',async({page,context,baseURL})=>{
  const errors:string[]=[],requests:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await context.grantPermissions(['clipboard-read','clipboard-write']);await open(page);
  await expect(page.getByRole('region',{name:'U.S. trade totals'})).toContainText('U.S. total · latest month · imports');
  await expect(summary(page)).toContainText('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
  const table=summary(page).getByRole('table'),rows=table.getByRole('row');await expect(rows).toHaveCount(3);
  expect(await rows.nth(1).getByRole('cell').allTextContents()).toEqual(['$300','$144','+$156','+108.3%','25.0%','24.0%','+1.0 pp']);
  expect(await rows.nth(2).getByRole('cell').allTextContents()).toEqual(['$300','Unavailable','Unavailable','Unavailable','25.0%','Unavailable','Unavailable']);
  const before=await csv(page),data=records(before);expect(data.map(row=>row.partner_code)).toEqual(['4759','1220']);expect(data[0]).toMatchObject({current_value_usd:'300',previous_value_usd:'144',change_usd:'156',world_current_value_usd:'1200',world_previous_value_usd:'600',current_share_percent:'25',previous_share_percent:'24',share_change_percentage_points:'1',measure:'GEN_VAL_MO',source:'Development sample data'});expect(data[1]).toMatchObject({current_value_usd:'300',previous_value_usd:'',change_usd:'',growth_percent:'',current_share_percent:'25',previous_share_percent:''});
  await page.getByLabel('History window').selectOption('60');await page.getByRole('searchbox',{name:'Find a country'}).fill('mex');await page.getByLabel('Rank changes by').selectOption('share');expect(await csv(page)).toBe(before);
  await page.getByRole('button',{name:'Copy view link'}).click();await expect(page.getByText('View link copied.')).toBeVisible();expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(new URL('/products/090121/?direction=imports&months=60&countries=4759%2C1220',baseURL).href);await page.reload();await expect(page.getByRole('button',{name:'Copy view link'})).toBeEnabled();expect(await csv(page)).toBe(before);
  await mkdir('test-results/selected-comparison-visual',{recursive:true});await summary(page).screenshot({path:'test-results/selected-comparison-visual/desktop.png'});
  await page.getByRole('button',{name:'Remove ITALY'}).click();expect(records(await csv(page)).map(row=>row.partner_code)).toEqual(['1220']);await page.getByRole('button',{name:'Show U.S. total'}).click();await expect(summary(page)).toHaveCount(0);
  await page.getByRole('radio',{name:'Exports'}).check();await expect(summary(page)).toHaveCount(0);await page.getByRole('checkbox',{name:'CANADA'}).check();await expect(summary(page)).toContainText('U.S. exports');expect(records(await csv(page))[0]).toMatchObject({partner_code:'1220',direction:'exports',current_value_usd:'600',previous_value_usd:'300',change_usd:'300',growth_percent:'100',current_share_percent:'25',previous_share_percent:'25',share_change_percentage_points:'0',measure:'ALL_VAL_MO'});expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('mobile annual table scrolls by keyboard and downloads without overflowing the page',async({page})=>{
  await page.setViewportSize({width:375,height:812});await open(page);const scroll=summary(page).getByRole('region',{name:'Scrollable selected country annual comparison'}),download=summary(page).getByRole('button',{name:'Download selected countries CSV'});
  await tabTo(page,scroll);await expect(scroll).toBeFocused();expect(await scroll.evaluate(element=>element.scrollWidth>element.clientWidth)).toBe(true);for(let i=0;i<8;i++)await page.keyboard.press('ArrowRight');await expect.poll(()=>scroll.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press('Tab');await expect(download).toBeFocused();const downloaded=page.waitForEvent('download');await page.keyboard.press('Enter');expect(records(await readFile(await (await downloaded).path(),'utf8'))).toHaveLength(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await summary(page).screenshot({path:'test-results/selected-comparison-visual/mobile.png'});await page.getByRole('button',{name:'Remove CANADA'}).click();await expect(page.getByRole('searchbox',{name:'Find a country'})).toBeFocused();await expect(summary(page).getByRole('row')).toHaveCount(2);
});

test('without JavaScript the national figures remain explicit and saved selections are explained',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}}),page=await context.newPage();
  try{await page.goto('/products/090121/?direction=exports&months=12&countries=1220');await expect(page.getByRole('region',{name:'U.S. trade totals'})).toContainText('U.S. total · latest month · imports');await expect(page.getByRole('region',{name:'U.S. trade totals'})).toContainText('U.S. total · trailing twelve months');await expect(summary(page)).toHaveCount(0);await expect(page.locator('noscript p').first()).toContainText('initial view shows U.S. imports');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}finally{await context.close();}
});

