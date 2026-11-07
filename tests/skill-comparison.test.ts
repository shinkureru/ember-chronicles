import {describe,it,expect} from 'vitest';
import {makeInitialState} from '../src/game/state/initial';
import {getSkillComparison} from '../src/game/engine/skillComparison';
import {SCENES} from '../src/game/data/scenes';

const pickByTag=(tag:string)=>SCENES.survey.actions.find(a=>a.tags.includes(tag as typeof a.tags[number]))!;

describe('v0.5 skill-attachment comparison',()=>{
  it('uses the exact existing preview rules for both cards',()=>{
    const state=makeInitialState('courier');
    state.hand=['route'];
    const result=getSkillComparison(state,pickByTag('run'),'route');
    expect(result.original.resourceCost).toBe(0);
    expect(result.enhanced.resourceCost).toBe(2);
    expect(result.resourceAfter).toBe(4);
    expect(result.enhanced.staminaCost).toBeLessThanOrEqual(result.original.staminaCost);
    expect(result.metrics.find(x=>x.key==='resource')?.result).toBe('worse');
  });
  it('never falsely boosts a card when the skill is unavailable',()=>{
    const state=makeInitialState('courier');
    state.hand=[];
    const result=getSkillComparison(state,pickByTag('run'),'route');
    expect(result.enhanced).toEqual(result.original);
    expect(result.metrics.every(x=>x.result==='same')).toBe(true);
  });
  it('keeps resource preview stable with no skill attached',()=>{
    const state=makeInitialState('courier');
    const result=getSkillComparison(state,pickByTag('run'),null);
    expect(result.resourceBefore).toBe(state.player.resource);
    expect(result.resourceAfter).toBe(state.player.resource);
  });
});
