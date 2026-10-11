import {execFileSync} from 'node:child_process';
import {resolveCountryAuditOptions} from './audit-country';
import {runCountryPartitionProbe} from './diagnose-country';
try {
 const options=resolveCountryAuditOptions(process.argv.slice(2),process.env);
 const report=await runCountryPartitionProbe({...options,codeVersion:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()});
 console.log(`Canada import partition probe: ${report.results.length} logical checks, ${report.events.length} attempts; ${report.probePassed?'passed':'failed'}. Coverage and classification remain unverified; no release accepted.`);
 if(!report.probePassed)process.exitCode=1;
} catch {
 console.error('Canada import partition probe failed; inspect retained evidence.');process.exitCode=1;
}
