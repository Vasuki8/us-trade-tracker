import {defineConfig,devices} from '@playwright/test';
import {resolveCanadaPilotPort} from './scripts/serve-canada-preview-fixture';
const port=resolveCanadaPilotPort(process.env.PLAYWRIGHT_CANADA_PILOT_PORT),baseURL=`http://127.0.0.1:${port}`;
export default defineConfig({testDir:'tests/e2e-pilot',fullyParallel:false,workers:1,outputDir:'test-results/canada-pilot',
  use:{baseURL,trace:'retain-on-failure'},projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{command:'node --import tsx scripts/serve-canada-pilot-fixture.ts',url:baseURL+'/countries/1220/',reuseExistingServer:false,timeout:90_000}});
