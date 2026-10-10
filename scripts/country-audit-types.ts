import type {Direction,Measure} from '../src/lib/trade/types';
export type CountryContext={countryCode:string;month:string;direction:Direction;kind:'total'|'products'};
export type CountryRow={code:string;description:string;valueUsd:number|null;special:boolean};
export type CountryPart=CountryContext & {measure:Measure;rows:CountryRow[]};
export type CountryRaw=CountryContext & {schemaVersion:1;requestUrl:string;retrievedAt:string;httpStatus:number;attempts:number;responseBody:string};
export type CountryFetchOptions=CountryContext & {apiKey:string;onRaw?:(raw:CountryRaw)=>Promise<void>};
