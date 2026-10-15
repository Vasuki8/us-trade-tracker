import {afterEach,expect,it,vi} from 'vitest';
import {runVerifyLiveSite} from '../../scripts/verify-live-site';
import {verifyLiveSite} from '../../scripts/live-site-verification';
vi.mock('../../scripts/live-site-verification',()=>({verifyLiveSite:vi.fn()}));
afterEach(()=>vi.resetAllMocks());
const args=['--work-dir','owned','--manifest','manifest.json','--zip','site.zip','--manifest-sha256','a'.repeat(64),'--zip-sha256','b'.repeat(64),'--deployment-origin','https://660d1364.us-trade-tracker.pages.dev','--proof-root','fresh'];
it('forwards every operator package pin and target without inventing an origin',async()=>{
 vi.mocked(verifyLiveSite).mockResolvedValue({status:'passed'} as any);
 expect((await runVerifyLiveSite(args)).status).toBe('passed');
 expect(verifyLiveSite).toHaveBeenCalledWith({workDir:'owned',manifestPath:'manifest.json',zipPath:'site.zip',manifestSha256:'a'.repeat(64),zipSha256:'b'.repeat(64),deploymentOrigin:'https://660d1364.us-trade-tracker.pages.dev',proofRoot:'fresh'});
});
it.each([args.slice(2),[...args,'--unknown','x'],[...args,'--zip','duplicate'],args.slice(0,-1)].map(invalid=>({invalid})))('rejects missing, duplicate or unknown arguments before verification',async({invalid})=>{
 await expect(runVerifyLiveSite(invalid)).rejects.toThrow('site-');
 expect(verifyLiveSite).not.toHaveBeenCalled();
});
it('does not change a failed verification into success',async()=>{
 vi.mocked(verifyLiveSite).mockResolvedValue({status:'failed',failure:{code:'live-body-hash'}} as any);
 expect(await runVerifyLiveSite(args)).toMatchObject({status:'failed',failure:{code:'live-body-hash'}});
});


it('the actual CLI exits nonzero and saves failure proof for a wrong pin without network',async()=>{
 const {liveFixture,cleanLiveFixtures}=await import('../helpers/live-site');const {execFileSync}=await import('node:child_process');const {resolve}=await import('node:path');const {readFile}=await import('node:fs/promises');
 const f=await liveFixture();
 const cli=['--work-dir',f.workDir,'--manifest',f.manifestPath,'--zip',f.zipPath,'--manifest-sha256',f.manifestSha256,'--zip-sha256','b'.repeat(64),'--deployment-origin',f.deploymentOrigin,'--proof-root',f.proofRoot];
 let result:unknown;
 try{execFileSync(process.execPath,['--import','tsx','--import','data:text/javascript,globalThis.fetch%3D()%3D%3E%7Bthrow%20Error(%22Network%20disabled%22)%7D',resolve('scripts/verify-live-site.ts'),...cli],{encoding:'utf8',stdio:'pipe'});}catch(e){result=e;}
 try{expect((result as {status:number}).status).toBe(1);const proof=JSON.parse(await readFile(resolve(f.proofRoot,'failed.json'),'utf8'));expect(proof.failure.code).toBe('live-package-input');expect(proof.httpAttempts).toBe(0);}finally{await cleanLiveFixtures();}
});
