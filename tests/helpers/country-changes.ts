import type {Release} from '../../src/lib/trade/types';
import {buildChangesView,buildMonthlyChangesView,type CountryChangesViews} from '../../src/lib/trade/changes';

export function makeCountryChangesData(release:Release):string{
  const views:CountryChangesViews={
    rolling:{imports:buildChangesView(release,'imports'),exports:buildChangesView(release,'exports')},
    monthly:{imports:buildMonthlyChangesView(release,'imports'),exports:buildMonthlyChangesView(release,'exports')},
  };
  return JSON.stringify(views);
}
