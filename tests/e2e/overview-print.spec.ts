import {test,expect} from '@playwright/test';

for(const direction of ['imports','exports'])for(const comparison of ['monthly','annual']) {
 test(`overview print separates research links and retains sourced ${direction} ${comparison} rows`,async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`/?direction=${direction}&comparison=${comparison}&months=12`);
  await expect(page.getByRole('button',{name:'Copy overview link',exact:true})).toBeEnabled();
  const monitor=page.getByRole('navigation',{name:'Product profiles',exact:true});
  const original=await monitor.textContent();
  const values=await monitor.locator('tbody td').allTextContents();
  await page.emulateMedia({media:'print'});
  await expect(page.locator('.overview-view-link')).toBeHidden();
  await expect(monitor.locator('.monitor-links')).toHaveCount(2);
  for(const links of await monitor.locator('.monitor-links').all()){
   const first=links.getByRole('link',{name:'Country changes',exact:true});
   const second=links.getByRole('link',{name:'Release briefing',exact:true});
   await expect(first).toBeVisible();await expect(second).toBeVisible();
   const a=await first.boundingBox(),b=await second.boundingBox();expect(a).not.toBeNull();expect(b).not.toBeNull();
   expect(b!.y>=a!.y+a!.height || b!.x>=a!.x+a!.width+8).toBe(true);
  }
  await expect(monitor.getByText('Source: Development fixtures',{exact:false}).first()).toBeVisible();
  expect(await monitor.textContent()).toBe(original);expect(await monitor.locator('tbody td').allTextContents()).toEqual(values);
  for(const paper of ['A4','Letter'] as const){
   const pdf=await page.pdf({path:testInfo.outputPath('overview-'+paper+'.pdf'),format:paper,printBackground:false,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});
   expect(pdf.subarray(0,5).toString()).toBe('%PDF-');
  }
  await page.emulateMedia({media:'screen'});expect(await monitor.textContent()).toBe(original);
  await expect(page.getByRole('button',{name:'Copy overview link',exact:true})).toBeVisible();expect(errors).toEqual([]);
 });
}
test('static overview print exposes research links without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false});
 try{
  const page=await context.newPage();await page.goto('/');await page.emulateMedia({media:'print'});
  await expect(page.locator('.monitor-links')).toHaveCount(2);
  for(const links of await page.locator('.monitor-links').all()){
   for(const link of await links.locator('a').all())await expect(link).toBeVisible();
   const [a,b]=await links.locator('a').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}));
   expect(b.y>=a.y+a.height || b.x>=a.x+a.width+8).toBe(true);
  }
  await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();
  await expect(page.locator('.overview-kpi').first()).toContainText('$100');
  await expect(page.locator('.monitor-navigation').getByText('Source: Development fixtures',{exact:false}).first()).toBeVisible();
 }finally{await context.close();}
});

