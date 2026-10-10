import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

for(const config of [
  {path:'/changes/',metric:'share',label:'Rank changes by',code:'090121'},
  {path:'/changes/090122/',metric:'share',label:'Rank changes by',code:'090122'},
  {path:'/changes/products/',metric:'growth',label:'Rank product changes by',code:null},
] as const)test(`saved filters, copy, reload, history and CSV agree on ${config.path}`,async({page,context})=>{
  const errors:string[]=[],requests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('api.census.gov'))requests.push(request.url());});
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto(`${config.path}?direction=exports&metric=${config.metric}`);
  await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  await expect(page.getByLabel(config.label)).toHaveValue(config.metric);
  await expect(page.locator('.measure-tag')).toHaveText('ALL_VAL_MO');
  await page.getByRole('button',{name:'Copy changes link',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByText('Changes link copied.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(page.url());
  await page.reload();await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();await expect(page.getByLabel(config.label)).toHaveValue(config.metric);
  await page.getByRole('radio',{name:'Imports',exact:true}).check();
  await expect(page).toHaveURL(new RegExp(`${config.path}\\?direction=imports&metric=${config.metric}$`));
  await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Methods',exact:true}).click();await page.goBack();
  await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();await expect(page.getByLabel(config.label)).toHaveValue(config.metric);
  await page.getByRole('radio',{name:'Exports',exact:true}).check();await page.getByLabel(config.label).selectOption('dollars');await page.reload();
  await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  const event=page.waitForEvent('download');await page.getByRole('button',{name:config.code?'Download changes CSV':'Download product changes CSV',exact:true}).click();const file=await event;
  expect(file.suggestedFilename()).toBe(config.code?`hs-${config.code}-exports-changes-dollars.csv`:'pilot-products-exports-changes-dollars.csv');
  const csv=await readFile(await file.path(),'utf8');expect(csv).toContain('ALL_VAL_MO');expect(csv).toContain('exports');
  expect(errors).toEqual([]);expect(requests).toEqual([]);
});

test('mobile invalid filters recover and manual copying retains only current supported choices',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Unavailable');}}}));
  await page.goto('/changes/090122/?direction=exports&metric=growth&utm_source=briefing#changes-heading');
  await expect(page.getByText(/saved changes selection could not be restored/i)).toBeVisible();
  await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();await expect(page.getByLabel('Rank changes by')).toHaveValue('dollars');
  await page.getByRole('radio',{name:'Imports',exact:true}).focus();await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();await expect(page.getByText(/saved changes selection could not be restored/i)).toHaveCount(0);
  await page.getByLabel('Rank changes by').selectOption('share');
  await page.getByRole('button',{name:'Copy changes link',exact:true}).focus();await page.keyboard.press('Enter');
  const link=page.getByLabel('Changes link',{exact:true});await expect(link).toHaveValue(page.url());
  expect(new URL(await link.inputValue()).search).toBe('?direction=exports&metric=share');expect(new URL(await link.inputValue()).hash).toBe('#changes-heading');
  await link.focus();expect(await link.evaluate(element=>(element as HTMLInputElement).selectionEnd)).toBe((await link.inputValue()).length);
  await page.getByLabel('Rank changes by').selectOption('dollars');await expect(link).toHaveValue(page.url());
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('saved query pages keep readable default rankings and an explanation without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}}),page=await context.newPage();
  try{
    for(const path of ['/changes/','/changes/090122/','/changes/products/']){
      await page.goto(`${path}?direction=exports&metric=${path==='/changes/products/'?'growth':'share'}`);
      await expect(page.locator('.measure-tag')).toHaveText('GEN_VAL_MO');
      await expect(page.getByRole('table',{name:path==='/changes/products/'?'Largest product increases · dollar change':'Largest increases · dollar change',exact:true})).toBeVisible();
      await expect(page.getByText(/initial view shows U.S. imports ranked by dollar change/)).toBeVisible();
      await expect(page.getByRole('button',{name:'Copy changes link',exact:true})).toBeDisabled();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }finally{await context.close();}
});
