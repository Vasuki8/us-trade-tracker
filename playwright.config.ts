import {defineConfig,devices} from '@playwright/test';
const port=process.env.PLAYWRIGHT_PORT??'4321';
if(!/^\d{4,5}$/.test(port)||Number(port)<1024||Number(port)>65535)throw new Error('Invalid PLAYWRIGHT_PORT');
const baseURL=`http://127.0.0.1:${port}`;
export default defineConfig({testDir:'tests/e2e',fullyParallel:false,workers:1,
  use:{baseURL,trace:'retain-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{command:`npm run preview -- --port ${port}`,url:baseURL,reuseExistingServer:!process.env.CI,timeout:30_000}});
