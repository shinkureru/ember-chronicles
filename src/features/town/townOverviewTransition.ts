import type {TownDistrictId} from './townDistricts';
export const TOWN_OVERVIEW_TRANSITION_MS=900;
export const TOWN_OVERVIEW_ORDER:readonly TownDistrictId[]=['outer-ring','steam-street','old-core'] as const;
/** In tile heights: target enters center, other images exit away. */
export function getTownOverviewShiftRows(selectedIndex:number,tileIndex:number):number{
 if(!Number.isInteger(selectedIndex)||!Number.isInteger(tileIndex)
  ||selectedIndex<0||selectedIndex>=TOWN_OVERVIEW_ORDER.length
  ||tileIndex<0||tileIndex>=TOWN_OVERVIEW_ORDER.length)return 0;
 if(selectedIndex===tileIndex)return 1-tileIndex;
 return tileIndex<selectedIndex?-2.1:2.1;
}
