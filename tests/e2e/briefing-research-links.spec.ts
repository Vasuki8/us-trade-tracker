import {test,expect,type Page,type Locator} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';

async function reachByTab(page:Page,target:Locator){
  const limit=await page.locator('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]').count()+1;
  for(let n=0;n<limit;n++){await page.keyboard.press('Tab');if(await target.evaluate(element=>element===document.activeElement))return;}
  throw new Error('Briefing research link cannot be reached by keyboard');
}

for(const [code,briefing,changes,multiplier] of [['090121','/briefing/','/changes/',1],['090122','/briefing/090122/','/changes/090122/',3]] as const){
  for(const direction of ['imports','exports'] as const)for(const period of ['monthly','rolling'] as const){
    test(`briefing research keeps ${code} ${direction} ${period}`,async({page,baseURL})=>{
      const errors:string[]=[],outside:string[]=[],origin=new URL(baseURL!).origin;
      page.on('pageerror',error=>errors.push(error.message));
      await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===origin||u.protocol==='blob:')return route.continue();outside.push(u.origin);return route.abort();});
      await page.context().grantPermissions(['clipboard-read','clipboard-write'],{origin});
      await page.goto(briefing);await expect(page.locator('astro-island')).toHaveCount(0);
      const noun=direction==='imports'?'import':'export';
      const card=page.getByRole('region',{name:period==='monthly'?(direction==='imports'?'Monthly imports':'Monthly exports'):`Annual ${noun} partner changes`});
      const link=card.getByRole('link',{name:`Explore ${period==='monthly'?'latest-month':'twelve-month'} ${noun} changes by country`,exact:true});
      const href=`${changes}?direction=${direction}&metric=dollars${period==='monthly'?'&period=monthly':''}#changes-heading`;
      await expect(link).toHaveAttribute('href',href);
      const label=await card.locator('.briefing-period').innerText();
      const factor=multiplier*(direction==='imports'?1:2),worldNow=(period==='monthly'?100:1200)*factor,worldPrior=worldNow/2;
      const money=(n:number)=>'$'+n.toLocaleString('en-US');
      if(period==='monthly'){await expect(card).toContainText(`Current value: ${money(worldNow)}`);await expect(card).toContainText(`Previous value: ${money(worldPrior)}`);}
      else await expect(card).toContainText(`Largest increase: ${direction==='imports'?'ITALY':'CANADA'} · ${money((direction==='imports'?156:300)*multiplier)}`);
      for(const width of [320,375,1120]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
      await page.setViewportSize({width:375,height:812});await reachByTab(page,link);await expect(link).toBeFocused();await page.keyboard.press('Enter');
      await expect(page).toHaveURL(origin+href);await expect(page.getByRole('button',{name:'Copy changes link',exact:true})).toBeEnabled();
      const checkSelection=async()=>{
        await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
        await expect(page.getByRole('radio',{name:period==='monthly'?'Latest month versus the same month last year':'Rolling twelve months',exact:true})).toBeChecked();
        await expect(page.getByLabel('Rank changes by')).toHaveValue('dollars');await expect(page.locator('#changes-heading')).toHaveCount(1);
        await expect(page.locator('.changes-period')).toContainText(label);
        expect(await page.locator('.changes-world strong').allTextContents()).toEqual([money(worldNow),money(worldPrior),'+'+money(worldNow-worldPrior)]);
      };
      await checkSelection();
      if(period==='rolling')await expect(page.getByRole('table',{name:'Largest increases · dollar change'}).locator('.ranked-value').first()).toHaveText('+'+money((direction==='imports'?156:300)*multiplier));
      await page.getByRole('button',{name:'Copy changes link',exact:true}).click();await expect(page.getByText('Changes link copied.',{exact:true})).toBeVisible();
      expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(origin+href);
      const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download changes CSV',exact:true}).click();const download=await event;
      expect(download.suggestedFilename()).toBe(`hs-${code}-${direction}-changes-${period==='monthly'?'monthly-':''}dollars.csv`);
      const rows=parseCsv(await readFile((await download.path())!,'utf8'));expect(rows.length).toBeGreaterThan(0);
      for(const row of rows){expect(row.product_code).toBe(code);expect(row.direction).toBe(direction);expect(row.ranking_metric).toBe('dollars');expect(row.current_period_end).toBe('2025-12');expect(row.previous_period_end).toBe('2024-12');expect(row.comparison_period).toBe(period==='monthly'?'monthly':undefined);}
      await page.reload();await expect(page.getByRole('button',{name:'Copy changes link',exact:true})).toBeEnabled();await checkSelection();
      await page.goBack();await expect(page).toHaveURL(origin+briefing);await expect(link).toHaveAttribute('href',href);
      await page.goForward();await expect(page.getByRole('button',{name:'Copy changes link',exact:true})).toBeEnabled();await checkSelection();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);expect(outside).toEqual([]);
    });
  }
  test(`briefing ${code} keeps native research and explained defaults without JavaScript`,async({browser,baseURL})=>{
    const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:812}}),page=await context.newPage();
    try{
      await page.goto(briefing);await expect(page.locator('astro-island')).toHaveCount(0);
      for(const name of ['Explore latest-month import changes by country','Explore latest-month export changes by country','Explore twelve-month import changes by country','Explore twelve-month export changes by country'])await expect(page.getByRole('link',{name,exact:true})).toBeVisible();
      const link=page.getByRole('link',{name:'Explore latest-month export changes by country',exact:true});
      const href=`${changes}?direction=exports&metric=dollars&period=monthly#changes-heading`;await expect(link).toHaveAttribute('href',href);
      await link.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new URL(baseURL!).origin+href);
      await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();await expect(page.getByRole('radio',{name:'Rolling twelve months',exact:true})).toBeChecked();
      await expect(page.getByText(/initial view shows U.S. imports ranked by dollar change over rolling twelve months/)).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }finally{await context.close();}
  });
}
