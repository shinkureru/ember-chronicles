import { CARDS } from '../data/cards';
import { townAbsoluteMinute } from '../data/town';
import { getPeacefulResolutionCap } from './encounterBalance';
import { ITEMS } from '../data/items';
import { SCENES } from '../data/scenes';
import { ALLEY_SCENES, getAlleySceneActions } from '../data/chapters/ch01-alley/scenes';
import { getSceneVariation } from '../data/chapters/ch01-warehouse/sceneVariants';
import { remainingSearches } from './lootLimits';
import {activeEnemyInsight} from './encounterAccess';
import { createAttackChoice, attackStatus, getAttackDamage } from '../data/attacks';
import type { ActionChoice, ActionPreview, ActionTag, GameState, SceneDef, SkillCard } from '../types';

export const clamp = (value:number, min:number, max:number) => Math.max(min,Math.min(max,value));
export const worldPhase = (minute:number): string => {
  const hour=Math.floor(((minute%1440)+1440)%1440/60);
  if(hour>=5&&hour<11)return '早上';
  if(hour>=11&&hour<14)return '中午';
  if(hour>=14&&hour<18)return '下午';
  if(hour>=18&&hour<23)return '晚上';
  return '深夜';
};
/** Five supported day phases; the visuals remain dark even in daylight. */
export const worldPhaseToken=(minute:number):'morning'|'noon'|'afternoon'|'evening'|'late-night'=> {
  const hour=Math.floor((((minute%1440)+1440)%1440)/60);
  if(hour>=5&&hour<11)return 'morning';
  if(hour>=11&&hour<14)return 'noon';
  if(hour>=14&&hour<18)return 'afternoon';
  if(hour>=18&&hour<23)return 'evening';
  return 'late-night';
};
export const worldClock=(minute:number)=>{
  const time=((minute%1440)+1440)%1440;
  return `${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')}`;
};
export const isSkillCompatible = (action:ActionChoice, card?:SkillCard):boolean =>
  !!card && action.tags.some(tag=>card.tags.includes(tag));

export const getVisibleActions = (state:GameState):ActionChoice[]=>{
  const scene=(state.stageId===2?ALLEY_SCENES:SCENES)[state.sceneId];
  if(!scene)return [];
  const story=(state.stageId===2?getAlleySceneActions(state):getSceneVariation(state)).filter(action=>(!action.lootSource||remainingSearches(state,action.lootSource)>0)&&!(state.flags.includes('negotiation_rejected')&&state.sceneId==='confrontation'&&action.tags.includes('talk')&&action.successScene==='loot'));
  if(state.sceneId!=='confrontation'||state.mode!=='adventure'||state.enemy.health<=0)return story;
  const attacks=state.attackDeck.map(id=>createAttackChoice(state,id)).filter((a):a is ActionChoice=>a!==null);
  return [...story,...attacks];
};
export const getSceneContent = (state:GameState):SceneDef => {
  const base=(state.stageId===2?ALLEY_SCENES:SCENES)[state.sceneId] ?? SCENES.gate;
  if(state.stageId===2){
    const npc=state.alleyNpc;
    if(state.sceneId==='gate'&&(npc?.met??0)>1){
      const prior=npc?.remembers.includes('alley_spotted')?'「你上次沿著水管偷偷摸過去，我都看見了。別再耍那一套。」':
       npc?.remembers.includes('alley_retreat')?'「又回來了？你上次跑得可真快。」':
       '「又是你？上次問過的事情，我已經回答得夠多了。」';
      return {...base,npcText:prior,narration:`這是我第 ${npc?.met??1} 次來到那條後巷。我知道某段圍牆有視線死角，可這次對方也記住我的腳步聲。`};
    }
    if(state.sceneId==='inside'&&npc?.remembers.includes('alley_victory')){
      return {...base,npcText:'「你上次把證物帶走了。這回還打算拿走什麼？」'};
    }
    if(state.sceneId==='confrontation'&&npc?.remembers.includes('alley_spotted')){
      return {...base,npcText:'「那天我明明看到你。你還敢回來？」'};
    }
    return base;
  }
  if(state.sceneId==='gate' && state.npc.met>1){
    const last=state.npc.remembers.includes('bluff_exposed')
      ? '「你上次那套虛張聲勢我可還記得。這次少耍花樣。」'
      : state.npc.remembers.includes('caught_sneaking')
      ? '「又來了？上次還想從側門溜進去，別以為我沒看到。」'
      : '「又是你？我記得你上次來過。今天到底想做什麼？」';
    return {...base, npcText:last, narration:`這是我第 ${state.npc.met} 次來到這裡。對方似乎還記得以前發生的事，但我也比上次更清楚這個地方的狀況。`};
  }
  if(state.sceneId==='inside' && state.searchedSources.length>0)
    return {...base,narration:'我已經找到一些東西。外面的聲音愈來愈清楚……要繼續搜查，還是趕快處理眼前的事？'};
  if(state.sceneId==='confrontation' && state.npc.remembers.includes('bluff_exposed'))
    return {...base,npcText:'「上次你說有後援，結果只是唬我。現在還想騙我？」'};
  return base;
};
const specialtyBonus=(state:GameState,tags:ActionTag[]) => {
  if(state.profession==='journalist'&&tags.some(t=>t==='talk'||t==='observe'||t==='search'))return 6;
  if(state.profession==='courier'&&tags.some(t=>t==='run'||t==='sneak'))return 8;
  if(state.profession==='infiltrator'&&tags.includes('sneak'))return 11;
  if(state.profession==='infiltrator'&&tags.includes('observe'))return 4;
  return 0;
};
const attributeBonus=(state:GameState,tags:ActionTag[])=>{
  const attr=state.player.attributes;
  const relevant=tags.includes('run')?'mobility':tags.includes('talk')?'persuasion':tags.includes('search')||tags.includes('observe')?'observation':tags.includes('sneak')?'adaptability':tags.includes('fight')?'melee':'resilience';
  return Math.round(attr[relevant]*0.8);
};
const adaptationKey=(tags:ActionTag[])=>
  tags.includes('talk')?'talk':tags.includes('sneak')?'sneak':tags.includes('run')?'run':tags.includes('fight')?'fight':'observe';
export const calculateActionPreview=(state:GameState,choice:ActionChoice,skillId:string|null):ActionPreview=>{
  const skill=skillId?CARDS[skillId]:undefined;
  const validSkill=skill&&isSkillCompatible(choice,skill)&&state.hand.includes(skill.id)&&state.player.resource>=skill.resourceCost?skill:undefined;
  const skillLevel=validSkill?(state.ownedCards[validSkill.id]?.level??1):1;
  // Story/action cards were authored against an 80-point stamina pool. Convert
  // after the skill discount so 10-point characters retain several meaningful turns.
  const originalCost=Math.max(0,choice.staminaCost-(validSkill?.staminaSaved??0)-(validSkill&&validSkill.staminaSaved?Math.floor((skillLevel-1)/2):0));
  const staminaCost=Math.ceil(originalCost/8);
  const courageDelta=choice.courageDelta+(validSkill?.courageSaved??0)+(validSkill&&validSkill.courageSaved?Math.floor((skillLevel-1)/2):0);
  const projectedStamina=clamp(state.player.stamina-staminaCost,0,state.player.maxStamina);
  const projectedCourage=clamp(state.player.courage+courageDelta,0,100);
  const weight=bagWeight(state.bag);
  const overweightPenalty=choice.tags.some(t=>t==='run'||t==='sneak')?Math.max(0,Math.floor((weight-10)*3)):0;
  const currentNpc=state.stageId===2?(state.alleyNpc??state.npc):state.npc;
  const npcPenalty=(currentNpc.adaptations[adaptationKey(choice.tags)]??0);
  const tiredPenalty=state.player.fatigue>=70?7:state.player.fatigue>=50?3:0;
  const lowStaminaPenalty=state.player.stamina<staminaCost?24:0;
  const fearPenalty=state.player.courage<40 && choice.tags.some(t=>t==='talk'||t==='fight')?7:0;
  // Failed-encounter reflections must not provide permanent cross-NPC chance boosts.
  const clueBonus=Math.min(24,state.clues.filter(clue=>!clue.includes('失敗反思')).length*5);
  const groomedBonus=choice.tags.includes('talk')&&(state.town?.socialPoiseUntil??0)>townAbsoluteMinute(state)?5:0;
  const routeBonus=state.flags.includes('route_known')&&choice.tags.some(t=>t==='sneak'||t==='run')?8:0;
  const heardBonus=state.flags.includes('heard_steps')&&choice.tags.includes('talk')?8:0;
  const hostilityPenalty=choice.tags.includes('talk')?Math.max(0,Math.floor((currentNpc.hostility-25)/8)):0;
  const weaponAvailable=!choice.attackCardId||attackStatus(state,choice.attackCardId).inBag;
  const rawChance=!weaponAvailable?0:choice.baseChance===100?100:Math.round(clamp(
    choice.baseChance+specialtyBonus(state,choice.tags)+attributeBonus(state,choice.tags)+
    (validSkill?validSkill.chanceBonus+(skillLevel-1)*3:0)+clueBonus+activeEnemyInsight(state)+routeBonus+heardBonus-
    npcPenalty-overweightPenalty-tiredPenalty-lowStaminaPenalty-hostilityPenalty-fearPenalty+groomedBonus,
    5,95));
  const crisisCap=getPeacefulResolutionCap(state,choice);
  const chance=crisisCap===null?rawChance:Math.min(rawChance,crisisCap);
  const warnings:ActionPreview['warnings']=[];
  if(!weaponAvailable)warnings.push({title:'缺少所需武器',detail:'對應物品尚未放進背包，無法使用這張攻擊牌。',remedy:'可在關卡內取得武器，或回據點從倉庫備妥。'});
  if(projectedCourage<40&&state.player.courage>=40)warnings.push({title:'膽量將跌破 40',detail:'可能進入「畏縮」狀態，面對威嚇類事件時較不利。',remedy:'可透過休息、情緒安撫或完成勇氣事件恢復。'});
  if(projectedStamina<=Math.ceil(state.player.maxStamina*.2)&&state.player.stamina>Math.ceil(state.player.maxStamina*.2))warnings.push({title:'體力即將見底',detail:'後續逃跑及衝刺會較不容易成功。',remedy:'可返回安全地點休息或使用補給。'});
  if(state.player.fatigue>=70)warnings.push({title:'疲勞偏高',detail:'部分需要集中注意力的行動成功率降低。',remedy:'可以在安全地點休息。'});
  return {chance,staminaCost,courageDelta,minutes:choice.minutes,resourceCost:validSkill?.resourceCost??0,projectedStamina,projectedCourage,warnings,
    damage:choice.attackCardId&&weaponAvailable?getAttackDamage(state,choice.attackCardId):undefined,
    attackAvailable:weaponAvailable};
};
export const bagWeight=(bag:Record<string,number>):number=>
  Object.entries(bag).reduce((total,[id,qty])=>total+(ITEMS[id]?.weight??0)*qty,0);
export const remainingWarehouseCapacity=(s:GameState)=>Math.max(0,s.warehouseCapacity-bagWeight(s.warehouse));
export const retreatPreview=(state:GameState)=>{
  const excess=Math.max(0,bagWeight(state.bag)-10);
  const lowStamina=state.player.stamina<Math.ceil(state.player.maxStamina*.3)?16:0;
  const speed=state.profession==='courier'?12:state.profession==='infiltrator'?8:0;
  const sceneRisk=state.sceneId==='confrontation'?18:state.sceneId==='loot'?5:0;
  const chance=Math.round(clamp(64+speed+Math.round(state.player.attributes.mobility*0.8)-lowStamina-Math.ceil(excess*3)-sceneRisk+Math.min(8,state.clues.length*2),5,95));
  return {chance,staminaCost:1,courageLoss:state.sceneId==='gate'?6:3,minutes:8};
};
