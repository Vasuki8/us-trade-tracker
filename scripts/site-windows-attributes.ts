import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {join} from 'node:path';

// One hidden, read-only Windows helper. Paths are JSON data on stdin, never shell code.
const command = String.raw`
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
while ($null -ne ($line = [Console]::In.ReadLine())) {
  try {
    $paths = ConvertFrom-Json -InputObject $line
    $values = @($paths | ForEach-Object { [int][System.IO.File]::GetAttributes([string]$_) })
    [Console]::Out.WriteLine((ConvertTo-Json -InputObject @($values) -Compress))
  } catch { [Console]::Out.WriteLine('null') }
}
`;
type Pending={paths:string[];resolve:(values:number[])=>void;reject:(error:Error)=>void;timer:NodeJS.Timeout};
type RefStream={ref?:()=>void;unref?:()=>void};
let service:ReturnType<typeof start>|undefined;
function start(){
 const child=spawn(join(process.env.SystemRoot??'C:\\Windows','System32/WindowsPowerShell/v1.0/powershell.exe'),['-NoLogo','-NoProfile','-NonInteractive','-Command',command],{windowsHide:true,stdio:['pipe','pipe','pipe']});
 const pending:Pending[]=[];let closed=false;
 const refs=(active:boolean)=>{active?child.ref():child.unref();for(const stream of [child.stdin,child.stdout,child.stderr]){const ref=stream as unknown as RefStream;active?ref.ref?.():ref.unref?.();}};
 const kill=()=>child.kill();
 const fail=()=>{
  if(closed)return;closed=true;if(service?.child===child)service=undefined;
  for(const p of pending.splice(0)){clearTimeout(p.timer);p.reject(Error('site-windows-attributes-unavailable'));}
  child.kill();process.removeListener('exit',kill);
 };
 process.once('exit',kill);child.on('error',fail);child.on('exit',fail);child.stderr.resume();
 createInterface({input:child.stdout}).on('line',line=>{
  try{
   const p=pending[0],values:unknown=JSON.parse(line);
   if(!p||!Array.isArray(values)||values.length!==p.paths.length||values.some(v=>!Number.isInteger(v)||v<0))return fail();
   pending.shift();clearTimeout(p.timer);p.resolve(values as number[]);if(!pending.length)refs(false);
  }catch{fail();}
 });
 refs(false);
 return {child,query(paths:string[]):Promise<number[]>{
  if(closed)return Promise.reject(Error('site-windows-attributes-unavailable'));
  refs(true);
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(fail,10_000);pending.push({paths,resolve,reject,timer});
   child.stdin.write(JSON.stringify(paths)+'\n',error=>{if(error)fail();});
  });
 }};
}
export async function windowsAttributes(paths:string[]):Promise<number[]>{
 if(process.platform!=='win32')throw Error('site-windows-attributes-platform');
 service??=start();return service.query(paths);
}
