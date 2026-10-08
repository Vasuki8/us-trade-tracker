import { describe, expect, it } from 'vitest';
import imports from '../fixtures/census-imports.json';
import exports from '../fixtures/census-exports.json';
import { normalizeCensusResponse } from '../../src/lib/trade/normalize';

const change = (column: string, value: string) => {
  const payload = structuredClone(imports);
  payload[1][payload[0].indexOf(column)] = value;
  return payload;
};
describe('Census observations', () => {
  it('preserves leading zeros and separates world from countries and groupings', () => {
    const rows = normalizeCensusResponse(imports, 'imports');
    expect(rows[0].productCode).toBe('090121');
    expect(rows.find(r => r.geography === 'world')?.valueUsd).toBe(1000);
    expect(rows.filter(r => r.geography === 'country').map(r => r.valueUsd)).toEqual([600, 400]);
    expect(rows).toHaveLength(3);
  });
  it('uses total exports rather than the import measure', () => {
    expect(normalizeCensusResponse(exports, 'exports')[0]).toMatchObject({ measure: 'ALL_VAL_MO', valueUsd: 800 });
    expect(() => normalizeCensusResponse(exports, 'imports')).toThrow();
  });
  it.each([['', null, 'missing'], ['null', null, 'missing'], ['0', 0, 'reported']])('preserves %s value status', (raw, value, status) => {
    expect(normalizeCensusResponse(change('GEN_VAL_MO', raw as string), 'imports')[0]).toMatchObject({valueUsd: value, status});
  });
  it.each([['GEN_VAL_MO', '9007199254740992'], ['GEN_VAL_MO', 'NaN'], ['GEN_VAL_MO', '-1'], ['GEN_VAL_MO', '1.2'], ['time', '2026-13'], ['I_COMMODITY', '0901210000'], ['COMM_LVL', 'HS10']])('rejects invalid %s=%s', (field, value) => {
    expect(() => normalizeCensusResponse(change(field, value), 'imports')).toThrow();
  });
  it('rejects duplicate observations rather than summing them', () => {
    expect(() => normalizeCensusResponse([...imports, imports[1]], 'imports')).toThrow(/duplicate/i);
  });
  it('rejects incomplete rows and duplicate headers', () => {
    expect(() => normalizeCensusResponse([imports[0], ['CANADA']], 'imports')).toThrow();
    expect(() => normalizeCensusResponse([['time', 'time'], ['2026-06', '2026-06']], 'imports')).toThrow();
  });
});
