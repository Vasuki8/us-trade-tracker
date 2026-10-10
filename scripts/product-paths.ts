import {join} from 'node:path';
import {assertProductCode,DEFAULT_PRODUCT_CODE} from '../src/lib/trade/product-registry';
export function productDataPaths(workspaceRoot:string,productCode:string):{dataDir:string;processedDir:string;classificationFile:string}{
  assertProductCode(productCode);
  const dataDir=productCode===DEFAULT_PRODUCT_CODE?join(workspaceRoot,'data'):join(workspaceRoot,'data/products',productCode);
  return {dataDir,processedDir:join(dataDir,'processed'),classificationFile:join(workspaceRoot,'data/classification',`${productCode}.json`)};
}
export function productArchiveKeys(productCode:string):{prefix:string;currentKey:string}{
  assertProductCode(productCode);const prefix=`trade/v1/products/${productCode}/`;return {prefix,currentKey:`${prefix}current.json`};
}
