import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const csv=async(page:Page)=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download changes CSV',exact:true}).click();const file=await event;return {name:file.suggestedFilename(),text:await readFile(await file.path(),'utf8')};};

test('the second profile keeps its product in standalone changes, rankings and downloads',async({page,context})=>{
  const requests:string[]=[],errors:string[]=[];page.on('request',r=>{if(r.url().includes('api.census.gov'))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/products/090122/');await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Monthly changes',exact:true}).click();
  await expect(page).toHaveURL(/\/changes\/090122\/$/);
  await expect(page.locator('.page-heading>p').filter({hasText:'Synthetic second product (HS 090122).'})).toHaveText('Synthetic second product (HS 090122).');
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  const products=page.getByRole('navigation',{name:'Changes products'});
  await expect(products.getByRole('link',{name:'Synthetic second product · HS 090122',exact:true})).toHaveAttribute('aria-current','page');
  const profile=await context.newPage();await profile.goto('/products/090122/');
  for(const direction of ['Imports','Exports'])for(const metric of ['dollars','share']){
    for(const target of [page,profile]){await expect(target.locator('astro-island[ssr]')).toHaveCount(0);await target.getByRole('radio',{name:direction,exact:true}).check();await target.getByLabel('Rank changes by').selectOption(metric);}
    expect(await page.getByRole('region',{name:'What changed?',exact:true}).getByRole('table').allTextContents()).toEqual(await profile.getByRole('region',{name:'What changed?',exact:true}).getByRole('table').allTextContents());
    if(direction==='Exports'&&metric==='share'){await expect(page.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();continue;}
    const actual=await csv(page);expect(actual.text).toBe((await csv(profile)).text);expect(actual.name).toBe(`hs-090122-${direction.toLowerCase()}-changes-${metric}.csv`);expect(actual.text).toContain('090122,SYNTHETIC PRODUCT 090122');expect(actual.text).not.toContain('090121');
  }
  await page.getByLabel('Rank changes by').selectOption('dollars');
  const countryLink=page.getByRole('table',{name:'Largest increases · dollar change'}).getByRole('link').first();await expect(countryLink).toHaveAttribute('href',/^\/products\/090122\/\?direction=exports&months=12&countries=/);
  await products.getByRole('link',{name:'Roasted coffee · HS 090121',exact:true}).click();await expect(page).toHaveURL(/\/changes\/$/);await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();
  await expect(page.getByRole('navigation',{name:'Changes products'}).getByRole('link',{name:'Roasted coffee · HS 090121',exact:true})).toHaveAttribute('aria-current','page');
  await profile.close();expect(requests).toEqual([]);expect(errors).toEqual([]);
});

test('both product changes pages and matching research links work without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false}),page=await context.newPage();
  try{
    await page.goto('/products/090122/');await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Monthly changes',exact:true}).click();
    await expect(page).toHaveURL(/\/changes\/090122\/$/);await expect(page.getByRole('table',{name:'Largest increases · dollar change'})).toBeVisible();
    await page.getByRole('link',{name:'View the full product profile'}).click();await expect(page).toHaveURL(/\/products\/090122\/$/);
    await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Monthly changes',exact:true}).click();
    await page.getByRole('navigation',{name:'Changes products'}).getByRole('link',{name:'Roasted coffee · HS 090121',exact:true}).click();
    await expect(page).toHaveURL(/\/changes\/$/);await expect(page.locator('.page-heading>p').filter({hasText:'Roasted coffee (HS 090121).'})).toBeVisible();
    const unsupported=await page.goto('/changes/999999/');expect(unsupported?.status()).toBe(404);
  }finally{await context.close();}
});

test('second-product changes controls, table scrolling and downloads work on mobile',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/changes/090122/');
  const imports=page.getByRole('radio',{name:'Imports',exact:true});await expect(imports).toBeEnabled();await imports.focus();await expect(imports).toBeFocused();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  await page.getByRole('button',{name:'Download changes CSV',exact:true}).focus();const event=page.waitForEvent('download');await page.keyboard.press('Enter');expect((await event).suggestedFilename()).toBe('hs-090122-exports-changes-dollars.csv');
  const table=page.getByRole('region',{name:'Scrollable largest increases · dollar change'});await table.focus();for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');await expect.poll(()=>table.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
