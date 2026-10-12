// Independent reader for testing the downloadable CSV, including embedded newlines.
export function parseCsv(text:string):Record<string,string>[] {
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(cell||row.length){row.push(cell);rows.push(row);}
  const headers=rows.shift()??[];
  return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]??''])));
}
