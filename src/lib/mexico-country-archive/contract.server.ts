export const mexicoArchiveContract={
 policyId:'mexico-private-all-goods-archive-v1' as const,
 prefix:'trade/v1/countries/2010/private-all-goods/',
 currentKey:'trade/v1/countries/2010/private-all-goods/current.json',
 accountId:'2e23d873002d29a02a1427e1fa37c5cd',bucketName:'us-trade-tracker',
 backupRoot:'data/backups/mexico-country-release',
 preservationDepth:'retained-all-goods-evidence-only' as const,
 limits:{candidate:24*1024*1024,evidence:3*1024*1024,manifest:64*1024,pointer:16*1024,ciphertext:128*1024,summary:16*1024,totalStored:16*1024*1024,requestMs:30_000,operationMs:300_000,batchRequests:32,batchBytes:64*1024*1024},
};
