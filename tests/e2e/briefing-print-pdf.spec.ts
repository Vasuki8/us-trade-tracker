import {test,expect} from '@playwright/test';
for(const report of [{path:'/briefing/',code:'090121',value:'$100'},{path:'/briefing/090122/',code:'090122',value:'$300'}])for(const paper of ['A4','Letter'] as const){
 test(report.code+' produces a native '+paper+' PDF with visible report and provenance',async({page},testInfo)=>{
  const errors:string[]=[],sourceRequests:string[]=[];page.on('pageerror',()=>errors.push('page-error'));page.on('request',r=>{if(r.url().includes('api.census.gov'))sourceRequests.push(r.url());});await page.goto(report.path);await page.emulateMedia({media:'print'});
  await expect(page.locator('.site-header')).toBeHidden();await expect(page.getByRole('region',{name:'Monthly imports'})).toContainText('Current value: '+report.value);await expect(page.getByText('Development sample data',{exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'Sources and release'})).toBeVisible();await expect(page.locator('.site-footer p').last()).toBeVisible();
  const pdf=await page.pdf({path:testInfo.outputPath(report.code+'-'+paper+'.pdf'),format:paper,printBackground:false,displayHeaderFooter:false,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});expect(pdf.subarray(0,5).toString()).toBe('%PDF-');expect(pdf.length).toBeGreaterThan(1000);expect(errors).toEqual([]);expect(sourceRequests).toEqual([]);await expect(page.locator('astro-island')).toHaveCount(0);
 });
}
