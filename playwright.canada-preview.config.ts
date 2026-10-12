import {defineConfig,devices} from '@playwright/test';
import {resolveCanadaPreviewPort} from './scripts/serve-canada-preview-fixture';
const port=resolveCanadaPreviewPort(process.env.PLAYWRIGHT_CANADA_PORT),baseURL=`http://127.0.0.1:${port}`;
export default defineConfig({testDir:'tests/e2e-preview',fullyParallel:false,workers:1,
  outputDir:'test-results/canada-preview',use:{baseURL,trace:'retain-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{command:'node --import tsx scripts/serve-canada-preview-fixture.ts',url:baseURL+ '/preview/countries/1220/',reuseExistingServer:false,timeout:90_000}});
