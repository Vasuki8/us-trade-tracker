import {expect,it} from 'vitest';
import {buildCountryChartExport} from '../../src/lib/country-preview/chart-export';
import {makeCountryPreviewFixture} from '../helpers/country-preview-data';
import type {CountryPresentation} from '../../src/lib/country-preview/types';
const snapshot:CountryPresentation={kind:'pilot-snapshot',releaseId:'private-release-id',acceptedAt:'2026-10-12T23:46:54.013Z'};
const real=()=>{const data=makeCountryPreviewFixture();data.source='retained';data.rawVerification='previous-reviewed-replay';return data;};
it.each([['imports','GEN_VAL_MO','U.S. imports from Canada'],['exports','ALL_VAL_MO','U.S. exports to Canada']] as const)('binds %s image metadata and filename to the chosen historical view',(direction,measure,title)=>{
 const result=buildCountryChartExport(real(),direction,snapshot);
 expect(result).toMatchObject({title,direction,measure,from:'2024-09',to:'2026-08',sourceLabel:'U.S. Census Bureau monthly merchandise files',captureStartedAt:'2026-10-11T17:01:00.000Z',captureFinishedAt:'2026-10-11T17:02:00.000Z',processingVersion:'synthetic-fixture-v1',context:'historical-snapshot',sourcePageUrl:'https://us-trade-tracker.pages.dev/countries/1220/?direction='+direction,filename:'canada-1220-'+direction+'-2024-09-2026-08-historical-snapshot-chart.png'});
 expect(result.qualification).toBe('Accepted historical snapshot; not a uniform or latest-revised series. No monthly-update claim.');
 expect(JSON.stringify(result)).not.toContain('private-release-id');expect(JSON.stringify(result)).not.toContain('acceptedAt');
});
it('labels fixture images as synthetic without accepted claims',()=>{
 const result=buildCountryChartExport(makeCountryPreviewFixture(),'imports',{kind:'pilot-fixture'});
 expect(result.context).toBe('pilot-fixture');expect(result.sourceLabel).toBe('Synthetic development data');
 expect(result.qualification).toBe('SYNTHETIC DEVELOPMENT DATA — no accepted country release.');
 expect(result.filename).toBe('canada-1220-imports-2024-09-2026-08-pilot-fixture-chart.png');
});
it('rejects crossed source/presentation, private contexts and invalid direction',()=>{
 expect(()=>buildCountryChartExport(makeCountryPreviewFixture(),'imports',snapshot)).toThrow();
 expect(()=>buildCountryChartExport(real(),'imports',{kind:'pilot-fixture'})).toThrow();
 for(const kind of ['preview','accepted-fixture'] as const)expect(()=>buildCountryChartExport(makeCountryPreviewFixture(),'imports',{kind})).toThrow();
 for(const kind of ['accepted-local','pilot-prepared'] as const)expect(()=>buildCountryChartExport(real(),'imports',{...snapshot,kind})).toThrow();
 expect(()=>buildCountryChartExport(real(),'wrong' as 'imports',snapshot)).toThrow();
});
