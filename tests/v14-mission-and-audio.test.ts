import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { makeInitialState } from '../src/game/state/initial';
import { gameReducer } from '../src/game/engine/resolve';
import { ALLEY_SCENES } from '../src/game/data/chapters/ch01-alley/scenes';
import { CHAPTER_ONE } from '../src/game/data/maps/ch01';
import { getVisibleActions,getSceneContent,calculateActionPreview } from '../src/game/engine/rules';
import { PROFESSIONS } from '../src/game/data/professions';
import { STARTER_CARDS,CARDS } from '../src/game/data/cards';
import { STARTER_ATTACK_CARDS, ATTACK_CARDS } from '../src/game/data/attacks';
import { CARD_LORE } from '../src/game/data/cardLore';
import { SOUNDSCAPES } from '../src/audio/soundscapes';
import { LOOT_POOLS } from '../src/game/data/items';
import AlleySceneArtwork from '../src/features/chapter/AlleySceneArtwork';
import { getAmbientThoughts } from '../src/game/data/ambientThoughts';

const firstClear=()=>{
 let s=makeInitialState('journalist');
 s=gameReducer(s,{type:'START_ATTEMPT'});
 s.sceneId='loot';
 s=gameReducer(s,{type:'CHOOSE',choiceId:'loot_exit',skillId:null});
 return gameReducer(s,{type:'RETURN_HUB'});
};
describe('v1.4 second mission unlocking and mission progression',()=>{
 it('starts locked; first mission victory unlocks second, but not third',()=>{
  const fresh=makeInitialState('journalist');
  expect(gameReducer(fresh,{type:'SELECT_STAGE',stageId:2})).toBe(fresh);
  expect(CHAPTER_ONE.stages.filter(x=>x.implementation==='playable').map(x=>x.sequence)).toEqual([1,2]);
  const won=firstClear();
  expect(won.chapterProgress.unlocked).toBe(2);
  expect(won.chapterProgress.completed).toEqual([1]);
 });
 it('provides five fully authored scenes with multiple grounded narrative choices',()=>{
  for(const scene of Object.values(ALLEY_SCENES)){
   expect(scene.narration.length).toBeGreaterThan(30);
   expect(scene.actions.length).toBeGreaterThanOrEqual(4);
   expect(scene.actions.every(x=>x.thought.length>8&&x.detail.length>5)).toBe(true);
  }
  const state=gameReducer(firstClear(),{type:'SELECT_STAGE',stageId:2});
  const inMission=gameReducer(state,{type:'START_ATTEMPT'});
  expect(inMission.enemy.name).toContain('巷口守望者');
  expect(inMission.enemy.maxHealth).toBeGreaterThanOrEqual(20);
  expect(getSceneContent(inMission).location).toContain('後巷');
  const gate=getVisibleActions(inMission);
  expect(gate.length).toBeGreaterThan(4);
  expect(gate.some(x=>x.id==='alley_gate_scan')).toBe(true);
 });
 it('lets the player finish the entire nonviolent route and unlock the third mission',()=>{
  let s=gameReducer(firstClear(),{type:'SELECT_STAGE',stageId:2});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  s=gameReducer(s,{type:'CHOOSE',choiceId:'alley_gate_scan',skillId:null});
  expect(s.sceneId).toBe('survey');
  s=gameReducer(s,{type:'CHOOSE',choiceId:'alley_survey_wait',skillId:null});
  expect(s.sceneId).toBe('inside');
  s.rngSeed=0;
  s=gameReducer(s,{type:'CHOOSE',choiceId:'alley_inside_listen',skillId:null});
  expect(s.sceneId).toBe('loot');
  expect(s.flags).toContain('alley_witness_statement');
  s=gameReducer(s,{type:'CHOOSE',choiceId:'alley_loot_exit',skillId:null});
  expect(s.mode).toBe('result');
  expect(s.outcome).toBe('victory');
  expect(s.chapterProgress.completed).toEqual([1,2]);
  expect(s.chapterProgress.unlocked).toBe(3);
  expect(s.clues.some(x=>x.includes('公寓'))).toBe(true);
  const back=gameReducer(s,{type:'RETURN_HUB'});
  expect(back.mode).toBe('home');
  expect(back.chapterProgress.completed).toEqual([1,2]);
 });
 it('keeps mission 01 and mission 02 NPC memory separate even after failure',()=>{
  let s=gameReducer(firstClear(),{type:'SELECT_STAGE',stageId:2});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  const oldFirstMet=s.npc.met,firstMemory=[...s.npc.remembers];
  // A failed second-stage confrontation should give a new clue, not delete items.
  s.sceneId='confrontation';s.player.stamina=0;s.player.fatigue=95;s.rngSeed=4000;
  const before=Object.entries(s.bag).map(([id,qty])=>id+':'+qty).sort();
  s=gameReducer(s,{type:'CHOOSE',choiceId:'alley_fight_shadow',skillId:null});
  expect(s.mode).toBe('result');
  expect(s.outcome).toBe('defeat');
  expect(s.alleyNpc?.remembers).toContain('alley_defeat');
  expect(s.npc.met).toBe(oldFirstMet);
  expect(s.npc.remembers).toEqual(firstMemory);
  expect(Object.entries(s.bag).map(([id,qty])=>id+':'+qty).sort()).toEqual(before);
  s=gameReducer(s,{type:'RETURN_HUB'});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  expect(s.alleyNpc?.met).toBe(2);
  expect(getSceneContent(s).narration).toContain('第 2 次');
 });
 it('revisit options rotate without randomizing every React rerender',()=>{
  let s=gameReducer(firstClear(),{type:'SELECT_STAGE',stageId:2});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  const first=getVisibleActions(s).map(x=>x.id);
  expect(first).toEqual(getVisibleActions(s).map(x=>x.id));
  s.mode='result';s=gameReducer(s,{type:'RETURN_HUB'});s=gameReducer(s,{type:'START_ATTEMPT'});
  const second=getVisibleActions(s).map(x=>x.id);
  expect(second).not.toEqual(first);
 });
});
describe('v1.4 profession and music',()=>{
 it('makes infiltrator meaningfully different, with four unique skills and real items',()=>{
  const s=makeInitialState('infiltrator');
  expect(PROFESSIONS.infiltrator.name).toBe('滲透者');
  expect(s.activeDeck).toContain('shadow_wall');
  expect(STARTER_CARDS.infiltrator.slice(0,4)).toEqual(['shadow_wall','silent_approach','quick_withdraw','use_blindspot']);
  for(const id of STARTER_CARDS.infiltrator.slice(0,4)){
   expect(CARDS[id]?.profession).toBe('infiltrator');
   expect(CARD_LORE[id]?.story.length).toBeGreaterThan(15);
  }
  for(const id of STARTER_ATTACK_CARDS.infiltrator){
   const card=ATTACK_CARDS[id];expect(card).toBeDefined();
   if(card?.profession==='infiltrator')expect(s.warehouse[card.requiredItemId]).toBeGreaterThan(0);
  }
  const sneak=ALLEY_SCENES.gate.actions.find(x=>x.id==='alley_gate_sneak')!;
  const j=calculateActionPreview(makeInitialState('journalist'),sneak,null).chance;
  const i=calculateActionPreview(s,sneak,null).chance;
  expect(i).toBeGreaterThan(j);
 });
 it('has distinct original battle score and scene textures',()=>{
  const ids=['alley_gate','alley_survey','alley_inside','alley_confrontation','alley_loot'] as const;
  for(const id of ids){
   expect(SOUNDSCAPES[id].melody.length).toBe(8);
   expect(SOUNDSCAPES[id].melody.some(n=>n!==null)).toBe(true);
  }
  expect(SOUNDSCAPES.alley_confrontation.beat).toBeLessThan(SOUNDSCAPES.alley_gate.beat);
  expect(SOUNDSCAPES.alley_confrontation.tension).toBeGreaterThan(SOUNDSCAPES.alley_inside.tension);
  expect(LOOT_POOLS.alley_wall.length).toBeGreaterThan(3);
 });
 it('renders five unique lightweight SVG scene illustrations',()=>{
  const names=['gate','survey','inside','confrontation','loot'] as const;
  const art=names.map(scene=>renderToStaticMarkup(createElement(AlleySceneArtwork,{scene})));
  expect(new Set(art).size).toBe(5);
  expect(art.every(html=>html.includes('<svg')&&html.length>500)).toBe(true);
  expect(getAmbientThoughts('inside',3,1200,6,2)[0]).not.toBe(getAmbientThoughts('inside',3,1200,6,1)[0]);
 });
});
