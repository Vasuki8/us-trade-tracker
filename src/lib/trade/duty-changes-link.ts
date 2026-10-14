import {DEFAULT_PRODUCT_CODE} from './product-registry';
import type {DutyChangesSelection} from './duty-changes';
const defaults=():DutyChangesSelection=>({period:'rolling',metric:'share'});
export function readDutyChangesSelection(search:string):{selection:DutyChangesSelection;notice:string|null}{
  const fallback=()=>({selection:defaults(),notice:'This saved duty changes selection could not be restored. Showing U.S. imports, rolling twelve months, ranked by share change.'});
  if(search.length>2048)return fallback();
  const params=new URLSearchParams(search);
  if(['direction','period','metric'].some(key=>params.getAll(key).length>1))return fallback();
  const direction=params.get('direction')??'imports',period=params.get('period')??'rolling',metric=params.get('metric')??'share';
  if(direction!=='imports'||!['rolling','monthly'].includes(period)||!['share','dollars'].includes(metric))return fallback();
  return {selection:{period:period as DutyChangesSelection['period'],metric:metric as DutyChangesSelection['metric']},notice:null};
}
export function dutyChangesPath(productCode:string,selection?:DutyChangesSelection,hash=''):string{
  if(!/^\d{6}$/.test(productCode))throw new Error('Invalid product code');
  if(hash&&!hash.startsWith('#'))throw new Error('Invalid link fragment');
  const path=productCode===DEFAULT_PRODUCT_CODE?'/changes/duties/':`/changes/duties/${productCode}/`;
  if(!selection)return path+hash;
  if(!['rolling','monthly'].includes(selection.period)||!['share','dollars'].includes(selection.metric))throw new Error('Invalid duty changes selection');
  return `${path}?${new URLSearchParams({direction:'imports',period:selection.period,metric:selection.metric})}${hash}`;
}
