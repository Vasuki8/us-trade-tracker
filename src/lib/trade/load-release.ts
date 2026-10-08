import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {Release} from './types';
import {readCurrentRelease,validateRelease} from '../../../scripts/prepare-release';
export async function loadRelease():Promise<Release>{
  if(process.env.TRADE_DATA_MODE==='fixture'){
    const value:unknown=JSON.parse(await readFile(join(process.cwd(),'tests/fixtures/product-release.json'),'utf8'));
    validateRelease(value);if(value.source!=='fixture')throw new Error('Fixture mode requires fixture provenance');return value;
  }
  if(process.env.TRADE_DATA_MODE&&process.env.TRADE_DATA_MODE!=='census')throw new Error('Unknown TRADE_DATA_MODE');
  try{return await readCurrentRelease(join(process.cwd(),'data/processed'));}catch{throw new Error('No validated Census release. Import a release, or explicitly set TRADE_DATA_MODE=fixture for a labeled development preview.');}
}
