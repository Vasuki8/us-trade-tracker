import type {SnapshotDirection} from './country-snapshot-types';
const sourceRoot='data/backups/canada-country-audit/bulk-diagnostic-2026-10-11-r1';
const normalizedRoot=sourceRoot+'-offline-inventory-128';
const months=Array.from({length:24},(_,i)=>new Date(Date.UTC(2024,8+i)).toISOString().slice(0,7));
export const canadaSnapshotContract = {
  policyId:'canada-archive-snapshot-v1' as const,sourceRoot,normalizedRoot,months,
  candidates:{
    imports:['270900','980100','271019','271121','870323','870340','870324','870829','271012','880240'],
    exports:['988000','270900','880000','870431','271012','271019','870899','847150','870323','711291'],
  } satisfies Record<SnapshotDirection,readonly string[]>,
  anchors:{
    bulk:{path:sourceRoot+'/bulk-report.json',bytes:91396,sha256:'7a306222bf6be80eae1c938341661e353b08cb4a5ab4e50c6466702f704ad00c'},
    manifest:{path:sourceRoot+'/original-manifest.json',bytes:51828,sha256:'66acdc59057211575cf8b659f853460e1d279d624677f41fd880da6827865535'},
    replay:{path:normalizedRoot+'/offline-replay.json',bytes:139962,sha256:'9157869192cef9b14d542de8ce772ddea146167dbe7d510aa45eb4919735ca6d'},
    verification:{path:'.tmp/canada-inventory-independent-review-20261011/independent-inventory128-receipt.json',bytes:228778,sha256:'0279468121f2164f007b0338f0ff5cd9babc49c67e16cf31cfbd6e28c3d20927'},
  },outputLimit:8*1024*1024,
};
