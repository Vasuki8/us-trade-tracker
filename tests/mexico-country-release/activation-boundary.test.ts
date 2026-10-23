import {expect,it} from 'vitest';
import fs from 'node:fs/promises';import {resolve} from 'node:path';
it('keeps public country routes and data loaders independent of private Mexico acceptance',async()=>{
 const page=await fs.readFile(resolve('src/pages/countries/[code].astro'),'utf8');
 expect(page).toContain("code:'1220'");expect(page).toContain("code:'2010'");
 expect(page).toContain('loadMexicoPilot()');
 const sources=['src/pages/countries/[code].astro','src/pages/index.astro'];
 for(const path of sources){
  const text=await fs.readFile(resolve(path),'utf8');
  expect(text).not.toMatch(/mexico-country-(archive|release)|readAcceptedMexico|MEXICO_LOCAL_PREVIEW_MODE/);
 }
 const home=await fs.readFile(resolve('src/pages/index.astro'),'utf8');expect(home).toContain('resolveMexicoPilotMode(process.env)');
});
