import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {siteArguments} from './stage-site';
import {verifyLiveSite,type LiveSiteVerificationReceipt} from './live-site-verification';

export async function runVerifyLiveSite(args:string[]):Promise<LiveSiteVerificationReceipt>{
 const a=siteArguments(args,['--work-dir','--manifest','--zip','--manifest-sha256','--zip-sha256','--deployment-origin','--proof-root']);
 return verifyLiveSite({workDir:a['--work-dir'],manifestPath:a['--manifest'],zipPath:a['--zip'],manifestSha256:a['--manifest-sha256'],zipSha256:a['--zip-sha256'],deploymentOrigin:a['--deployment-origin'],proofRoot:a['--proof-root']});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 runVerifyLiveSite(process.argv.slice(2)).then(receipt=>{
  console.log(JSON.stringify({status:receipt.status,plannedCount:receipt.plannedCount,completedCount:receipt.completedCount,httpAttempts:receipt.httpAttempts,...(receipt.failure?{error:receipt.failure.code}:{})}));
  if(receipt.status!=='passed')process.exitCode=1;
 }).catch(()=>{console.error('Live site verification failed before a verified receipt could be saved; check arguments and fresh owned paths.');process.exitCode=1;});
}

