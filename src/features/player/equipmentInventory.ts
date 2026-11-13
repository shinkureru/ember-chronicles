import type {GameState} from '../../game/types';
import {EQUIPMENT_SLOTS,type EquipmentSlot} from '../../game/data/equipment';
import {ITEMS} from '../../game/data/items';
import {bagWeight} from '../../game/engine/rules';

/** Read-only combined inventory for the character equipment board.
 * Includes equipped items on migrated saves even when storage count is zero.
 * All EQUIP_ITEM decisions still go through the reducer.
 */
export function characterInventoryEntries(s:GameState){
 const ids=new Set([
  ...Object.keys(s.bag),...Object.keys(s.warehouse),
  ...Object.values(s.equipment).filter((id):id is string=>typeof id==='string'),
 ]);
 return [...ids].filter(id=>!!ITEMS[id]).map(id=>{
  const inBag=Math.max(0,s.bag[id]??0);
  const inWarehouse=Math.max(0,s.warehouse[id]??0);
  return {
   id,item:ITEMS[id]!,inBag,inWarehouse,
   quantity:inBag+inWarehouse,
   inUse:Object.values(s.equipment).includes(id),
   equippable:EQUIPMENT_SLOTS.some(slot=>slot.allowed.includes(id)),
  };
 }).filter(e=>e.quantity>0||e.inUse).sort((a,b)=>
  Number(b.inUse)-Number(a.inUse)||
  Number(b.equippable)-Number(a.equippable)||
  a.item.name.localeCompare(b.item.name,'zh-TW')
 );
}

export function canEquipInSlot(s:GameState,slot:EquipmentSlot,id:string):{allowed:boolean;reason:string}{
 if(s.mode!=='home')return {allowed:false,reason:'只能在避難所變更裝備'};
 const def=EQUIPMENT_SLOTS.find(s=>s.id===slot);
 const item=ITEMS[id];
 if(!def||!item)return {allowed:false,reason:'找不到對應裝備'};
 if(!def.allowed.includes(id))return {allowed:false,reason:'不適用於目前選取的部位'};
 if(s.equipment[slot]===id)return {allowed:false,reason:'此部位已穿戴'};
 if(Object.entries(s.equipment).some(([key,value])=>key!==slot&&value===id))
  return {allowed:false,reason:'物品已在其他部位使用'};
 const inBag=(s.bag[id]??0)>0,inWarehouse=(s.warehouse[id]??0)>0;
 if(!inBag&&!inWarehouse)return {allowed:false,reason:'背包與倉庫都沒有此物品'};
 if(!inBag&&bagWeight(s.bag)+item.weight>15)
  return {allowed:false,reason:'倉庫物品領到背包後將超過 15 kg 負重'};
 return {allowed:true,reason:'可裝備'};
}
