import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

test('coffee briefing links to the research and separates monthly and annual comparisons',async({page})=>{
  const errors:string[]=[],censusRequests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))censusRequests.push(request.url());});
  await page.goto('/briefing/');await expect(page.getByRole('heading',{name:'Coffee release briefing',exact:true})).toBeVisible();
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  await expect(page.getByRole('region',{name:'Monthly imports'})).toContainText('Current value: $100');
  await expect(page.getByRole('region',{name:'Monthly imports'})).toContainText('Dec 2025 compared with Dec 2024');
  await expect(page.getByRole('region',{name:'Monthly exports'})).toContainText('Current value: $200');
  await expect(page.getByRole('region',{name:'Annual import partner changes'})).toContainText('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
  await expect(page.getByRole('article',{name:'Rolling estimated duties'})).toContainText('Duty share: 7.500%');
  await expect(page.getByRole('region',{name:'Sources and release'})).toContainText('Merchandise observations revised: 0');
  await expect(page.locator('astro-island')).toHaveCount(0);
  await page.getByRole('link',{name:'Explore the full product profile',exact:true}).click();await expect(page).toHaveURL(/\/products\/090121\/$/);
  await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Briefing',exact:true}).click();await expect(page).toHaveURL(/\/briefing\/$/);
  await page.getByRole('link',{name:'See all country changes',exact:true}).click();await expect(page).toHaveURL(/\/changes\/$/);
  await page.goto('/');await page.getByRole('link',{name:'Read the coffee briefing',exact:true}).click();await expect(page).toHaveURL(/\/briefing\/$/);
  expect(errors).toEqual([]);expect(censusRequests).toEqual([]);
});

test('briefing research and mobile keyboard navigation work without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}}),page=await context.newPage();
  try{
    await page.goto('/briefing/');await expect(page.getByRole('heading',{name:'Coffee release briefing',exact:true})).toBeVisible();
    await expect(page.getByRole('region',{name:'Monthly exports'})).toContainText('Dollar change: $100');
    await expect(page.getByRole('article',{name:'Monthly estimated duties'})).toContainText('Consumption value: $20');
    await expect(page.getByRole('region',{name:'Sources and release'})).toContainText('2026-01-01T00:00:00.000Z');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/briefing\/#main$/);
    await page.getByRole('link',{name:'See all country changes',exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/changes\/$/);
    await page.goto('/briefing/');await mkdir('test-results/briefing-visual',{recursive:true});await page.screenshot({path:'test-results/briefing-visual/mobile-no-js.png',fullPage:true});
  }finally{await context.close();}
});
