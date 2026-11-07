import { describe, expect, it } from 'vitest';
import { getChoicePositions, getRiskHintIndex } from '../src/features/chapter/choiceLayout';
import type { ActionChoice, ActionPreview } from '../src/game/types';

const action=(id:string)=>({id,title:id} as ActionChoice);
const preview=(chance:number,staminaCost=0,warnings:ActionPreview['warnings']=[]):ActionPreview=>({
  chance,staminaCost,warnings,courageDelta:0,minutes:5,resourceCost:0,projectedStamina:60,projectedCourage:60,
});
describe('v0.6 scattered action selection',()=>{
  it('is stable during render but changes when a different attempt is entered',()=>{
    const actions=[action('a'),action('b'),action('c')];
    const one=getChoicePositions(actions,'attempt:1:gate');
    expect(getChoicePositions(actions,'attempt:1:gate')).toEqual(one);
    const two=getChoicePositions(actions,'attempt:2:gate');
    expect(two).not.toEqual(one);
  });
  it('distributes three choices across three safe and non-overlapping zones',()=>{
    const positions=getChoicePositions([action('a'),action('b'),action('c')],'gate:4');
    expect(new Set(positions.map(p=>`${p.x},${p.y}`)).size).toBe(3);
    for(const p of positions){
      expect(p.x).toBeGreaterThanOrEqual(20);
      expect(p.x).toBeLessThanOrEqual(80);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(100);
      expect(p.angle).toBeGreaterThanOrEqual(-9);
      expect(p.angle).toBeLessThanOrEqual(9);
    }
  });
  it('warns only about the riskiest known action, not a hidden future outcome',()=>{
    const dangerous=preview(45,10,[{title:'低體力',detail:'',remedy:''}]);
    expect(getRiskHintIndex([preview(83),dangerous,preview(70,2)])).toBe(1);
    expect(getRiskHintIndex([preview(80)])).toBe(-1);
  });
});
