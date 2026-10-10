import {parseArgs} from 'node:util';import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {prepareRelease,type PrepareOptions} from './prepare-release';import type {Release} from '../src/lib/trade/types';
import {classificationThrough} from './classification';
import {getProduct,PRODUCTS,type ProductDefinition} from '../src/lib/trade/product-registry';
import {productDataPaths} from './product-paths';
export async function resolveImportOptions(args:string[],env:NodeJS.ProcessEnv,workspaceRoot:string,registry:readonly ProductDefinition[]=PRODUCTS):Promise<Omit<PrepareOptions,'codeVersion'>>{
  const {values}=parseArgs({args,options:{product:{type:'string'},end:{type:'string'},months:{type:'string',default:'60'},classification:{type:'string'},duties:{type:'boolean',default:false}}});
  if(!values.product||!values.end)throw new Error('Usage: npm run data:import -- --product 090121 --end YYYY-MM [--months 60] [--classification path.json] [--duties]');
  const product=getProduct(values.product,registry);if(!product.importable)throw new Error(`Product ${product.code} is not available for import`);
  let classificationIntervals:Release['classificationIntervals']=[];
  if(values.classification)classificationIntervals=classificationThrough(JSON.parse(await readFile(values.classification,'utf8')),values.end);
  return {productCode:product.code,end:values.end,months:Number(values.months),apiKey:env.CENSUS_API_KEY??'',outputDir:productDataPaths(workspaceRoot,product.code).processedDir,classificationIntervals,includeDuties:values.duties};
}
async function main():Promise<void>{
  const options=await resolveImportOptions(process.argv.slice(2),process.env,process.cwd());
  const codeVersion=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const release=await prepareRelease({...options,codeVersion});
  console.log(`Validated ${release.productCode} through ${release.reportingMonth}; ${release.observations.length} observations; ${release.revisedKeys.length} revised.`);
  if(!release.classificationIntervals.length)console.log('Classification continuity remains unverified; comparisons across unverified intervals are unavailable.');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)main().catch(error=>{console.error(error instanceof Error?error.message:'Import failed');process.exitCode=1;});
