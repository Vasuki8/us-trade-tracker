import {validMonth} from '../src/lib/trade/normalize';
import {DEFAULT_PRODUCT_CODE,getProduct,PRODUCTS,type ProductDefinition} from '../src/lib/trade/product-registry';
export function parseArchiveDispatch(env:NodeJS.ProcessEnv,registry:readonly ProductDefinition[]=PRODUCTS):{productCode:string;reportingMonth:string;archive:boolean;initialize:boolean;includeDuties:boolean;candidateOnly:boolean}{
  const product=getProduct(env.PRODUCT_CODE??DEFAULT_PRODUCT_CODE,registry);if(!product.importable)throw new Error('Product is not available for import');
  const bool=(value:string|undefined)=>{if(value!==undefined&&value!=='true'&&value!=='false')throw new Error('Invalid archive boolean input');return value==='true';};
  const reportingMonth=env.REPORTING_MONTH;const archive=bool(env.ARCHIVE_TO_R2),initialize=bool(env.INITIALIZE_ARCHIVE),candidateOnly=bool(env.CANDIDATE_ONLY);
  if(!validMonth(reportingMonth)||initialize&&!archive||archive&&env.GITHUB_REF!=='refs/heads/main')throw new Error('Invalid archive dispatch month, branch or initialization');
  if(candidateOnly&&(!archive||initialize))throw new Error('Candidate-only review requires an existing archive without initialization');
  return {productCode:product.code,reportingMonth,archive,initialize,includeDuties:bool(env.INCLUDE_DUTIES),candidateOnly};
}
