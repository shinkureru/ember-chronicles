import {describe,expect,it} from 'vitest';
import {getChoiceRailLayout,getChoiceClusterCount} from '../src/features/chapter/choiceRailLayout';
import {getVisibleActions} from '../src/game/engine/rules';
import {makeInitialState} from '../src/game/state/initial';
import type {ActionChoice} from '../src/game/types';
const options=(n:number)=>Array.from({length:n},(_,i)=>({id:'choice'+i,title:'選項'+i}) as ActionChoice);
describe('v1.0-b unlimited horizontal choice rail',()=>{
 it('holds any number of choices in two-option, non-overlapping vertical bands',()=>{
  for(const n of [1,2,3,4,5,6,10,17]){
   const positions=getChoiceRailLayout(options(n),'1:gate');
   expect(positions.length).toBe(n);
   expect(getChoiceClusterCount(n)).toBe(Math.ceil(n/2));
   positions.forEach((p,i)=>{
    expect(p.cluster).toBe(Math.floor(i/2));
    expect(p.x).toBeGreaterThanOrEqual(25);
    expect(p.x).toBeLessThanOrEqual(75);
    expect(p.y).toBeGreaterThanOrEqual(20);
    expect(p.y).toBeLessThanOrEqual(81);
   });
   for(let i=0;i<n-1;i+=2)expect(positions[i+1]!.y-positions[i]!.y).toBeGreaterThanOrEqual(45);
  }
 });
 it('keeps positions steady through render, changes them between attempts',()=>{
  const list=options(8);
  const once=getChoiceRailLayout(list,'attempt-1:inside');
  expect(getChoiceRailLayout(list,'attempt-1:inside')).toEqual(once);
  expect(getChoiceRailLayout(list,'attempt-2:inside')).not.toEqual(once);
 });
 it('actual story choices may exceed four without losing required progression paths',()=>{
  for(const scene of ['gate','survey','inside','confrontation','loot'] as const){
   const s=makeInitialState('journalist');s.mode='adventure';s.attempt=3;s.sceneId=scene;
   const actions=getVisibleActions(s);
   expect(actions.length).toBeGreaterThan(4);
   expect(new Set(actions.map(a=>a.id)).size).toBe(actions.length);
   if(scene==='gate')expect(actions.some(a=>a.id==='gate_observe')).toBe(true);
   if(scene==='confrontation')expect(actions.some(a=>a.id==='fight_talk')).toBe(true);
   if(scene==='loot')expect(actions.some(a=>a.id==='loot_exit')).toBe(true);
  }
 });
});