import {test,expect,type Page,type Locator} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';

const exportsPath='/products/090121/?direction=exports&months=12&countries=4759%2C1220';
const importsPath='/products/090121/?direction=imports&months=60&countries=1220';
const ready=async(page:Page)=>{await expect(page.getByRole('button',{name:'Copy view link'})).toBeEnabled();};
const dataCsv=async(page:Page)=>{
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download data CSV',exact:true}).click();
  return readFile(await (await downloaded).path(),'utf8');
};
const tabTo=async(page:Page,control:Locator)=>{
  for(let i=0;i<35;i++){await page.keyboard.press('Tab');if(await control.evaluate(element=>element===document.activeElement))return;}
  throw new Error('Control was not reachable through Tab navigation');
};

test('a copied multi-country view restores its filters, figures and identical CSV after reopening',async({page,context,baseURL})=>{
  const errors:string[]=[],requests:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto(exportsPath);await ready(page);
  await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();await expect(page.getByLabel('History window')).toHaveValue('12');
  for(const name of ['ITALY','CANADA'])await expect(page.getByRole('checkbox',{name})).toBeChecked();
  const table=page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'});await expect(table.getByRole('row')).toHaveCount(13);await expect(table.getByRole('cell',{name:'$50',exact:true})).toHaveCount(24);
  await expect(page.locator('.summary-grid .stat').first()).toContainText('$200');await expect(page.getByRole('region',{name:'Estimated duties',exact:true})).toHaveCount(0);
  const csv=await dataCsv(page);expect(csv.trim().split('\r\n')).toHaveLength(25);expect(csv).toContain('exports,4759,ITALY,50,reported,ALL_VAL_MO');expect(csv).toContain('exports,1220,CANADA,50,reported,ALL_VAL_MO');
  await page.getByRole('button',{name:'Copy view link'}).click();await expect(page.getByText('View link copied.')).toBeVisible();
  const link=await page.evaluate(()=>navigator.clipboard.readText());expect(link).toBe(new URL(exportsPath,baseURL).href);
  await page.goto(link);await ready(page);expect(await dataCsv(page)).toBe(csv);
  await page.reload();await ready(page);expect(await dataCsv(page)).toBe(csv);
  await mkdir('test-results/view-links-visual',{recursive:true});await page.screenshot({path:'test-results/view-links-visual/desktop.png',fullPage:true});
  expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('saved country gaps remain unavailable and browser back/forward restores complete selections',async({page})=>{
  await page.goto(importsPath);await ready(page);await expect(page.getByRole('checkbox',{name:'CANADA'})).toBeChecked();
  const table=page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'});await expect(table.getByRole('row').filter({hasText:'Jul 2024'})).toContainText('Unavailable');
  const duties=page.getByRole('region',{name:'Estimated duties',exact:true});await expect(duties.getByRole('heading',{name:'CANADA',exact:true})).toBeVisible();await expect(duties).toContainText('comparisons are unavailable');
  await page.goto(exportsPath);await ready(page);await page.goBack();await ready(page);await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();await expect(page.getByLabel('History window')).toHaveValue('60');await expect(page.getByRole('checkbox',{name:'CANADA'})).toBeChecked();await expect(page.getByRole('checkbox',{name:'ITALY'})).not.toBeChecked();
  await page.goForward();await ready(page);await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();await expect(page.getByLabel('History window')).toHaveValue('12');await expect(page.getByRole('checkbox',{name:'ITALY'})).toBeChecked();
  // Also exercise same-document history, where React must handle popstate without reloading.
  await page.evaluate(path=>{history.pushState({savedView:true},'',path);dispatchEvent(new PopStateEvent('popstate'));},importsPath);
  await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();await page.goBack();await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();await page.goForward();await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();
});

test('invalid selections explain the default and blocked clipboard copying has a usable mobile keyboard fallback',async({page,baseURL})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator.clipboard,'writeText',{value:async()=>{throw new Error('Denied');}});});
  await page.setViewportSize({width:375,height:812});await page.goto('/products/090121/?direction=exports&countries=9999#changes-heading');await ready(page);
  await expect(page.getByText(/could not be restored/)).toBeVisible();await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();
  await page.getByLabel('History window').selectOption('12');await expect(page.getByText(/could not be restored/)).toHaveCount(0);await expect(page).toHaveURL(/direction=imports&months=12#changes-heading$/);
  await page.locator('body').click({position:{x:1,y:1}});await tabTo(page,page.getByRole('button',{name:'Copy view link'}));await page.keyboard.press('Enter');
  const link=page.getByLabel('View link',{exact:true});await expect(link).toHaveValue(new URL('/products/090121/?direction=imports&months=12#changes-heading',baseURL).href);await expect(page.getByText(/Select and copy the view link below/)).toBeVisible();
  await tabTo(page,link);expect(await link.evaluate(element=>(element as HTMLInputElement).selectionStart===0&&(element as HTMLInputElement).selectionEnd===(element as HTMLInputElement).value.length)).toBe(true);
  await page.getByRole('checkbox',{name:'ITALY'}).check();await expect(link).toHaveValue(new URL('/products/090121/?direction=imports&months=12&countries=4759#changes-heading',baseURL).href);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('.view-link').screenshot({path:'test-results/view-links-visual/mobile-fallback.png'});
});

test('country links from the briefing and changes page open the matching profile view',async({page})=>{
  await page.goto('/briefing/');const highlight=page.getByRole('region',{name:'Annual export partner changes'}).getByRole('link',{name:'CANADA',exact:true});await expect(highlight).toHaveAttribute('href','/products/090121/?direction=exports&months=12&countries=1220');await highlight.click();await ready(page);await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();await expect(page.getByRole('checkbox',{name:'CANADA'})).toBeChecked();
  await page.goto('/changes/');const italy=page.getByRole('region',{name:'What changed?',exact:true}).getByRole('link',{name:'ITALY',exact:true});await expect(italy).toHaveAttribute('href','/products/090121/?direction=imports&months=12&countries=4759');await italy.click();await ready(page);await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();await expect(page.getByRole('checkbox',{name:'ITALY'})).toBeChecked();await expect(page.getByLabel('History window')).toHaveValue('12');
});

test('a shared URL explains the default research view when JavaScript is disabled',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL,viewport:{width:375,height:812}});const page=await context.newPage();await page.goto(exportsPath);
  await expect(page.locator('noscript p').first()).toContainText('Enable JavaScript to restore saved selections');await expect(page.locator('noscript p').first()).toContainText('The initial view shows U.S. imports');await expect(page.getByRole('button',{name:'Copy view link'})).toBeDisabled();await expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();
  await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'}).getByRole('row')).toHaveCount(25);await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).toContainText('All partner countries');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});
