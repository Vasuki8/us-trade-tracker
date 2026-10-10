export type ProductDefinition={code:string;displayName:string;importable:boolean;published:boolean;dutiesAccepted:boolean};
export const DEFAULT_PRODUCT_CODE='090121';
export const PRODUCTS:readonly ProductDefinition[]=[
  {code:DEFAULT_PRODUCT_CODE,displayName:'Roasted coffee',importable:true,published:true,dutiesAccepted:true},
  {code:'090111',displayName:'Green coffee (not decaffeinated)',importable:true,published:false,dutiesAccepted:false},
];
export function assertProductCode(value:unknown):asserts value is string{
  if(typeof value!=='string'||value.length!==6||!/^\d{6}$/.test(value))throw new Error('Invalid HS6 product code');
}
export function validateProductRegistry(value:unknown):asserts value is ProductDefinition[]{
  if(!Array.isArray(value))throw new Error('Invalid product registry');
  const seen=new Set<string>();
  for(const product of value){
    if(!product||typeof product!=='object'||Array.isArray(product)||Object.keys(product).some(k=>!['code','displayName','importable','published','dutiesAccepted'].includes(k)))throw new Error('Invalid product definition');
    assertProductCode(product.code);
    if(seen.has(product.code)||typeof product.displayName!=='string'||!product.displayName.trim()||['importable','published','dutiesAccepted'].some(k=>typeof product[k]!=='boolean')||product.published&&!product.importable)throw new Error('Invalid product registry availability or identity');
    seen.add(product.code);
  }
}
export function getProduct(code:string,registry:readonly ProductDefinition[]=PRODUCTS):ProductDefinition{
  assertProductCode(code);validateProductRegistry(registry);
  const product=registry.find(p=>p.code===code);if(!product)throw new Error(`Product ${code} is not reviewed`);return product;
}
