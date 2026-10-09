import {useRef,useState} from 'react';

type Country={code:string;name:string};
export function CountryPicker({countries,selectedCodes,onChange,ready}:{countries:Country[];selectedCodes:string[];onChange:(codes:string[])=>void;ready:boolean}){
  const [query,setQuery]=useState('');const search=useRef<HTMLInputElement>(null);
  const term=query.trim().toLowerCase();
  const visible=countries.filter(country=>country.name.toLowerCase().includes(term)||country.code.includes(term));
  const selected=selectedCodes.flatMap(code=>{const country=countries.find(country=>country.code===code);return country?[country]:[];});
  const remove=(code:string)=>{onChange(selectedCodes.filter(selected=>selected!==code));search.current?.focus();};
  return <>
    <label className="country-search">Find a country<input ref={search} type="search" placeholder="Name or country code" value={query} disabled={!ready} onChange={event=>setQuery(event.target.value)}/></label>
    {query&&<button type="button" className="text-button" aria-label="Clear country search" disabled={!ready} onClick={()=>{setQuery('');search.current?.focus();}}>Clear search</button>}
    {selected.length>0&&<ul className="selected-countries" aria-label="Selected countries">{selected.map(country=><li key={country.code}><span>{country.name}</span><button type="button" className="text-button" aria-label={`Remove ${country.name}`} disabled={!ready} onClick={()=>remove(country.code)}>Remove</button></li>)}</ul>}
    <p className="country-results" role="status">Showing {visible.length} of {countries.length} countries.</p>
    {visible.length===0&&<p className="country-empty">No matching countries. Try a name or country code.</p>}
    <fieldset className="country-list"><legend className="sr-only">Partner countries</legend>{visible.map(country=><label key={country.code}><input type="checkbox" checked={selectedCodes.includes(country.code)} disabled={!ready||(selectedCodes.length===3&&!selectedCodes.includes(country.code))} onChange={event=>onChange(event.target.checked?[...selectedCodes,country.code]:selectedCodes.filter(code=>code!==country.code))}/><span>{country.name}</span></label>)}</fieldset>
    <p className="selection-count" role="status">{selectedCodes.length} of 3 selected</p>
    {selectedCodes.length>0&&<button type="button" className="text-button" disabled={!ready} onClick={()=>{onChange([]);search.current?.focus();}}>Show U.S. total</button>}
  </>;
}
