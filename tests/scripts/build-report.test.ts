import {afterEach,expect,it} from 'vitest';
import {mkdtemp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {measureBuild,planningWarning,reportBuild} from '../../scripts/build-report';

const directories:string[]=[];
afterEach(async()=>{for(const directory of directories.splice(0))await rm(directory,{recursive:true,force:true});});
async function temporaryDirectory(){
  const parent=join(process.cwd(),'.tmp');await mkdir(parent,{recursive:true});
  const directory=await mkdtemp(join(parent,'build-report-test-'));directories.push(directory);return directory;
}

it('counts nested and hidden files with exact bytes and the largest relative path',async()=>{
  const directory=await temporaryDirectory();await mkdir(join(directory,'assets'));
  await writeFile(join(directory,'index.html'),'hello');
  await writeFile(join(directory,'assets','chart.js'),'abcdefghijkl');
  await writeFile(join(directory,'assets','empty.js'),'');
  await writeFile(join(directory,'.hidden'),'ab');
  expect(await measureBuild(directory)).toEqual({fileCount:4,totalBytes:19,largestFile:{path:'assets/chart.js',bytes:12}});
});

it.each([{files:14999,warns:false},{files:15000,warns:true},{files:15001,warns:true}])(
  'warns at the planning boundary for $files files without rejecting the build',({files,warns})=>{
    const warning=planningWarning({fileCount:files,totalBytes:0,largestFile:null});
    expect(warning!==null).toBe(warns);
    if(warns)expect(warning).toContain('20,000');
  }
);

it('writes the measured report to logs and the Actions summary without adding deployment files',async()=>{
  const directory=await temporaryDirectory();const output=join(directory,'output');await mkdir(output);
  await writeFile(join(output,'index.html'),'123456789');
  const summary=join(directory,'step-summary.md');const lines:string[]=[];
  const result=await reportBuild(output,{info:message=>lines.push(message),warn:message=>lines.push(message)},summary);
  expect(result).toEqual({fileCount:1,totalBytes:9,largestFile:{path:'index.html',bytes:9}});
  expect(lines.join('\n')).toContain('Files: 1');
  expect(lines.join('\n')).toContain('9 bytes');
  expect(lines.join('\n')).toContain('index.html');
  const content=await readFile(summary,'utf8');
  expect(content).toContain('index.html');expect(content).toContain('9 bytes');
  expect(await measureBuild(output)).toEqual({fileCount:1,totalBytes:9,largestFile:{path:'index.html',bytes:9}});
});

it('reports an empty output honestly and rejects a missing output directory',async()=>{
  const directory=await temporaryDirectory();
  expect(await measureBuild(directory)).toEqual({fileCount:0,totalBytes:0,largestFile:null});
  await expect(measureBuild(join(directory,'missing'))).rejects.toThrow();
});
