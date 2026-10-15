import type {CountryDirection} from './types';

export type CanadaViewSelection={direction:CountryDirection};
export function readCanadaViewSelection(search:string):{selection:CanadaViewSelection;notice:string|null}{
 const fallback=()=>({selection:{direction:'imports' as const},notice:'This saved Canada view could not be restored. Showing Imports.'});
 if(search.length>2048)return fallback();
 const params=new URLSearchParams(search),direction=params.get('direction')??'imports';
 if(params.getAll('direction').length>1||(direction!=='imports'&&direction!=='exports'))return fallback();
 return {selection:{direction},notice:null};
}
export function canadaViewPath(selection:CanadaViewSelection,hash=''):string{
 if((selection.direction!=='imports'&&selection.direction!=='exports')||(hash!==''&&!hash.startsWith('#')))throw new Error('Invalid Canada view selection');
 return '/countries/1220/?'+new URLSearchParams({direction:selection.direction})+hash;
}
