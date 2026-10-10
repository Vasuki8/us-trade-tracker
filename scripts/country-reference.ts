import type {CountryReferenceRow} from './country-audit-types';
const names=['January','February','March','April','May','June','July','August','September','October','November','December'];
const text=(html:string)=>html.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ').trim();
export function parseCountryReference(html:string):CountryReferenceRow[]{
  const plain=text(html);
  if(!/trade in goods with Canada/i.test(plain))throw new Error('Reference is not the Canada goods table');
  if(!plain.includes('millions of U.S. dollars on a nominal basis')||!plain.includes('not seasonally adjusted'))throw new Error('Unexpected country reference units');
  const rows:CountryReferenceRow[]=[];const seen=new Set<string>();let header=false;
  for(const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const cells=[...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell=>text(cell[1]));
    if(cells[0]==='Month'){if(cells.join('|')!=='Month|Exports|Imports|Balance')throw new Error('Unexpected reference column order');header=true;continue;}
    const monthly=/^(\w+) (20\d{2})$/.exec(cells[0]??'');if(!monthly||!names.includes(monthly[1]))continue;
    if(!header||cells.length!==4)throw new Error('Incomplete reference month');
    const month=`${monthly[2]}-${String(names.indexOf(monthly[1])+1).padStart(2,'0')}`;
    if(seen.has(month))throw new Error('Duplicate reference month');seen.add(month);
    const money=(value:string)=>{if(!/^\d{1,3}(?:,\d{3})*\.\d$|^\d+\.\d$/.test(value))throw new Error('Unexpected reference value');const usd=Number(value.replace(/[,.]/g,''))*100000;if(!Number.isSafeInteger(usd))throw new Error('Unsafe reference value');return usd;};
    rows.push({month,exportsUsd:money(cells[1]),importsUsd:money(cells[2])});
  }
  if(!header||!rows.length)throw new Error('Missing reference months');return rows;
}
