export const canadaPreviewContract={
  route:'/preview/countries/1220/',policyId:'canada-archive-snapshot-v1',
  assessment:{path:'data/backups/canada-country-audit/snapshot-classifications-2026-10-12-r1/snapshot-assessment.json',bytes:858857,sha256:'2cad0dcabf353b8aec0d365bb247e5d976712a7a1ebc90cac26694322503d9f8'},
  inputLimit:1024*1024,processingCommit:'9c385fb94b2a36b1d07ddf9e01670c366839a83b',
  ledger:{path:'docs/data-validation/1220-snapshot-classification-evidence.json',bytes:487985,sha256:'afde19b1384c0cbab8cb2f7bbbc5ed8253bc636bb7a35c6b8d5d3c599a1010fd'},
  months:Array.from({length:24},(_,i)=>new Date(Date.UTC(2024,8+i)).toISOString().slice(0,7)),
  candidates:{imports:['270900','980100','271019','271121','870323','870340','870324','870829','271012','880240'],exports:['988000','270900','880000','870431','271012','271019','870899','847150','870323','711291']},
} as const;
