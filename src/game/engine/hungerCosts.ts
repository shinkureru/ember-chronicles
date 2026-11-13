import {TOWN_SERVICES} from '../data/town';
import type {ActionChoice,GameState} from '../types';

/** v0.8.34: former fictional minutes are the source of an explicit hunger cost.
 * This rate is provisional balancing data; it never advances real Taipei time.
 * Hunger: 0 = fed, 100 = maximum starvation. Higher means worse.
 */
export const HUNGER_MAX=100;
export const HUNGER_COST_MINUTES_PER_POINT=20;
export const HUNGER_HIGH_THRESHOLD=70;
export const HUNGER_SEVERE_THRESHOLD=90;
export const HUNGER_DEFEAT_COST=hungerCostFromMinutes(120);
export const HUNGER_FIELD_GEAR_COST=hungerCostFromMinutes(2);
export const HUNGER_CLINIC_PURCHASE_COST=hungerCostFromMinutes(5);
export const HUNGER_QUEST_HANDIN_COST=hungerCostFromMinutes(10);
export function hungerCostFromMinutes(minutes:number):number{
 if(!Number.isFinite(minutes)||minutes<=0)return 0;
 return Math.ceil(minutes/HUNGER_COST_MINUTES_PER_POINT);
}
export function actionHungerCost(choice:Pick<ActionChoice,'id'|'minutes'>):number{
 // Ending a mission or entering a new screen is not physical exertion.
 if(choice.id==='loot_exit'||choice.id==='alley_loot_exit')return 0;
 return hungerCostFromMinutes(choice.minutes);
}
export function townServiceHungerCost(id:string):number{
 // Eating is already a recovery action: the existing meal always reduces hunger by 38.
 if(id==='hot_meal')return 0;
 return hungerCostFromMinutes(TOWN_SERVICES.find(service=>service.id===id)?.minutes??0);
}
export function projectedHunger(before:number,delta:number):number{
 return Math.max(0,Math.min(HUNGER_MAX,Math.round(before)+Math.round(delta)));
}
export function applyHungerCost(state:GameState,cost:number):void{
 state.player.hunger=projectedHunger(state.player.hunger,Math.max(0,cost));
}
export interface HungerProjection{
 hungerDelta:number;
 projectedHunger:number;
 appliedDelta:number;
}
export function hungerProjection(before:number,delta:number):HungerProjection{
 const after=projectedHunger(before,delta);
 return {hungerDelta:delta,projectedHunger:after,appliedDelta:after-before};
}
export function townHungerProjection(state:GameState,serviceId:string):HungerProjection{
 return hungerProjection(state.player.hunger,serviceId==='hot_meal'?-38:townServiceHungerCost(serviceId));
}
/** High hunger affects future attempts, not the successful action currently being resolved. */
export function hungerSuccessPenalty(hunger:number):number{
 return hunger>=100?16:hunger>=HUNGER_SEVERE_THRESHOLD?10:hunger>=HUNGER_HIGH_THRESHOLD?4:0;
}
export interface HungerRisk{title:string;detail:string;remedy:string}
export function hungerRisk(before:number,after:number):HungerRisk|null{
 if(after>=100)return {title:'飢餓已達上限 100',detail:'即將或已達重度飢餓上限；後續行動成功率將受到最嚴重的飢餓懲罰（−16）。',remedy:'先吃乾糧、罐頭或到食堂吃熱飯，降低飢餓。'};
 if(after>=HUNGER_SEVERE_THRESHOLD)return {title:before<90?'飢餓將突破 90':'重度飢餓持續中',detail:'飢餓達 90 後，下次行動與撤退的成功率將額外降低 10 個百分點。',remedy:'進食或補充熱飯可降低飢餓，並恢復成功率。'};
 if(after>=HUNGER_HIGH_THRESHOLD)return {title:before<70?'飢餓將達 70':'飢餓偏高',detail:'飢餓達 70 後，下次行動與撤退的成功率將降低 4 個百分點。',remedy:'食用乾糧、罐頭或熱飯補給後即可解除懲罰。'};
 return null;
}
export function signedHunger(delta:number):string{
 return delta>0?`+${delta}`:String(delta);
}
