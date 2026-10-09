import {expect,it,vi} from 'vitest';
import {Readable} from 'node:stream';
import {createR2Store,readR2Config,type R2Config} from '../../scripts/archive-store';
import {CURRENT_KEY} from '../../scripts/archive-bundle';
const config:R2Config={accountId:'a'.repeat(32),bucketName:'trade-test',accessKeyId:'b'.repeat(32),secretAccessKey:'c'.repeat(64)};
function wire(respond:(request:any,options:any)=>Promise<any>|any){
  const requests:any[]=[];
  const requestHandler={handle:async(request:any,options:any)=>{requests.push(request);return {response:await respond(request,options)};},destroy(){}};
  return {requests,store:createR2Store(config,{requestHandler})};
}
const response=(statusCode=200,headers:Record<string,string>={etag:'"test-etag"'},body:Readable=Readable.from([Buffer.from('{}')]))=>({statusCode,headers,body});
it('sends signed conditional PUTs with the exact ETag and no default CRC32 header',async()=>{
  const w=wire(()=>response());await w.store.put(CURRENT_KEY,Buffer.from('{}'),{ifMatch:'"original-etag"'});await w.store.put(CURRENT_KEY,Buffer.from('{}'),{ifNoneMatch:'*'});
  expect(w.requests[0].headers['if-match']).toBe('"original-etag"');expect(w.requests[1].headers['if-none-match']).toBe('*');
  expect(w.requests[0].hostname).toBe(`${config.accountId}.r2.cloudflarestorage.com`);expect(w.requests[0].path).toBe(`/trade-test/${CURRENT_KEY}`);
  expect(w.requests[0].headers.authorization).toContain('AWS4-HMAC-SHA256');expect(w.requests[0].headers['x-amz-checksum-crc32']).toBeUndefined();
});
it('never retries a lost PUT response and hides provider secrets',async()=>{
  const w=wire(()=>{throw new Error(`Authorization=${config.secretAccessKey}`);});
  const error=await w.store.put(CURRENT_KEY,Buffer.from('{}'),{ifNoneMatch:'*'}).catch(e=>e);
  expect(error.code).toBe('unconfirmed_write');expect(w.requests).toHaveLength(1);expect(error.message).not.toContain(config.secretAccessKey);expect(error.cause).toBeUndefined();
});
it.each([['NoSuchKey',404,true],['NoSuchBucket',404,false],['',404,false],['AccessDenied',403,false]] as const)('distinguishes %s from object absence',async(code,status,absent)=>{
  const w=wire(()=>response(status,{'content-type':'application/xml'},Readable.from([`<Error><Code>${code}</Code><Message>private</Message></Error>`])));
  if(absent)expect(await w.store.get(CURRENT_KEY,1024)).toBeNull();else await expect(w.store.get(CURRENT_KEY,1024)).rejects.toMatchObject({code:'read_failed'});
});
it.each([[412,'conflict'],[403,'write_failed'],[500,'unconfirmed_write']] as const)('classifies PUT %s safely',async(status,code)=>{
  const w=wire(()=>response(status,{'content-type':'application/xml'},Readable.from(['<Error><Code>Failure</Code></Error>'])));
  await expect(w.store.put(CURRENT_KEY,Buffer.from('{}'),{ifNoneMatch:'*'})).rejects.toMatchObject({code});expect(w.requests).toHaveLength(1);
});
it.each<Record<string,string>>([{}, {'content-length':'1'},{'content-length':'1000'}])('bounds real streamed bytes regardless of declared length %j',async(headers)=>{
  const w=wire(()=>response(200,{etag:'"etag"',...headers},Readable.from([Buffer.alloc(16),Buffer.alloc(16)])));
  await expect(w.store.get(CURRENT_KEY,24)).rejects.toMatchObject({code:'read_failed'});
});
it('accepts bounded streamed data without a Content-Length',async()=>{const w=wire(()=>response());expect(await w.store.get(CURRENT_KEY,16)).toEqual({bytes:Buffer.from('{}'),etag:'"test-etag"'});});
it('rejects missing ETags and aborts a stalled body at the total deadline',async()=>{
  const w=wire(()=>response(200,{}));await expect(w.store.get(CURRENT_KEY,1024)).rejects.toMatchObject({code:'read_failed'});
  vi.useFakeTimers();const stream=new Readable({read(){}});const stall=wire(()=>response(200,{etag:'"etag"'},stream));
  const pending=stall.store.get(CURRENT_KEY,1024).catch(e=>e);await vi.advanceTimersByTimeAsync(30_001);expect((await pending).code).toBe('read_failed');expect(stream.destroyed).toBe(true);vi.useRealTimers();
});
it('rejects invalid settings, keys and preconditions before sending',async()=>{
  expect(readR2Config({R2_ACCOUNT_ID:config.accountId,R2_BUCKET_NAME:config.bucketName,R2_ACCESS_KEY_ID:config.accessKeyId,R2_SECRET_ACCESS_KEY:config.secretAccessKey})).toEqual(config);
  for(const env of [{},{R2_ACCOUNT_ID:'../../bad'},{R2_BUCKET_NAME:'http://bad'}])expect(()=>readR2Config(env)).toThrow();
  const w=wire(()=>response());await expect(w.store.get('outside/key',1024)).rejects.toThrow();await expect(w.store.put(CURRENT_KEY,Buffer.from('{}'),{ifMatch:'bad\r\nHeader'})).rejects.toThrow();expect(w.requests).toHaveLength(0);
});
it.each([['GET',403],['PUT',200],['PUT',500]] as const)('bounds %s %s response before SDK buffering',async(method,status)=>{
  let consumed=0;const stream=Readable.from((async function*(){yield Buffer.from('<Error><Code>Failure</Code><Message>');for(let i=0;i<128;i++){consumed+=1024;yield Buffer.alloc(1024,120);}yield Buffer.from('</Message></Error>');})());
  const w=wire(()=>response(status,{'content-type':'application/xml',etag:'"etag"'},stream));
  const operation=method==='GET'?w.store.get(CURRENT_KEY,32):w.store.put(CURRENT_KEY,Buffer.from('{}'),{ifNoneMatch:'*'});
  await expect(operation).rejects.toThrow();expect(consumed).toBeLessThan(128*1024);expect(stream.destroyed).toBe(true);
});
it.each(['GET-error','PUT-response','request'])('bounds and aborts a stalled %s',async(kind)=>{
  vi.useFakeTimers();const stream=new Readable({read(){}});
  const w=wire(()=>kind==='request'?new Promise(()=>{}):response(kind==='GET-error'?403:200,{},stream));
  const pending=(kind==='GET-error'?w.store.get(CURRENT_KEY,1024):w.store.put(CURRENT_KEY,Buffer.from('{}'),{ifNoneMatch:'*'})).catch(e=>e);
  await vi.advanceTimersByTimeAsync(30_001);expect((await pending).code).toBe(kind==='GET-error'?'read_failed':'unconfirmed_write');if(kind!=='request')expect(stream.destroyed).toBe(true);vi.useRealTimers();
});
