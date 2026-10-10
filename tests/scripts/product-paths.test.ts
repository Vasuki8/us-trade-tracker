import {expect,it} from 'vitest';import {join} from 'node:path';
import {productDataPaths,productArchiveKeys} from '../../scripts/product-paths';
it('preserves coffee storage and isolates other identities in a workspace with spaces',()=>{
  const root=join('workspace','with spaces');
  expect(productDataPaths(root,'090121')).toEqual({dataDir:join(root,'data'),processedDir:join(root,'data/processed'),classificationFile:join(root,'data/classification/090121.json')});
  expect(productDataPaths(root,'090122')).toEqual({dataDir:join(root,'data/products/090122'),processedDir:join(root,'data/products/090122/processed'),classificationFile:join(root,'data/classification/090122.json')});
  expect(productArchiveKeys('090121')).toEqual({prefix:'trade/v1/products/090121/',currentKey:'trade/v1/products/090121/current.json'});
  expect(productArchiveKeys('090122')).toEqual({prefix:'trade/v1/products/090122/',currentKey:'trade/v1/products/090122/current.json'});
});
it.each(['../090121','090121/','90121','090121\n','000000/x','090121;echo'])('rejects unsafe product paths %s',code=>{
  expect(()=>productDataPaths('workspace',code)).toThrow();expect(()=>productArchiveKeys(code)).toThrow();
});
