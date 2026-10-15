import type {CountryPreview,CountryDirection,CountryPresentation} from './types';
import {assertCountryPresentationSource,countryCsvFilename} from './downloads';
import {canadaViewPath} from './view-link';

export type CountryChartExport={
 title:string;direction:CountryDirection;measure:'GEN_VAL_MO'|'ALL_VAL_MO';from:string;to:string;
 sourceLabel:string;captureStartedAt:string;captureFinishedAt:string;processingVersion:string;
 context:'historical-snapshot'|'pilot-fixture';qualification:string;sourcePageUrl:string;filename:string;
};
export function buildCountryChartExport(data:CountryPreview,direction:CountryDirection,presentation:CountryPresentation):CountryChartExport{
 assertCountryPresentationSource(data,presentation);
 if((presentation.kind!=='pilot-snapshot'&&presentation.kind!=='pilot-fixture')||(direction!=='imports'&&direction!=='exports'))throw new Error('Country chart presentation mismatch');
 const view=data.directions[direction],sample=presentation.kind==='pilot-fixture';
 return {title:view.title,direction,measure:view.measure,from:data.reporting.from,to:data.reporting.to,
  sourceLabel:sample?'Synthetic development data':'U.S. Census Bureau monthly merchandise files',
  captureStartedAt:data.captureInterval.startedAt,captureFinishedAt:data.captureInterval.finishedAt,processingVersion:data.processingVersion,
  context:sample?'pilot-fixture':'historical-snapshot',
  qualification:sample?'SYNTHETIC DEVELOPMENT DATA — no accepted country release.':'Accepted historical snapshot; not a uniform or latest-revised series. No monthly-update claim.',
  sourcePageUrl:'https://us-trade-tracker.pages.dev'+canadaViewPath({direction}),
  filename:countryCsvFilename(direction,'monthly',presentation).replace(/-monthly\.csv$/,'-chart.png')};
}
