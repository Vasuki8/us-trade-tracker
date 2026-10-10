import {readFileSync} from 'node:fs';
import {test,expect,type Page} from '@playwright/test';
import type {Release} from '../../src/lib/trade/types';

const profiles=[
  {code:'090121',name:'Roasted coffee',file:'product-release.json',changes:'/changes/',briefing:'/briefing/'},
  {code:'090122',name:'Synthetic second product',file:'product-release-090122.json',changes:'/changes/090122/',briefing:'/briefing/090122/'},
];

async function checkProfiles(page:Page){
  const directory=page.getByRole('navigation',{name:'Product profiles',exact:true});
  await expect(directory.getByRole('article')).toHaveCount(2);
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  for(const profile of profiles){
    const release=JSON.parse(readFileSync(`tests/fixtures/${profile.file}`,'utf8')) as Release;
    const card=directory.getByRole('article',{name:`${profile.name} · HS ${profile.code}`,exact:true});
    await expect(card).toContainText(release.observations.find(row=>row.geography==='world')!.description);
    await expect(card).toContainText('Source: Development fixtures');
    await expect(card.locator('time')).toHaveAttribute('datetime',release.reportingMonth);
    await expect(card.getByRole('link',{name:`${profile.name} · HS ${profile.code}`,exact:true})).toHaveAttribute('href',`/products/${profile.code}/`);
    await expect(card.getByRole('link',{name:'Country changes',exact:true})).toHaveAttribute('href',profile.changes);
    await expect(card.getByRole('link',{name:'Release briefing',exact:true})).toHaveAttribute('href',profile.briefing);
  }
  await expect(page.getByRole('link',{name:'Find a product',exact:true})).toHaveAttribute('href','/products/');
  await expect(page.getByRole('link',{name:'Compare product changes',exact:true})).toHaveAttribute('href','/changes/products/');
  await expect(page.locator('astro-island')).toHaveCount(0);
}

test('home starts product search and exposes the published pilot research with its own identity',async({page})=>{
  const errors:string[]=[],requests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await page.goto('/');await checkProfiles(page);
  await page.getByRole('link',{name:'Find a product',exact:true}).click();
  await expect(page).toHaveURL(/\/products\/$/);await page.getByRole('searchbox',{name:'Find a product'}).fill('090122');
  await page.getByRole('list',{name:'Available product profiles'}).getByRole('link',{name:'Synthetic second product',exact:true}).click();
  await expect(page).toHaveURL(/\/products\/090122\/$/);await expect(page.getByRole('heading',{name:'Synthetic second product',exact:true})).toBeVisible();
  await page.goto('/');await page.getByRole('link',{name:'Compare product changes',exact:true}).click();
  await expect(page).toHaveURL(/\/changes\/products\/$/);await expect(page.getByRole('heading',{name:'Product changes',exact:true})).toBeVisible();
  expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('home research links retain their products on mobile by keyboard without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}}),page=await context.newPage();
  try{
    await page.goto('/');await checkProfiles(page);
    await expect(page.getByText('2 reviewed pilot profiles. Coverage is limited to the products listed below.',{exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content',exact:true})).toBeFocused();await page.keyboard.press('Enter');
    const card=page.getByRole('article',{name:'Synthetic second product · HS 090122',exact:true});
    await card.getByRole('link',{name:'Country changes',exact:true}).focus();await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/changes\/090122\/$/);await expect(page.locator('.heading-description')).toHaveText('SYNTHETIC PRODUCT 090122');
    await page.goto('/');await card.getByRole('link',{name:'Release briefing',exact:true}).focus();await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/briefing\/090122\/$/);await expect(page.getByRole('heading',{name:'Release briefing',exact:true})).toBeVisible();
    await page.goto('/');await page.getByRole('link',{name:'Find a product',exact:true}).click();await expect(page).toHaveURL(/\/products\/$/);
    await expect(page.getByRole('list',{name:'Available product profiles'}).getByRole('link',{name:'Synthetic second product',exact:true})).toBeVisible();
  }finally{await context.close();}
});
