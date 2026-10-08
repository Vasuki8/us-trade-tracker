import {parseArgs} from 'node:util';import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';import {join} from 'node:path';
import {prepareRelease} from './prepare-release';import type {Release} from '../src/lib/trade/types';
import {classificationThrough} from './classification';
try{
  const {values}=parseArgs({options:{product:{type:'string'},end:{type:'string'},months:{type:'string',default:'60'},classification:{type:'string'}}});
  if(!values.product||!values.end)throw new Error('Usage: npm run data:import -- --product 090121 --end YYYY-MM [--months 60] [--classification path.json]');
  let classificationIntervals:Release['classificationIntervals']=[];
  if(values.classification)classificationIntervals=classificationThrough(JSON.parse(await readFile(values.classification,'utf8')),values.end);
  const codeVersion=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const release=await prepareRelease({productCode:values.product,end:values.end,months:Number(values.months),apiKey:process.env.CENSUS_API_KEY??'',
    outputDir:join(process.cwd(),'data/processed'),codeVersion,classificationIntervals});
  console.log(`Validated ${release.productCode} through ${release.reportingMonth}; ${release.observations.length} observations; ${release.revisedKeys.length} revised.`);
  if(!release.classificationIntervals.length)console.log('Classification continuity remains unverified; comparisons across unverified intervals are unavailable.');
}catch(error){console.error(error instanceof Error?error.message:'Import failed');process.exitCode=1;}
