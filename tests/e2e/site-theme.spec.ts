import {test,expect} from '@playwright/test';

test('theme survives navigation and reload without resetting the research selection',async({page})=>{
  await page.emulateMedia({colorScheme:'dark'});
  await page.goto('/products/090121/?direction=exports&months=12&countries=1220');
  const toggle=page.getByRole('switch',{name:'Dark theme',exact:true});
  await expect(toggle).toHaveAttribute('aria-checked','false');
  await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  const url=page.url(),table=await page.getByRole('table',{name:'Monthly trade values · current U.S. dollars',exact:true}).textContent();
  await toggle.focus();await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-checked','true');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(page.url()).toBe(url);
  await expect(page.getByRole('checkbox',{name:'CANADA',exact:true})).toBeChecked();
  expect(await page.getByRole('table',{name:'Monthly trade values · current U.S. dollars',exact:true}).textContent()).toBe(table);
  await page.reload();await expect(toggle).toHaveAttribute('aria-checked','true');
  await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Methods',exact:true}).click();
  await expect(toggle).toHaveAttribute('aria-checked','true');
  await toggle.click();await page.reload();await expect(toggle).toHaveAttribute('aria-checked','false');
});

test('theme still works when browser storage is blocked',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked');}}));
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  const toggle=page.getByRole('switch',{name:'Dark theme',exact:true});
  await toggle.click();await expect(toggle).toHaveAttribute('aria-checked','true');
  await toggle.click();await expect(toggle).toHaveAttribute('aria-checked','false');
  expect(errors).toEqual([]);
});

test('global search finds the published product and opens its profile',async({page})=>{
  await page.goto('/methods/');
  const search=page.getByRole('searchbox',{name:'Search products or HS codes',exact:true});
  await page.keyboard.press('Control+k');await expect(search).toBeFocused();
  await search.fill('090122');
  await expect(page.locator('#global-search-count')).toContainText('1 matching products');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('region',{name:'Product search results',exact:true}).getByRole('link',{name:/Synthetic second product/})).toBeFocused();
  await page.keyboard.press('Escape');await expect(search).toBeFocused();
  await expect(page.getByRole('region',{name:'Product search results',exact:true})).toBeHidden();
  await search.fill('090122 ');
  await page.getByRole('region',{name:'Product search results',exact:true}).getByRole('link',{name:/Synthetic second product/}).click();
  await expect(page).toHaveURL(/\/products\/090122\/$/);
});

test('both themes fit small screens and print uses a light page',async({page})=>{
  for(const route of ['/','/products/','/products/090121/','/changes/','/briefing/','/methods/']){
    await page.setViewportSize({width:320,height:812});await page.goto(route);
    for(const dark of [true,false]){
      const toggle=page.getByRole('switch',{name:'Dark theme',exact:true});
      if((await toggle.getAttribute('aria-checked')==='true')!==dark)await toggle.click();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
    }
  }
  await page.goto('/briefing/');await page.getByRole('switch',{name:'Dark theme',exact:true}).click();
  await page.emulateMedia({media:'print'});
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(255, 255, 255)');
  await expect(page.locator('.site-sidebar')).toBeHidden();
});
