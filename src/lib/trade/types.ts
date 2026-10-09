export type Direction = 'imports' | 'exports';
export type Month = string;
export type Measure = 'GEN_VAL_MO' | 'ALL_VAL_MO';
export type ValueStatus = 'reported' | 'missing' | 'suppressed';
export type Observation = {
  productCode: string; description: string; direction: Direction; month: Month;
  partnerCode: string; partnerName: string; geography: 'world' | 'country';
  measure: Measure; valueUsd: number | null; status: ValueStatus;
};
export type Comparison = {current: number | null; previous: number | null; changeUsd: number | null; changePercent: number | null};
export type ReleaseV1 = {
  schemaVersion: 1; productCode: string; reportingMonth: Month; retrievedAt: string;
  codeVersion: string; source: 'census' | 'fixture'; sourceUrls: string[];
  observations: Observation[]; revisedKeys: string[];
  classificationIntervals: {from: Month; to: Month; evidenceUrl: string}[];
};
export type ReleaseV2 = Omit<ReleaseV1,'schemaVersion'> & {schemaVersion:2;duties:DutyDataset};
export type Release = ReleaseV1 | ReleaseV2;
export type ComparisonPeriod = 'annual' | 'monthly';
export type ExplorerSelection = {direction: Direction; months: 12 | 60; countryCodes: string[]; comparisonPeriod?: ComparisonPeriod};
export type ChartSeries = {code: string; name: string; points: {month: Month; valueUsd: number | null; breakBefore: boolean; classificationVerified: boolean}[]};
export type ProfileView = {
  productCode: string; title: string; selection: ExplorerSelection; reportingMonth: Month;
  latestMonth: Comparison; trailingYear: Comparison;
  partners: {code: string; name: string; valueUsd: number | null; sharePercent: number | null}[];
  series: ChartSeries[];
  provenance: {source: Release['source']; measure: Measure; retrievedAt: string; codeVersion: string; sourceUrls: string[]; revised: boolean};
};
import type {DutyDataset} from './duty-types';
