import { CARDS } from '../data/cards';
import { ITEMS } from '../data/items';
import { SCENES } from '../data/scenes';
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
export const worldClock=(minute:number)=>{
  const time=((minute%1440)+1440)%1440;
  return `${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')}`;
};
export const isSkillCompatible = (action:ActionChoice, card?:SkillCard):boolean =>
  !!card && action.tags.some(tag=>card.tags.includes(tag));

export const getVisibleActions = (state:GameState):ActionChoice[]=>{
  const scene=SCENES[state.sceneId];
  if(!scene)return [];
  return scene.actions.filter(action=>!action.requiresNotSearched||!state.searchedSources.includes(action.requiresNotSearched));
};
export const getSceneContent = (state:GameState):SceneDef => {
  const base=SCENES[state.sceneId] ?? SCENES.gate;
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
  return 0;
};
const attributeBonus=(state:GameState,tags:ActionTag[])=>{
  const attr=state.player.attributes;
  const relevant=tags.includes('run')?'mobility':tags.includes('talk')?'persuasion':tags.includes('search')||tags.includes('observe')?'observation':tags.includes('sneak')?'adaptability':tags.includes('fight')?'melee':'resilience';
  return Math.round((attr[relevant]-10)*0.8);
};
const adaptationKey=(tags:ActionTag[])=>
  tags.includes('talk')?'talk':tags.includes('sneak')?'sneak':tags.includes('run')?'run':tags.includes('fight')?'fight':'observe';
export const calculateActionPreview=(state:GameState,choice:ActionChoice,skillId:string|null):ActionPreview=>{
  const skill=skillId?CARDS[skillId]:undefined;
  const validSkill=skill&&isSkillCompatible(choice,skill)&&state.hand.includes(skill.id)&&state.player.resource>=skill.resourceCost?skill:undefined;
  const skillLevel=validSkill?(state.ownedCards[validSkill.id]?.level??1):1;
  const staminaCost=Math.max(0,choice.staminaCost-(validSkill?.staminaSaved??0)-(validSkill&&validSkill.staminaSaved?Math.floor((skillLevel-1)/2):0));
  const courageDelta=choice.courageDelta+(validSkill?.courageSaved??0)+(validSkill&&validSkill.courageSaved?Math.floor((skillLevel-1)/2):0);
  const projectedStamina=clamp(state.player.stamina-staminaCost,0,state.player.maxStamina);
  const projectedCourage=clamp(state.player.courage+courageDelta,0,100);
  const weight=bagWeight(state.bag);
  const overweightPenalty=choice.tags.some(t=>t==='run'||t==='sneak')?Math.max(0,Math.floor((weight-10)*3)):0;
  const npcPenalty=(state.npc.adaptations[adaptationKey(choice.tags)]??0);
  const tiredPenalty=state.player.fatigue>=70?7:state.player.fatigue>=50?3:0;
  const lowStaminaPenalty=state.player.stamina<staminaCost?24:0;
  const fearPenalty=state.player.courage<40 && choice.tags.some(t=>t==='talk'||t==='fight')?7:0;
  const clueBonus=Math.min(24,state.clues.length*5);
  const routeBonus=state.flags.includes('route_known')&&choice.tags.some(t=>t==='sneak'||t==='run')?8:0;
  const heardBonus=state.flags.includes('heard_steps')&&choice.tags.includes('talk')?8:0;
  const hostilityPenalty=choice.tags.includes('talk')?Math.max(0,Math.floor((state.npc.hostility-25)/8)):0;
  const chance=choice.baseChance===100?100:Math.round(clamp(
    choice.baseChance+specialtyBonus(state,choice.tags)+attributeBonus(state,choice.tags)+
    (validSkill?validSkill.chanceBonus+(skillLevel-1)*3:0)+clueBonus+state.insightBonus+routeBonus+heardBonus-
    npcPenalty-overweightPenalty-tiredPenalty-lowStaminaPenalty-hostilityPenalty-fearPenalty,
    5,95));
  const warnings:ActionPreview['warnings']=[];
  if(projectedCourage<40&&state.player.courage>=40)warnings.push({title:'膽量將跌破 40',detail:'可能進入「畏縮」狀態，面對威嚇類事件時較不利。',remedy:'可透過休息、情緒安撫或完成勇氣事件恢復。'});
  if(projectedStamina<=10&&state.player.stamina>10)warnings.push({title:'體力即將見底',detail:'後續逃跑及衝刺會較不容易成功。',remedy:'可返回安全地點休息或使用補給。'});
  if(state.player.fatigue>=70)warnings.push({title:'疲勞偏高',detail:'部分需要集中注意力的行動成功率降低。',remedy:'可以在安全地點休息。'});
  return {chance,staminaCost,courageDelta,minutes:choice.minutes,resourceCost:validSkill?.resourceCost??0,projectedStamina,projectedCourage,warnings};
};
export const bagWeight=(bag:Record<string,number>):number=>
  Object.entries(bag).reduce((total,[id,qty])=>total+(ITEMS[id]?.weight??0)*qty,0);
export const remainingWarehouseCapacity=(s:GameState)=>Math.max(0,s.warehouseCapacity-bagWeight(s.warehouse));
export const retreatPreview=(state:GameState)=>{
  const excess=Math.max(0,bagWeight(state.bag)-10);
  const lowStamina=state.player.stamina<25?16:0;
  const speed=state.profession==='courier'?12:0;
  const sceneRisk=state.sceneId==='confrontation'?18:state.sceneId==='loot'?5:0;
  const chance=Math.round(clamp(64+speed+Math.round((state.player.attributes.mobility-10)*0.8)-lowStamina-Math.ceil(excess*3)-sceneRisk+Math.min(8,state.clues.length*2),5,95));
  return {chance,staminaCost:6,courageLoss:state.sceneId==='gate'?6:3,minutes:8};
};
