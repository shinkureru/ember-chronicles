/** UI comparison derives both snapshots from the same rule engine used by CHOOSE. */
import type { ActionChoice, GameState } from '../types';
import { calculateActionPreview, clamp } from './rules';

export interface SkillComparisonMetric {
  key: string;
  label: string;
  before: number;
  after: number;
  suffix: string;
  /** up/down denotes favorable/unfavorable change, not the arithmetic sign. */
  result: 'better' | 'worse' | 'same';
}

export const getSkillComparison = (state:GameState, action:ActionChoice, skillId:string|null) => {
  const original = calculateActionPreview(state,action,null);
  const enhanced = calculateActionPreview(state,action,skillId);
  const resource = (cost:number) => clamp(state.player.resource-cost,0,state.player.maxResource);
  const item = (key:string,label:string,before:number,after:number,suffix:string,higherIsBetter:boolean):SkillComparisonMetric => ({
    key,label,before,after,suffix,
    result:before===after?'same':(after>before)===higherIsBetter?'better':'worse',
  });
  return {
    original,
    enhanced,
    resourceBefore:state.player.resource,
    resourceAfter:resource(enhanced.resourceCost),
    metrics:[
      item('chance','成功率',original.chance,enhanced.chance,'%',true),
      item('stamina','體力消耗',original.staminaCost,enhanced.staminaCost,'',false),
      item('courage','膽量變化',original.courageDelta,enhanced.courageDelta,'',true),
      item('time','時間消耗',original.minutes,enhanced.minutes,' 分',false),
      item('resource','剩餘資源',resource(original.resourceCost),resource(enhanced.resourceCost),'',true),
    ],
  };
};
