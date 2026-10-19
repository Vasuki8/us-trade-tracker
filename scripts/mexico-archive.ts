import {fileURLToPath} from 'node:url';
import {runMexicoArchiveCli} from '../src/lib/mexico-country-archive/cli.server';
const root=fileURLToPath(new URL('../',import.meta.url));
try{const result=await runMexicoArchiveCli(process.argv.slice(2),root);process.stdout.write(JSON.stringify(result)+'\n');}catch{process.stderr.write('Mexico private archive operation failed; inspect its bounded private/public outcome receipt.\n');process.exitCode=1;}
