import {build,preview,type PreviewServer} from 'astro';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertSnapshotPath} from './country-snapshot-input';
export function resolveCanadaPilotPort(value:string|undefined):number {
  try{return resolveCanadaPreviewPort(value??'4403');}catch{throw new Error('Invalid PLAYWRIGHT_CANADA_PILOT_PORT');}
}
export async function serveCanadaPilotFixture():Promise<void>{return serveCanadaFixture('pilot');}
export function resolveCanadaPreviewPort(value:string|undefined):number {
  if(value===undefined)return 4402;
  if(!/^[1-9]\d{3,4}$/.test(value)||Number(value)<1024||Number(value)>65535)throw new Error('Invalid PLAYWRIGHT_CANADA_PORT');
  return Number(value);
}
export async function serveCanadaPreviewFixture():Promise<void> {
  return serveCanadaFixture('preview');
}
async function serveCanadaFixture(kind:'preview'|'pilot'):Promise<void> {
  const port=kind==='pilot'?resolveCanadaPilotPort(process.env.PLAYWRIGHT_CANADA_PILOT_PORT):resolveCanadaPreviewPort(process.env.PLAYWRIGHT_CANADA_PORT),root=resolve(process.cwd()),tempRoot=resolve(root,'.tmp'),prefix=`canada-${kind}-`;
  await assertSnapshotPath(root,tempRoot,true);await mkdir(tempRoot,{recursive:true});
  const owned=await mkdtemp(resolve(tempRoot,prefix));
  const prior={TRADE_DATA_MODE:process.env.TRADE_DATA_MODE,CANADA_PREVIEW_MODE:process.env.CANADA_PREVIEW_MODE,CANADA_ACCEPTED_PREVIEW_MODE:process.env.CANADA_ACCEPTED_PREVIEW_MODE,CANADA_PILOT_MODE:process.env.CANADA_PILOT_MODE};
  let server:PreviewServer|undefined,stopping=false,stopPromise:Promise<void>|undefined;
  const stop=()=>{stopping=true;if(server)stopPromise??=server.stop();return stopPromise??Promise.resolve();};
  const signal=()=>{void stop().catch(()=>{process.exitCode=1;});};
  process.on('SIGINT',signal);process.on('SIGTERM',signal);
  try {
    await assertSnapshotPath(root,owned);
    process.env.TRADE_DATA_MODE='fixture';
    if(kind==='pilot'){process.env.CANADA_PILOT_MODE='fixture';delete process.env.CANADA_PREVIEW_MODE;delete process.env.CANADA_ACCEPTED_PREVIEW_MODE;}
    else{process.env.CANADA_PREVIEW_MODE='fixture';process.env.CANADA_ACCEPTED_PREVIEW_MODE='fixture';delete process.env.CANADA_PILOT_MODE;}
    const config={root,outDir:owned,server:{host:'127.0.0.1',port}};
    await build(config);if(stopping)throw new Error('Canada preview startup interrupted');
    server=await preview(config);if(stopping)throw new Error('Canada preview startup interrupted');if(server.port!==port)throw new Error('Unexpected Canada preview port');
    await server.closed();
  } finally {
    process.off('SIGINT',signal);process.off('SIGTERM',signal);
    try {await stop();} finally {
      for(const name of ['TRADE_DATA_MODE','CANADA_PREVIEW_MODE','CANADA_ACCEPTED_PREVIEW_MODE','CANADA_PILOT_MODE'] as const){if(prior[name]===undefined)delete process.env[name];else process.env[name]=prior[name];}
      // Never delete normal dist, a link target, or an output we did not create.
      const within=relative(tempRoot,owned);
      if(!within.startsWith(prefix)||within.length<=prefix.length||/[\\/]/.test(within))throw new Error('Invalid owned Canada preview output');
      await assertSnapshotPath(root,owned);await rm(owned,{recursive:true,force:true});
    }
  }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  serveCanadaPreviewFixture().catch(()=>{console.error('Canada fixture preview failed');process.exitCode=1;});
}
