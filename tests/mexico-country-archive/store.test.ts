import {afterEach,expect,it,vi} from 'vitest';
import {Readable} from 'node:stream';
import {mexicoAcceptanceContract} from '../../src/lib/mexico-country-release/acceptance-contract.server';
import {mexicoArchiveContract} from '../../src/lib/mexico-country-archive/contract.server';
afterEach(()=>vi.restoreAllMocks());
const config={accountId:'2e23d873002d29a02a1427e1fa37c5cd',bucketName:'us-trade-tracker',accessKeyId:'a'.repeat(32),secretAccessKey:'b'.repeat(64)};
const candidateKey='trade/v1/countries/2010/private-all-goods/objects/candidate/'+mexicoAcceptanceContract.candidate.sha256+'.json';
async function api(){let mod:any;try{mod=await import('../../src/lib/mexico-country-archive/store.server');}catch{}expect(mod?.createMexicoArchiveStore,'bounded archive store is missing').toBeTypeOf('function');return mod;}
const handler=(body:Buffer,statusCode=200)=>({async handle(){return {response:{statusCode,headers:{etag:'"matching-etag-is-not-a-digest"','content-length':String(body.length)},body:Readable.from([body])}};}});
it('fully consumes a bounded body and records its actual request/response bytes',async()=>{
 const m=await api(),b=Buffer.from('retained body'),store=m.createMexicoArchiveStore(config,{requestHandler:handler(b)}),result=await store.get(candidateKey,1024);
 expect(result.bytes).toEqual(b);expect(store.ledger).toMatchObject({requests:1,get:1,put:0,requestBytes:0,responseBytes:13});
});
it.each(['foreign-key','alias','too-large','bad-condition','immutable-put','other-account'] as const)('refuses %s before transport',async kind=>{
 const m=await api(),events:string[]=[],h={async handle(){events.push('unexpected');throw Error('transport reached');}};
 if(kind==='other-account'){expect(()=>m.createMexicoArchiveStore({...config,accountId:'c'.repeat(32)},{requestHandler:h})).toThrow();return;}
 const store=m.createMexicoArchiveStore(config,{requestHandler:h});let action;
 if(kind==='foreign-key')action=store.get('trade/v1/countries/1220/current.json',1024);
 if(kind==='alias')action=store.get(mexicoArchiveContract.prefix+'../current.json',1024);
 if(kind==='too-large')action=store.get(candidateKey,24*1024*1024+1);
 if(kind==='bad-condition')action=store.put(mexicoArchiveContract.currentKey,Buffer.from('{}'),{ifMatch:'*'});
 if(kind==='immutable-put')action=store.put(candidateKey,Buffer.from('{}'),{ifNoneMatch:'*'});
 await expect(action).rejects.toThrow();expect(events).toEqual([]);
});
it('rejects and destroys oversized streamed data rather than trusting absent content length',async()=>{
 const m=await api(),body=Readable.from([Buffer.alloc(600),Buffer.alloc(600)]),h={async handle(){return {response:{statusCode:200,headers:{etag:'"x"'},body}};}};
 const store=m.createMexicoArchiveStore(config,{requestHandler:h});await expect(store.get(candidateKey,1024)).rejects.toThrow();expect(body.destroyed).toBe(true);
});
it('does not retry a transport failure',async()=>{
 const m=await api(),events:string[]=[],h={async handle(){events.push('request');throw Object.assign(Error('temporary failure'),{code:'ECONNRESET'});}};
 const store=m.createMexicoArchiveStore(config,{requestHandler:h});await expect(store.get(candidateKey,1024)).rejects.toThrow();expect(events).toEqual(['request']);expect(store.ledger.requests).toBe(1);
});
it('aborts a hanging HTTP operation and keeps a consumed attempt in the ledger',async()=>{
 const m=await api();let aborted=false;const h={handle(_request:any,options:any){return new Promise((_resolve,reject)=>options.abortSignal.addEventListener('abort',()=>{aborted=true;reject(Error('aborted'));},{once:true}));}};
 const store=m.createMexicoArchiveStore(config,{requestHandler:h,requestMs:25});await expect(store.get(candidateKey,1024)).rejects.toThrow();expect(aborted).toBe(true);expect(store.ledger.requests).toBe(1);
});
it('stops before an additional request after its smaller configured allowance is consumed',async()=>{
 const m=await api(),store=m.createMexicoArchiveStore(config,{requestHandler:handler(Buffer.from('x')),maxRequests:1});await store.get(candidateKey,1);await expect(store.get(candidateKey,1)).rejects.toThrow();expect(store.ledger.requests).toBe(1);
});

function pointerBytes(){const ref=(role:string,digest:any)=>({key:mexicoArchiveContract.prefix+'objects/'+role+'/'+digest.sha256+'.json',identity:digest});return Buffer.from(JSON.stringify({schemaVersion:1,policyId:'mexico-private-all-goods-archive-v1',acceptancePolicyId:'mexico-private-all-goods-acceptance-v1',countryCode:'2010',scope:'all-goods',source:'census',from:'2024-09',to:'2026-08',releaseId:mexicoAcceptanceContract.releaseId,status:'accepted-private-all-goods',candidate:ref('candidate',mexicoAcceptanceContract.candidate),evidence:ref('evidence',{bytes:10,sha256:'d'.repeat(64)}),manifest:ref('manifests',{bytes:10,sha256:'e'.repeat(64)}),authorization:{bytes:10,sha256:'f'.repeat(64)},acceptedAt:'2026-10-19T03:00:00.000Z',allGoodsAccepted:true,classificationAccepted:false,publicMexicoProfile:false,productComparisons:{available:false}})+'\n');}
it('sends only the conditional marker PUT and closes its success response',async()=>{
 const m=await api(),events:any[]=[],body=Readable.from([]),h={async handle(request:any){events.push({method:request.method,condition:request.headers['if-none-match'],body:Buffer.from(request.body)});return {response:{statusCode:200,headers:{'content-length':'0'},body}};}};
 const bytes=pointerBytes(),store=m.createMexicoArchiveStore(config,{requestHandler:h});await store.put(mexicoArchiveContract.currentKey,bytes,{ifNoneMatch:'*'});
 expect(events).toEqual([{method:'PUT',condition:'*',body:bytes}]);expect(body.destroyed).toBe(true);expect(store.ledger.put).toBe(1);
});
it('keeps the request deadline active until a complete GET body is consumed',async()=>{
 const m=await api(),body=new Readable({read(){}}),h={async handle(){return {response:{statusCode:200,headers:{etag:'"x"'},body}};}};
 const store=m.createMexicoArchiveStore(config,{requestHandler:h,requestMs:25});
 const work=store.get(candidateKey,1024).then(()=>({kind:'unexpected-success'}),(e:any)=>({kind:e.kind}));
 const outcome=await Promise.race([work,new Promise<{kind:string}>(resolve=>setTimeout(()=>resolve({kind:'body-deadline-missing'}),250))]);
 body.destroy();await work;expect(outcome.kind).toBe('read-failed');expect(body.destroyed).toBe(true);
});
