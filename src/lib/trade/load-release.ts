import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {Release} from './types';
import {readCurrentRelease,validateRelease} from '../../../scripts/prepare-release';
import {DEFAULT_PRODUCT_CODE,getProduct,PRODUCTS,validateProductRegistry,type ProductDefinition} from './product-registry';
import {productDataPaths} from '../../../scripts/product-paths';
import fixtureRegistry from '../../../tests/fixtures/product-registry.json';
export type LoadReleaseOptions={workspaceRoot?:string;mode?:'census'|'fixture';registry?:readonly ProductDefinition[]};
function settings(options:LoadReleaseOptions){
  const mode=options.mode??process.env.TRADE_DATA_MODE??'census';if(mode!=='fixture'&&mode!=='census')throw new Error('Unknown TRADE_DATA_MODE');
  const registry=options.registry??(mode==='fixture'?fixtureRegistry:PRODUCTS);validateProductRegistry(registry);return {mode,registry,workspaceRoot:options.workspaceRoot??process.cwd()};
}
export async function loadRelease(productCode:string=DEFAULT_PRODUCT_CODE,options:LoadReleaseOptions={}):Promise<Release>{
  const {mode,registry,workspaceRoot}=settings(options),product=getProduct(productCode,registry);let release:Release;
  if(mode==='fixture'){
    const filename=productCode===DEFAULT_PRODUCT_CODE?'product-release.json':`product-release-${productCode}.json`;
    const value:unknown=JSON.parse(await readFile(join(workspaceRoot,'tests/fixtures',filename),'utf8'));
    validateRelease(value);if(value.source!=='fixture')throw new Error('Fixture mode requires fixture provenance');if(value.productCode!==productCode)throw new Error(`Fixture product differs from ${productCode}`);release=value;
  }else{
    try{release=await readCurrentRelease(productDataPaths(workspaceRoot,productCode).processedDir,productCode);}catch{throw new Error(`No validated Census release for ${productCode}. Import a release, or explicitly set TRADE_DATA_MODE=fixture for a labeled development preview.`);}
  }
  if(product.published&&release.schemaVersion===2&&!product.dutiesAccepted)throw new Error(`Estimated duties are not accepted for published product ${productCode}`);return release;
}
export async function loadPublishedReleases(options:LoadReleaseOptions={}):Promise<{product:ProductDefinition;release:Release}[]>{
  const {registry}=settings(options);return Promise.all(registry.filter(product=>product.published).map(async product=>({product,release:await loadRelease(product.code,options)})));
}
