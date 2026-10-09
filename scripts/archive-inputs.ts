import {validMonth} from '../src/lib/trade/normalize';
export function parseArchiveDispatch(env:NodeJS.ProcessEnv):{reportingMonth:string;archive:boolean;initialize:boolean;includeDuties:boolean}{
  const bool=(value:string|undefined)=>{if(value!==undefined&&value!=='true'&&value!=='false')throw new Error('Invalid archive boolean input');return value==='true';};
  const reportingMonth=env.REPORTING_MONTH;const archive=bool(env.ARCHIVE_TO_R2),initialize=bool(env.INITIALIZE_ARCHIVE);
  if(!validMonth(reportingMonth)||initialize&&!archive||archive&&env.GITHUB_REF!=='refs/heads/main')throw new Error('Invalid archive dispatch month, branch or initialization');
  return {reportingMonth,archive,initialize,includeDuties:bool(env.INCLUDE_DUTIES)};
}
