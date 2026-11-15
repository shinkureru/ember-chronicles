import type {TownFacilityId} from '../../game/types';
import type {TownDistrictId} from './townDistricts';

/** Locations normalized directly from the user's yellow-dot calibration
 * screenshots (727/721/719 × 1303). These screenshots are NEVER bundled.
 * Positions refer to the ORIGINAL 768x1376 art, with hotspots sharing the
 * same scale/translate as the full-bleed cover-fit image. */
export interface TownDistrictHotspot{
 facility:TownFacilityId;
 label:string;
 x:number;
 y:number;
 side:'left'|'right';
}
export const TOWN_DISTRICT_HOTSPOTS:Readonly<Record<TownDistrictId,readonly TownDistrictHotspot[]>>={
 'outer-ring':[
  {facility:'inn',label:'旅店',x:14.99,y:48.81,side:'right'},
 ],
 'steam-street':[
  {facility:'laundry',label:'公共澡堂',x:20.8,y:44.21,side:'right'},
  {facility:'canteen',label:'公共食堂',x:84.33,y:40.21,side:'left'},
 ],
 'old-core':[
  {facility:'workshop',label:'修理工坊',x:30.6,y:38.22,side:'right'},
  {facility:'clinic',label:'地下診所',x:17.8,y:55.1,side:'right'},
  {facility:'tavern',label:'情報酒館',x:88.73,y:44.67,side:'left'},
  {facility:'training',label:'訓練場',x:76.77,y:59.4,side:'left'},
 ],
};
export const getTownDistrictHotspots=(id:TownDistrictId)=>TOWN_DISTRICT_HOTSPOTS[id];
