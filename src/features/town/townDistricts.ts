import type {TownFacilityId} from '../../game/types';

export type TownDistrictId='outer-ring'|'steam-street'|'old-core';
export interface TownDistrict{
 id:TownDistrictId;number:string;title:string;english:string;tagline:string;
 summary:string;facilities:readonly TownFacilityId[];facilityNames:readonly string[];
 image:string;lighting:'cool'|'warm'|'industrial';
}
export const CITY_OVERVIEW_IMAGE='assets/town/city-overview.webp';
export const TOWN_DISTRICTS:readonly TownDistrict[]=[
 {
  id:'outer-ring',number:'01',title:'外環高架區',english:'OUTER RING',
  tagline:'在城市邊緣，找一處可以撐過今晚的地方。',
  summary:'客棧／旅店，以及暫時封閉的高架設施。',
  facilities:['inn'],facilityNames:['客棧／旅店','尚未開放'],
  image:'assets/town/outer-ring.webp',lighting:'cool'
 },
 {
  id:'steam-street',number:'02',title:'蒸霧商街',english:'STEAM STREET',
  tagline:'有人煮食，有人洗去一整天的塵埃。',
  summary:'恢復體力、進食與整理儀容的生活街區。',
  facilities:['laundry','canteen'],facilityNames:['公共澡堂','公共食堂'],
  image:'assets/town/steam-street.webp',lighting:'warm'
 },
 {
  id:'old-core',number:'03',title:'舊城核心',english:'OLD CITY CORE',
  tagline:'維修的火光、地下診所，和不能公開的情報。',
  summary:'醫療、修理、情報與訓練集中於城區深處。原城市公告欄委託已搬入情報酒館。',
  facilities:['clinic','workshop','tavern','training'],facilityNames:['地下診所','修理工坊','情報酒館','訓練場'],
  image:'assets/town/old-core.webp',lighting:'industrial'
 }
] as const;
export const isTownDistrictId=(id:string):id is TownDistrictId=>TOWN_DISTRICTS.some(d=>d.id===id);
export const getTownDistrict=(id:string):TownDistrict|undefined=>TOWN_DISTRICTS.find(d=>d.id===id);
export const townAsset=(path:string)=>`${import.meta.env.BASE_URL}${path}`;
