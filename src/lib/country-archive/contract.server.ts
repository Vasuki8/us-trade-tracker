import type {Digest} from '../country-release/types';
export const countryArchiveContract={
  policyId:'canada-private-archive-v1' as const,countryCode:'1220' as const,
  prefix:'trade/v1/countries/1220/',currentKey:'trade/v1/countries/1220/current.json',
  get releaseId(){return '2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca';},backupRoot:'data/backups/canada-country-archive',
  selectionEvidenceRoot:'data/backups/canada-country-release/local-selection-20261012-r1',
  get selectedPointerDigest():Digest{return {bytes:466,sha256:'9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399'};},
  get manifestPin():Digest&{path:string}{return {path:'docs/data-validation/1220-preservation-manifest.json',bytes:181256,sha256:'d67abbcb1e666a4b4f2a51eefbfe8c1efc564c924c7acf944375e6fa640b84ba'};},
  get expectedSources(){return {files:766,bytes:7944428339};},
  limits:{files:1024,manifest:512*1024,source:512*1024*1024,total:8*1024*1024*1024,bundle:12*1024*1024,record:64*1024,pointer:16*1024,capabilities:4*1024*1024,chunk:256*1024,objectMs:10*60*1000,totalMs:3*60*60*1000,lifetimeSeconds:3*60*60,concurrency:2},
};
