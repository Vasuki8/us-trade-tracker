import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {canadaReviewedPublications,type ReviewedPublication} from './country-publications';

/** Project the reviewed ledger; the optional diagnostic does not own its pins. */
export function projectCanadaPublications():{schemaVersion:1;countryCode:'1220';publications:ReviewedPublication[]}{
  return {schemaVersion:1,countryCode:'1220',publications:canadaReviewedPublications.map(pin=>({...pin}))};
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  process.stdout.write(`${JSON.stringify(projectCanadaPublications())}\n`);
}
