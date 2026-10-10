export function countryTable(kind:'total'|'products'='products',direction:'imports'|'exports'='imports',month='2026-08'){
  const commodity=direction==='imports'?'I_COMMODITY':'E_COMMODITY';
  const headers=[commodity,`${commodity}_LDESC`,direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO','CTY_CODE','CTY_NAME','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','time','DISTRICT',direction==='imports'?'RP':'DF',...(direction==='imports'?['CTY_SUBCODE']:[]),'LAST_UPDATE'];
  const row=(code:string,value:string)=>[code,code==='-'?'ALL GOODS':code.startsWith('99')?'LOW VALUE ESTIMATE':'COFFEE',value,'1220','CANADA',kind==='total'?'':'HS6','DET',kind==='total'?'CY':'HSCY',month,'-','-',...(direction==='imports'?['-']:[]),'2026-10-10'];
  return [headers,...(kind==='total'?[row('-','1000000')]:[row('090121','900000'),row('999995','100000')])];
}
export function referenceHtml(){
  const names=['January','February','March','April','May','June','July','August','September','October','November','December'];
  let html='<h1>Trade in Goods with Canada</h1><p>All figures are in millions of U.S. dollars on a nominal basis, not seasonally adjusted unless otherwise specified.</p><table><tr><th>Month</th><th>Exports</th><th>Imports</th><th>Balance</th></tr>';
  for(let year=2024;year<=2026;year++)for(let month=1;month<=12;month++)html+=`<tr><td>${names[month-1]} ${year}</td><td>1.0</td><td>1.0</td><td>0.0</td></tr>`;
  return html+'</table>';
}
export function countryFetch(transform?:(table:string[][],url:URL)=>void):typeof fetch{
  return (async input=>{
    const url=new URL(String(input));
    if(url.hostname==='www.census.gov')return new Response(referenceHtml(),{headers:{'content-type':'text/html'}});
    const payload=countryTable(url.searchParams.get('SUMMARY_LVL2')==='CY'?'total':'products',url.pathname.includes('/imports/')?'imports':'exports',url.searchParams.get('time')!);
    transform?.(payload,url);return new Response(JSON.stringify(payload),{headers:{'content-type':'application/json'}});
  }) as typeof fetch;
}
