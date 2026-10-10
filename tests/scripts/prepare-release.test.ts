import {afterEach,expect,it,vi} from 'vitest';
import {access,mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import imports from '../fixtures/census-imports.json';import exports from '../fixtures/census-exports.json';
import {prepareRelease,readCurrentRelease,validateRelease} from '../../scripts/prepare-release';
const dirs:string[]=[];afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
const fetcher=(change=0)=>(async(input:RequestInfo|URL)=>{
  const url=new URL(String(input)); const payload=structuredClone(url.pathname.includes('exports')?exports:imports);
  const summary=payload[0].indexOf('SUMMARY_LVL2'),time=payload[0].indexOf('time');
  const rows=payload.slice(1).filter(r=>r[summary]===url.searchParams.get('SUMMARY_LVL2')).map(r=>{r[time]=url.searchParams.get('time')!;if(r[payload[0].indexOf('CTY_CODE')]==='-'&&change)r[payload[0].findIndex(h=>h.endsWith('_VAL_MO'))]=String(1000+change);return r;});
  return Response.json([payload[0],...rows]);
}) as typeof fetch;
it('does not read a current release as a different requested product',async()=>{
  const outputDir=await mkdtemp(join(tmpdir(),'trade-identity-'));dirs.push(outputDir);
  await prepareRelease({productCode:'090121',end:'2026-06',months:24,apiKey:'synthetic',outputDir,codeVersion:'test'},fetcher());
  await expect(readCurrentRelease(outputDir,'090122')).rejects.toThrow(/product/i);
});
it('promotes only a complete release and preserves it after failed refresh',async()=>{
  const outputDir=await mkdtemp(join(tmpdir(),'trade-release-'));dirs.push(outputDir);
  const options={productCode:'090121',end:'2026-06',months:24,apiKey:'test-secret-key',outputDir,codeVersion:'test-commit'};
  const first=await prepareRelease(options,fetcher());
  expect(first.observations.filter(r=>r.geography==='world')).toHaveLength(48);
  await expect(prepareRelease(options,(async()=>new Response(null,{status:204})) as typeof fetch)).rejects.toThrow();
  expect(await readCurrentRelease(outputDir)).toEqual(first);
  const revised=await prepareRelease(options,fetcher(100));
  expect(revised.revisedKeys).toContain('imports/090121/2026-06/world/-/GEN_VAL_MO');
  expect(await readCurrentRelease(outputDir)).toEqual(revised);
  expect(JSON.stringify(revised)).not.toContain('test-secret-key');
  const pointer=JSON.parse(await readFile(join(outputDir,'current.json'),'utf8'));
  expect(pointer.releaseFile).toMatch(/^releases\//);
});
it('runtime validation rejects fixture promotion, duplicate keys and inconsistent totals',async()=>{
  const {sampleRelease}=await import('../helpers/release');
  const release=sampleRelease();
  expect(()=>validateRelease(release,true)).toThrow(/fixture/i);
  release.source='census'; release.observations.push(release.observations[0]);
  expect(()=>validateRelease(release)).toThrow(/duplicate/i);
});
it('records removed observations within the overlapping history as revisions',async()=>{
  const outputDir=await mkdtemp(join(tmpdir(),'trade-release-'));dirs.push(outputDir);
  const options={productCode:'090121',end:'2026-06',months:24,apiKey:'test-secret-key',outputDir,codeVersion:'test'};
  await prepareRelease(options,fetcher());const base=fetcher();
  const dropped=(async(input:RequestInfo|URL,init?:RequestInit)=>{
    const response=await base(input,init);const payload:string[][]=await response.json();
    const url=new URL(String(input));
    if(url.pathname.includes('imports')&&url.searchParams.get('time')==='2026-06'){
      const code=payload[0].indexOf('CTY_CODE');return Response.json([payload[0],...payload.slice(1).filter(r=>r[code]!=='1220')]);
    }
    return Response.json(payload);
  }) as typeof fetch;
  const next=await prepareRelease(options,dropped);
  expect(next.revisedKeys).toContain('imports/090121/2026-06/country/1220/GEN_VAL_MO');
});
it('holds the import lock until a failed worker and its pending sibling have both stopped',async()=>{
  const outputDir=await mkdtemp(join(tmpdir(),'trade-release-'));dirs.push(outputDir);
  let unblock!:()=>void;let started!:()=>void;let failed=false;let settled=false;
  const siblingStarted=new Promise<void>(resolve=>{started=resolve;});
  const blocked=new Promise<void>(resolve=>{unblock=resolve;});const base=fetcher();
  const controlled=(async(input:RequestInfo|URL,init?:RequestInit)=>{
    if(new URL(String(input)).pathname.includes('imports')){await siblingStarted;failed=true;return new Response('unauthorized',{status:401});}
    started();await blocked;return base(input,init);
  }) as typeof fetch;
  const pending=prepareRelease({productCode:'090121',end:'2026-06',months:24,apiKey:'test-secret-key',outputDir,codeVersion:'test'},controlled).then(()=>{settled=true;},()=>{settled=true;});
  try{await vi.waitFor(()=>expect(failed).toBe(true));expect(settled).toBe(false);await expect(access(join(outputDir,'.import.lock'))).resolves.toBeUndefined();}finally{unblock();await pending;}
});
