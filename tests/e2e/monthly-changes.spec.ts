import {test,expect,type Page} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
const open=async(page:Page)=>{await page.goto('/changes/');await expect(page.getByRole('heading',{name:'Monthly changes',exact:true})).toBeVisible();await expect(page.locator('astro-island[ssr]')).toHaveCount(0);};
const csv=async(page:Page)=>{const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download changes CSV',exact:true}).click();return readFile(await (await downloaded).path(),'utf8');};

test('standalone direction, ranking and downloads match the product profile',async({page,context})=>{
  const requests:string[]=[],errors:string[]=[];page.on('request',r=>{if(r.url().includes('api.census.gov'))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
  await open(page);await expect(page.locator('.page-heading>p').filter({hasText:'Roasted coffee (HS 090121).'})).toContainText('HS 090121');
  await expect(page.getByRole('region',{name:'What changed?',exact:true})).toContainText('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  const profile=await context.newPage();await profile.goto('/products/090121/');await expect(profile.locator('astro-island[ssr]')).toHaveCount(0);
  for(const direction of ['Imports','Exports'])for(const metric of ['dollars','share']){
    for(const target of [page,profile]){await target.getByRole('radio',{name:direction,exact:true}).check();await target.getByLabel('Rank changes by').selectOption(metric);}
    expect(await page.getByRole('region',{name:'What changed?',exact:true}).getByRole('table').allTextContents()).toEqual(await profile.getByRole('region',{name:'What changed?',exact:true}).getByRole('table').allTextContents());
    if(direction==='Exports'&&metric==='share'){await expect(page.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();continue;}
    const actual=await csv(page);expect(actual).toBe(await csv(profile));expect(actual).toContain('Development sample data');expect(actual).toContain(direction==='Imports'?'GEN_VAL_MO':'ALL_VAL_MO');
  }
  await profile.close();await page.getByRole('link',{name:'View the full product profile'}).click();await expect(page).toHaveURL(/\/products\/090121\/$/);
  await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Monthly changes',exact:true}).click();await expect(page).toHaveURL(/\/changes\/$/);
  await page.goto('/');await page.getByRole('link',{name:'See monthly changes'}).click();await expect(page.getByRole('heading',{name:'Monthly changes',exact:true})).toBeVisible();expect(requests).toEqual([]);expect(errors).toEqual([]);
});

test('standalone mobile controls, scrolling tables and CSV work by keyboard',async({page})=>{
  await page.setViewportSize({width:375,height:812});await open(page);
  await page.getByRole('radio',{name:'Imports'}).focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();
  await page.getByLabel('Rank changes by').focus();await page.keyboard.press('ArrowDown');await expect(page.getByLabel('Rank changes by')).toHaveValue('share');await expect(page.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
  await page.keyboard.press('ArrowUp');await expect(page.getByLabel('Rank changes by')).toHaveValue('dollars');await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Download changes CSV'})).toBeFocused();
  const downloaded=page.waitForEvent('download');await page.keyboard.press('Enter');expect((await downloaded).suggestedFilename()).toBe('hs-090121-exports-changes-dollars.csv');
  const scrolling=page.getByRole('region',{name:'Scrollable largest increases · dollar change'});await page.keyboard.press('Tab');await expect(scrolling).toBeFocused();for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');await expect.poll(()=>scrolling.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await mkdir('test-results/monthly-changes-visual',{recursive:true});await page.screenshot({path:'test-results/monthly-changes-visual/mobile.png',fullPage:true});
});

test('standalone initial comparisons and source information are readable without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false}),page=await context.newPage();
  try{
    await page.goto('/changes/');await expect(page.getByRole('heading',{name:'Monthly changes',exact:true})).toBeVisible();
    await expect(page.getByRole('table',{name:'Largest increases · dollar change'})).toBeVisible();await expect(page.getByText(/Source: Development fixtures/)).toContainText('GEN_VAL_MO');
    await expect(page.getByText('Enable JavaScript to change the ranking, trade direction or download a CSV.',{exact:true})).toBeVisible();
    await page.getByRole('link',{name:'View the full product profile'}).click();await expect(page.getByRole('heading',{name:'Roasted coffee',exact:true})).toBeVisible();
  }finally{await context.close();}
});
