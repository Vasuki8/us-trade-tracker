import type {Month,ValueStatus} from './types';
export type DutyMoney={valueUsd:number|null;status:ValueStatus};
export type DutyObservation={
  productCode:string;month:Month;geography:'world'|'country';partnerCode:string;partnerName:string;
  calculatedDuty:DutyMoney;consumptionValue:DutyMoney;dutiableValue:DutyMoney;
  coverage:{status:'verified'|'unavailable';uncalculatedDutiableValueUsd:number|null};
};
export type DutyDataset={schemaVersion:1;fromMonth:Month;observations:DutyObservation[];revisedKeys:string[]};
export type DutyPeriod={
  from:Month;to:Month;calculatedDutyUsd:number|null;consumptionValueUsd:number|null;dutiableValueUsd:number|null;dutySharePercent:number|null;
  statuses:{calculatedDuty:ValueStatus;consumptionValue:ValueStatus;dutiableValue:ValueStatus};
  complete:boolean;classificationCompatible:boolean;
  coverage:{status:'verified'|'unavailable';affectedDutiableValueUsd:number|null;affectedSharePercent:number|null;qualified:boolean};
};
export type DutyChange={comparable:boolean;calculatedDutyUsd:number|null;growthPercent:number|null;dutySharePercentagePoints:number|null};
export type DutyComparison={current:DutyPeriod;previous:DutyPeriod;change:DutyChange};
export type DutySeries={code:string;name:string;monthly:DutyPeriod[];latest:DutyComparison;rolling:DutyComparison};
export type DutyView={
  productCode:string;title:string;reportingMonth:Month;fromMonth:Month|null;available:boolean;series:DutySeries[];
  provenance:{source:'census'|'fixture';retrievedAt:string;codeVersion:string;sourceUrls:string[];revised:boolean};
};
export type DutySummary='HS'|'HSCY'|'HSRP'|'HSCYRP';
export type DutyRawPart={summary:DutySummary;httpStatus:200|204;payload:unknown;requestUrl:string;retrievedAt:string};
export type DutyAuditReport={
  schemaVersion:1;productCode:'090121';fromMonth:Month;toMonth:Month;retrievedAt:string;codeVersion:string;sourceUrls:string[];eligibleForRelease:boolean;
  rawFiles:{path:string;bytes:number;sha256:string}[];
  months:{month:Month;worldAvailable:boolean;countryCount:number;unavailableCountryCoverage:number;countryReconciliation:'verified'|'mismatch'|'unavailable';uncalculatedDutiableValueUsd:number|null;error?:string}[];
};
