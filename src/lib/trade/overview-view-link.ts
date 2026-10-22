import type {Direction} from './types';

export type OverviewSelection={
  productCode:string;
  direction:Direction;
  comparisonPeriod:'monthly'|'annual';
  months:12|60;
};

export function readOverviewSelection(search:string,productCodes:readonly string[]):{selection:OverviewSelection;notice:string|null}{
  if(!productCodes.length||new Set(productCodes).size!==productCodes.length||productCodes.some(code=>typeof code!=='string'||!/^\d{6}$/.test(code)))throw new Error('Invalid overview products');
  const defaults:OverviewSelection={productCode:productCodes[0],direction:'imports',comparisonPeriod:'monthly',months:60};
  const fallback=()=>({selection:defaults,notice:'Saved overview selection could not be restored. Showing the default overview.'});
  if(search.length>2048)return fallback();
  const params=new URLSearchParams(search);
  if(['product','direction','comparison','months'].some(key=>params.getAll(key).length>1))return fallback();
  const productCode=params.get('product')??defaults.productCode,direction=params.get('direction')??'imports',comparisonPeriod=params.get('comparison')??'monthly',months=params.get('months')??'60';
  if(!productCodes.includes(productCode)||(direction!=='imports'&&direction!=='exports')||(comparisonPeriod!=='monthly'&&comparisonPeriod!=='annual')||(months!=='12'&&months!=='60'))return fallback();
  return {selection:{productCode,direction,comparisonPeriod,months:months==='12'?12:60},notice:null};
}

export function overviewViewPath(selection:OverviewSelection):string{
  if(typeof selection?.productCode!=='string'||!/^\d{6}$/.test(selection.productCode)||(selection.direction!=='imports'&&selection.direction!=='exports')||(selection.comparisonPeriod!=='monthly'&&selection.comparisonPeriod!=='annual')||(selection.months!==12&&selection.months!==60))throw new Error('Invalid overview selection');
  const params=new URLSearchParams({product:selection.productCode,direction:selection.direction,comparison:selection.comparisonPeriod,months:String(selection.months)});
  return `/?${params}`;
}
