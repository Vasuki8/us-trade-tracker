import {defineConfig,devices} from '@playwright/test';
import {resolveMexicoProfilePort} from './scripts/serve-mexico-profile-fixture';
const port=resolveMexicoProfilePort(process.env.PLAYWRIGHT_MEXICO_PILOT_PORT??'4416'),baseURL='http://127.0.0.1:'+port;
export default defineConfig({
 testDir:'tests/e2e-mexico-pilot',fullyParallel:false,workers:1,retries:0,outputDir:'test-results/mexico-pilot',
 use:{baseURL,trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'firefox',use:{...devices['Desktop Firefox']}},{name:'webkit',use:{...devices['Desktop Safari']}}],
 webServer:{command:'node --import tsx scripts/serve-mexico-pilot-fixture.ts',url:baseURL+'/',reuseExistingServer:false,timeout:90_000},
});
