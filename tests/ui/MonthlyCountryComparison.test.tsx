// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {act,cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {sampleDutyRelease} from '../helpers/duties';
import {ProductExplorer} from '../../src/components/ProductExplorer';

afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
const saved=(monthly=false)=>window.history.replaceState(null,'',`/products/090121/?direction=imports&months=12&countries=4759%2C1220${monthly?'&comparison=monthly':''}`);
const summary=()=>screen.getByRole('region',{name:'Selected country comparison'});

it('defaults old saved views to annual and switches only the selected-country summary to monthly',async()=>{
  saved();render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup(),rankings=screen.getByRole('region',{name:'What changed?'}).textContent;expect(screen.getByLabelText('Country comparison period')).toHaveValue('annual');await user.selectOptions(screen.getByLabelText('Country comparison period'),'monthly');expect(summary()).toHaveTextContent('Dec 2025 compared with Dec 2024');expect(summary()).toHaveTextContent('same month one year earlier');expect(within(within(summary()).getByRole('row',{name:/ITALY/})).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['$25','$12','+$13','+108.3%','25.0%','24.0%','+1.0 pp']);expect(screen.getByRole('region',{name:'What changed?'}).textContent).toBe(rankings);expect(window.location.search).toContain('comparison=monthly');
});
it('restores monthly mode and preserves it through history, country and direction changes',async()=>{
  saved(true);render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();expect(screen.getByLabelText('Country comparison period')).toHaveValue('monthly');await user.selectOptions(screen.getByLabelText('History window'),'60');await user.click(screen.getByRole('button',{name:'Remove ITALY'}));expect(summary()).toHaveTextContent('CANADA');expect(screen.getByLabelText('Country comparison period')).toHaveValue('monthly');await user.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.queryByRole('region',{name:'Selected country comparison'})).toBeNull();await user.click(screen.getByRole('checkbox',{name:'CANADA'}));expect(screen.getByLabelText('Country comparison period')).toHaveValue('monthly');expect(within(within(summary()).getByRole('row',{name:/CANADA/})).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['$50','$25','+$25','+100.0%','25.0%','25.0%','0.0 pp']);
});
it('shows complete monthly figures for a country with incomplete annual history and returns to the annual gap',async()=>{
  const release=sampleDutyRelease();release.observations=release.observations.filter(row=>!(row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-07'));saved(true);render(<ProductExplorer release={release}/>);expect(within(within(summary()).getByRole('row',{name:/CANADA/})).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['$25','$12','+$13','+108.3%','25.0%','24.0%','+1.0 pp']);await userEvent.setup().selectOptions(screen.getByLabelText('Country comparison period'),'annual');expect(within(within(summary()).getByRole('row',{name:/CANADA/})).getAllByRole('cell')[1]).toHaveTextContent('Unavailable');expect(window.location.search).not.toContain('comparison=');
});
it('restores the comparison period with browser history as part of the complete saved view',()=>{
  saved(true);render(<ProductExplorer release={sampleDutyRelease()}/>);act(()=>{window.history.replaceState(null,'','/products/090121/?direction=exports&months=60&countries=1220');window.dispatchEvent(new PopStateEvent('popstate'));});expect(screen.getByLabelText('Country comparison period')).toHaveValue('annual');expect(within(summary()).getByRole('table',{name:'Selected country annual comparison'})).toBeInTheDocument();
});
