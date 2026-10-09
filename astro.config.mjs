import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { buildReportIntegration } from './scripts/build-report.ts';
export default defineConfig({ output: 'static', integrations: [react(), buildReportIntegration()] });
