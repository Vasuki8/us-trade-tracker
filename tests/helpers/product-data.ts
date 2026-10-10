import {syntheticCensusFetch} from './archive';
import {syntheticDutyFetch} from './duties';

// Independent synthetic identities and amounts; this never contacts Census.
export function syntheticProductFetch(productCode:string,{scale=1,worldDelta=0,duties=false}:{scale?:number;worldDelta?:number;duties?:boolean}={}):typeof fetch{
  const base=duties?syntheticDutyFetch():syntheticCensusFetch();
  return (async(input:RequestInfo|URL,init?:RequestInit)=>{
    const response=await base(input,init);if(response.status!==200)return response;
    const table:string[][]=await response.json(),header=table[0];
    for(const row of table.slice(1))for(let i=0;i<header.length;i++){
      if(['I_COMMODITY','E_COMMODITY'].includes(header[i]))row[i]=productCode;
      if(['I_COMMODITY_LDESC','E_COMMODITY_LDESC'].includes(header[i]))row[i]=`SYNTHETIC PRODUCT ${productCode}`;
      if(['GEN_VAL_MO','ALL_VAL_MO','CAL_DUT_MO','CON_VAL_MO','DUT_VAL_MO'].includes(header[i])){
        row[i]=String(Number(row[i])*scale+(['GEN_VAL_MO','ALL_VAL_MO'].includes(header[i])&&row[header.indexOf('CTY_CODE')]==='-'?worldDelta:0));
      }
    }
    return Response.json(table);
  }) as typeof fetch;
}
