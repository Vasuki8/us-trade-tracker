import {ArchiveStoreError,type ArchiveStore,type StoredObject,type WriteCondition} from '../../scripts/archive-store';
import {sha256,CURRENT_KEY} from '../../scripts/archive-bundle';
// Synthetic conditional transport. Faults occur at the storage boundary, not in the protocol.
export class MemoryArchiveStore implements ArchiveStore{
  readonly objects=new Map<string,StoredObject>();
  readonly puts:{key:string;bytes:Buffer;condition:WriteCondition}[]=[];
  beforeGet?: (key:string)=>void;
  afterPut?: (key:string)=>void;
  get pointerPutCalls(){return this.puts.filter(p=>p.key===CURRENT_KEY).length;}
  seed(key:string,bytes:Buffer):void{this.objects.set(key,{bytes:Buffer.from(bytes),etag:`"${sha256(bytes)}"`});}
  async get(key:string,maxBytes:number):Promise<StoredObject|null>{this.beforeGet?.(key);const v=this.objects.get(key);if(!v)return null;if(v.bytes.length>maxBytes)throw new ArchiveStoreError('read_failed');return {bytes:Buffer.from(v.bytes),etag:v.etag};}
  async put(key:string,bytes:Buffer,condition:WriteCondition):Promise<void>{
    this.puts.push({key,bytes,condition});const old=this.objects.get(key);
    if('ifNoneMatch' in condition?!!old:old?.etag!==condition.ifMatch)throw new ArchiveStoreError('conflict');
    this.seed(key,bytes);this.afterPut?.(key);
  }
}
