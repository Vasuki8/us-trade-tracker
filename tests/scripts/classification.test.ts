import {expect,it} from 'vitest';
import {classificationThrough} from '../../scripts/classification';
const evidenceUrl='https://www.census.gov/foreign-trade/reference/index.html';
const reviewed=[{from:'2021-09',to:'2026-08',evidenceUrl}];
it('limits reviewed evidence to an earlier reporting month without extending its start',()=>{
  expect(classificationThrough(reviewed,'2024-06')).toEqual([{from:'2021-09',to:'2024-06',evidenceUrl}]);
  expect(reviewed[0].to).toBe('2026-08');
});
it('never extends evidence into an unreviewed month',()=>{
  expect(classificationThrough(reviewed,'2026-09')).toEqual(reviewed);
  expect(classificationThrough(reviewed,'2021-08')).toEqual([]);
});
it('preserves separate intervals and rejects invalid evidence before clipping',()=>{
  expect(classificationThrough([{from:'2021-09',to:'2022-12',evidenceUrl},{from:'2023-01',to:'2026-08',evidenceUrl}],'2024-06'))
    .toEqual([{from:'2021-09',to:'2022-12',evidenceUrl},{from:'2023-01',to:'2024-06',evidenceUrl}]);
  expect(()=>classificationThrough([{from:'2027-01',to:'bad',evidenceUrl}],'2024-06')).toThrow();
  expect(()=>classificationThrough([...reviewed,{from:'2026-07',to:'2026-09',evidenceUrl}],'2024-06')).toThrow();
});
