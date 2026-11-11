import {describe,it,expect} from 'vitest';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {rememberCombatDefeat,DEFEAT_THOUGHTS} from '../src/game/data/npcDefeatMemory';

describe('v1.6a: NPC remembers battle outcomes, not harmless repeated visits',()=>{
 it('tracks ten distinct authored thoughts and real adaptation',()=>{
  const s=makeInitialState('journalist');
  s.stageId=1;s.npc.met=10;
  for(let i=0;i<10;i++)rememberCombatDefeat(s,'pen_thrust');
  expect(s.npc.combatDefeats).toBe(10);
  expect(new Set(s.npc.defeatMemories!.map(x=>x.thought)).size).toBe(10);
  expect(s.npc.defeatMemories![0]?.method).toBe('鋼筆突刺');
  expect(s.npc.adaptations.fight).toBe(12);
  expect(s.npc.defeatMemories![9]?.thought).toBe(DEFEAT_THOUGHTS[9].replace('{method}','鋼筆突刺'));
  expect(s.npc.defeatMemories![9]?.effect).toContain('攻擊適應 +0');
  expect(s.npc.hostility).toBe(38);
 });
 it('stores first and second chapter separately',()=>{
  const s=makeInitialState('journalist');rememberCombatDefeat(s,'pen_thrust');
  s.stageId=2;rememberCombatDefeat(s,'hook_snap');
  expect(s.npc.combatDefeats).toBe(1);
  expect(s.alleyNpc?.combatDefeats).toBe(1);
  expect(s.alleyNpc?.defeatMemories?.[0]?.method).toBe('掛鉤勾擊');
 });
 it('a peaceful confrontation does not invent a new combat memory',()=>{
  let s=makeInitialState('journalist');
  s.npc.met=15;s.mode='adventure';s.sceneId='confrontation';s.rngSeed=1;
  // Directly ending a noncombat mission does not call rememberCombatDefeat.
  const before=s.npc.combatDefeats??0;
  s=gameReducer(s,{type:'RETREAT'});
  expect(s.npc.combatDefeats??0).toBe(before);
 });
});
