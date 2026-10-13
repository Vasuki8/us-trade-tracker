import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {parseCsv} from '../helpers/parse-csv';
const path='/preview/accepted/countries/1220/';
test.use({timezoneId:'Pacific/Honolulu'});
test.beforeEach(async({page})=>{await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname!=='127.0.0.1'&&url.protocol!=='blob:')throw new Error('Unexpected network request');return route.continue();});});
test('accepted-profile fixture stays visibly synthetic, gated and unpublished',async({page})=>{await page.goto(path);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');await expect(page.getByText('Synthetic accepted-profile sample · No accepted country release')).toBeVisible();await expect(page.getByRole('region',{name:'Country overview'})).toContainText('$2,400,000');await expect(page.getByRole('table',{name:'Selected categories · Imports'}).getByRole('row')).toHaveCount(11);await page.getByRole('radio',{name:'Exports'}).check();await expect(page.getByRole('region',{name:'Country overview'})).toContainText('Canadian import data');await expect(page.getByRole('region',{name:'Sources and revision differences'})).toContainText('17 matched; 7 mismatch');});
test('both direction CSVs retain values and blank exclusions with explicit sample context',async({page})=>{await page.goto(path);for(const direction of ['imports','exports'] as const){await page.getByRole('radio',{name:direction==='imports'?'Imports':'Exports'}).check();for(const kind of ['monthly','products'] as const){const event=page.waitForEvent('download');await page.getByRole('button',{name:`Download ${kind} CSV`}).click();const download=await event;expect(download.suggestedFilename()).toBe(`canada-1220-${direction}-2024-09-2026-08-accepted-profile-fixture-${kind}.csv`);const rows=parseCsv(await readFile((await download.path())!,'utf8'));expect(rows).toHaveLength(kind==='monthly'?24:10);expect(rows.every(r=>r.presentation_context==='accepted-profile-fixture'&&r.publication_status==='not-published'&&r.accepted_release_id===''&&r.local_accepted_at==='')).toBe(true);if(kind==='monthly')expect(rows[0].value_usd).toBe(direction==='imports'?'100000':'300000');else for(const row of rows.filter(r=>r.special_by_policy==='true'))expect(row).toMatchObject({change_usd:'',growth_percent:'',current_share_percent:'',prior_share_percent:'',share_change_percentage_points:''});}}});
test('accepted-profile sample supports mobile keyboard controls and contained tables',async({page})=>{await page.setViewportSize({width:320,height:812});await page.goto(path);const imports=page.getByRole('radio',{name:'Imports'});await expect(imports).toBeEnabled();await imports.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Exports'})).toBeChecked();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const table=page.getByRole('region',{name:'Selected country category comparisons'});await table.focus();await expect(table).toBeFocused();expect(await table.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download products CSV'}).focus();await page.keyboard.press('Enter');expect((await download).suggestedFilename()).toContain('exports');});
test('capture details open by keyboard, retain source context on direction changes and work without JavaScript',async({page,browser,baseURL})=>{
  await page.setViewportSize({width:320,height:812});await page.goto(path);
  await expect(page.getByText('11 Oct 2026, 17:01 UTC',{exact:true})).toBeVisible();
  const summary=page.getByText('Capture and verification details',{exact:true}),details=summary.locator('..');
  await expect(details).not.toHaveAttribute('open');await expect(details.getByText('synthetic-fixture-v1',{exact:true})).not.toBeVisible();
  await summary.focus();await expect(summary).toBeFocused();await page.keyboard.press('Enter');await expect(details).toHaveAttribute('open','');
  await expect(details.getByText('synthetic-fixture-v1',{exact:true})).toBeVisible();
  await expect(details.locator('time').first()).toHaveAttribute('datetime','2026-10-11T17:01:00.000Z');
  await page.getByRole('radio',{name:'Exports'}).check();await expect(details).toHaveAttribute('open','');
  await expect(page.getByRole('region',{name:'Sources and revision differences'})).toContainText('17 matched; 7 mismatch');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await summary.focus();await page.keyboard.press('Space');await expect(details).not.toHaveAttribute('open');
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:812}});
  try{const fallback=await context.newPage();await fallback.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());await fallback.goto(path);
    await expect(fallback.getByText('11 Oct 2026, 17:01 UTC',{exact:true})).toBeVisible();
    const disclosure=fallback.getByText('Capture and verification details',{exact:true});await disclosure.focus();await fallback.keyboard.press('Enter');
    await expect(disclosure.locator('..').getByText('synthetic-fixture-v1',{exact:true})).toBeVisible();await expect(fallback.getByRole('radio',{name:'Exports'})).toBeDisabled();
  }finally{await context.close();}
});
