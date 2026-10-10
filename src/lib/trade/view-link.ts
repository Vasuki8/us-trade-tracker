import type {Release,ExplorerSelection} from './types';
import {DEFAULT_PRODUCT_CODE,assertProductCode} from './product-registry';

export function monthlyChangesPath(productCode:string=DEFAULT_PRODUCT_CODE):string{
  assertProductCode(productCode);
  return productCode===DEFAULT_PRODUCT_CODE?'/changes/':`/changes/${productCode}/`;
}

export function releaseBriefingPath(productCode:string=DEFAULT_PRODUCT_CODE):string{
  assertProductCode(productCode);
  return productCode===DEFAULT_PRODUCT_CODE?'/briefing/':`/briefing/${productCode}/`;
}

const defaultSelection=():ExplorerSelection=>({direction:'imports',months:60,countryCodes:[]});
const validSelection=(selection:ExplorerSelection)=>
  (selection.direction==='imports'||selection.direction==='exports')&&(selection.months===12||selection.months===60)&&
  (selection.comparisonPeriod===undefined||selection.comparisonPeriod==='annual'||selection.comparisonPeriod==='monthly')&&
  Array.isArray(selection.countryCodes)&&selection.countryCodes.length<=3&&
  selection.countryCodes.every(code=>/^[1-9]\d{3}$/.test(code))&&new Set(selection.countryCodes).size===selection.countryCodes.length;

export function readViewSelection(search:string,release:Release):{selection:ExplorerSelection;notice:string|null}{
  const unavailable=()=>({selection:defaultSelection(),notice:'This saved selection could not be restored with the current dataset. Showing U.S. imports with up to five years of available history.'});
  if(search.length>2048)return unavailable();
  const params=new URLSearchParams(search);
  if(['direction','months','countries','comparison'].some(key=>params.getAll(key).length>1))return unavailable();
  const direction=params.get('direction')??'imports',months=params.get('months')??'60',countries=params.get('countries');
  const comparison=params.get('comparison')??'annual';
  if(comparison!=='annual'&&comparison!=='monthly')return unavailable();
  if((direction!=='imports'&&direction!=='exports')||(months!=='12'&&months!=='60'))return unavailable();
  const selection:ExplorerSelection={direction,months:Number(months) as 12|60,countryCodes:countries?countries.split(','):[]};
  if(comparison==='monthly')selection.comparisonPeriod='monthly';
  if(!validSelection(selection))return unavailable();
  const available=new Set(release.observations.filter(row=>row.productCode===release.productCode&&row.direction===direction&&row.geography==='country').map(row=>row.partnerCode));
  if(selection.countryCodes.some(code=>!available.has(code)))return unavailable();
  return {selection,notice:null};
}

export function profileViewPath(productCode:string,selection:ExplorerSelection):string{
  if(!/^\d{6}$/.test(productCode))throw new Error('Invalid product code');
  if(!validSelection(selection))throw new Error('Invalid profile selection');
  const params=new URLSearchParams({direction:selection.direction,months:String(selection.months)});
  if(selection.countryCodes.length)params.set('countries',selection.countryCodes.join(','));
  if(selection.comparisonPeriod==='monthly')params.set('comparison','monthly');
  return `/products/${productCode}/?${params}`;
}
