const timestampFormatter=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'UTC'});
export const countryTimestampLabel=(timestamp:string):string=>`${timestampFormatter.format(new Date(timestamp))} UTC`;
