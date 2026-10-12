import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
import {readSnapshotFile,snapshotObject,snapshotUsd} from '../../../scripts/country-snapshot-input';
import {canadaPreviewContract as contract} from './contract.server';
import {projectRetainedAssessment} from './project.server';
import type {CountryPreview,CountryPreviewMode} from './types';

export function resolveCanadaPreviewMode(value:string|undefined):CountryPreviewMode {
  if(value===undefined)return null;
  if(value==='fixture'||value==='retained')return value;
  throw new Error('Invalid Canada preview mode');
}
export function validateFixturePreview(value:unknown):CountryPreview {
  const data=snapshotObject(value);
  const require=(ok:boolean)=>{if(!ok)throw new Error('Invalid synthetic Canada preview');};
  require(data.schemaVersion===1&&data.countryCode==='1220'&&data.countryName==='Canada'&&data.source==='fixture'&&data.rawVerification==='synthetic'&&data.processingVersion==='synthetic-fixture-v1');
  const preview=data as unknown as CountryPreview;
  require(preview.reporting.from==='2024-09'&&preview.reporting.to==='2026-08'&&preview.reporting.latest==='2026-08');
  require(Object.values(preview.availability).length===3&&Object.values(preview.availability).every(v=>v===false));
  require(Number.isFinite(Date.parse(preview.captureInterval.startedAt))&&Number.isFinite(Date.parse(preview.captureInterval.finishedAt)));
  const finite=(v:unknown):void=>{if(typeof v==='number')require(Number.isFinite(v));else if(v&&typeof v==='object')Object.values(v).forEach(finite);};finite(preview);
  for(const direction of ['imports','exports'] as const){
    const view=preview.directions[direction];require(view.direction===direction&&view.measure===(direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO'));
    require(view.monthly.length===24&&view.products.length===10);
    view.monthly.forEach((point,i)=>{require(point.month===contract.months[i]&&point.originalSource===null);if(point.valueUsd!==null)snapshotUsd(point.valueUsd);});
    for(const period of [view.summary.current,view.summary.prior]){require(period.reportedMonths>=0&&period.reportedMonths<=12);if(period.totalUsd!==null)snapshotUsd(period.totalUsd);}
    if(view.summary.latestUsd!==null)snapshotUsd(view.summary.latestUsd);
    view.products.forEach((p,i)=>{
      require(p.code===contract.candidates[direction][i]);
      for(const period of [p.current,p.prior]){if(period.observedSumUsd!==null)snapshotUsd(period.observedSumUsd);if(period.countryTotalUsd!==null)snapshotUsd(period.countryTotalUsd);require(period.reportedMonths>=0&&period.reportedMonths<=12);}
      require(p.current.from==='2025-09'&&p.current.to==='2026-08'&&p.prior.from==='2024-09'&&p.prior.to==='2025-08');
      if(p.specialByPolicy)require(!p.comparisonEligible&&p.changeUsd===null&&p.growthPercent===null&&p.sharePointChange===null&&p.current.sharePercent===null&&p.prior.sharePercent===null);
    });
    require(view.references.before.source===null&&view.references.after.source===null);
    require(view.references.differences.every(row=>row.publicationSource===null));
  }
  return preview;
}
export async function loadCanadaPreview(options:{workspaceRoot?:string;modeValue?:string}={}):Promise<CountryPreview|null> {
  const mode=resolveCanadaPreviewMode(Object.hasOwn(options,'modeValue')?options.modeValue:process.env.CANADA_PREVIEW_MODE);
  if(mode===null)return null;
  const root=options.workspaceRoot??process.cwd();
  if(mode==='fixture')return validateFixturePreview(JSON.parse(await readFile(resolve(root,'tests/fixtures/canada-preview.json'),'utf8')));
  try {
    const identity=contract.assessment;
    if(identity.bytes>contract.inputLimit)throw new Error('input-size-limit');
    const body=await readSnapshotFile(root,identity);
    return projectRetainedAssessment(JSON.parse(body.toString('utf8')));
  } catch {throw new Error('Canada preview assessment unavailable or invalid');}
}
