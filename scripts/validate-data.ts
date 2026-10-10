import {parseArgs} from 'node:util';import {readCurrentRelease} from './prepare-release';
import {DEFAULT_PRODUCT_CODE,getProduct} from '../src/lib/trade/product-registry';import {productDataPaths} from './product-paths';
try{
 const {values}=parseArgs({options:{product:{type:'string',default:DEFAULT_PRODUCT_CODE}}});const product=getProduct(values.product!);if(!product.importable)throw new Error('Product is not available for import');
 const release=await readCurrentRelease(productDataPaths(process.cwd(),product.code).processedDir,product.code);console.log(`Validated Census release: ${release.productCode}, ${release.reportingMonth}, ${release.observations.length} observations.`);
}catch(error){console.error(error instanceof Error?error.message:'Validation failed');process.exitCode=1;}
