import {readFileSync} from 'node:fs';
import {test,expect} from '@playwright/test';
import type {Release} from '../../src/lib/trade/types';

const products=[{code:'090121',name:'Roasted coffee',filename:'product-release.json'},{code:'090122',name:'Synthetic second product',filename:'product-release-090122.json'}];

test('methods identifies each published release and links to its own profile',async({page})=>{
  const errors:string[]=[],requests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await page.goto('/products/090122/');await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Methods',exact:true}).click();
  await expect(page).toHaveURL(/\/methods\/$/);
  await expect(page.getByRole('heading',{name:'Published release information',exact:true})).toBeVisible();
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  for(const product of products){
    const release=JSON.parse(readFileSync(`tests/fixtures/${product.filename}`,'utf8')) as Release;
    const details=page.getByRole('article',{name:`${product.name} (HS ${product.code})`,exact:true});
    await expect(details).toContainText(release.observations.find(row=>row.geography==='world')!.description);
    await expect(details).toContainText('Source: Development fixtures');
    await expect(details.locator('time').first()).toHaveAttribute('datetime',release.reportingMonth);
    await expect(details).toContainText(release.retrievedAt);await expect(details).toContainText(release.codeVersion);
    await expect(details.locator('div').filter({has:page.getByText('Merchandise observations marked revised',{exact:true})}).locator('dd')).toHaveText(String(release.revisedKeys.length));
    if(release.schemaVersion===2){
      await expect(details).toContainText(`${release.duties.fromMonth}–${release.reportingMonth}`);
      await expect(details.locator('div').filter({has:page.getByText('Duty records marked revised',{exact:true})}).locator('dd')).toHaveText(String(release.duties.revisedKeys.length));
    }
    await expect(details.getByRole('link',{name:'Open product profile',exact:true})).toHaveAttribute('href',`/products/${product.code}/`);
  }
  await expect(page.locator('astro-island')).toHaveCount(0);
  expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('release information remains readable and navigable on mobile without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}}),page=await context.newPage();
  try{
    await page.goto('/methods/');
    for(const product of products)await expect(page.getByRole('article',{name:`${product.name} (HS ${product.code})`,exact:true})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Estimated duties',exact:true})).toBeVisible();
    await expect(page.getByRole('link',{name:'official release calendar',exact:true})).toHaveAttribute('href','https://www.census.gov/foreign-trade/schedule.html');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:'test-results/visual/product-release-information-mobile.png',fullPage:true});
    await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');
    const profile=page.getByRole('article',{name:'Synthetic second product (HS 090122)',exact:true}).getByRole('link',{name:'Open product profile',exact:true});
    await profile.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/products\/090122\/$/);
    await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Methods',exact:true}).click();
    await page.getByRole('link',{name:'Browse published products',exact:true}).click();await expect(page).toHaveURL(/\/products\/$/);
  }finally{await context.close();}
});
