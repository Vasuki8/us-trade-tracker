import {defineConfig,devices} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,
  testMatch:['**/content-disclosure.spec.ts','**/merchandise-download-reliability.spec.ts','**/estimated-duty-recorded-revisions.spec.ts','**/product-profile.spec.ts','**/briefing-print.spec.ts'],
  retries:0,outputDir:'test-results/compatibility',
  projects:[
    {name:'firefox',use:{...base.use,...devices['Desktop Firefox']}},
    {name:'webkit',use:{...base.use,...devices['Desktop Safari']}},
  ],
});
