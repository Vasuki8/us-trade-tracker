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
    await expect(page.getByText(/Product rankings use rolling twelve-month periods/)).toBeVisible();
    await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeDisabled();
    await expect(page.getByLabel('Rank product changes by')).toBeDisabled();
    await expect(page.getByRole('button',{name:'Download product changes CSV'})).toBeDisabled();
    await expect(page.getByRole('link',{name:'Open portfolio briefing',exact:true})).toHaveAttribute('href','/briefing/portfolio/?products=090121%2C090122&direction=imports');
    await page.getByRole('table',{name:'Largest product increases · dollar change'}).getByRole('link',{name:'Roasted coffee',exact:true}).click();await expect(page).toHaveURL(/\/products\/090121\/\?direction=imports&months=12$/);
  }finally{await context.close();}
});

test('pilot product controls, table scrolling and download work by keyboard on mobile',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/changes/products/');
  await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeEnabled();
  await page.getByRole('radio',{name:'Imports',exact:true}).focus();await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeFocused();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  const table=page.getByRole('region',{name:'Scrollable largest product increases · dollar change'});await table.focus();for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');await expect.poll(()=>table.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Download product changes CSV'}).focus();const event=page.waitForEvent('download');await page.keyboard.press('Enter');expect((await event).suggestedFilename()).toBe('pilot-products-exports-changes-dollars.csv');
});


test('product rankings open the existing monthly report with every product and the selected direction',async({page})=>{
  await page.goto('/changes/products/');
  await expect(page.getByRole('button',{name:'Copy changes link'})).toBeEnabled();
  await page.getByRole('radio',{name:'Exports',exact:true}).check();
  await page.getByLabel('Rank product changes by').selectOption('growth');
  await page.getByRole('link',{name:'Open portfolio briefing',exact:true}).click();
  await expect(page).toHaveURL(/\/briefing\/portfolio\/\?products=090121%2C090122&direction=exports$/);
  await expect(page.getByRole('button',{name:'Copy briefing link'})).toBeEnabled();
  await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('heading',{name:'Latest month',exact:true})).toHaveCount(2);
});


for(const direction of ['imports','exports'] as const)test(`monthly product views preserve ${direction}, CSV identity and profile comparison`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`/changes/products/?direction=${direction}&metric=dollars&period=monthly`);
  await expect(page.getByRole('radio',{name:'Latest month',exact:true})).toBeChecked();
  await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
  await expect(page.locator('.changes-period')).toHaveText(new RegExp(`Dec 2025 compared with Dec 2024.*U.S. ${direction}`));
  const table=page.getByRole('table',{name:'Largest product increases · dollar change'});
  await expect(table.getByRole('row').nth(1)).toContainText(direction==='imports'?'+$150':'+$300');
  const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download product changes CSV',exact:true}).click();const file=await event;
  expect(file.suggestedFilename()).toBe(`pilot-products-${direction}-changes-monthly-dollars.csv`);
  const csv=await readFile(await file.path(),'utf8');
  expect(csv).toContain('comparison_period,growth_qualification_basis');
  expect(csv).toContain('monthly,preceding_twelve_months,2024-01,2024-12');
  expect(csv).toContain(direction==='imports'?'300,150,150,100,2025-12,2025-12,2024-12,2024-12':'600,300,300,100,2025-12,2025-12,2024-12,2024-12');
  await page.getByLabel('Rank product changes by').selectOption('growth');
  await expect(page.getByRole('radio',{name:'Latest month',exact:true})).toBeChecked();
  await expect(page.getByRole('status')).toContainText('2 below the growth threshold');
  await expect(page.getByRole('button',{name:'Download product changes CSV'})).toBeDisabled();
  await page.getByRole('radio',{name:'Rolling twelve months',exact:true}).check();
  await expect(page).not.toHaveURL(/period=/);
  await page.getByRole('radio',{name:'Latest month',exact:true}).check();
  await page.getByLabel('Rank product changes by').selectOption('dollars');await page.reload();
  await expect(page.getByRole('radio',{name:'Latest month',exact:true})).toBeChecked();
  await table.getByRole('link',{name:'Synthetic second product',exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/products/090122/\\?direction=${direction}&months=12&comparison=monthly$`));
  await page.getByRole('checkbox',{name:'CANADA',exact:true}).check();
  await expect(page.getByLabel('Country comparison period')).toHaveValue('monthly');expect(errors).toEqual([]);
});

test('monthly product manual copy, duplicate fallback and static period choices work on small screens',async({page,browser,baseURL})=>{
  await page.setViewportSize({width:320,height:812});
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('blocked');}}}));
  await page.goto('/changes/products/?direction=exports&metric=dollars&period=monthly#product-changes-heading');
  await expect(page.getByRole('button',{name:'Copy changes link',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Copy changes link',exact:true}).focus();await expect(page.getByRole('button',{name:'Copy changes link',exact:true})).toBeFocused();await page.keyboard.press('Enter');
  const manual=page.getByLabel('Changes link',{exact:true});await expect(manual).toHaveValue(page.url());
  await page.getByRole('radio',{name:'Latest month',exact:true}).focus();await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('radio',{name:'Rolling twelve months',exact:true})).toBeChecked();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto('/changes/products/?direction=exports&metric=growth&period=monthly&period=rolling');
  await expect(page.getByText(/saved changes selection could not be restored/)).toBeVisible();
  await expect(page.getByRole('radio',{name:'Rolling twelve months',exact:true})).toBeChecked();
  await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();
  const context=await browser.newContext({baseURL,javaScriptEnabled:false}),staticPage=await context.newPage();
  try{await staticPage.goto('/changes/products/?direction=exports&metric=growth&period=monthly');
    await expect(staticPage.getByRole('radio',{name:'Latest month',exact:true})).toBeDisabled();
    await expect(staticPage.getByRole('radio',{name:'Rolling twelve months',exact:true})).toBeChecked();
    await expect(staticPage.getByText(/Product rankings use rolling twelve-month periods.*comparison period/)).toBeVisible();
  }finally{await context.close();}
});
