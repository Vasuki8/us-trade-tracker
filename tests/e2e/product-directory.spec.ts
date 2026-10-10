import {test,expect} from '@playwright/test';

test('product search finds code, name and official description without changing profile identity',async({page})=>{
  const errors:string[]=[],requests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await page.goto('/products/090122/');
  await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Product research',exact:true}).click();
  await expect(page).toHaveURL(/\/products\/$/);
  await expect(page.getByRole('heading',{name:'Product research',exact:true})).toBeVisible();
  const profiles=page.getByRole('list',{name:'Available product profiles'}),search=page.getByRole('searchbox',{name:'Find a product'});
  await expect(profiles.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  await expect(search).toBeVisible();await expect(page.getByRole('button',{name:'Clear search',exact:true})).toBeHidden();
  await search.fill(' 090122 ');
  await expect(profiles.getByRole('link',{name:'Synthetic second product',exact:true})).toBeVisible();
  await expect(profiles.getByRole('link',{name:'Roasted coffee',exact:true})).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('Showing 1 of 2 profiles.');
  await search.fill('  ROASTED   coffee  ');
  await expect(profiles.getByRole('link',{name:'Roasted coffee',exact:true})).toBeVisible();
  await expect(profiles.getByRole('link',{name:'Synthetic second product',exact:true})).toBeHidden();
  await search.fill('NOT DECAFFEINATED');
  await expect(profiles.getByRole('link',{name:'Roasted coffee',exact:true})).toBeVisible();
  await expect(profiles.getByRole('link',{name:'Synthetic second product',exact:true})).toBeHidden();
  await search.fill('   ');await expect(page.getByRole('status')).toHaveText('Showing 2 of 2 profiles.');
  await search.fill('coffee 090122');
  await expect(page.getByText('No matching pilot profiles. Try another name or HS code.',{exact:true})).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Showing 0 of 2 profiles.');
  await page.getByRole('button',{name:'Clear search',exact:true}).click();
  await expect(search).toBeFocused();await expect(search).toHaveValue('');
  await expect(page.getByRole('button',{name:'Clear search',exact:true})).toBeHidden();
  await expect(profiles.getByRole('link',{name:'Roasted coffee',exact:true})).toBeVisible();
  await expect(profiles.getByRole('link',{name:'Synthetic second product',exact:true})).toBeVisible();
  await search.fill('090122');
  await profiles.getByRole('link',{name:'Synthetic second product',exact:true}).click();
  await expect(page).toHaveURL(/\/products\/090122\/$/);
  await expect(page.getByRole('region',{name:'U.S. trade totals'})).toContainText('$300');
  expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('directory is readable and both profiles open without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false}),page=await context.newPage();
  try{
    await page.goto('/products/');
    await expect(page.getByRole('searchbox',{name:'Find a product'})).toBeHidden();
    await expect(page.locator('noscript p')).toContainText('All available profiles are listed below. Enable JavaScript to search them.');
    const profiles=page.getByRole('list',{name:'Available product profiles'});
    await expect(profiles.getByRole('listitem')).toHaveCount(2);
    await expect(profiles.getByRole('listitem').filter({hasText:'HS 090121'})).toContainText('COFFEE, ROASTED, NOT DECAFFEINATED');
    await expect(profiles.getByRole('listitem').filter({hasText:'HS 090122'})).toContainText('SYNTHETIC PRODUCT 090122');
    await expect(profiles.getByRole('listitem').first()).toContainText('Dec 2025');
    await profiles.getByRole('link',{name:'Roasted coffee',exact:true}).click();
    await expect(page).toHaveURL(/\/products\/090121\/$/);
    await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Product research',exact:true}).click();
    await profiles.getByRole('link',{name:'Synthetic second product',exact:true}).click();
    await expect(page).toHaveURL(/\/products\/090122\/$/);
  }finally{await context.close();}
});

test('mobile search and navigation work by keyboard without page overflow',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/products/');
  const search=page.getByRole('searchbox',{name:'Find a product'});
  await search.focus();await page.keyboard.type('090122');await expect(page.getByRole('status')).toHaveText('Showing 1 of 2 profiles.');
  await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Clear search'})).toBeFocused();
  await page.keyboard.press('Enter');await expect(search).toBeFocused();
  await page.keyboard.type('090122');await page.keyboard.press('Tab');await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Synthetic second product',exact:true})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/products\/090122\/$/);
});
