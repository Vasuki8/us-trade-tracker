import {test,expect,type Page} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';

const periodLabel=(period:string)=>period==='monthly'?'Latest month versus the same month last year':'Rolling twelve months';
const ready=async(page:Page)=>expect(page.locator('astro-island[ssr]')).toHaveCount(0);
for(const [code,path,scale] of [['090121','/changes/',1],['090122','/changes/090122/',3]] as const)
for(const direction of ['imports','exports'] as const)
for(const period of ['monthly','rolling'] as const)
for(const metric of ['dollars','share'] as const){
  test('fixture country movers '+[code,direction,period,metric].join('/'),async({page})=>{
    const external:string[]=[],errors:string[]=[];
    await page.route(/^https?:/,route=>{if(new URL(route.request().url()).hostname!=='127.0.0.1'){external.push(route.request().url());return route.abort();}return route.continue();});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(path+'?direction='+direction+'&metric='+metric+'&period='+period);
    await ready(page);
    await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
    await expect(page.getByRole('radio',{name:periodLabel(period),exact:true})).toBeChecked();
    await expect(page.getByLabel('Rank changes by')).toHaveValue(metric);
    await expect(page.locator('.measure-tag')).toHaveText(direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO');
    const current=100*(direction==='exports'?2:1)*(period==='rolling'?12:1)*scale;
    const comparison=page.getByRole('region',{name:'What changed?',exact:true});
    await expect(comparison).toContainText(period==='monthly'?'Dec 2025 compared with Dec 2024':'Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
    await expect(comparison.locator('.changes-world')).toContainText('$'+current.toLocaleString('en-US'));
    const button=page.getByRole('button',{name:'Download changes CSV',exact:true});
    if(direction==='exports'&&metric==='share')await expect(button).toBeDisabled();
    else{
      const event=page.waitForEvent('download');await button.click();const download=await event;
      expect(download.suggestedFilename()).toBe('hs-'+code+'-'+direction+'-changes-'+(period==='monthly'?'monthly-':'')+metric+'.csv');
      const rows=parseCsv(await readFile(await download.path(),'utf8'));
      expect(rows[0]).toMatchObject({partner_code:direction==='imports'&&period==='rolling'?'4759':'1220',movement:'increase',rank:'1',current_value_usd:String(current/4),previous_value_usd:String(direction==='imports'?12*(period==='rolling'?12:1)*scale:current/8),measure:direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO'});
      expect(rows[0].comparison_period).toBe(period==='monthly'?'monthly':undefined);
      expect(rows[0].current_period_start).toBe(period==='monthly'?'2025-12':'2025-01');
      expect(rows[0].previous_period_start).toBe(period==='monthly'?'2024-12':'2024-01');
    }
    expect(external).toEqual([]);expect(errors).toEqual([]);
  });
}

test('monthly link copy, reload and browser history preserve all choices',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/changes/090122/?direction=exports&metric=dollars&period=monthly#changes-heading');await ready(page);
  await page.getByRole('button',{name:'Copy changes link',exact:true}).click();
  await expect(page.getByText('Changes link copied.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(page.url());
  await page.reload();await ready(page);await expect(page.getByRole('radio',{name:periodLabel('monthly')})).toBeChecked();
  await page.getByRole('radio',{name:'Imports',exact:true}).check();
  await page.getByLabel('Rank changes by').selectOption('share');
  expect(new URL(page.url()).search).toBe('?direction=imports&metric=share&period=monthly');
  const saved=page.url();await page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Methods',exact:true}).click();
  await page.goBack();await ready(page);expect(page.url()).toBe(saved);
  await expect(page.getByRole('radio',{name:periodLabel('monthly')})).toBeChecked();await expect(page.getByLabel('Rank changes by')).toHaveValue('share');
  await page.goForward();await expect(page).toHaveURL(/\/methods\/$/);await page.goBack();await ready(page);
  await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();
});

test('invalid and duplicate period queries fall back with an actionable explanation',async({page})=>{
  for(const query of ['period=monthly&period=rolling','period=annual','period=','period=monthly&metric=growth','period=monthly&padding='+ 'x'.repeat(2048)]){
    await page.goto('/changes/?direction=exports&'+query);await ready(page);
    await expect(page.getByText(/saved changes selection could not be restored/)).toBeVisible();
    await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();
    await expect(page.getByRole('radio',{name:periodLabel('rolling')})).toBeChecked();
    await expect(page.getByLabel('Rank changes by')).toHaveValue('dollars');
    await page.getByRole('radio',{name:periodLabel('monthly')}).check();
    await expect(page.getByText(/saved changes selection could not be restored/)).toHaveCount(0);
  }
});

for(const [code,path] of [['090121','/changes/'],['090122','/changes/090122/']] as const)
test('monthly profile and duty drilldowns agree for '+code,async({page})=>{
  for(const direction of ['imports','exports'] as const){
    await page.goto(path+'?direction='+direction+'&metric=dollars&period=monthly');await ready(page);
    const link=page.getByRole('link',{name:'CANADA',exact:true});
    await expect(link).toHaveAttribute('href','/products/'+code+'/?direction='+direction+'&months=12&countries=1220&comparison=monthly#selected-comparison-heading');
    await link.click();await ready(page);
    await expect(page.getByLabel('Country comparison period')).toHaveValue('monthly');
    await expect(page.getByRole('table',{name:'Selected country monthly comparison',exact:true})).toContainText('CANADA');
    await expect(page.getByRole('region',{name:'What changed?',exact:true})).toContainText('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
    await page.goBack();await ready(page);
    const duty=page.getByRole('link',{name:'Explore estimated-duty changes across countries',exact:true});
    if(direction==='exports'){await expect(duty).toHaveCount(0);continue;}
    const dutyPath=code==='090121'?'/changes/duties/':'/changes/duties/'+code+'/';
    await expect(duty).toHaveAttribute('href',dutyPath+'?direction=imports&period=monthly&metric=share');
    await duty.click();await ready(page);await expect(page.getByRole('radio',{name:periodLabel('monthly')})).toBeChecked();
  }
});

for(const width of [320,375])
test('monthly mobile keyboard and manual link at '+width,async({page})=>{
  await page.setViewportSize({width,height:812});
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('Unavailable');}}}));
  await page.goto('/changes/?direction=imports&metric=dollars#changes-heading');await ready(page);
  await page.getByRole('radio',{name:periodLabel('rolling')}).focus();await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio',{name:periodLabel('monthly')})).toBeChecked();
  await page.getByLabel('Rank changes by').focus();await page.keyboard.press('ArrowDown');
  await expect(page.getByLabel('Rank changes by')).toHaveValue('share');
  await page.getByRole('button',{name:'Copy changes link',exact:true}).focus();await page.keyboard.press('Enter');
  const link=page.getByLabel('Changes link',{exact:true});await expect(link).toHaveValue(page.url());await link.focus();
  expect(await link.evaluate(el=>(el as HTMLInputElement).selectionEnd)).toBe((await link.inputValue()).length);
  expect(new URL(await link.inputValue()).hash).toBe('#changes-heading');
  const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download changes CSV',exact:true}).focus();await page.keyboard.press('Enter');
  expect((await event).suggestedFilename()).toBe('hs-090121-imports-changes-monthly-share.csv');
  const table=page.getByRole('region',{name:'Scrollable largest increases · country share change'});await table.focus();for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');
  await expect.poll(()=>table.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await mkdir('test-results/monthly-country-movers',{recursive:true});await page.screenshot({path:'test-results/monthly-country-movers/mobile-'+width+'.png',fullPage:true});
});

test('monthly saved queries keep truthful static defaults without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:812}}),page=await context.newPage();
  try{
    for(const path of ['/changes/','/changes/090122/']){
      await page.goto(path+'?direction=exports&metric=share&period=monthly');
      await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();
      await expect(page.getByRole('radio',{name:periodLabel('rolling')})).toBeChecked();
      for(const radio of await page.getByRole('radio').all())await expect(radio).toBeDisabled();
      await expect(page.getByLabel('Rank changes by')).toBeDisabled();
      await expect(page.getByRole('button',{name:'Download changes CSV',exact:true})).toBeDisabled();
      await expect(page.getByRole('button',{name:'Copy changes link',exact:true})).toBeDisabled();
      await expect(page.getByText(/initial view shows U.S. imports ranked by dollar change over rolling twelve months/)).toBeVisible();
      await expect(page.getByRole('table',{name:'Largest increases · dollar change',exact:true})).toBeVisible();
      await expect(page.getByText(/Source: Development fixtures/)).toContainText('GEN_VAL_MO');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }finally{await context.close();}
});
