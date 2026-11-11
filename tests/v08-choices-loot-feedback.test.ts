import { describe, expect, it } from 'vitest';
import { makeInitialState } from '../src/game/state/initial';
import { gameReducer } from '../src/game/engine/resolve';
import { getVisibleActions, calculateActionPreview } from '../src/game/engine/rules';
import { remainingSearches } from '../src/game/engine/lootLimits';
import { majorStateChanges } from '../src/components/GameFeedback';

describe('v0.8 encounter variation without dead ends',()=>{
 it('changes the opening choices when the player re-enters while retaining the observation route',()=>{
  const ids:string[]=[];
  for(let attempt=1;attempt<=8;attempt++){
   const state=makeInitialState('journalist');state.mode='adventure';state.sceneId='gate';state.attempt=attempt;
   const actions=getVisibleActions(state);
   expect(actions.some(a=>a.id==='gate_observe')).toBe(true);
   expect(actions.every(a=>a.thought.length>0)).toBe(true);
   expect(new Set(actions.map(a=>a.id)).size).toBe(actions.length);
   ids.push(actions.map(a=>a.id).join(','));
  }
  expect(new Set(ids).size).toBeGreaterThanOrEqual(4);
 });
 it('keeps confrontation viable and loot exit always present',()=>{
  for(let attempt=1;attempt<=7;attempt++){
   const s=makeInitialState('journalist');s.mode='adventure';s.attempt=attempt;
   s.sceneId='confrontation';
   expect(getVisibleActions(s).some(a=>a.id==='fight_talk')).toBe(true);
   s.sceneId='loot';s.flags.push('won_by_combat');s.enemy.health=0;
   expect(getVisibleActions(s).some(a=>a.id==='loot_exit')).toBe(true);
  }
 });
 it('uses the unchanged preview engine for all new narrative choices',()=>{
  const s=makeInitialState('journalist');s.mode='adventure';s.sceneId='gate';s.attempt=3;
  for(const a of getVisibleActions(s)){
   const preview=calculateActionPreview(s,a,null);
   expect(preview.chance).toBeGreaterThanOrEqual(0);
   expect(preview.chance).toBeLessThanOrEqual(100);
   expect(preview.staminaCost).toBeGreaterThanOrEqual(0);
  }
 });
});
describe('v0.8 limited repeatable scavenging',()=>{
 it('lets the player search the same pockets three times, then removes the action',()=>{
  let s=makeInitialState('journalist');s.mode='adventure';s.attempt=1;s.sceneId='loot';s.flags.push('won_by_combat');s.enemy.health=0;
  expect(remainingSearches(s,'pockets')).toBe(3);
  for(let i=0;i<3;i++){
   expect(getVisibleActions(s).some(a=>a.id==='loot_pockets')).toBe(true);
   s=gameReducer(s,{type:'CHOOSE',choiceId:'loot_pockets',skillId:null});
   expect(remainingSearches(s,'pockets')).toBe(2-i);
   expect(s.lootSearches.pockets).toBe(i+1);
  }
  expect(getVisibleActions(s).some(a=>a.id==='loot_pockets')).toBe(false);
  expect(getVisibleActions(s).some(a=>a.id==='loot_exit')).toBe(true);
 });
 it('keeps persistent NPC gear distinct from each attempt’s search allowances',()=>{
  let s=makeInitialState('journalist');s.mode='adventure';s.attempt=1;s.sceneId='loot';
  s=gameReducer(s,{type:'CHOOSE',choiceId:'loot_gear',skillId:null});
  expect(s.npc.stolenGear.length).toBe(1);
  expect(remainingSearches(s,'npcGear')).toBe(2);
  s.mode='result';s.outcome='victory';s=gameReducer(s,{type:'RETURN_HUB'});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  expect(s.lootSearches).toEqual({});
  // A fresh attempt requires defeating the same NPC again before looting them.
  expect(remainingSearches(s,'npcGear')).toBe(0);
  s.sceneId='loot';s.flags.push('won_by_combat');s.enemy.health=0;
  expect(remainingSearches(s,'npcGear')).toBe(2);
 });
 it('never consumes a scavenging attempt when inventory weight blocks pickup',()=>{
  let s=makeInitialState('journalist');s.mode='adventure';s.sceneId='loot';s.attempt=1;
  s.bag.vest=6;
  s=gameReducer(s,{type:'CHOOSE',choiceId:'loot_pockets',skillId:null});
  expect(s.lootSearches.pockets??0).toBe(0);
 });
});
describe('v0.8 interrupting notices',()=>{
 it('does not interrupt for ordinary resource gain or minor costs',()=>{
  const a=makeInitialState('journalist'),b=structuredClone(a);
  b.bag.biscuit=(b.bag.biscuit??0)+1;
  b.player.stamina-=6;
  b.lastEvent='我找到了一些食物。';
  expect(majorStateChanges(a,b)).toHaveLength(0);
 });
 it('interrupts for critical injuries and new clues',()=>{
  const a=makeInitialState('journalist'),b=structuredClone(a);
  b.player.health=2;b.clues.push('發現守衛換班的時間。');
  const notices=majorStateChanges(a,b);
  expect(notices.some(n=>n.kind==='danger')).toBe(true);
  expect(notices.some(n=>n.title==='關鍵情報')).toBe(true);
 });
});
