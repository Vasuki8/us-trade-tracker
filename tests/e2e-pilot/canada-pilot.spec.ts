import {test,expect} from '@playwright/test';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parseCsv} from '../helpers/parse-csv';
const path='/countries/1220/';
test.use({timezoneId:'Pacific/Honolulu'});
test.beforeEach(async({page})=>{await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='127.0.0.1'&&u.protocol!=='blob:')throw Error('Unexpected network request');return route.continue();});});
test('pilot fixtures identify the historical coverage, source and unavailable categories',async({page})=>{
  await page.goto(path);await expect(page.getByRole('heading',{name:'Canada historical snapshot',exact:true})).toBeVisible();await expect(page.getByText('Synthetic pilot preparation sample · No accepted country release')).toBeVisible();await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
  await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$2,400,000');await expect(page.getByRole('table',{name:'Monthly U.S. imports from Canada · nominal USD'}).getByRole('row')).toHaveCount(25);
  const categories=page.getByRole('table',{name:'Selected categories · Imports'});await expect(categories.getByRole('row')).toHaveCount(11);await expect(categories.getByRole('row').filter({hasText:'980100'})).toContainText('Unavailable');
  await expect(page.getByRole('region',{name:'Sources and revision differences'})).toContainText('All displayed observations and reference examples are synthetic');
});
test('direction changes and all four downloads keep values and honest pilot context',async({page})=>{
  await page.goto(path);for(const direction of ['imports','exports'] as const){await page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports',exact:true}).check();
    await expect(page.getByRole('region',{name:'Country overview'})).toContainText(direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO');
    if(direction==='exports')await expect(page.getByRole('region',{name:'Country overview'})).toContainText('Canadian import data');
    for(const kind of ['monthly','products']){const event=page.waitForEvent('download');await page.getByRole('button',{name:`Download ${kind} CSV`,exact:true}).click();const file=await event;expect(file.suggestedFilename()).toBe(`canada-1220-${direction}-2024-09-2026-08-pilot-fixture-${kind}.csv`);const rows=parseCsv(await readFile((await file.path())!,'utf8'));expect(rows).toHaveLength(kind==='monthly'?24:10);for(const row of rows){expect(row).toMatchObject({presentation_context:'pilot-fixture',build_context:'local-preparation-only',accepted_release_id:'',local_accepted_at:''});expect(row).not.toHaveProperty('publication_status');}
      if(kind==='monthly')expect(rows[0]).toMatchObject({month:'2024-09',value_usd:direction==='imports'?'100000':'300000'});else{expect(rows.find(r=>r.product_code==='270900')).toMatchObject({current_value_usd:direction==='imports'?'240000':'216000',prior_value_usd:direction==='imports'?'120000':'108000',current_country_total_usd:direction==='imports'?'2400000':'4600000'});for(const r of rows.filter(r=>r.special_by_policy==='true'))expect(r).toMatchObject({change_usd:'',growth_percent:'',current_share_percent:'',prior_share_percent:'',share_change_percentage_points:''});}
    }
  }await expect(page.getByRole('region',{name:'Sources and revision differences'})).toContainText('17 matched; 7 mismatch');
});
test('mobile keyboard controls and native details remain usable',async({page},testInfo)=>{
  await page.setViewportSize({width:320,height:812});await page.goto(path);const imports=page.getByRole('radio',{name:'Imports',exact:true});await expect(imports).toBeEnabled();await imports.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeChecked();
  const table=page.getByRole('region',{name:'Selected country category comparisons'});await table.focus();await expect(table).toBeFocused();expect(await table.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  const summary=page.getByText('Capture and verification details',{exact:true});await summary.focus();await page.keyboard.press('Enter');await expect(summary.locator('..')).toHaveAttribute('open','');await expect(summary.locator('..')).toContainText('synthetic-fixture-v1');await page.getByRole('radio',{name:'Imports',exact:true}).check();await expect(summary.locator('..')).toHaveAttribute('open','');
  for(const width of [320,375,1120]){await page.setViewportSize({width,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:testInfo.outputPath('pilot-desktop.png')});await page.setViewportSize({width:375,height:812});await page.screenshot({path:testInfo.outputPath('pilot-mobile.png')});
});
test('default Imports and source details work without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:812}});try{const page=await context.newPage();await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.goto(path);
    await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$2,400,000');await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Download monthly CSV'})).toBeDisabled();const summary=page.getByText('Capture and verification details',{exact:true});await summary.focus();await page.keyboard.press('Enter');await expect(summary.locator('..')).toContainText('synthetic-fixture-v1');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{await context.close();}
});
test('pilot output omits private previews, acceptance packages and private identities',async({page})=>{
  for(const privateRoute of ['/preview/countries/1220/','/preview/accepted/countries/1220/'])expect((await page.goto(privateRoute))?.status()).toBe(404);
  const dirs=(await readdir(resolve('.tmp'))).filter(name=>/^canada-pilot-[A-Za-z0-9]{6}$/.test(name)),served=await (await page.request.get('/methods/')).text(),matching=[];
  // Windows force-termination can leave older owned fixture output. Authenticate the current output against its actual served HTML.
  for(const dir of dirs){try{if(await readFile(resolve('.tmp',dir,'methods/index.html'),'utf8')===served)matching.push(dir);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}}
  expect(matching).toHaveLength(1);
  async function scan(dir:string):Promise<void>{for(const entry of await readdir(dir,{withFileTypes:true})){const file=resolve(dir,entry.name);if(entry.isDirectory()){expect(file.replaceAll('\\','/')).not.toContain('/preview/');await scan(file);}else if(/\.(html|js|json)$/.test(entry.name)){const text=await readFile(file,'utf8');expect(text,file).not.toMatch(/data\/backups|\.superpowers\/|X-Amz-Signature|9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399|337d25eeb94c87d9dbfdc4c9a21a20e7e50f416a6599cd0699f028eee0349818|owner-private-evidence/);}}}
  await scan(resolve('.tmp',matching[0]));
});
test('opted-in homepage, Methods and product navigation expose only the fixed country snapshot',async({page})=>{
  await page.goto('/');const card=page.getByRole('region',{name:'Country snapshot',exact:true});await expect(card).toContainText('September 2024–August 2026');await expect(card).toContainText('Synthetic development data');await expect(page.getByRole('navigation',{name:'Product profiles',exact:true}).getByRole('article')).toHaveCount(2);await expect(page.locator('astro-island')).toHaveCount(0);
  await card.getByRole('link',{name:'Canada historical snapshot',exact:true}).click();await expect(page).toHaveURL(/\/countries\/1220\/$/);
  for(const url of ['/methods/','/products/090121/','/countries/1220/']){await page.goto(url);await expect(page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Country research',exact:true})).toHaveAttribute('href',path);}
  await page.goto('/methods/');const methods=page.getByRole('region',{name:'Canada snapshot',exact:true});await expect(methods).toContainText('Synthetic development data');await expect(methods).toContainText('same captured files');await expect(methods).toContainText('GEN_VAL_MO');await expect(methods).toContainText('ALL_VAL_MO');await expect(methods).toContainText('Statistical categories');await expect(methods).toContainText('monthly Canada updates');await expect(page.locator('astro-island')).toHaveCount(0);
});
test('country entry, navigation and Methods stay usable on mobile without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:812}});try{const page=await context.newPage();await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
    await page.goto('/');const entry=page.getByRole('region',{name:'Country snapshot',exact:true}).getByRole('link',{name:'Canada historical snapshot',exact:true});await entry.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/countries\/1220\/$/);await expect(page.getByRole('radio',{name:'Exports',exact:true})).toBeDisabled();
    for(const width of [320,375])for(const url of ['/','/countries/1220/','/methods/','/products/090121/']){await page.setViewportSize({width,height:812});await page.goto(url);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Country research',exact:true})).toBeVisible();}
  }finally{await context.close();}
});
