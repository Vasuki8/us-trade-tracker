import type {PortfolioSelection} from './portfolio-briefing';
export function portfolioPath(selection:PortfolioSelection,hash=''):string{
  return `/briefing/portfolio/?${new URLSearchParams({products:selection.productCodes.join(','),direction:selection.direction})}${hash}`;
}
export function readPortfolioSelection(search:string,availableCodes:readonly string[]):{selection:PortfolioSelection;notice:string|null}{
  const defaults:PortfolioSelection={productCodes:[...availableCodes],direction:'imports'};
  const fallback=()=>({selection:defaults,notice:'This saved briefing selection could not be restored. Showing all available products and Imports.'});
  if(search.length>2048)return fallback();
  const params=new URLSearchParams(search);
  if(['products','direction'].some(key=>params.getAll(key).length>1))return fallback();
  const codes=params.has('products')?params.get('products')!.split(','):[...availableCodes],direction=params.get('direction')??'imports';
  if(!codes.length||new Set(codes).size!==codes.length||codes.some(code=>!availableCodes.includes(code))||(direction!=='imports'&&direction!=='exports'))return fallback();
  return {selection:{productCodes:availableCodes.filter(code=>codes.includes(code)),direction},notice:null};
}
