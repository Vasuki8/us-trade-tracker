import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createSiteStage,verifySiteStage} from './site-staging';
export function siteArguments(args:string[],names:string[]):Record<string,string>{
 const result:Record<string,string>={};for(let i=0;i<args.length;i+=2){const key=args[i];if(!names.includes(key)||result[key]!==undefined||!args[i+1]||args[i+1].startsWith('--'))throw Error('site-invalid-arguments');result[key]=args[i+1];}
 if(names.some(key=>!result[key]))throw Error('site-missing-arguments');return result;
}
export async function runStageSite(args:string[]):Promise<unknown>{
 const command=args.shift();if(command==='verify'){const a=siteArguments(args,['--source-root','--data-root','--stage-root']);return verifySiteStage({sourceRoot:a['--source-root'],dataRoot:a['--data-root'],stageRoot:a['--stage-root']});}if(command!=='create')throw Error('site-command-must-be-create-or-verify');
 const a=siteArguments(args,['--source-root','--data-root','--output','--commit']);return createSiteStage({sourceRoot:a['--source-root'],dataRoot:a['--data-root'],outputRoot:a['--output'],commit:a['--commit']});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)runStageSite(process.argv.slice(2)).then(value=>console.log(JSON.stringify(value))).catch(()=>{console.error('Local site staging failed; check arguments, committed source, accepted inputs and fresh output.');process.exitCode=1;});

