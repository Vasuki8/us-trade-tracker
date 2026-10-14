import {describe,it,expect} from 'vitest';
import {dutyChangesRelease,setDutyAmounts} from '../helpers/duty-changes';
import {sampleRelease} from '../helpers/release';
import {buildDutyChangesView,rankDutyChanges,prepareDutyChanges,selectDutyChanges} from '../../src/lib/trade/duty-changes';

describe('estimated-duty country changes',()=>{
  it('uses country consumption sums, distinct world amounts and matching monthly periods',()=>{
    const release=dutyChangesRelease(),rolling=buildDutyChangesView(release,'rolling');
    const canada=rolling.countries.find(c=>c.code==='1220')!.comparison;
    expect(canada.current).toMatchObject({calculatedDutyUsd:72,consumptionValueUsd:240,dutySharePercent:30,from:'2025-01',to:'2025-12'});
    expect(canada.previous).toMatchObject({calculatedDutyUsd:12,consumptionValueUsd:120,dutySharePercent:10});
    expect(canada.change).toEqual({comparable:true,calculatedDutyUsd:60,growthPercent:500,dutySharePercentagePoints:20});
    expect(rolling.countries.find(c=>c.code==='4759')!.comparison.change).toMatchObject({calculatedDutyUsd:-48,dutySharePercentagePoints:-45});
    expect(rolling.world!.current.dutySharePercent).toBe(17.5);
    const monthly=buildDutyChangesView(release,'monthly');
    expect(monthly.periods).toEqual({current:{from:'2025-12',to:'2025-12'},previous:{from:'2024-12',to:'2024-12'}});
    expect(monthly.countries[0].comparison.change).toMatchObject({calculatedDutyUsd:5,dutySharePercentagePoints:20});
  });
  it('weights rolling rates by consumption rather than averaging monthly percentages',()=>{
    const release=dutyChangesRelease();
    for(const row of release.duties.observations.filter(r=>r.month==='2025-12')){
      if(row.partnerCode==='1220'){row.calculatedDuty.valueUsd=9;row.consumptionValue.valueUsd=50;row.dutiableValue.valueUsd=50;}
      if(row.partnerCode==='-'){row.calculatedDuty.valueUsd=10;row.consumptionValue.valueUsd=70;row.dutiableValue.valueUsd=70;}
    }
    const c=buildDutyChangesView(release,'rolling').countries[0].comparison.current;
    expect(c).toMatchObject({calculatedDutyUsd:75,consumptionValueUsd:270});expect(c.dutySharePercent).toBe(100*75/270);expect(c.dutySharePercent).not.toBe(29);
    expect(buildDutyChangesView(release,'monthly').countries[0].comparison.change.dutySharePercentagePoints).toBe(8);
  });
  it('withholds missing rolling months without withholding a complete latest month',()=>{
    const release=dutyChangesRelease();release.duties.observations=release.duties.observations.filter(r=>!(r.partnerCode==='1220'&&r.month==='2025-02'));
    expect(rankDutyChanges(buildDutyChangesView(release,'rolling'),'share')).toMatchObject({comparableCount:1,unavailableCount:1,exclusions:{incomplete_period:1}});
    expect(rankDutyChanges(buildDutyChangesView(release,'monthly'),'share').increases.map(r=>r.code)).toEqual(['1220']);
  });
  it.each(['calculatedDuty','consumptionValue'] as const)('withholds suppressed %s amounts',measure=>{
    const release=dutyChangesRelease(),row=release.duties.observations.find(r=>r.partnerCode==='1220'&&r.month==='2025-12')!;row[measure]={status:'suppressed',valueUsd:null};
    expect(rankDutyChanges(buildDutyChangesView(release,'monthly'),'dollars')).toMatchObject({unavailableCount:1,exclusions:{incomplete_period:1}});
  });
  it('counts coverage failures once and includes qualified verified affected values',()=>{
    const release=dutyChangesRelease();for(const row of release.duties.observations.filter(r=>r.partnerCode==='1220'))row.coverage.uncalculatedDutiableValueUsd=2;
    let rank=rankDutyChanges(buildDutyChangesView(release,'rolling'),'share');expect(rank.qualifiedCount).toBe(1);expect(rank.increases[0].comparison.current.coverage).toMatchObject({qualified:true,affectedDutiableValueUsd:24,affectedSharePercent:10});
    release.duties.observations.find(r=>r.partnerCode==='1220')!.coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
    rank=rankDutyChanges(buildDutyChangesView(release,'rolling'),'share');expect(rank).toMatchObject({unavailableCount:1,exclusions:{coverage_unavailable:1,incomplete_period:0}});
  });
  it('uses classification then completeness then coverage then denominator exclusion precedence',()=>{
    const release=dutyChangesRelease();setDutyAmounts(release,'1220',[6,0],[1,10]);
    let rank=rankDutyChanges(buildDutyChangesView(release,'rolling'),'share');expect(rank.exclusions.denominator_unavailable).toBe(1);
    expect(rankDutyChanges(buildDutyChangesView(release,'rolling'),'dollars').increases[0].comparison.change.calculatedDutyUsd).toBe(60);
    const row=release.duties.observations.find(r=>r.partnerCode==='1220')!;row.coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
    expect(rankDutyChanges(buildDutyChangesView(release,'rolling'),'share').exclusions.coverage_unavailable).toBe(1);
    row.calculatedDuty={status:'missing',valueUsd:null};rank=rankDutyChanges(buildDutyChangesView(release,'rolling'),'share');expect(rank.exclusions).toEqual({classification_unverified:0,incomplete_period:1,coverage_unavailable:0,denominator_unavailable:0});
    release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/a'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
    rank=rankDutyChanges(buildDutyChangesView(release,'rolling'),'share');expect(rank.exclusions).toEqual({classification_unverified:2,incomplete_period:0,coverage_unavailable:0,denominator_unavailable:0});expect(rank.unavailableCount).toBe(2);
  });
  it('retains zero duties with no growth percentage and never clamps rates over 100%',()=>{
    const release=dutyChangesRelease();setDutyAmounts(release,'1220',[6,2],[0,10]);
    const c=rankDutyChanges(buildDutyChangesView(release,'rolling'),'dollars').increases[0].comparison;
    expect(c.current.dutySharePercent).toBe(300);expect(c.change).toMatchObject({calculatedDutyUsd:72,growthPercent:null,dutySharePercentagePoints:300});
  });
  it('uses exact rational signs and order when floating rates collapse to the same number',()=>{
    const release=dutyChangesRelease();
    // Both floating differences can collapse; Italy has the larger exact deficit.
    // Twelve-month sums remain safe integers for the existing duty builder.
    setDutyAmounts(release,'1220',[750599937895080,750599937895081],[1,1]);
    setDutyAmounts(release,'4759',[750599937895079,750599937895080],[1,1]);
    const rank=rankDutyChanges(buildDutyChangesView(release,'monthly'),'share');
    expect(rank.decreases.map(c=>c.code)).toEqual(['4759','1220']);expect(rank.unchangedCount).toBe(0);
    expect(rank.decreases.every(c=>c.comparison.change.dutySharePercentagePoints!<0)).toBe(true);
  });
  it('recognizes exact zero and breaks ties by English country name then code',()=>{
    const release=dutyChangesRelease();setDutyAmounts(release,'1220',[1,3],[2,6]);setDutyAmounts(release,'4759',[1,3],[2,6]);
    const rank=rankDutyChanges(buildDutyChangesView(release,'monthly'),'share');expect(rank.unchangedCount).toBe(2);expect(rank.decreases).toEqual([]);
    setDutyAmounts(release,'1220',[3,10],[1,10]);setDutyAmounts(release,'4759',[3,10],[1,10]);
    expect(rankDutyChanges(buildDutyChangesView(release,'monthly'),'share').increases.map(c=>c.code)).toEqual(['1220','4759']);
    for(const row of release.duties.observations)if(row.geography==='country')row.partnerName='Same';
    expect(rankDutyChanges(buildDutyChangesView(release,'monthly'),'dollars').increases.map(c=>c.code)).toEqual(['1220','4759']);
  });
  it('keeps countries independent of unavailable world and merchandise chart history',()=>{
    const release=dutyChangesRelease();release.duties.observations.find(r=>r.partnerCode==='-'&&r.month==='2025-12')!.calculatedDuty={status:'suppressed',valueUsd:null};release.observations=release.observations.filter(r=>r.partnerCode!=='1220');
    const view=buildDutyChangesView(release,'monthly');expect(view.world!.change.comparable).toBe(false);expect(rankDutyChanges(view,'share').increases[0]).toMatchObject({code:'1220',profileCountryAvailable:false});
  });
  it('compacts only displayed union without raw/history arrays, preserving selected values and input',()=>{
    const release=dutyChangesRelease(),original=structuredClone(release);
    // 24 additional positive countries ensure the top-ten cut actually removes data.
    const source=release.duties.observations.filter(r=>r.partnerCode==='1220');
    for(let i=0;i<24;i++)for(const row of source)release.duties.observations.push({...structuredClone(row),partnerCode:String(6000+i),partnerName:`Sample ${i}`,calculatedDuty:{status:'reported',valueUsd:row.month.startsWith('2025')?10+i:1}});
    const before=structuredClone(release),prepared=prepareDutyChanges(release);
    for(const period of ['monthly','rolling'] as const)for(const metric of ['share','dollars'] as const){const direct=rankDutyChanges(buildDutyChangesView(release,period),metric),selected=selectDutyChanges(prepared,{period,metric});expect(selected.ranking).toEqual(direct);expect(direct.increases).toHaveLength(10);expect(direct.comparableCount).toBe(26);}
    expect(prepared.views.rolling.countries.length).toBeLessThan(26);expect(JSON.stringify(prepared)).not.toMatch(/observations|"monthly":\[/);expect(release).toEqual(before);expect(original.duties.observations).toHaveLength(72);
  });
  it('does not invent duties or countries for schema-one data',()=>{
    const view=buildDutyChangesView(sampleRelease(),'rolling');expect(view.available).toBe(false);expect(view.world).toBeNull();expect(view.countries).toEqual([]);expect(selectDutyChanges(prepareDutyChanges(sampleRelease()),{period:'monthly',metric:'dollars'}).ranking.totalCountryCount).toBe(0);
  });
});
