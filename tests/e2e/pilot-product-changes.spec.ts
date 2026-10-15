import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('pilot product changes switches directions, applies growth threshold and downloads displayed rows',async({page})=>{
  const errors:string[]=[],requests:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await page.goto('/changes/090122/');await page.getByRole('link',{name:'Compare changes across reviewed products',exact:true}).click();
  await expect(page).toHaveURL(/\/changes\/products\/$/);await expect(page.getByRole('heading',{name:'Product changes',exact:true})).toBeVisible();
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const table=page.getByRole('table',{name:'Largest product increases · dollar change'});
  await expect(table.getByRole('row').nth(1)).toContainText('Synthetic second product');await expect(table.getByRole('row').nth(1)).toContainText('+$1,800');
  await page.getByRole('radio',{name:'Exports',exact:true}).check();await expect(table.getByRole('row').nth(1)).toContainText('+$3,600');
  const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download product changes CSV'}).click();const file=await event;
  expect(file.suggestedFilename()).toBe('pilot-products-exports-changes-dollars.csv');const csv=await readFile(await file.path(),'utf8');
  expect(csv.trim().split('\r\n')).toHaveLength(3);expect(csv).toContain('090122,Synthetic second product,SYNTHETIC PRODUCT 090122,exports,7200,3600,3600,100');expect(csv).toContain('090121');expect(csv).toContain('2025-01,2025-12,2024-01,2024-12');expect(csv).toContain('Development sample data');expect(csv).toContain('ALL_VAL_MO');
  await expect(table.getByRole('link',{name:'Synthetic second product',exact:true})).toHaveAttribute('href','/products/090122/?direction=exports&months=12');
  await page.getByLabel('Rank product changes by').selectOption('growth');await expect(page.getByRole('status')).toContainText('2 below the growth threshold');await expect(page.getByRole('button',{name:'Download product changes CSV'})).toBeDisabled();
  await expect(page.getByRole('table',{name:'Largest product increases · percentage growth'}).getByRole('row')).toHaveCount(1);
  await page.getByLabel('Rank product changes by').selectOption('dollars');await table.getByRole('link',{name:'Synthetic second product',exact:true}).click();await expect(page).toHaveURL(/\/products\/090122\/\?direction=exports&months=12$/);
  expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('pilot import rankings and product links remain available without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false}),page=await context.newPage();
  try{
    await page.goto('/changes/');await page.getByRole('link',{name:'Compare changes across reviewed products',exact:true}).click();
    await expect(page.getByRole('table',{name:'Largest product increases · dollar change'})).toContainText('+$1,800');
    await expect(page.getByText(/The initial view shows U.S. imports ranked by dollar change over rolling twelve months/)).toBeVisible();
    await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeDisabled();
    await expect(page.getByLabel('Rank product changes by')).toBeDisabled();
    await expect(page.getByRole('button',{name:'Download product changes CSV'})).toBeDisabled();
    await expect(page.getByRole('link',{name:'Compare latest-month figures',exact:true})).toHaveAttribute('href','/briefing/portfolio/?products=090121%2C090122&direction=imports');
    await page.getByRole('table',{name:'Largest product increases · dollar change'}).getByRole('link',{name:'Roasted coffee',exact:true}).click();await expect(page).toHaveURL(/\/products\/090121\/\?direction=imports&months=12$/);
  }finally{await context.close();}
});

test('pilot product controls, table scrolling and download work by keyboard on mobile',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/changes/products/');
  await page.getByRole('radio',{name:'Imports',exact:true}).focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  const table=page.getByRole('region',{name:'Scrollable largest product increases · dollar change'});await table.focus();for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');await expect.poll(()=>table.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Download product changes CSV'}).focus();const event=page.waitForEvent('download');await page.keyboard.press('Enter');expect((await event).suggestedFilename()).toBe('pilot-products-exports-changes-dollars.csv');
});


test('product rankings open the existing monthly report with every product and the selected direction',async({page})=>{
  await page.goto('/changes/products/');
  await expect(page.getByRole('button',{name:'Copy changes link'})).toBeEnabled();
  await page.getByRole('radio',{name:'Exports',exact:true}).check();
  await page.getByLabel('Rank product changes by').selectOption('growth');
  await page.getByRole('link',{name:'Compare latest-month figures',exact:true}).click();
  await expect(page).toHaveURL(/\/briefing\/portfolio\/\?products=090121%2C090122&direction=exports$/);
  await expect(page.getByRole('button',{name:'Copy briefing link'})).toBeEnabled();
  await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('heading',{name:'Latest month',exact:true})).toHaveCount(2);
});
