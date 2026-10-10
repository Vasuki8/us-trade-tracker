// Reviewed FT900 calendar snapshot. Only verified publication dates belong here.
export const CENSUS_RELEASE_CALENDAR={
  sourceUrl:'https://www.census.gov/foreign-trade/schedule.html',
  checkedOn:'2026-10-10',
  entries:[
    {reportingMonth:'2026-09',publishesAt:'2026-11-04T08:30:00-05:00'},
    {reportingMonth:'2026-10',publishesAt:'2026-12-08T08:30:00-05:00'},
    {reportingMonth:'2026-11',publishesAt:'2027-01-07T08:30:00-05:00'},
  ],
} as const;

export function nextScheduledRelease(asOf:Date){
  const timestamp=asOf.getTime();
  if(!Number.isFinite(timestamp))throw new Error('Invalid schedule evaluation date');
  return CENSUS_RELEASE_CALENDAR.entries.find(entry=>Date.parse(entry.publishesAt)>timestamp)??null;
}
