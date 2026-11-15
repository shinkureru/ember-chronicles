import type {TownDistrictId} from './townDistricts';
export type SceneLightTone='cyan'|'amber'|'violet';
export interface TownSceneLight{
 x:number;y:number;size:number;tone:SceneLightTone;delay:number;duration:number;
}
/** Low-cost localized radial-gradient light layers, not new image assets.
 * These locations track visible lamps/advertising/building accents. */
export const TOWN_DISTRICT_LIGHTS:Readonly<Record<TownDistrictId,readonly TownSceneLight[]>>={
 'outer-ring':[
  {x:12,y:46,size:17,tone:'amber',delay:1.2,duration:5.9},
  {x:18,y:57,size:13,tone:'violet',delay:2.8,duration:8.4},
  {x:11,y:66,size:15,tone:'amber',delay:4.3,duration:7.5},
  {x:81,y:63,size:18,tone:'cyan',delay:2.4,duration:6.7},
  {x:92,y:52,size:13,tone:'cyan',delay:6.2,duration:9.1},
  {x:62,y:28,size:11,tone:'cyan',delay:3.6,duration:9.7},
  {x:29,y:46,size:9,tone:'violet',delay:5.1,duration:7.1},
 ],
 'steam-street':[
  {x:20,y:43,size:19,tone:'amber',delay:1.7,duration:6.4},
  {x:17,y:56,size:14,tone:'cyan',delay:2.9,duration:7.2},
  {x:84,y:39,size:24,tone:'amber',delay:5.4,duration:9.5},
  {x:72,y:49,size:17,tone:'amber',delay:2.1,duration:7.7},
  {x:51,y:33,size:19,tone:'cyan',delay:3.6,duration:8.6},
  {x:32,y:80,size:13,tone:'cyan',delay:4.7,duration:9.3},
  {x:77,y:78,size:14,tone:'amber',delay:1.5,duration:8.1},
  {x:14,y:27,size:12,tone:'violet',delay:2.3,duration:6.8},
 ],
 'old-core':[
  {x:31,y:38,size:19,tone:'amber',delay:3.4,duration:5.9},
  {x:18,y:55,size:17,tone:'cyan',delay:4.8,duration:7.5},
  {x:89,y:45,size:18,tone:'cyan',delay:2.5,duration:8.2},
  {x:77,y:59,size:20,tone:'cyan',delay:6.1,duration:9.3},
  {x:24,y:42,size:13,tone:'amber',delay:1.3,duration:7.8},
  {x:62,y:63,size:18,tone:'cyan',delay:2.8,duration:10.4},
  {x:13,y:27,size:12,tone:'violet',delay:3.5,duration:9.8},
  {x:72,y:41,size:16,tone:'amber',delay:6.4,duration:8.8},
 ],
};
