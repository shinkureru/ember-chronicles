import {clamp} from './rules';
import type {GameState} from '../types';
export const CONSUMABLE_IDS=['biscuit','canned','water','firstaid','bandage','sterile_bandage','antiseptic_kit','antidote_injector','pain_relief'] as const;
export type ConsumableId=typeof CONSUMABLE_IDS[number];
export const isConsumable=(id:string):id is ConsumableId=>(CONSUMABLE_IDS as readonly string[]).includes(id);

/** Exactly the same effect preview is used for the inventory UI and reducer commit. */
export const previewConsumable=(s:GameState,id:string)=>{
 if(!isConsumable(id))return null;
 const p={...s.player};
 const c={wounds:0,infection:0,poisoning:0,illness:0,...s.conditions};
 const before={health:p.health,stamina:p.stamina,hunger:p.hunger,fatigue:p.fatigue,...c};
 if(id==='biscuit'||id==='canned'){p.hunger=clamp(p.hunger-20,0,100);p.stamina=clamp(p.stamina+1,0,p.maxStamina);}
 if(id==='water')p.stamina=clamp(p.stamina+2,0,p.maxStamina);
 if(id==='firstaid'){p.health=clamp(p.health+5,0,p.maxHealth);c.wounds=Math.max(0,c.wounds-1);}
 if(id==='bandage'){p.health=clamp(p.health+2,0,p.maxHealth);c.wounds=Math.max(0,c.wounds-1);}
 if(id==='sterile_bandage'){p.health=clamp(p.health+4,0,p.maxHealth);c.wounds=Math.max(0,c.wounds-2);}
 if(id==='antiseptic_kit'){p.health=clamp(p.health+3,0,p.maxHealth);c.infection=Math.max(0,c.infection-2);}
 if(id==='antidote_injector'){p.stamina=clamp(p.stamina+2,0,p.maxStamina);c.poisoning=Math.max(0,c.poisoning-2);}
 if(id==='pain_relief'){p.health=clamp(p.health+3,0,p.maxHealth);p.fatigue=clamp(p.fatigue-4,0,100);}
 const changes:{label:string;amount:number}[]=[];
 const after={health:p.health,stamina:p.stamina,hunger:p.hunger,fatigue:p.fatigue,...c};
 const names:Record<keyof typeof before,string>={health:'生命',stamina:'體力',hunger:'飢餓',fatigue:'疲勞',wounds:'外傷',infection:'感染',poisoning:'中毒',illness:'疾病'};
 for(const key of Object.keys(before) as (keyof typeof before)[]){
  const value=after[key]-before[key];
  if(value!==0)changes.push({label:names[key],amount:value});
 }
 return {player:p,conditions:c,changes,canUse:changes.length>0};
};
