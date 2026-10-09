import {appendFile,readdir,stat} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import type {AstroIntegration} from 'astro';

export type BuildMetrics={fileCount:number;totalBytes:number;largestFile:{path:string;bytes:number}|null};
type ReportLogger={info:(message:string)=>void;warn:(message:string)=>void};
const planningFileCount=15000;

export async function measureBuild(directory:string):Promise<BuildMetrics>{
  const result:BuildMetrics={fileCount:0,totalBytes:0,largestFile:null};
  async function visit(current:string):Promise<void>{
    const entries=await readdir(current,{withFileTypes:true});
    for(const entry of entries){
      const path=join(current,entry.name);
      if(entry.isDirectory()){await visit(path);continue;}
      if(!entry.isFile())throw new Error(`Cannot measure non-regular build entry: ${path}`);
      const {size}=await stat(path);const name=relative(directory,path).replaceAll('\\','/');
      result.fileCount++;result.totalBytes+=size;
      if(!result.largestFile||size>result.largestFile.bytes||(size===result.largestFile.bytes&&name<result.largestFile.path))
        result.largestFile={path:name,bytes:size};
    }
  }
  await visit(directory);return result;
}

export function planningWarning(metrics:BuildMetrics):string|null{
  return metrics.fileCount>=planningFileCount
    ?`Planning alert: ${metrics.fileCount.toLocaleString('en-US')} files; review hosting before reaching the Cloudflare Pages Free limit of 20,000 files.`
    :null;
}

function sizeLabel(bytes:number){return `${bytes.toLocaleString('en-US')} bytes (${(bytes/1024/1024).toFixed(2)} MiB)`;}
function htmlText(value:string){return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','&#10;').replaceAll('\r','&#13;');}

export async function reportBuild(directory:string,logger:ReportLogger,summaryPath=process.env.GITHUB_STEP_SUMMARY):Promise<BuildMetrics>{
  const metrics=await measureBuild(directory);const warning=planningWarning(metrics);
  const largest=metrics.largestFile?`${metrics.largestFile.path}: ${sizeLabel(metrics.largestFile.bytes)}`:'none';
  logger.info(`Files: ${metrics.fileCount.toLocaleString('en-US')}; total (uncompressed): ${sizeLabel(metrics.totalBytes)}; largest file: ${largest}`);
  if(warning)logger.warn(warning);
  if(summaryPath){
    const largestSummary=metrics.largestFile?`<code>${htmlText(metrics.largestFile.path)}</code>: ${sizeLabel(metrics.largestFile.bytes)}`:'none';
    await appendFile(summaryPath,`\n## Static build report\n\n- Files: ${metrics.fileCount.toLocaleString('en-US')}\n- Total (uncompressed): ${sizeLabel(metrics.totalBytes)}\n- Largest file: ${largestSummary}\n- Planning alert: 15,000 files; Cloudflare Pages Free limit: 20,000 files.\n${warning?`\n**${warning}**\n`:''}`);
  }
  return metrics;
}

export function buildReportIntegration():AstroIntegration{
  return {name:'static-build-report',hooks:{'astro:build:done':async({dir,logger})=>{
    await reportBuild(fileURLToPath(dir),logger);
  }}};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const {values}=parseArgs({options:{dir:{type:'string',default:'dist'}}});
    await reportBuild(resolve(values.dir!),{info:console.log,warn:console.warn});
  }catch(error){console.error(error instanceof Error?error.message:'Build report failed');process.exitCode=1;}
}
