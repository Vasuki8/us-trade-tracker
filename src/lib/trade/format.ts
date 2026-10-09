export const usd=(value:number|null,compact=false)=>value===null?'Unavailable':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:compact?1:0,notation:compact?'compact':'standard'}).format(value);
export const percent=(value:number|null)=>value===null?'Unavailable':`${value>0?'+':''}${value.toFixed(1)}%`;
export const countryShare=(value:number|null)=>value===null?'Unavailable':`${value.toFixed(1)}%`;
export const percentagePoints=(value:number|null)=>value===null?'Unavailable':`${value>0?'+':''}${value!==0&&Math.abs(value)<0.1?new Intl.NumberFormat('en-US',{maximumSignificantDigits:2}).format(value):value.toFixed(1)} pp`;
export const usdChange=(value:number|null)=>`${value!==null&&value>0?'+':''}${usd(value)}`;
export const monthLabel=(month:string)=>new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${month}-01T00:00:00Z`));
export const seriesColor=(code:string)=>code==='-'?'#286568':`hsl(${(Number(code)*137.508)%360} 48% 36%)`;
