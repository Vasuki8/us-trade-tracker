import {test,expect} from '@playwright/test';

test('the second product keeps its identity in briefings, figures and research links',async({page})=>{
  const errors:string[]=[],requests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await page.goto('/products/090122/');await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Briefing',exact:true}).click();
  await expect(page).toHaveURL(/\/briefing\/090122\/$/);
  await expect(page.getByText(/Current pilot coverage:/)).toHaveText('Current pilot coverage: Synthetic second product (HS 090122).');
  await expect(page.getByText('SYNTHETIC PRODUCT 090122',{exact:true})).toBeVisible();
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  await expect(page.getByRole('region',{name:'Monthly imports'})).toContainText('Current value: $300');
  await expect(page.getByRole('region',{name:'Monthly imports'})).toContainText('Previous value: $150');
  await expect(page.getByRole('region',{name:'Monthly exports'})).toContainText('Current value: $600');
  await expect(page.getByRole('region',{name:'Monthly exports'})).toContainText('Previous value: $300');
  await expect(page.getByRole('article',{name:'Monthly estimated duties'})).toContainText('Calculated duties: $3');
  await expect(page.getByRole('article',{name:'Monthly estimated duties'})).toContainText('Consumption value: $60');
  await expect(page.getByRole('article',{name:'Monthly estimated duties'})).toContainText('Duty share: 5.000%');
  await expect(page.getByRole('navigation',{name:'Briefing products'}).getByRole('link',{name:'Synthetic second product · HS 090122',exact:true})).toHaveAttribute('aria-current','page');
  await expect(page.locator('astro-island')).toHaveCount(0);
  const partner=page.getByRole('region',{name:'Annual import partner changes'}).getByRole('link').first();
  await expect(partner).toHaveAttribute('href',/^\/products\/090122\/\?direction=imports&months=12&countries=/);
  await partner.click();await expect(page).toHaveURL(/\/products\/090122\/\?direction=imports&months=12&countries=/);
  await page.goto('/briefing/090122/');await page.getByRole('link',{name:'See all country changes',exact:true}).click();await expect(page).toHaveURL(/\/changes\/090122\/$/);
  await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Briefing',exact:true}).click();await expect(page).toHaveURL(/\/briefing\/090122\/$/);
  await page.getByRole('link',{name:'Explore duty history and comparisons',exact:true}).click();await expect(page).toHaveURL(/\/products\/090122\/#duties-heading$/);
  await page.goto('/briefing/090122/');await page.getByRole('link',{name:'Explore the full product profile',exact:true}).click();await expect(page).toHaveURL(/\/products\/090122\/$/);
  await page.goto('/briefing/090122/');await page.getByRole('navigation',{name:'Briefing products'}).getByRole('link',{name:'Roasted coffee · HS 090121',exact:true}).click();await expect(page).toHaveURL(/\/briefing\/$/);
  await expect(page.getByRole('region',{name:'Monthly imports'})).toContainText('Current value: $100');
  const missing=await page.goto('/briefing/999999/');expect(missing?.status()).toBe(404);
  expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('product briefings remain readable and navigable by keyboard on mobile without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}}),page=await context.newPage();
  try{
    await page.goto('/products/090122/');await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Briefing',exact:true}).click();await expect(page).toHaveURL(/\/briefing\/090122\/$/);
    await expect(page.getByRole('region',{name:'Monthly exports'})).toContainText('Dollar change: $300');
    await expect(page.getByRole('article',{name:'Rolling estimated duties'})).toContainText('Duty share: 7.500%');
    await expect(page.getByRole('region',{name:'Sources and release'})).toContainText('Development fixtures');
    await expect(page.locator('astro-island')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/briefing\/090122\/#main$/);
    await page.getByRole('link',{name:'See all country changes',exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/changes\/090122\/$/);
    await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Briefing',exact:true}).click();await page.getByRole('navigation',{name:'Briefing products'}).getByRole('link',{name:'Roasted coffee · HS 090121',exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/briefing\/$/);
  }finally{await context.close();}
});
