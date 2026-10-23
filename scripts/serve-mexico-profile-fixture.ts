import {build,preview,type PreviewServer} from 'astro';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertSnapshotPath} from './country-snapshot-input';
export function resolveMexicoProfilePort(value:string|undefined):number{
 if(value===undefined)return 4410;
 if(!/^[1-9]\d{3,4}$/.test(value)||Number(value)<1024||Number(value)>65535)throw Error('Invalid PLAYWRIGHT_MEXICO_PROFILE_PORT');return Number(value);
}
export async function serveMexicoProfileFixture(options?:{presentation?:'local'|'pilot'}):Promise<void>{
 const pilot=options?.presentation==='pilot';
 const port=resolveMexicoProfilePort(pilot?(process.env.PLAYWRIGHT_MEXICO_PILOT_PORT??'4416'):process.env.PLAYWRIGHT_MEXICO_PROFILE_PORT),root=resolve(process.cwd()),tempRoot=resolve(root,'.tmp'),prefix=pilot?'mexico-pilot-':'mexico-profile-';
 await assertSnapshotPath(root,tempRoot,true);await mkdir(tempRoot,{recursive:true});const owned=await mkdtemp(resolve(tempRoot,prefix));
 const names=['MEXICO_LOCAL_PREVIEW_MODE','MEXICO_PILOT_MODE','TRADE_DATA_MODE','CANADA_PILOT_MODE','CANADA_PREVIEW_MODE','CANADA_ACCEPTED_PREVIEW_MODE'] as const;
 const prior=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 let server:PreviewServer|undefined,stopping=false,stopPromise:Promise<void>|undefined;
 const stop=()=>{stopping=true;if(server)stopPromise??=server.stop();return stopPromise??Promise.resolve();};
 const signal=()=>{void stop().catch(()=>{process.exitCode=1;});};process.on('SIGINT',signal);process.on('SIGTERM',signal);
 try{
  await assertSnapshotPath(root,owned);
  for(const k of names)delete process.env[k];
  process.env.TRADE_DATA_MODE='fixture';
  if(pilot){process.env.MEXICO_PILOT_MODE='fixture';process.env.CANADA_PILOT_MODE='fixture';}
  else process.env.MEXICO_LOCAL_PREVIEW_MODE='fixture';
  const config={root,outDir:owned,server:{host:'127.0.0.1',port}};
  await build(config);if(stopping)throw Error('Mexico profile startup interrupted');
  server=await preview(config);if(stopping)throw Error('Mexico profile startup interrupted');if(server.port!==port)throw Error('Unexpected Mexico profile port');
  await server.closed();
 }finally{
  process.off('SIGINT',signal);process.off('SIGTERM',signal);
  try{await stop();}finally{
   for(const k of names){if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k];}
   const within=relative(tempRoot,owned);
   if(!within.startsWith(prefix)||within.length<=prefix.length||/[\\/]/.test(within))throw Error('Invalid owned Mexico profile output');
   await assertSnapshotPath(root,owned);await rm(owned,{recursive:true,force:true});
  }
 }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))serveMexicoProfileFixture().catch(()=>{console.error('Mexico fixture preview failed');process.exitCode=1;});
