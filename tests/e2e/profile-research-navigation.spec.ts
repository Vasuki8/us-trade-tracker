import {test,expect,type Page} from '@playwright/test';

const diagnostics=new WeakMap<Page,{errors:string[];blocked:string[]}>();
async function observe(page:Page,origin:string){
  const record={errors:[] as string[],blocked:[] as string[]};diagnostics.set(page,record);
  page.on('pageerror',error=>record.errors.push(error.message));
  await page.route('**/*',route=>{const url=new URL(route.request().url());
    if(url.origin===new URL(origin).origin||url.protocol==='blob:')return route.continue();
    record.blocked.push(url.origin);return route.abort();});
}
test.beforeEach(async({page,baseURL})=>observe(page,baseURL!));
test.afterEach(({page})=>{expect(diagnostics.get(page)?.errors).toEqual([]);expect(diagnostics.get(page)?.blocked).toEqual([]);});
const ready=async(page:Page)=>expect(page.getByRole('button',{name:'Copy view link',exact:true})).toBeEnabled();

for(const code of ['090121','090122'])for(const direction of ['imports','exports']){
  test(`${code} ${direction} section links and leading partner restore the matching annual view`,async({page})=>{
    await page.goto(`/products/${code}/?direction=${direction}&months=60&countries=4759%2C1220&comparison=monthly`);await ready(page);
    const nav=page.getByRole('navigation',{name:'On this profile'});
    await expect(nav.getByRole('link')).toHaveCount(direction==='imports'?8:7);
    const query=new URL(page.url()).search;
    for(const link of await nav.getByRole('link').all()){
      const hash=(await link.getAttribute('href'))!;const target=page.locator(`[id="${hash.slice(1)}"]`);
      await expect(target).toHaveCount(1);await link.click();await expect(target).toBeInViewport();
      expect(new URL(page.url()).search).toBe(query);
    }
    await expect(page.getByRole('table',{name:'Selected country monthly comparison'})).toBeVisible();
    const country=page.getByRole('complementary',{name:'Leading partners'}).getByRole('link',{name:'CANADA',exact:true});
    await expect(country).toHaveAttribute('href',`/products/${code}/?direction=${direction}&months=12&countries=1220#trade-history-heading`);
    await country.click();await ready(page);await page.reload();await ready(page);
    await expect(page.getByLabel('History window')).toHaveValue('12');
    await expect(page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true})).toBeChecked();
    await expect(page.getByRole('checkbox',{name:'CANADA',exact:true})).toBeChecked();
    await expect(page.locator('.country-list input:checked')).toHaveCount(1);
    await expect(page.getByRole('table',{name:'Selected country annual comparison'})).toContainText('CANADA');
    await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'}).getByRole('row')).toHaveCount(13);
    await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).toContainText('CANADA');
    await expect(page.locator('#trade-history-heading')).toBeInViewport();
    if(direction==='imports')await expect(page.getByRole('region',{name:'Estimated duties',exact:true})).toContainText('CANADA');
    else await expect(nav.getByRole('link',{name:'Estimated duties',exact:true})).toHaveCount(0);
  });
}

test('native fragment history preserves open fallback, picker and PNG failure; changed queries restore',async({page,baseURL})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Denied');}}});
    HTMLCanvasElement.prototype.toBlob=function(callback){callback(null);};
  });
  const path='/products/090121/?direction=imports&months=12&countries=1220';
  await page.goto(path+'#trade-history-heading');await ready(page);
  await page.getByRole('searchbox',{name:'Find a country'}).fill('can');
  await page.getByRole('button',{name:'Download chart PNG',exact:true}).click();
  const failure=page.getByText('PNG export failed. You can still download the displayed data as CSV.',{exact:true});await expect(failure).toBeVisible();
  await page.getByRole('button',{name:'Copy view link',exact:true}).click();const field=page.getByLabel('View link',{exact:true});await expect(field).toBeVisible();
  const check=async(hash:string)=>{
    await expect(field).toHaveValue(new URL(path+hash,baseURL).href);await expect(failure).toBeVisible();
    await expect(page.getByRole('searchbox',{name:'Find a country'})).toHaveValue('can');
    await page.getByRole('button',{name:'Copy view link',exact:true}).focus();await field.focus();
    expect(await field.evaluate((el:HTMLInputElement)=>[el.selectionStart,el.selectionEnd])).toEqual([0,(await field.inputValue()).length]);
  };
  const nav=page.getByRole('navigation',{name:'On this profile'});
  await nav.getByRole('link',{name:'Chart data',exact:true}).click();await check('#chart-data-heading');
  await nav.getByRole('link',{name:'Sources',exact:true}).click();await check('#profile-sources-heading');
  await page.goBack();await check('#chart-data-heading');await page.goBack();await check('#trade-history-heading');
  await page.goForward();await check('#chart-data-heading');
  await page.evaluate(()=>{history.pushState({savedView:true},'','?direction=exports&months=60&countries=4759#trade-history-heading');dispatchEvent(new PopStateEvent('popstate'));});
  await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();await expect(field).toHaveCount(0);
  await expect(page.getByLabel('History window')).toHaveValue('60');
  await page.goBack();await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();await expect(page.getByLabel('History window')).toHaveValue('12');
  await page.goForward();await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();await expect(page.getByRole('checkbox',{name:'ITALY',exact:true})).toBeChecked();
});

test('native section links wrap and are usable by keyboard at mobile and desktop sizes',async({page})=>{
  await page.goto('/products/090121/');await ready(page);
  const nav=page.getByRole('navigation',{name:'On this profile'});
  for(const width of [320,375,1120]){
    await page.setViewportSize({width,height:812});
    for(const link of await nav.getByRole('link').all()){
      const hash=(await link.getAttribute('href'))!;await link.focus();await expect(link).toBeFocused();await page.keyboard.press('Enter');
      await expect(page.locator(hash)).toBeInViewport();expect(new URL(page.url()).hash).toBe(hash);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

for(const code of ['090121','090122'])test(`${code} native navigation works with explained defaults without JavaScript`,async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}}),page=await context.newPage();
  await observe(page,baseURL!);
  try{
    await page.goto(`/products/${code}/?direction=exports&months=12&countries=1220`);
    await expect(page.locator('noscript p').first()).toContainText('The initial view shows U.S. imports');
    const nav=page.getByRole('navigation',{name:'On this profile'});await expect(nav.getByRole('link')).toHaveCount(8);
    await nav.getByRole('link',{name:'Chart data',exact:true}).click();await expect(page.locator('#chart-data-heading')).toBeInViewport();
    const country=page.getByRole('complementary',{name:'Leading partners'}).getByRole('link',{name:'CANADA',exact:true});
    await expect(country).toHaveAttribute('href',`/products/${code}/?direction=imports&months=12&countries=1220#trade-history-heading`);
    await country.click();await expect(page.locator('#trade-history-heading')).toBeInViewport();await expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();
    await expect(page.getByRole('button',{name:'Copy view link',exact:true})).toBeDisabled();
    await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).toContainText('All partner countries');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(diagnostics.get(page)?.errors).toEqual([]);expect(diagnostics.get(page)?.blocked).toEqual([]);
  }finally{await context.close();}
});
