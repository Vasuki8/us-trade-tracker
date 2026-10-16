// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {TradeTable} from '../../src/components/TradeTable';
import {buildProfileView} from '../../src/lib/trade/profile';
import {sampleRelease} from '../helpers/release';
afterEach(cleanup);
it('marks only the matching zero and unavailable cells with readable revision text',()=>{
 const release=sampleRelease();
 release.revisedKeys=['imports/090121/2025-01/country/1220/GEN_VAL_MO','imports/090121/2025-02/country/1220/GEN_VAL_MO'];
 for(const row of release.observations.filter(r=>r.direction==='imports'&&r.partnerCode==='1220')){
  if(row.month==='2025-01')row.valueUsd=0;
  if(row.month==='2025-02'){row.valueUsd=null;row.status='suppressed';}
 }
 const view=buildProfileView(release,{direction:'imports',months:12,countryCodes:['1220','4759']});
 render(<TradeTable view={view}/>);
 const table=screen.getByRole('table',{name:'Monthly trade values · current U.S. dollars'});
 const january=within(within(table).getByRole('row',{name:/Jan 2025/})).getAllByRole('cell');
 expect(january[0]).toHaveTextContent('$0 Revised');expect(january[1]).toHaveTextContent('$25');expect(january[1]).not.toHaveTextContent('Revised');
 const february=within(within(table).getByRole('row',{name:/Feb 2025/})).getAllByRole('cell');
 expect(february[0]).toHaveTextContent('Unavailable Revised');
 expect(within(table).getAllByText('Revised',{exact:true})).toHaveLength(2);
 expect(screen.getByText(/No mark does not mean never revised or final/)).toBeVisible();
 expect(screen.getByRole('region',{name:'Scrollable monthly data'})).toHaveAttribute('tabindex','0');
 const doc=new DOMParser().parseFromString(renderToStaticMarkup(<TradeTable view={view}/>),'text/html');
 expect([...doc.querySelectorAll('td')].filter(cell=>cell.textContent?.includes('Revised'))).toHaveLength(2);
});
