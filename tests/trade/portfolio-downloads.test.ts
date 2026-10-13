import {expect,it} from 'vitest';
import {portfolioSample} from '../helpers/portfolio';
import {parseCsv} from '../helpers/parse-csv';
import {preparePortfolioBriefing,selectPortfolioBriefing} from '../../src/lib/trade/portfolio-briefing';
import {serializePortfolioSummaryCsv,serializePortfolioPartnersCsv} from '../../src/lib/trade/downloads';
const selected=(items=[portfolioSample()],direction:'imports'|'exports'='imports')=>selectPortfolioBriefing(preparePortfolioBriefing(items),{productCodes:items.map(i=>i.product.code),direction});
it('exports two sourced world comparison rows with matched duty sums and qualifications',()=>{
  const rows=parseCsv(serializePortfolioSummaryCsv(selected()));expect(rows).toHaveLength(2);
  expect(rows[0]).toMatchObject({product_code:'090121',comparison_period:'monthly',current_value_usd:'100',previous_value_usd:'50',change_usd:'50',growth_percent:'100',current_value_status:'reported',current_period_start:'2025-12',previous_period_end:'2024-12',measure:'GEN_VAL_MO',current_duty_calculated_duty_usd:'12',current_duty_consumption_value_usd:'80',current_duty_duty_share_percent:'15',source:'Development sample data',retrieved_at:'2026-01-01T00:00:00.000Z',code_version:'synthetic'});
  expect(rows[1]).toMatchObject({comparison_period:'rolling',current_value_usd:'1200',previous_value_usd:'600',current_period_start:'2025-01',previous_period_start:'2024-01',current_duty_calculated_duty_usd:'144',current_duty_consumption_value_usd:'960',previous_duty_calculated_duty_usd:'24',previous_duty_consumption_value_usd:'240',current_duty_coverage_status:'verified',current_duty_qualified:'true',current_duty_affected_dutiable_value_usd:'24',current_duty_affected_share_percent:'5',duty_comparison_available:'true',duty_change_usd:'120',duty_share_change_percentage_points:'5',numerator_measure:'CAL_DUT_MO',denominator_measure:'CON_VAL_MO'});
});
it('exports only displayed rolling highlights and protects literal text and numeric negatives',()=>{
  const item=portfolioSample('090121','=Roasted,"coffee"\nreport');
  for(const row of item.release.observations)if(row.partnerCode==='4759')row.partnerName='@Italy';
  const rows=parseCsv(serializePortfolioPartnersCsv(selected([item])));expect(rows).toHaveLength(2);
  expect(rows[0]).toMatchObject({movement:'increase',ranking_metric:'dollars',partner_code:'1220',current_value_usd:'480',previous_value_usd:'120',change_usd:'360',share_change_percentage_points:'20',current_duty_calculated_duty_usd:'12',current_duty_consumption_value_usd:'120'});
  expect(rows[1]).toMatchObject({movement:'decrease',partner_name:"'@Italy",change_usd:'-120',product_name:'\'=Roasted,"coffee"\nreport'});
});
it('leaves mismatched release amounts blank while retaining identity, source and common periods',()=>{
  const old=portfolioSample('090111','Green');old.release.reportingMonth='2025-11';
  const view=selected([portfolioSample(),old]),rows=parseCsv(serializePortfolioSummaryCsv(view));
  expect(rows[2]).toMatchObject({product_code:'090111',availability:'reporting_month_mismatch',product_reporting_month:'2025-11',reporting_month:'2025-12',current_value_usd:'',previous_value_usd:'',current_duty_calculated_duty_usd:'',current_period_start:'2025-12',retrieved_at:'2026-01-01T00:00:00.000Z'});
  expect(parseCsv(serializePortfolioPartnersCsv(view)).map(row=>row.product_code)).toEqual(['090121','090121']);
});
it('preserves suppressed amounts and zero-prior growth, with empty duty fields for exports',()=>{
  const item=portfolioSample(),row=item.release.observations.find(r=>r.geography==='world'&&r.direction==='imports'&&r.month==='2025-12')!;row.status='suppressed';row.valueUsd=null;
  expect(parseCsv(serializePortfolioSummaryCsv(selected([item])))[0]).toMatchObject({availability:'incomplete_period',current_value_status:'suppressed',current_value_usd:'',previous_value_usd:'50',growth_percent:''});
  const exports=parseCsv(serializePortfolioSummaryCsv(selected([portfolioSample()],'exports')));
  expect(exports[0]).toMatchObject({direction:'exports',measure:'ALL_VAL_MO',current_value_usd:'200',current_duty_calculated_duty_usd:'',numerator_measure:'',denominator_measure:''});
  expect(parseCsv(serializePortfolioPartnersCsv(selected([portfolioSample()],'exports')))[0].current_duty_consumption_value_usd).toBe('');
});
