import type {GameState} from '../types';
import {TOWN_SERVICES} from '../data/town';
import {ITEMS} from '../data/items';
import {bagWeight,clamp} from './rules';

export interface ClinicProgress {
 favor:number;acceptedDay:number;completedDay:number;purchases:Record<string,number>;
}
export const CLINIC_SUPPLIES=[
 {id:'sterile_bandage',price:44,limit:2,summary:'無菌敷料；生命 +4、外傷 −2'},
 {id:'antiseptic_kit',price:67,limit:2,summary:'抗感染組合；生命 +3、感染 −2'},
 {id:'antidote_injector',price:79,limit:1,summary:'緊急解毒針；中毒 −2、體力 +2'},
 {id:'pain_relief',price:49,limit:2,summary:'鎮痛藥盒；生命 +3、疲勞 −4'},
] as const;
export type ClinicItemId=typeof CLINIC_SUPPLIES[number]['id'];
export const CLINIC_DAILY_QUESTS=[
 {id:'water',title:'傷患飲水',detail:'交給護理站 1 瓶密封飲水，協助照顧病房裡的傷員。',coins:22,favor:2,quantity:1},
 {id:'bandage',title:'清創敷料補給',detail:'提供 1 份普通繃帶，讓診所可以替新傷患包紮。',coins:23,favor:2,quantity:1},
 {id:'firstaid',title:'夜間醫療物資',detail:'提供 1 份簡易急救包，支援值夜醫師處理緊急病例。',coins:55,favor:3,quantity:1},
] as const;
export const getClinicQuest=(s:GameState)=>CLINIC_DAILY_QUESTS[(s.world.day-1)%CLINIC_DAILY_QUESTS.length]!;
export const getClinicProgress=(s:GameState):ClinicProgress=>s.town?.clinic??{favor:0,acceptedDay:0,completedDay:0,purchases:{}};
export const ensureClinicProgress=(s:GameState):ClinicProgress=>{
 if(!s.town)throw Error('Town is not initialized');
 return s.town.clinic??(s.town.clinic={favor:0,acceptedDay:0,completedDay:0,purchases:{}});
};
export const clinicUnitPrice=(s:GameState,id:string)=>{
 const item=CLINIC_SUPPLIES.find(x=>x.id===id);
 if(!item)return 0;
 return Math.max(1,Math.round(item.price*(1-Math.min(15,getClinicProgress(s).favor)*.01)));
};
export const clinicBuyBlock=(s:GameState,id:string):string|null=>{
 const item=CLINIC_SUPPLIES.find(x=>x.id===id);
 if(!item)return '診所沒有販售此物品';
 if(s.mode!=='home')return '任務中無法向診所購買';
 const p=getClinicProgress(s);
 if((p.purchases[`${s.world.day}:${id}`]??0)>=item.limit)return '今天這項物品已售完';
 if(s.economy.coins<clinicUnitPrice(s,id))return '舊幣不足';
 if(bagWeight(s.bag)+(ITEMS[id]?.weight??0)>15)return '背包容量不足';
 return null;
};
export const clinicQuestBlock=(s:GameState,complete:boolean):string|null=>{
 if(s.mode!=='home')return '請先回城鎮';
 const p=getClinicProgress(s),q=getClinicQuest(s);
 if(p.completedDay===s.world.day)return '今天已完成診所委託';
 if(!complete)return p.acceptedDay===s.world.day?'今日委託已承接':null;
 if(p.acceptedDay!==s.world.day)return '必須先承接委託';
 const stock=(s.bag[q.id]??0)+(s.warehouse[q.id]??0);
 return stock>=q.quantity?null:`缺少 ${ITEMS[q.id]?.name??q.id} ${q.quantity-stock} 件`;
};
export const CLINIC_TREATMENTS=['clinic_general','clinic_wounds','clinic_infection','clinic_poison','clinic_illness'] as const;
export const clinicTreatmentPreview=(s:GameState,id:string)=>{
 const p=s.player,c=s.conditions??{wounds:0,infection:0,poisoning:0,illness:0};
 const fee=TOWN_SERVICES.find(x=>x.id===id)?.coins??0;
 const health=id==='clinic_general'?Math.min(3,p.maxHealth-p.health):
  id==='clinic_wounds'?Math.min(4,p.maxHealth-p.health):
  id==='clinic_infection'?Math.min(2,p.maxHealth-p.health):0;
 const stamina=id==='clinic_poison'?Math.min(2,p.maxStamina-p.stamina):0;
 const fatigue=id==='clinic_illness'?-Math.min(12,p.fatigue):0;
 const wounds=id==='clinic_wounds'?-Math.min(2,c.wounds):0;
 const infection=id==='clinic_infection'?-Math.min(2,c.infection):0;
 const poisoning=id==='clinic_poison'?-Math.min(2,c.poisoning):0;
 const illness=id==='clinic_illness'?-Math.min(2,c.illness):0;
 return {fee,health,stamina,fatigue,wounds,infection,poisoning,illness,
  resultingHealth:clamp(p.health+health,0,p.maxHealth),resultingStamina:clamp(p.stamina+stamina,0,p.maxStamina)};
};
