import {test,expect,type Page,type Locator} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';

const open=async(page:Page)=>{await page.goto('/products/090121/?direction=imports&months=12&countries=4759%2C1220');await expect(page.getByRole('button',{name:'Copy view link'})).toBeEnabled();};
const csv=async(page:Page,name:string)=>{const downloaded=page.waitForEvent('download');await page.getByRole('button',{name,exact:true}).click();return readFile(await (await downloaded).path(),'utf8');};
const tabTo=async(page:Page,control:Locator)=>{for(let i=0;i<40;i++){await page.keyboard.press('Tab');if(await control.evaluate(element=>element===document.activeElement))return;}throw new Error('Control was not reachable through Tab navigation');};

test('search preserves restored selections and downloads while the limit applies across results',async({page,context,baseURL})=>{
  const errors:string[]=[],requests:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await context.grantPermissions(['clipboard-read','clipboard-write']);await open(page);
  const search=page.getByRole('searchbox',{name:'Find a country'}),selected=page.getByRole('list',{name:'Selected countries'}),changes=page.getByRole('region',{name:'What changed?',exact:true});
  const before=await csv(page,'Download data CSV'),dutiesBefore=await csv(page,'Download estimated duties CSV'),ranksBefore=await changes.getByRole('table').allTextContents();
  await search.fill('  mEx  ');await expect(page.getByRole('checkbox')).toHaveCount(1);await expect(page.getByRole('checkbox',{name:'MEXICO'})).not.toBeChecked();await expect(selected.getByRole('button')).toHaveCount(2);
  expect(await csv(page,'Download data CSV')).toBe(before);expect(await csv(page,'Download estimated duties CSV')).toBe(dutiesBefore);expect(await changes.getByRole('table').allTextContents()).toEqual(ranksBefore);await expect(page).toHaveURL(/direction=imports&months=12&countries=4759%2C1220$/);
  await page.getByRole('checkbox',{name:'MEXICO'}).check();await search.fill('4280');await expect(page.getByRole('checkbox',{name:'GERMANY'})).toBeDisabled();await expect(page.getByText('3 of 3 selected',{exact:true})).toBeVisible();
  await selected.getByRole('button',{name:'Remove ITALY'}).click();await expect(search).toBeFocused();await expect(page.getByRole('checkbox',{name:'GERMANY'})).toBeEnabled();await page.getByRole('checkbox',{name:'GERMANY'}).check();
  const current=await csv(page,'Download data CSV');expect(current.trim().split('\r\n')).toHaveLength(37);for(const [code,name] of [['1220','CANADA'],['2010','MEXICO'],['4280','GERMANY']])expect(current).toContain(`imports,${code},${name},25,reported,GEN_VAL_MO`);expect(current).not.toContain('imports,4759,ITALY');
  await page.getByRole('button',{name:'Copy view link'}).click();await expect(page.getByText('View link copied.')).toBeVisible();expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(new URL('/products/090121/?direction=imports&months=12&countries=1220%2C2010%2C4280',baseURL).href);
  await page.reload();await expect(page.getByRole('button',{name:'Copy view link'})).toBeEnabled();await expect(search).toHaveValue('');expect(await csv(page,'Download data CSV')).toBe(current);await expect(selected.getByRole('button')).toHaveCount(3);
  await mkdir('test-results/country-picker-visual',{recursive:true});await page.locator('.comparison-card').screenshot({path:'test-results/country-picker-visual/desktop.png'});expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('mobile search, hidden selection removal and clear search work by keyboard without overflow',async({page})=>{
  await page.setViewportSize({width:375,height:812});await open(page);const search=page.getByRole('searchbox',{name:'Find a country'});
  await tabTo(page,search);await page.keyboard.type('not-a-country');await expect(page.getByText(/No matching countries/)).toBeVisible();await expect(page.getByRole('checkbox')).toHaveCount(0);
  await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Clear country search'})).toBeFocused();await page.keyboard.press('Enter');await expect(search).toBeFocused();await expect(page.getByRole('checkbox')).toHaveCount(4);
  await page.keyboard.type('2010');await tabTo(page,page.getByRole('checkbox',{name:'MEXICO'}));await page.keyboard.press('Space');await expect(page.getByText('3 of 3 selected',{exact:true})).toBeVisible();
  // Hidden restored selections stay ahead of the filtered result in keyboard order.
  await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Remove MEXICO'})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Remove CANADA'})).toBeFocused();await page.keyboard.press('Enter');await expect(search).toBeFocused();await expect(page.getByText('2 of 3 selected',{exact:true})).toBeVisible();
  await page.locator('.comparison-card').screenshot({path:'test-results/country-picker-visual/mobile.png'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('radio',{name:'Exports'}).check();await expect(page.getByRole('searchbox',{name:'Find a country'})).toHaveValue('');await expect(page.getByRole('list',{name:'Selected countries'})).toHaveCount(0);await expect(page.getByText('0 of 3 selected',{exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'Estimated duties',exact:true})).toHaveCount(0);
});

test('country names and research remain readable without JavaScript while picker controls are disabled',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}}),page=await context.newPage();
  try{await page.goto('/products/090121/?direction=exports&countries=1220');await expect(page.getByRole('searchbox',{name:'Find a country'})).toBeDisabled();await expect(page.getByRole('checkbox')).toHaveCount(4);for(const checkbox of await page.getByRole('checkbox').all())await expect(checkbox).toBeDisabled();await expect(page.locator('noscript p').first()).toContainText('find and select countries');await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).toContainText('All partner countries');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}finally{await context.close();}
});
