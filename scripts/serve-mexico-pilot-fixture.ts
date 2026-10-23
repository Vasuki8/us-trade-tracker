import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveMexicoProfileFixture} from './serve-mexico-profile-fixture';
export async function serveMexicoPilotFixture():Promise<void>{await serveMexicoProfileFixture({presentation:'pilot'});}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))serveMexicoPilotFixture().catch(()=>{console.error('Mexico pilot fixture preview failed');process.exitCode=1;});
