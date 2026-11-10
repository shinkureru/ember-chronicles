import type { ActionChoice } from '../../game/types';

export type ChoiceGroupId='attack'|'talk'|'search'|'movement'|'observation'|'survival';
export interface ChoiceGroup {id:ChoiceGroupId;title:string;actions:ActionChoice[];}
const TITLES:Record<ChoiceGroupId,string>={
 attack:'攻擊取向',talk:'交涉取向',search:'搜尋調查',movement:'移動與潛行',observation:'觀察分析',survival:'生存應對',
};
/** Classify choices by their actual gameplay tags, keeping each original action exactly once.
 * No rule or success rate changes: this is presentation-only grouping.
 */
export const groupChoices=(actions:ActionChoice[]):ChoiceGroup[]=>{
 const groups=new Map<ChoiceGroupId,ChoiceGroup>();
 for(const action of actions){
  const tags=action.tags;
  const id:ChoiceGroupId=action.attackCardId||tags.includes('fight')?'attack'
   :tags.includes('talk')?'talk'
   :tags.includes('search')?'search'
   :tags.includes('sneak')||tags.includes('run')?'movement'
   :tags.includes('observe')?'observation':'survival';
  const group=groups.get(id)??{id,title:TITLES[id],actions:[]};
  group.actions.push(action);groups.set(id,group);
 }
 return Array.from(groups.values());
};
