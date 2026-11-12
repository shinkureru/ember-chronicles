import type {GameState,TownProgress} from '../types';

/** Defensive slots only. Hands/legacy tools, weapons, utilities and jewelry cannot be hit. */
export const ARMOR_SLOTS=['head','body','arms','legs'] as const;
export type ArmorSlot=typeof ARMOR_SLOTS[number];
export const ARMOR_SLOT_NAMES:Record<ArmorSlot,string>={head:'頭部',body:'身體',arms:'手臂',legs:'腿部'};
export const ARMOR_HIT_WEIGHTS:Record<ArmorSlot,number>={head:20,body:40,arms:20,legs:20};
export type ArmorDamageStage='intact'|'light'|'moderate'|'severe';
export const ARMOR_DAMAGE_STAGES:Record<ArmorDamageStage,string>={
 intact:'正常',light:'輕微損壞',moderate:'中度損壞',severe:'嚴重損壞'
};
export const ARMOR_STAGE_MULTIPLIER:Record<ArmorDamageStage,number>={
 intact:1,light:.85,moderate:.65,severe:.35
};
const REPAIR_BASE:Record<ArmorSlot,{light:number;moderate:number;severe:number}>={
 head:{light:8,moderate:18,severe:34},
 body:{light:10,moderate:22,severe:40},
 arms:{light:7,moderate:16,severe:30},
 legs:{light:7,moderate:16,severe:30},
};
export const PERFECT_REPAIR_CHANCE=.25;
export const PERFECT_REPAIR_DEFENSE=1;

/** Upgrade compatibility: the old hand slot has been migrated to arms. */
export const equippedArmorEntries=(s:GameState):{slot:ArmorSlot;itemId:string}[]=>
 ARMOR_SLOTS.flatMap(slot=>{
  const itemId=s.equipment[slot];
  return itemId?[{slot,itemId}]:[];
 });

/** Old saves had wear percentage but no armor hit history. Approximate conservatively. */
export const armorHitsFromWear=(wear:number):number=>
 Math.max(0,Math.min(10,Math.round((100-Math.max(15,Math.min(100,wear)))/7)));
export const armorHits=(s:GameState,id:string):number=>
 Math.max(0,Math.min(10,s.town?.armorHits?.[id]??armorHitsFromWear(s.town?.wear[id]??100)));
export const armorStage=(hits:number):ArmorDamageStage=>
 hits>=10?'severe':hits>=5?'moderate':hits>=3?'light':'intact';
export const armorDurability=(s:GameState,id:string):number=>
 Math.max(0,Math.min(100,s.town?.wear[id]??Math.max(30,100-armorHits(s,id)*7)));

export const armorSlotForItem=(s:GameState,id:string):ArmorSlot|null=>{
 const entry=equippedArmorEntries(s).find(x=>x.itemId===id);
 return entry?.slot??null;
};

/** Fee rises within a damage tier; one/two impacts are cheap to repair. */
export const armorRepairFee=(s:GameState,id:string):number=>{
 const slot=armorSlotForItem(s,id);if(!slot)return 0;
 const hits=armorHits(s,id),stage=armorStage(hits);
 const wear=armorDurability(s,id);
 if(hits<=0&&wear>=100)return 0;
 if(stage==='intact')return Math.max(3,4+hits*2);
 const base=REPAIR_BASE[slot][stage];
 const extra=stage==='light'?Math.max(0,hits-3)*2:stage==='moderate'?Math.max(0,hits-5)*2:0;
 return base+extra;
};

export interface ArmorImpact {
 slot:ArmorSlot;itemId:string;hits:number;durability:number;stage:ArmorDamageStage;changedStage:boolean;
}

/** Called once per real hit with positive HP loss. 100% chance to target ONE worn
 * defensive part; none is damaged when no protection is equipped. */
export const applyArmorImpact=(s:GameState,random:()=>number):ArmorImpact|null=>{
 const candidates=equippedArmorEntries(s);
 if(!candidates.length)return null;
 const total=candidates.reduce((sum,x)=>sum+ARMOR_HIT_WEIGHTS[x.slot],0);
 let index=Math.min(.999999999,Math.max(0,random()))*total;
 const selected=candidates.find(x=>(index-=ARMOR_HIT_WEIGHTS[x.slot])<0)??candidates[candidates.length-1]!;
 const id=selected.itemId,previous=armorHits(s,id),hits=Math.min(10,previous+1);
 if(!s.town)throw Error('Town progress must be initialized before armor impact');
 s.town.armorHits??={};
 s.town.armorHits[id]=hits;
 // 3 / 5 / 10 hits = 79 / 65 / 30 durability.
 s.town.wear[id]=Math.max(30,100-hits*7);
 const stage=armorStage(hits);
 return {slot:selected.slot,itemId:id,hits,durability:s.town.wear[id],stage,changedStage:stage!==armorStage(previous)};
};

/** Finish repairing from a damaged state. Once the very next mission ends, this
 * rare buff stops applying. Its chance is deterministic using the saved seed. */
export const completeArmorRepair=(s:GameState,id:string):boolean=>{
 if(!s.town)throw Error('Town progress required');
 s.town.armorHits??={};s.town.armorHits[id]=0;s.town.wear[id]=100;
 s.town.perfectRepairs??={};
 s.rngSeed=(Math.imul(1664525,s.rngSeed)+1013904223)>>>0;
 const perfect=s.rngSeed/4294967296<PERFECT_REPAIR_CHANCE;
 if(perfect)s.town.perfectRepairs[id]={bonus:PERFECT_REPAIR_DEFENSE,expiresAfterAttempt:s.attempt+1};
 else delete s.town.perfectRepairs[id];
 return perfect;
};
export const perfectRepairActive=(s:GameState,id:string):boolean=>{
 const value=s.town?.perfectRepairs?.[id];
 return !!value&&value.bonus>0&&s.attempt<=value.expiresAfterAttempt;
};
/** Clean expired bonuses at mission start, or after the mission result. */
export const expirePerfectRepairs=(s:GameState)=>{
 const values=s.town?.perfectRepairs;
 if(!values)return;
 for(const [id,buff] of Object.entries(values))if(s.attempt>buff.expiresAfterAttempt)delete values[id];
};
export const ensureArmorTownFields=(town:TownProgress)=>{
 town.armorHits??={};town.perfectRepairs??={};
};
