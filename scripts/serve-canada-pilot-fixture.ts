import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveCanadaPilotFixture} from './serve-canada-preview-fixture';
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  serveCanadaPilotFixture().catch(()=>{console.error('Canada pilot fixture failed');process.exitCode=1;});
}
