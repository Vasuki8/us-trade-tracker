import {useMemo} from 'react';
import {decodeBrowserRelease} from '../lib/trade/browser-release';
import {ProductExplorer} from './ProductExplorer';

export function ProductExplorerClient({data}:{data:string}){
  const release=useMemo(()=>decodeBrowserRelease(data),[data]);
  return <ProductExplorer release={release}/>;
}
