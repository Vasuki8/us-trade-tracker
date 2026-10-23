import {defineConfig,devices} from '@playwright/test';
import {resolveMexicoProfilePort} from './scripts/serve-mexico-profile-fixture';
const port=resolveMexicoProfilePort(process.env.PLAYWRIGHT_MEXICO_PROFILE_PORT),baseURL='http://127.0.0.1:'+port;
export default defineConfig({
 testDir:'tests/e2e-mexico-profile',fullyParallel:false,workers:1,outputDir:'test-results/mexico-profile',
 use:{baseURL,trace:'retain-on-failure'},projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
 webServer:{command:'node --import tsx scripts/serve-mexico-profile-fixture.ts',url:baseURL+'/preview/mexico/2010/',reuseExistingServer:false,timeout:90_000},
});
