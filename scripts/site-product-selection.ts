import {PRODUCTS} from '../src/lib/trade/product-registry';
import {validMonth} from '../src/lib/trade/normalize';
import {productDataPaths} from './product-paths';
import {localName,type FileIdentity} from './site-preparation-files';

export const SITE_PRODUCT_SELECTION_PATH='deployment/site-product-selection.json';
export type SiteProductSelection={schemaVersion:1;products:{code:string;reportingMonth:string;pointer:FileIdentity;release:FileIdentity}[]};
function fields(value:unknown,keys:string[]):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key)))throw Error('site-product-selection-fields');
 return value as Record<string,unknown>;
}
function fileIdentity(value:unknown,limit:number):FileIdentity{
 const v=fields(value,['path','bytes','sha256']);
 if(typeof v.path!=='string'||typeof v.bytes!=='number'||!Number.isSafeInteger(v.bytes)||v.bytes<1||v.bytes>limit||typeof v.sha256!=='string'||!/^[a-f0-9]{64}$/.test(v.sha256))throw Error('site-product-selection-identity');
 return{path:localName(v.path),bytes:v.bytes,sha256:v.sha256};
}
export function parseSiteProductSelection(value:unknown):SiteProductSelection{
 const v=fields(value,['schemaVersion','products']),codes=PRODUCTS.filter(p=>p.published).map(p=>p.code);
 if(v.schemaVersion!==1||!Array.isArray(v.products)||v.products.length!==codes.length)throw Error('site-product-selection-products');
 const products=v.products.map((value,index)=>{
  const p=fields(value,['code','reportingMonth','pointer','release']);
  if(p.code!==codes[index]||!validMonth(p.reportingMonth))throw Error('site-product-selection-product-month');
  const code=codes[index],reportingMonth=p.reportingMonth as string,base=productDataPaths('',code).processedDir.replaceAll('\\','/');
  const pointer=fileIdentity(p.pointer,16*1024),release=fileIdentity(p.release,16*1024*1024);
  if(pointer.path!==base+'/current.json'||!release.path.startsWith(base+'/releases/')||!new RegExp('^'+reportingMonth+'-[a-z0-9-]+\\.json$').test(release.path.slice((base+'/releases/').length)))throw Error('site-product-selection-path-month');
  return{code,reportingMonth,pointer,release};
 });
 return{schemaVersion:1,products};
}
