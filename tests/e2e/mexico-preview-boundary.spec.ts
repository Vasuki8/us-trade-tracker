import {test,expect} from '@playwright/test';
import {readdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
test('normal build omits the private Mexico route, data and navigation',async({page})=>{
 for(const path of ['/preview/mexico/2010/','/countries/2010/'])expect((await page.goto(path))?.status()).toBe(404);
 await page.goto('/');await expect(page.locator('a[href*="/preview/mexico/"],a[href="/countries/2010/"]')).toHaveCount(0);
 async function scan(dir:string):Promise<void>{for(const e of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,e.name);if(e.isDirectory()){expect(path.replaceAll('\\','/')).not.toContain('/preview/');await scan(path);}else if(/\.(html|js|json)$/.test(e.name)){const text=await readFile(path,'utf8');for(const marker of ['2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18','2026-10-19T04:12:15.203Z','36fcc241eed959e216359c4178445e1859cfe85d2f3a69aace7f038ad88fead2','2026-10-01T00:00:00.000Z','PRIVATE_OWNER_INSTRUCTION'])expect(text,path).not.toContain(marker);}}}
 await scan(resolve('dist'));
});
