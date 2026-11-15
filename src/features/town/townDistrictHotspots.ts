import type {TownFacilityId} from '../../game/types';
import type {TownDistrictId} from './townDistricts';

/** Percentages refer to each full 768x1376 image, never to a cropped "cover" box.
 * Approximate art-directed access points. The accessible list below the scene
 * is authoritative and remains operable when markers overlap on small screens.
 */
export interface TownDistrictHotspot{
 facility:TownFacilityId;
 label:string;
 x:number;
 y:number;
 side:'left'|'right';
}
export const TOWN_DISTRICT_HOTSPOTS:Readonly<Record<TownDistrictId,readonly TownDistrictHotspot[]>>={
 'outer-ring':[
  {facility:'inn',label:'旅店',x:24,y:38,side:'right'},
  {facility:'noticeboard',label:'公告欄',x:65,y:74,side:'left'},
 ],
 'steam-street':[
  {facility:'laundry',label:'公共澡堂',x:24,y:32,side:'right'},
  {facility:'canteen',label:'公共食堂',x:76,y:37,side:'left'},
 ],
 'old-core':[
  {facility:'workshop',label:'修理工坊',x:36,y:22,side:'right'},
  {facility:'clinic',label:'地下診所',x:25,y:59,side:'right'},
  {facility:'tavern',label:'情報酒館',x:76,y:36,side:'left'},
  {facility:'training',label:'訓練場',x:76,y:63,side:'left'},
 ],
};
export const getTownDistrictHotspots=(id:TownDistrictId)=>TOWN_DISTRICT_HOTSPOTS[id];
