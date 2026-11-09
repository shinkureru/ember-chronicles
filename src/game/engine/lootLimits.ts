import { INITIAL_NPC_GEAR } from '../data/items';
import type { GameState } from '../types';

/** Limits belong to a specific attempt. The NPC's equipment is persistent across attempts. */
export const LOOT_LIMITS:Record<string,number>={desk:3,shelves:3,pockets:3,npcGear:3};
export const remainingSearches=(s:GameState,source:string):number=>{
  const consumed=s.lootSearches?.[source]??0;
  const allowance=Math.max(0,(LOOT_LIMITS[source]??1)-consumed);
  if(source==='npcGear')return Math.min(allowance,INITIAL_NPC_GEAR.filter(id=>!s.npc.stolenGear.includes(id)).length);
  return allowance;
};
export const hasSearchedBefore=(s:GameState,source:string)=> (s.lootSearches?.[source]??0)>0;
