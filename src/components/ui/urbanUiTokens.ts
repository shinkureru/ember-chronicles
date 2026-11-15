/** Visual-only v0.8.44 library. These are not item drops, card rarities,
 * merchant price tiers or a new persisted gameplay schema.
 */
export const URBAN_RARITIES=[
 {id:'gray',label:'一般',english:'COMMON',description:'磨損的銀灰金屬'},
 {id:'green',label:'精良',english:'UNCOMMON',description:'低飽和礦物綠'},
 {id:'blue',label:'稀有',english:'RARE',description:'冷藍金屬光澤'},
 {id:'purple',label:'禁忌',english:'FORBIDDEN',description:'極少量流動微光'},
 {id:'gold',label:'傳說（預留）',english:'RESERVED',description:'只有視覺提案，未有實際掉落規則'},
] as const;
export type UrbanRarity=typeof URBAN_RARITIES[number]['id'];

export const URBAN_FRAME_LEVELS=[
 {id:'primary',label:'主框',description:'關鍵選單與最重要的視窗'},
 {id:'secondary',label:'次框',description:'一般資訊卡及商品群組'},
 {id:'light',label:'輕框',description:'次要標記、補充資訊與工具列'},
] as const;
export type UrbanFrameLevel=typeof URBAN_FRAME_LEVELS[number]['id'];
export type UrbanMeterTone='health'|'stamina'|'neutral';

/** Saturated UI only. Never silently clamp the displayed real stat text. */
export function meterPercent(value:number,max:number):number{
 if(!Number.isFinite(value)||!Number.isFinite(max)||max<=0)return 0;
 return Math.max(0,Math.min(100,Math.round(value/max*10000)/100));
}
export const safeMeterValue=(value:number)=>Number.isFinite(value)?Math.max(0,Math.round(value)):0;
