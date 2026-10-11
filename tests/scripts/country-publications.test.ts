import {describe,expect,it} from 'vitest';
import {createHash} from 'node:crypto';
import * as publications from '../../scripts/country-publications';

const bytes=Buffer.from('%PDF-1.7\nsynthetic-publication\n%%EOF');
const reviewed={countryCode:'1220',month:'2026-05',direction:'exports',measure:'ALL_VAL_MO',url:'https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2605.pdf',publicationDate:'2026-07-07',pdfPage:53,printedPage:'- 5 -',table:'FT900 supplement, Exhibit 4',column:'May exports, domestic and foreign, FAS',units:'nominal USD millions, not seasonally adjusted',quantumUsd:100000,valueUsd:29790800000,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')} as const;
const pdfFetch=(body:BodyInit=bytes,status=200,type='application/pdf')=>(async()=>new Response(body,{status,headers:{'content-type':type,'last-modified':'Tue, 07 Jul 2026 12:32:03 GMT','date':'Sun, 11 Oct 2026 02:17:08 GMT'}})) as typeof fetch;

describe('retained reviewed publication references',()=>{
  it('uses a reviewed figure only when the complete original bytes and hash match',async()=>{
    const result=await publications.fetchReviewedPublication(reviewed,'synthetic-key',pdfFetch());
    expect(result.evidence).toMatchObject({verification:'verified',referenceUsd:29790800000,httpStatus:200,lastModified:'Tue, 07 Jul 2026 12:32:03 GMT',bytes:bytes.length,sha256:reviewed.sha256});
    expect(result.body).toEqual(bytes);
  });
  it.each(['hash','length','type','status','magic'] as const)('withholds a figure when its %s check fails',async failure=>{
    const original=await publications.fetchReviewedPublication(reviewed,'synthetic-key',pdfFetch());expect(original.evidence.verification).toBe('verified');
    const body=failure==='hash'?Buffer.from('%PDF-1.7\nsynthetic-publication\n%%EOX'):failure==='length'?Buffer.concat([bytes,Buffer.from('extra')]):failure==='magic'?Buffer.from('not a PDF'):bytes;
    const result=await publications.fetchReviewedPublication(reviewed,'synthetic-key',pdfFetch(body,failure==='status'?503:200,failure==='type'?'text/html':'application/pdf'));
    expect(result.evidence.verification).toBe('unavailable');expect(result.evidence.referenceUsd).toBeNull();expect(result.body).toEqual(body);
  });
  it('retains safe diagnostics when transport fails and drops credential-echoed bodies',async()=>{
    const result=await publications.fetchReviewedPublication(reviewed,'synthetic-key',(async()=>{throw new Error('synthetic-key secret');}) as typeof fetch);
    expect(result).toMatchObject({body:null,evidence:{verification:'unavailable',referenceUsd:null,httpStatus:null,sha256:null,bytes:null}});expect(JSON.stringify(result)).not.toContain('synthetic-key');
    const echoed=await publications.fetchReviewedPublication(reviewed,'synthetic-key',pdfFetch(Buffer.from('synthetic-key')));
    expect(echoed.body).toBeNull();expect(JSON.stringify(echoed)).not.toContain('synthetic-key');
  });
  it('drops credential-echoed response metadata before it can enter the evidence',async()=>{
    const result=await publications.fetchReviewedPublication(reviewed,'synthetic-key',(async()=>new Response(bytes,{headers:{'content-type':'application/pdf','last-modified':'synthetic-key'}})) as typeof fetch);
    expect(result.evidence.verification).toBe('unavailable');expect(result.body).toBeNull();expect(JSON.stringify(result)).not.toContain('synthetic-key');
  });
  it('bounds original body retention and applies timeout and redirect controls without a key in requests',async()=>{
    const fetcher=(async(input,init)=>{
      expect(String(input)).toBe(reviewed.url);expect(JSON.stringify(init)).not.toContain('synthetic-key');expect(init?.signal).toBeInstanceOf(AbortSignal);expect(init?.redirect).toBe('error');
      return new Response(new Uint8Array(4*1024*1024+1),{headers:{'content-type':'application/pdf'}});
    }) as typeof fetch;
    const result=await publications.fetchReviewedPublication(reviewed,'synthetic-key',fetcher);expect(result.body).toBeNull();expect(result.evidence.verification).toBe('unavailable');
  });
  it('separates historical corroboration from current-table disagreement and uses the same rounding precision',()=>{
    expect(publications.compareCountryReferences(29790835759,30399000000,29790800000)).toEqual({referenceCheck:'mismatch',publicationCheck:'matched',referenceCorroboration:'original-publication-only'});
    expect(publications.compareCountryReferences(29790850000,30399000000,29790800000).publicationCheck).toBe('mismatch');
    expect(publications.compareCountryReferences(29790835759,29790800000,null)).toEqual({referenceCheck:'matched',publicationCheck:'unavailable',referenceCorroboration:'current-table'});
    expect(publications.compareCountryReferences(null,30399000000,29790800000).referenceCorroboration).toBe('none');
    expect(publications.compareCountryReferences(0,0,undefined)).toEqual({referenceCheck:'matched',publicationCheck:'not-reviewed',referenceCorroboration:'current-table'});
  });
});
