// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';import {cleanup,render,screen,within} from '@testing-library/react';import userEvent from '@testing-library/user-event';import '@testing-library/jest-dom/vitest';
import {EstimatedDuties} from '../../src/components/EstimatedDuties';import {buildDutyView} from '../../src/lib/trade/duties';import {sampleDutyRelease} from '../helpers/duties';import {sampleRelease} from '../helpers/release';
import {ProductExplorer} from '../../src/components/ProductExplorer';import {renderToStaticMarkup} from 'react-dom/server';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
it.each([
 {name:'tiny increase',currentDuty:325,currentValue:202566133,previousDuty:1,previousValue:1000000,share:'<0.001%',change:'Increase <0.001 pp',coverage:'<0.001%'},
 {name:'tiny decrease',currentDuty:1,currentValue:1000000,previousDuty:325,previousValue:202566133,share:'<0.001%',change:'Decrease <0.001 pp',coverage:'<0.001%'},
 {name:'actual zero',currentDuty:0,currentValue:1000000,previousDuty:0,previousValue:1000000,share:'0.000%',change:'0.000 pp',coverage:'<0.001%'},
 {name:'positive precision boundary',currentDuty:1,currentValue:100000,previousDuty:0,previousValue:1000000,share:'0.001%',change:'+0.001 pp',coverage:'0.001%'},
 {name:'negative precision boundary',currentDuty:0,currentValue:100000,previousDuty:1,previousValue:100000,share:'0.000%',change:'-0.001 pp',coverage:'0.001%'},
 {name:'positive boundary from nonzero shares',currentDuty:1001,currentValue:100000,previousDuty:1000,previousValue:100000,share:'1.001%',change:'+0.001 pp',coverage:'0.001%'},
 {name:'negative boundary from nonzero shares',currentDuty:1000,currentValue:100000,previousDuty:1001,previousValue:100000,share:'1.000%',change:'-0.001 pp',coverage:'0.001%'},
 {name:'positive boundary from larger nonzero shares',currentDuty:8001,currentValue:100000,previousDuty:8000,previousValue:100000,share:'8.001%',change:'+0.001 pp',coverage:'0.001%'},
 {name:'negative boundary from larger nonzero shares',currentDuty:8000,currentValue:100000,previousDuty:8001,previousValue:100000,share:'8.000%',change:'-0.001 pp',coverage:'0.001%'},
])('distinguishes $name from rounded zero',({currentDuty,currentValue,previousDuty,previousValue,share,change,coverage})=>{
 const release=sampleDutyRelease(),current=release.duties.observations.find(row=>row.month==='2025-12')!,previous=release.duties.observations.find(row=>row.month==='2024-12')!;
 current.calculatedDuty.valueUsd=currentDuty;current.consumptionValue.valueUsd=currentValue;current.dutiableValue.valueUsd=currentValue;current.coverage.uncalculatedDutiableValueUsd=1;
 previous.calculatedDuty.valueUsd=previousDuty;previous.consumptionValue.valueUsd=previousValue;previous.dutiableValue.valueUsd=previousValue;
 render(<EstimatedDuties view={buildDutyView(release,[])} classificationIntervals={release.classificationIntervals}/>);
 const region=screen.getByRole('region',{name:'Estimated duties'}),row=within(within(region).getByRole('table',{name:'Monthly estimated duties · All partner countries'})).getByRole('row',{name:/Dec 2025/});
 expect(within(row).getByRole('cell',{name:share})).toBeVisible();
 expect(region.querySelector('.duty-change')).toHaveTextContent(change);
 expect(region.querySelector('.duty-coverage')).toHaveTextContent(`${coverage} of dutiable value`);
});
it('shows monthly and rolling amounts, the consumption denominator and coverage qualification',()=>{
 const r=sampleDutyRelease();r.duties.observations[12].coverage.uncalculatedDutiableValueUsd=100;render(<EstimatedDuties view={buildDutyView(r,[])} classificationIntervals={r.classificationIntervals}/>);
 const region=screen.getByRole('region',{name:'Estimated duties'});expect(region).toHaveTextContent('Jan 2025–Dec 2025');expect(region).toHaveTextContent('Jan 2024–Dec 2024');expect(region).toHaveTextContent('7.500%');expect(region).toHaveTextContent('+2.500 pp');expect(region).toHaveTextContent('RP70/79');expect(region).toHaveTextContent('imports for consumption');expect(region).toHaveTextContent('not proof of duty-free trade');
 expect(within(region).getByRole('table',{name:'Monthly estimated duties · All partner countries'})).toBeVisible();expect(within(region).getByRole('button',{name:'Download estimated duties CSV'})).toBeEnabled();
});
it('provides explicit unavailable data for legacy releases and missing country history',()=>{
 const legacy=render(<EstimatedDuties view={buildDutyView(sampleRelease(),[])} classificationIntervals={sampleRelease().classificationIntervals}/>);expect(screen.getByText(/does not include a duty dataset/)).toBeVisible();expect(screen.queryByRole('button',{name:'Download estimated duties CSV'})).toBeNull();legacy.unmount();
 render(<EstimatedDuties view={buildDutyView(sampleDutyRelease(),['1220'])} classificationIntervals={sampleDutyRelease().classificationIntervals}/>);expect(screen.getByRole('heading',{name:'CANADA'})).toBeVisible();expect(screen.getAllByText('Unavailable').length).toBeGreaterThan(0);expect(screen.getByText(/comparisons are unavailable/i)).toBeVisible();
});
it('follows profile country selection and appears for imports only',async()=>{
 render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('All partner countries');
 await user.click(screen.getByRole('checkbox',{name:'CANADA'}));expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('CANADA');expect(screen.queryByRole('heading',{name:'All partner countries'})).toBeNull();
 await user.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.queryByRole('region',{name:'Estimated duties'})).toBeNull();await user.click(screen.getByRole('radio',{name:'Imports'}));expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('All partner countries');
});
it('keeps zero-prior growth unavailable and an initial sourced world view in server rendering',()=>{
 const r=sampleDutyRelease();r.duties.observations.filter(row=>row.month.startsWith('2024')).forEach(row=>row.calculatedDuty.valueUsd=0);
 const html=renderToStaticMarkup(<EstimatedDuties view={buildDutyView(r,[])} classificationIntervals={r.classificationIntervals}/>);expect(html).toContain('Growth unavailable');expect(html).toContain('Enable JavaScript');expect(html).toContain('All partner countries');expect(html).toContain('api.census.gov');
});
it('generates the displayed CSV in the browser on keyboard activation',async()=>{
 const create=vi.fn(()=> 'blob:synthetic'),revoke=vi.fn();vi.stubGlobal('URL',Object.assign(class extends URL {},{createObjectURL:create,revokeObjectURL:revoke}));const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
 try{render(<EstimatedDuties view={buildDutyView(sampleDutyRelease(),[])} classificationIntervals={sampleDutyRelease().classificationIntervals}/>);const user=userEvent.setup();screen.getByRole('button',{name:'Download estimated duties CSV'}).focus();await user.keyboard('{Enter}');expect(create).toHaveBeenCalledTimes(1);expect(click).toHaveBeenCalledOnce();await new Promise(resolve=>setTimeout(resolve,1100));expect(revoke).toHaveBeenCalledOnce();}finally{click.mockRestore();vi.unstubAllGlobals();}
});
it('keeps duty chart countries and fixed history aligned with the profile selection',async()=>{
 render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();
 const amounts=()=>screen.getByRole('figure',{name:'Monthly estimated duties · current USD'});
 expect(amounts()).toHaveTextContent('All partner countries');
 await user.click(screen.getByRole('checkbox',{name:'MEXICO'}));await user.click(screen.getByRole('checkbox',{name:'CANADA'}));await user.click(screen.getByRole('checkbox',{name:'ITALY'}));
 expect([...amounts().querySelectorAll('.duty-chart-legend li')].map(li=>li.textContent)).toEqual(['MEXICO · 2010','CANADA · 1220','ITALY · 4759']);
 const url=window.location.search;await user.selectOptions(screen.getByLabelText('History window'),'12');expect(amounts()).toHaveTextContent('Jan 2024–Dec 2025');expect(window.location.search).not.toContain('duty');
 await user.click(screen.getByRole('button',{name:'Show U.S. total'}));expect(amounts()).toHaveTextContent('All partner countries');
 await user.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.queryByRole('figure',{name:'Monthly estimated duties · current USD'})).toBeNull();
 await user.click(screen.getByRole('radio',{name:'Imports'}));expect(amounts()).toHaveTextContent('All partner countries');expect(url).toContain('countries=2010%2C1220%2C4759');
});
it.each([
 ['CAL_DUT_MO',['Revised','','Revised input','','']],
 ['CON_VAL_MO',['','Revised','Revised input','','']],
 ['DUT_VAL_MO',['','','','Revised','Revised input']],
 ['coverage',['','','','','Revised input']],
] as const)('marks only monthly dependencies of %s', (input,labels)=>{
 const r=sampleDutyRelease();r.duties.revisedKeys=[`imports/090121/2025-01/world/-/${input}`];
 render(<EstimatedDuties view={buildDutyView(r,[])} classificationIntervals={r.classificationIntervals}/>);
 const table=screen.getByRole('table',{name:'Monthly estimated duties · All partner countries'});
 const row=within(table).getByRole('row',{name:/Jan 2025/});
 const cells=within(row).getAllByRole('cell');
 cells.forEach((cell,index)=>expect(within(cell).queryByText(/^Revised(?: input)?$/)?.textContent??'').toBe(labels[index]));
 expect(within(screen.getByRole('table',{name:'Rolling estimated duties · All partner countries'})).queryByText(/^Revised(?: input)?$/)).toBeNull();
 expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('Estimated-duty release revisions: yes');
 expect(screen.getByText(/Revised inputs can leave/)).toHaveTextContent(/monthly/i);
 expect(screen.getByText(/No mark does not mean/)).toHaveTextContent(/final/);
});
it.each(['zero','suppressed','removed'] as const)('labels revised %s monthly amounts while retaining status',kind=>{
 const r=sampleDutyRelease();r.duties.revisedKeys=['imports/090121/2024-02/world/-/CAL_DUT_MO'];
 if(kind==='removed')r.duties.observations=r.duties.observations.filter(row=>row.month!=='2024-02');
 if(kind==='suppressed')r.duties.observations[1].calculatedDuty={valueUsd:null,status:'suppressed'};
 render(<EstimatedDuties view={buildDutyView(r,[])} classificationIntervals={r.classificationIntervals}/>);
 const row=within(screen.getByRole('table',{name:'Monthly estimated duties · All partner countries'})).getByRole('row',{name:/Feb 2024/});
 expect(within(row).getAllByRole('cell')[0]).toHaveTextContent(kind==='zero'?'$0':'Unavailable');
 expect(within(within(row).getAllByRole('cell')[0]).getByText('Revised')).toBeVisible();
});
it('keeps a release-wide revision summary without leaking unrelated keys into cells',()=>{
 const r=sampleDutyRelease();r.duties.revisedKeys=['imports/090111/2025-01/world/-/CAL_DUT_MO'];
 render(<EstimatedDuties view={buildDutyView(r,[])} classificationIntervals={r.classificationIntervals}/>);
 expect(screen.queryByText(/^Revised(?: input)?$/)).toBeNull();
 expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('Estimated-duty release revisions: yes');
});
it('marks combined revised inputs even when the monthly ratio is unchanged',()=>{
 const r=sampleDutyRelease();r.duties.revisedKeys=['coverage','DUT_VAL_MO','CON_VAL_MO','CAL_DUT_MO'].map(input=>`imports/090121/2025-01/world/-/${input}`);
 render(<EstimatedDuties view={buildDutyView(r,[])} classificationIntervals={r.classificationIntervals}/>);
 const row=within(screen.getByRole('table',{name:'Monthly estimated duties · All partner countries'})).getByRole('row',{name:/Jan 2025/});
 expect(within(row).getAllByText('Revised')).toHaveLength(3);expect(within(row).getAllByText('Revised input')).toHaveLength(2);
 expect(within(row).getAllByRole('cell')[2]).toHaveTextContent('10.556%');
});
