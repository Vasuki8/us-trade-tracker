import {test,expect} from '@playwright/test';
import {readdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
test('normal static build omits Canada preview route and observations',async({page})=>{
  for(const route of ['/preview/countries/1220/','/preview/accepted/countries/1220/']){
    const response=await page.goto(route);expect(response?.status()).toBe(404);
  }
  await page.goto('/products/');await expect(page.locator('nav a[href*="/preview/"]')).toHaveCount(0);
  async function scan(dir:string):Promise<void>{
    for(const entry of await readdir(dir,{withFileTypes:true})){
      const path=resolve(dir,entry.name);
      if(entry.isDirectory()){
        expect(path.replaceAll('\\','/')).not.toContain('/preview/');await scan(path);
      }else if(/\.(html|js|json)$/.test(entry.name)){
        const body=await readFile(path,'utf8');
        for(const identity of [
          '9c385fb94b2a36b1d07ddf9e01670c366839a83b',
          '2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca',
          '9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399',
          '2026-10-12T23:46:54.013Z',
          'Synthetic category 270900',
        ])expect(body,path).not.toContain(identity);
        // Shared validation code names this basis; rendered/serialized observations must remain absent.
        if(/\.(html|json)$/.test(entry.name))expect(body,path).not.toContain('previous-reviewed-replay');
      }
    }
  }
  await scan(resolve('dist'));
});
