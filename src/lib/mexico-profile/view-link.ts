import type {MexicoDirection} from './types';

export type MexicoViewSelection={direction:MexicoDirection};
export function readMexicoViewSelection(search:string):{selection:MexicoViewSelection;notice:string|null}{
 const fallback=()=>({selection:{direction:'imports' as const},notice:'This saved Mexico view could not be restored. Showing Imports.'});
 if(search.length>2048)return fallback();
 const params=new URLSearchParams(search),direction=params.get('direction')??'imports';
 if(params.getAll('direction').length>1||(direction!=='imports'&&direction!=='exports'))return fallback();
 return {selection:{direction},notice:null};
}
export function mexicoViewPath(selection:MexicoViewSelection,hash=''):string{
 if((selection.direction!=='imports'&&selection.direction!=='exports')||(hash!==''&&!hash.startsWith('#')))throw new Error('Invalid Mexico view selection');
 return '/countries/2010/?'+new URLSearchParams({direction:selection.direction})+hash;
}
