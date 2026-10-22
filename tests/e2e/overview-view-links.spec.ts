import {test,expect,type Page} from '@playwright/test';

const errors=new WeakMap<Page,string[]>();
test.beforeEach(({page})=>{const seen:string[]=[];errors.set(page,seen);page.on('pageerror',error=>seen.push(error.message));});
test.afterEach(({page})=>expect(errors.get(page)).toEqual([]));
const group=(page:Page,name:string)=>page.getByRole('group',{name:`Overview ${name}`,exact:true});
const copy=(page:Page)=>page.getByRole('button',{name:'Copy overview link',exact:true});
const selected=async(page:Page,code:string,direction:string,period:string,months:number)=>{
  await expect(page.getByLabel('Overview product',{exact:true})).toBeEnabled();
  await expect(page.getByLabel('Overview product',{exact:true})).toHaveValue(code);
  await expect(group(page,'trade direction').getByRole('button',{name:direction,exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(group(page,'comparison period').getByRole('button',{name:period,exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(group(page,'history window').getByRole('button',{name:months===12?'1Y':'5Y',exact:true})).toHaveAttribute('aria-pressed','true');
};
const clipboard=async(page:Page)=>page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(value:string)=>{(window as unknown as {copiedLink:string}).copiedLink=value;}}}));

test('saved overview restores figures and profile context',async({page})=>{
  await clipboard(page);
  await page.goto('/?product=090122&direction=exports&comparison=annual&months=12');
  await selected(page,'090122','Exports','Last 12 months',12);
  await expect(page.locator('.overview-kpi').first()).toContainText('$7.2K');
  await expect(page.locator('.overview-chart-desktop circle')).toHaveCount(12);
  await expect(page.getByRole('link',{name:'Exact values & downloads →',exact:true})).toHaveAttribute('href','/products/090122/?direction=exports&months=12#chart-data-heading');
  await copy(page).focus();await page.keyboard.press('Enter');
  await expect(page.getByText('Overview link copied.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(window as unknown as {copiedLink:string}).copiedLink)).toBe(page.url());
  await page.reload();await selected(page,'090122','Exports','Last 12 months',12);
});

test('control edits replace the address and survive reload and history',async({page})=>{
  await page.goto('/?utm_source=briefing#overview-history-heading');
  await expect(copy(page)).toBeEnabled();
  await page.evaluate(()=>history.replaceState({position:7},'',location.href));
  const count=await page.evaluate(()=>history.length);
  await page.getByLabel('Overview product',{exact:true}).selectOption('090122');
  await group(page,'trade direction').getByRole('button',{name:'Exports',exact:true}).click();
  await group(page,'comparison period').getByRole('button',{name:'Last 12 months',exact:true}).click();
  await group(page,'history window').getByRole('button',{name:'1Y',exact:true}).click();
  await expect(page).toHaveURL(/\/\?product=090122&direction=exports&comparison=annual&months=12#overview-history-heading$/);
  expect(await page.evaluate(()=>({length:history.length,state:history.state}))).toEqual({length:count,state:{position:7}});
  await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Methods',exact:true}).click();
  await page.goBack();await selected(page,'090122','Exports','Last 12 months',12);
  await page.goForward();await expect(page).toHaveURL(/\/methods\/$/);
  await page.goBack();await selected(page,'090122','Exports','Last 12 months',12);
  await page.reload();await selected(page,'090122','Exports','Last 12 months',12);
  await page.evaluate(()=>{history.pushState({},'','/?product=090121&direction=imports&comparison=monthly&months=60#product-monitor-heading');window.dispatchEvent(new PopStateEvent('popstate'));});
  await selected(page,'090121','Imports','Latest month',60);
  await page.goBack();await selected(page,'090122','Exports','Last 12 months',12);
});

for(const mode of ['denied','missing'] as const)test(`manual copying retains the current selection and fragment: ${mode}`,async({page})=>{
  await page.addInitScript(mode=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:mode==='missing'?undefined:{writeText:async()=>{throw new Error('Denied');}}}),mode);
  await page.goto('/?product=090122&direction=exports&comparison=annual&months=12&utm_source=briefing#overview-history-heading');
  await expect(copy(page)).toBeEnabled();await copy(page).click();
  const input=page.getByLabel('Overview link',{exact:true});
  const expected=new URL('/?product=090122&direction=exports&comparison=annual&months=12#overview-history-heading',page.url()).href;
  await expect(input).toHaveValue(expected);await input.focus();
  expect(await input.evaluate(element=>[ (element as HTMLInputElement).selectionStart,(element as HTMLInputElement).selectionEnd ])).toEqual([0,expected.length]);
  await group(page,'trade direction').getByRole('button',{name:'Imports',exact:true}).click();
  await expect(input).toHaveValue(page.url());expect(await input.inputValue()).toContain('direction=imports');
  await page.evaluate(()=>{location.hash='product-monitor-heading';});
  await copy(page).click();await expect(input).toHaveValue(page.url());
});

test('stale copy completion cannot announce another view',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>new Promise<void>(resolve=>{(window as unknown as {finishCopy:()=>void}).finishCopy=resolve;})}}));
  await page.goto('/');await expect(copy(page)).toBeEnabled();await copy(page).click();
  await page.getByLabel('Overview product',{exact:true}).selectOption('090122');
  await page.evaluate(()=>(window as unknown as {finishCopy:()=>void}).finishCopy());
  await expect(page.getByText('Overview link copied.',{exact:true})).toHaveCount(0);
  await selected(page,'090122','Imports','Latest month',60);
});

test('invalid overview falls back visibly',async({page})=>{
  for(const query of ['product=180100&direction=exports','product=090122&months=12&months=60','product=090122&direction=other',`product=090122&extra=${'x'.repeat(2048)}`]){
    await page.goto('/?'+query);await selected(page,'090121','Imports','Latest month',60);
    await expect(page.getByText(/Saved overview selection could not be restored/)).toBeVisible();
    await expect(page.locator('.overview-kpi').first()).toContainText('$100');
    await group(page,'trade direction').getByRole('button',{name:'Exports',exact:true}).click();
    await expect(page.getByText(/Saved overview selection could not be restored/)).toHaveCount(0);
  }
});

test('overview controls wait for restoration',async({page})=>{
  let release!:()=>void;const delayed=new Promise<void>(resolve=>release=resolve);
  await page.route('**/_astro/*',async route=>{if(route.request().resourceType()==='script')await delayed;await route.continue();});
  try{
    await page.goto('/?product=090122&direction=exports&comparison=annual&months=12',{waitUntil:'commit'});
    await expect(page.getByLabel('Overview product',{exact:true})).toBeVisible();
    await expect(page.getByLabel('Overview product',{exact:true})).toBeDisabled();await expect(copy(page)).toBeDisabled();
    for(const name of ['trade direction','comparison period','history window'])for(const button of await group(page,name).getByRole('button').all())await expect(button).toBeDisabled();
    release();await selected(page,'090122','Exports','Last 12 months',12);
  }finally{release();await page.unrouteAll({behavior:'wait'});}
});

test('blocked address updates keep the chosen view and a usable copy link',async({page})=>{
  await clipboard(page);
  await page.addInitScript(()=>{history.replaceState=()=>{throw new Error('Blocked');};});
  await page.goto('/');await expect(copy(page)).toBeEnabled();
  await group(page,'trade direction').getByRole('button',{name:'Exports',exact:true}).click();
  await selected(page,'090121','Exports','Latest month',60);
  await expect(page.locator('.overview-kpi').first()).toContainText('$200');
  await expect(page.getByRole('status')).toContainText(/address could not be updated/i);
  await copy(page).click();await expect(page.getByText('Overview link copied.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(window as unknown as {copiedLink:string}).copiedLink)).toBe(new URL('/?product=090121&direction=exports&comparison=monthly&months=60',page.url()).href);
});

test('both themes and manual overview links fit narrow screens with blocked storage',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked');}});Object.defineProperty(navigator,'clipboard',{value:undefined});});
  await page.goto('/?product=090122&direction=exports&comparison=annual&months=12#overview-history-heading');
  await expect(copy(page)).toBeEnabled();await copy(page).focus();await page.keyboard.press('Enter');
  for(const width of [320,390]){
    await page.setViewportSize({width,height:812});
    for(const dark of [true,false]){
      const toggle=page.getByRole('switch',{name:'Dark theme',exact:true});
      if((await toggle.getAttribute('aria-checked')==='true')!==dark)await toggle.click();
      await selected(page,'090122','Exports','Last 12 months',12);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await expect(page.getByLabel('Overview link',{exact:true})).toHaveValue(page.url());
    }
  }
});

test('no JavaScript keeps an honest static overview and inactive controls',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:812}}),page=await context.newPage();
  try{
    await page.goto('/?product=090122&direction=exports&comparison=annual&months=12');
    await expect(page.locator('.overview-kpi').first()).toContainText('$100');
    await expect(page.getByLabel('Overview product',{exact:true})).toHaveValue('090121');
    await expect(page.getByLabel('Overview product',{exact:true})).toBeDisabled();await expect(copy(page)).toBeDisabled();
    await expect(page.getByText(/Initial view: Roasted coffee imports, latest month, 5Y history/)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{await context.close();}
});

test('overview sharing actions stay out of printed research',async({page})=>{
  await page.goto('/?product=090122&direction=exports&comparison=annual&months=12');
  await selected(page,'090122','Exports','Last 12 months',12);
  await page.emulateMedia({media:'print'});
  await expect(copy(page)).toBeHidden();
  await expect(page.locator('.overview-kpi').first()).toContainText('$7.2K');
  await expect(page.locator('.overview-kpi').first()).toBeVisible();
});
