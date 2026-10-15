import {test,expect} from '@playwright/test';

for(const width of [320,375])for(const direction of ['imports','exports']){
  test(`research journey preserves amounts at ${width}px for ${direction}`,async({page,baseURL})=>{
    const errors:string[]=[],outside:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.origin===new URL(baseURL!).origin||url.protocol==='blob:')return route.continue();
      outside.push(url.origin);return route.abort();
    });
    await page.setViewportSize({width,height:812});await page.goto('/changes/products/');
    await expect(page.getByRole('button',{name:'Copy changes link'})).toBeEnabled();
    await page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true}).focus();
    await page.keyboard.press('Space');
    await page.getByRole('link',{name:'Compare latest-month figures',exact:true}).focus();await page.keyboard.press('Enter');
    await expect(page.getByRole('button',{name:'Copy briefing link'})).toBeEnabled();
    await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
    for(const period of ['monthly','rolling']){
      const card=page.getByRole('article',{name:'Roasted coffee · HS 090121',exact:true});
      const summary=card.getByRole('region',{name:period==='monthly'?'Latest month':'Rolling twelve months',exact:true});
      const label=await summary.locator('.briefing-period').innerText(),amounts=await summary.locator('.portfolio-figures dd').allTextContents();
      await summary.getByRole('link',{name:period==='monthly'?'Explore latest-month country changes':'Explore rolling country changes',exact:true}).focus();await page.keyboard.press('Enter');
      await expect(page.getByRole('button',{name:'Copy changes link'})).toBeEnabled();
      await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
      await expect(page.getByRole('radio',{name:period==='monthly'?'Latest month versus the same month last year':'Rolling twelve months',exact:true})).toBeChecked();
      await expect(page.getByLabel('Rank changes by')).toHaveValue('dollars');
      await expect(page.locator('.changes-period')).toContainText(label);
      expect(await page.locator('.changes-world strong').allTextContents()).toEqual(amounts.slice(0,3));
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.goBack();await expect(page.getByRole('button',{name:'Copy briefing link'})).toBeEnabled();
    }
    await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Methods',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Country changes',exact:true})).toBeVisible();
    expect(errors).toEqual([]);expect(outside).toEqual([]);
  });
}
