import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,mkdir,access,rm} from 'node:fs/promises';import {resolve} from 'node:path';import {tmpdir} from 'node:os';
import {assertMexicoNodeVersion,resolveMexicoPrepareOptions,runMexicoPrepare} from '../../scripts/prepare-mexico-country-release';
import * as evidence from '../../src/lib/mexico-country-release/evidence.server';
import {makeMexicoEvidenceFixture,installMexicoFixture} from '../helpers/mexico-country-release-data';
afterEach(()=>vi.restoreAllMocks());
it.each([[],['--output','x','--accept'],['--output','x','--output','y'],['--country','2010'],['--output','../x'],['--output','x','--preflight','--preflight'],['--output','--preflight'],['--hash','x']].map(args=>({args})))('rejects invalid prepare options $args',({args})=>expect(()=>resolveMexicoPrepareOptions(args,process.cwd())).toThrow());
it('requires Node24',()=>{expect(()=>assertMexicoNodeVersion('22.9.0')).toThrow();expect(()=>assertMexicoNodeVersion('24.1.0')).not.toThrow();});
it('preflight authenticates fixed evidence and writes nothing',async()=>{const root=await mkdtemp(resolve(tmpdir(),'mexico-cli-'));try{await mkdir(resolve(root,'data/backups/mexico-country-release'),{recursive:true});const f=makeMexicoEvidenceFixture();installMexicoFixture(f);vi.spyOn(evidence,'readMexicoAllGoodsEvidence').mockResolvedValue(evidence.verifyMexicoAllGoodsEvidence(f));const output='data/backups/mexico-country-release/no-output';await expect(runMexicoPrepare(resolveMexicoPrepareOptions(['--output',output,'--preflight'],root))).resolves.toEqual({status:'preflight-passed',candidateDigest:null});await expect(access(resolve(root,output))).rejects.toThrow();}finally{await rm(root,{recursive:true,force:true});}});
