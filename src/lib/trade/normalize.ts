import type { Direction, Observation } from './types';

export function validMonth(month: unknown): month is string {
  return typeof month === 'string' && /^(20\d{2})-(0[1-9]|1[0-2])$/.test(month);
}
export function observationKey(row: Observation): string {
  return [row.direction, row.productCode, row.month, row.geography, row.partnerCode, row.measure].join('/');
}
export function normalizeCensusResponse(payload: unknown, direction: Direction): Observation[] {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) throw new Error('Invalid Census response');
  const [headers, ...rows] = payload as unknown[][];
  if (headers.some(h => typeof h !== 'string') || new Set(headers).size !== headers.length) throw new Error('Invalid headers');
  const commodity = direction === 'imports' ? 'I_COMMODITY' : 'E_COMMODITY';
  const measure = direction === 'imports' ? 'GEN_VAL_MO' : 'ALL_VAL_MO';
  for (const field of [commodity, `${commodity}_LDESC`, measure, 'CTY_CODE', 'CTY_NAME', 'time', 'COMM_LVL', 'SUMMARY_LVL', 'SUMMARY_LVL2']) {
    if (!headers.includes(field)) throw new Error(`Missing field ${field}`);
  }
  const observations: Observation[] = [];
  const seen = new Set<string>();
  for (const cells of rows) {
    if (!Array.isArray(cells) || cells.length !== headers.length) throw new Error('Incomplete row');
    const row = Object.fromEntries(headers.map((h, index) => [h, cells[index]]));
    if (row.SUMMARY_LVL === 'CGP') continue;
    if (!['HS', 'HSCY'].includes(String(row.SUMMARY_LVL2))) continue;
    if (['DISTRICT', 'RP', 'DF', 'CTY_SUBCODE'].some(h => h in row && row[h] !== '-')) continue;
    if (row.SUMMARY_LVL !== 'DET' || row.COMM_LVL !== 'HS6' || !/^\d{6}$/.test(String(row[commodity])) || !validMonth(row.time)) throw new Error('Invalid HS6 dimensions');
    const partner = String(row.CTY_CODE);
    if (partner !== '-' && !/^[1-9]\d{3}$/.test(partner)) throw new Error('Invalid country code');
    if ((partner === '-' ? 'HS' : 'HSCY') !== row.SUMMARY_LVL2) throw new Error('Wrong country aggregation');
    const raw = row[measure];
    const missing = raw === null || raw === '' || raw === 'null';
    // Unknown markers stop publication; do not invent a meaning or coerce to zero.
    if (!missing && (typeof raw !== 'string' || !/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)))) throw new Error('Invalid dollar value');
    if (typeof row[`${commodity}_LDESC`] !== 'string' || typeof row.CTY_NAME !== 'string') throw new Error('Invalid description');
    const observation: Observation = {
      productCode: String(row[commodity]), description: String(row[`${commodity}_LDESC`]), direction,
      month: String(row.time), partnerCode: partner, partnerName: String(row.CTY_NAME),
      geography: partner === '-' ? 'world' : 'country', measure,
      valueUsd: missing ? null : Number(raw), status: missing ? 'missing' : 'reported',
    };
    const key = observationKey(observation);
    if (seen.has(key)) throw new Error('Duplicate observation');
    seen.add(key);
    observations.push(observation);
  }
  if (!observations.some(r => r.geography === 'world')) throw new Error('Missing world observations');
  return observations;
}
