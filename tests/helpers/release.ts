import type {Release, Observation} from '../../src/lib/trade/types';
export function sampleRelease(): Release {
  const observations: Observation[] = [];
  for (let year = 2024; year <= 2025; year++) for (let month = 1; month <= 12; month++) {
    for (const direction of ['imports', 'exports'] as const) for (const code of ['-', '1220', '4759', '2010', '4280']) {
      const total = (year === 2024 ? 50 : 100) * (direction === 'imports' ? 1 : 2);
      observations.push({productCode:'090121', description:'COFFEE, ROASTED, NOT DECAFFEINATED', direction,
        month:`${year}-${String(month).padStart(2,'0')}`, partnerCode:code,
        partnerName:code==='-'?'TOTAL FOR ALL COUNTRIES':({'1220':'CANADA','4759':'ITALY','2010':'MEXICO','4280':'GERMANY'}[code] ?? code),
        geography:code==='-'?'world':'country', measure:direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',
        valueUsd:code==='-'?total:code==='4280'?total-3*Math.floor(total/4):Math.floor(total/4), status:'reported'});
    }
  }
  return {schemaVersion:1,productCode:'090121',reportingMonth:'2025-12',retrievedAt:'2026-01-01T00:00:00.000Z',
    codeVersion:'synthetic',source:'fixture',sourceUrls:['https://api.census.gov/data/timeseries/intltrade/imports/hs'],
    observations,revisedKeys:[],classificationIntervals:[{from:'2024-01',to:'2025-12',evidenceUrl:'https://example.invalid/synthetic'}]};
}
