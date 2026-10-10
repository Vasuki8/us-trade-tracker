import {expect,it} from 'vitest';
import {getProduct,validateProductRegistry} from '../../src/lib/trade/product-registry';
const coffee={code:'090121',displayName:'Roasted coffee',importable:true,published:true,dutiesAccepted:true};
it('resolves the reviewed coffee and rejects an unreviewed product',()=>{
  expect(getProduct('090121')).toEqual(coffee);
  expect(()=>getProduct('090122')).toThrow(/product/i);
});
it.each([null,{},[coffee,coffee],[{...coffee,code:'../data'}],[{...coffee,displayName:' '}],[{...coffee,importable:false}],[{...coffee,published:'true'}],[{...coffee,dutiesAccepted:1}]])('rejects an invalid registry %j',value=>{expect(()=>validateProductRegistry(value)).toThrow();});
it('allows a reviewed product to be importable before publication',()=>{
  const product={code:'090122',displayName:'Synthetic second product',importable:true,published:false,dutiesAccepted:false};
  expect(()=>validateProductRegistry([coffee,product])).not.toThrow();expect(getProduct('090122',[coffee,product])).toEqual(product);
});
