import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {siteArguments} from './stage-site';
import {prepareSite} from './site-assembly';
export async function runPrepareSite(args:string[]):Promise<unknown>{
 const a=siteArguments(args,['--source-root','--data-root','--stage-root','--build-root','--output']);return prepareSite({sourceRoot:a['--source-root'],dataRoot:a['--data-root'],stageRoot:a['--stage-root'],buildRoot:a['--build-root'],outputRoot:a['--output']});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)runPrepareSite(process.argv.slice(2)).then(value=>console.log(JSON.stringify(value))).catch(()=>{console.error('Local site preparation failed; check verified staging, build output and fresh assembly destination.');process.exitCode=1;});

