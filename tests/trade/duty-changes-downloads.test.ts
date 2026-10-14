import {expect,it} from 'vitest';
import {dutyChangesRelease,setDutyAmounts} from '../helpers/duty-changes';
import {parseCsv} from '../helpers/parse-csv';
import {prepareDutyChanges,selectDutyChanges} from '../../src/lib/trade/duty-changes';
import {serializeDutyChangesCsv} from '../../src/lib/trade/downloads';
const selected=(release=dutyChangesRelease(),period:'rolling'|'monthly'='rolling',metric:'share'|'dollars'='share')=>selectDutyChanges(prepareDutyChanges(release),{period,metric});
it('exports exactly selected ranked country rows with literal period sums and source metadata',()=>{
  const rows=parseCsv(serializeDutyChangesCsv(selected()));expect(rows).toHaveLength(2);
  expect(rows[0]).toMatchObject({feature:'Estimated-duty changes',direction:'imports',product_code:'090121',partner_code:'1220',partner_name:'Canada',ranking_metric:'share',comparison_period:'rolling',movement:'increase',rank:'1',reporting_month:'2025-12',current_period_start:'2025-01',current_period_end:'2025-12',previous_period_start:'2024-01',previous_period_end:'2024-12',current_calculated_duty_usd:'72',previous_calculated_duty_usd:'12',current_consumption_value_usd:'240',previous_consumption_value_usd:'120',current_duty_share_percent:'30',previous_duty_share_percent:'10',calculated_duty_change_usd:'60',duty_growth_percent:'500',duty_share_change_percentage_points:'20',numerator_measure:'CAL_DUT_MO',denominator_measure:'CON_VAL_MO',coverage_measure:'DUT_VAL_MO',source:'Development sample data',retrieved_at:'2026-01-01T00:00:00.000Z',code_version:'synthetic',revised:'false',source_urls:'https://api.census.gov/data/timeseries/intltrade/imports/hs',total_country_count:'2',comparable_count:'2',unavailable_count:'0',unchanged_count:'0',qualified_count:'0',classification_unverified_count:'0',incomplete_period_count:'0',coverage_unavailable_count:'0',denominator_unavailable_count:'0'});
  expect(rows[0].units).toContain('current USD');expect(rows[0].units).toContain('percentage points');
  expect(rows[1]).toMatchObject({partner_code:'4759',movement:'decrease',rank:'1',calculated_duty_change_usd:'-48',duty_share_change_percentage_points:'-45'});
  const monthly=parseCsv(serializeDutyChangesCsv(selected(undefined,'monthly','dollars')));expect(monthly[0]).toMatchObject({current_calculated_duty_usd:'6',previous_calculated_duty_usd:'1',current_consumption_value_usd:'20',previous_consumption_value_usd:'10',current_period_start:'2025-12',previous_period_start:'2024-12',ranking_metric:'dollars'});
});
it('retains both period status and RP coverage independently of world suppression',()=>{
  const release=dutyChangesRelease();release.duties.revisedKeys=['duty/revised'];release.duties.observations.find(r=>r.partnerCode==='-'&&r.month==='2025-12')!.calculatedDuty={status:'suppressed',valueUsd:null};for(const row of release.duties.observations.filter(r=>r.partnerCode==='1220'))row.coverage.uncalculatedDutiableValueUsd=2;
  const row=parseCsv(serializeDutyChangesCsv(selected(release)))[0];
  expect(row).toMatchObject({current_dutiable_value_usd:'240',previous_dutiable_value_usd:'120',current_calculated_duty_status:'reported',previous_calculated_duty_status:'reported',current_consumption_value_status:'reported',previous_consumption_value_status:'reported',current_dutiable_value_status:'reported',previous_dutiable_value_status:'reported',current_complete:'true',previous_complete:'true',current_classification_compatible:'true',previous_classification_compatible:'true',classification_comparable:'true',comparison_available:'true',current_coverage_status:'verified',previous_coverage_status:'verified',current_affected_dutiable_value_usd:'24',previous_affected_dutiable_value_usd:'24',current_affected_share_percent:'10',previous_affected_share_percent:'20',current_qualified:'true',previous_qualified:'true',qualified_count:'1',revised:'true'});
});
it('exports dollar changes with unavailable zero-denominator share and no zero-prior growth',()=>{
  const release=dutyChangesRelease();setDutyAmounts(release,'1220',[6,0],[0,10]);
  const row=parseCsv(serializeDutyChangesCsv(selected(release,'monthly','dollars')))[0];expect(row).toMatchObject({current_consumption_value_usd:'0',current_duty_share_percent:'',previous_duty_share_percent:'0',calculated_duty_change_usd:'6',duty_growth_percent:'',duty_share_change_percentage_points:''});expect(row.qualification).toMatch(/zero or missing consumption/i);
  expect(parseCsv(serializeDutyChangesCsv(selected(release,'monthly','share'))).map(r=>r.partner_code)).toEqual(['4759']);
});
it('round-trips quoted text and protects formula-like strings without altering numeric negatives',()=>{
  const release=dutyChangesRelease();for(const row of release.observations)if(row.geography==='world')row.description='=Coffee,"quote"\nnew line';for(const row of release.duties.observations)if(row.partnerCode==='4759')row.partnerName='@Italy';
  const rows=parseCsv(serializeDutyChangesCsv(selected(release)));expect(rows[0].product_description).toBe('\'=Coffee,"quote"\nnew line');expect(rows[1].partner_name).toBe("'@Italy");expect(rows[1].calculated_duty_change_usd).toBe('-48');expect(rows[1].duty_share_change_percentage_points).toBe('-45');
});
it('limits export to exactly the displayed top-ten rows per movement',()=>{
  const release=dutyChangesRelease(),source=release.duties.observations.filter(r=>r.partnerCode==='1220');for(let i=0;i<12;i++)for(const row of source)release.duties.observations.push({...structuredClone(row),partnerCode:String(6000+i),partnerName:`Extra ${i}`,calculatedDuty:{status:'reported',valueUsd:row.month.startsWith('2025')?10+i:1}});
  const rows=parseCsv(serializeDutyChangesCsv(selected(release,'monthly','dollars')));expect(rows).toHaveLength(11);expect(rows.filter(r=>r.movement==='increase').map(r=>r.partner_code)).toEqual(['6011','6010','6009','6008','6007','6006','6005','6004','6003','6002']);expect(rows.filter(r=>r.movement==='increase').map(r=>r.rank)).toEqual(['1','2','3','4','5','6','7','8','9','10']);expect(rows[0].total_country_count).toBe('14');
});
