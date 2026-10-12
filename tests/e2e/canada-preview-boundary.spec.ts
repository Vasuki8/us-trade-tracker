import {test,expect} from '@playwright/test';
import {readdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
test('normal static build omits Canada preview route and observations',async({page})=>{
  const response=await page.goto('/preview/countries/1220/');expect(response?.status()).toBe(404);
  await page.goto('/products/');await expect(page.locator('nav a[href*="/preview/"]')).toHaveCount(0);
  async function scan(dir:string):Promise<void>{for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory()){expect(path.replaceAll('\\','/')).not.toContain('/preview/countries/');await scan(path);}else if(/\.(html|js|json)$/.test(entry.name)){const body=await readFile(path,'utf8');expect(body).not.toContain('9c385fb94b2a36b1d07ddf9e01670c366839a83b');expect(body).not.toContain('previous-reviewed-replay');expect(body).not.toContain('Synthetic category 270900');}}}
  await scan(resolve('dist'));
});
