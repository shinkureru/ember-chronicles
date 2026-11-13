import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {rememberCombatDefeat} from '../src/game/data/npcDefeatMemory';
import {PROFESSIONS} from '../src/game/data/professions';
import {CHARACTER_TABS} from '../src/features/player/characterSections';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read('src/features/player/CharacterPage.tsx');
const css=read('src/styles/_v0819-character-archive-compact.scss');

describe('v0.8.19 character archives are compact without deleting data',()=>{
 it('keeps all five character destinations while styling only town, NPC and story',()=>{
  expect(CHARACTER_TABS.map(x=>x.id)).toEqual(['equipment','attributes','town','record','story']);
  for(const tab of ['town','record','story']){
   expect(page).toContain(`tab==='${tab}'&&<section id="character-panel-${tab}"`);
   expect(page).toContain(`character-v0819--${tab}`);
  }
  expect(page).toContain("tab==='equipment'&&<CharacterEquipmentPanel/>");
  expect(page).toContain("tab==='attributes'&&");
  expect(read('src/styles/main.scss')).toContain('@import "v0819-character-archive-compact"');
  expect(css).not.toContain('.character-v0818__upgrade');
  expect(css).not.toContain('.equipment-v0817__item');
 });
 it('preserves all four real town-growth metrics, their details and constraints',()=>{
  const s=makeInitialState('journalist');
  expect(s.town?.lastTrainingDay===s.world.day).toBe(false);
  expect(Object.values(s.town?.quests??{}).filter(v=>v==='completed')).toHaveLength(0);
  expect(Object.values(s.town?.upgrades??{}).reduce((sum,x)=>sum+x,0)).toBe(0);
  expect(s.conditions).toMatchObject({wounds:0,infection:0,poisoning:0,illness:0});
  for(const text of [
   '今日訓練','完成委託','身體狀況','裝備改良',
   "s.town?.lastTrainingDay===s.world.day?'已完成':'可訓練'",
   "Object.values(s.town?.quests??{}).filter(v=>v==='completed').length",
   'Object.values(s.town?.upgrades??{}).reduce((sum,x)=>sum+x,0)',
   's.conditions?.wounds??0','s.conditions?.infection??0',
   's.conditions?.poisoning??0','s.conditions?.illness??0',
   '每日最多完成一次屬性專項訓練','訓練時數、物資和貨幣',
  ])expect(page).toContain(text);
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
  expect(css).toContain('grid-template-columns:repeat(4,minmax(0,1fr))');
 });
 it('keeps separate memories and actual NPC hostility, encounter, adaptation and loss values',()=>{
  const state=makeInitialState('journalist');
  state.stageId=1;
  rememberCombatDefeat(state,'pen_thrust');
  state.stageId=2;
  rememberCombatDefeat(state,'hook_snap');
  expect(state.npc.combatDefeats).toBe(1);
  expect(state.alleyNpc?.combatDefeats).toBe(1);
  expect(state.npc.defeatMemories?.[0]?.method).toBe('鋼筆突刺');
  expect(state.alleyNpc?.defeatMemories?.[0]?.method).toBe('掛鉤勾擊');
  for(const key of [
   "id:'warehouse_guard'","id:'alley_watchman'",
   'npc.hostility','npc.met','npc.adaptations.talk',
   'npc.adaptations.fight','npc.combatDefeats','npc.playerDefeats',
   's.insightByEnemy?.[id]??0',
   's.npc.remembers.length','s.alleyNpc?.remembers.length??0',
  ])expect(page).toContain(key);
  expect(page).toContain('npc.defeatMemories.slice().reverse().map(memory=>');
  expect(page).toContain('memory.count');
  expect(page).toContain('memory.method');
  expect(page).toContain('memory.thought');
  expect(page).toContain('memory.effect');
 });
 it('allows ten battle logs and long clues to be fully read behind native disclosures',()=>{
  const s=makeInitialState('journalist');
  s.stageId=1;
  for(let i=0;i<10;i++)rememberCombatDefeat(s,'pen_thrust');
  expect(s.npc.defeatMemories).toHaveLength(10);
  expect(new Set(s.npc.defeatMemories?.map(x=>x.thought)).size).toBe(10);
  s.clues.push('非常詳細的現場情報'.repeat(20));
  expect(s.clues).toHaveLength(1);
  expect(page).toContain('npc.defeatMemories?.length?<details');
  expect(page).toContain('戰鬥記憶 <strong>{npc.defeatMemories.length}</strong>');
  expect(page).toContain('className="character-v0819__disclosure character-v0819__clues"');
  expect(page).toContain('s.clues.slice().reverse().map((line,i)=>');
  expect(page).toContain('還沒有取得關鍵線索。');
  expect(page).toContain('尚未被我以戰鬥手段擊敗');
  expect(css).toContain('.character-v0819__disclosure > summary:focus-visible');
  expect(css).toContain('max-height:min(29dvh,195px)');
  expect(css).toContain('max-height:min(32dvh,200px)');
  expect(css).toContain('overflow-y:auto');
  expect(css).toContain('overscroll-behavior-y:contain');
 });
 it('retains every existing profession background, passive and two character quotes',()=>{
  const keys=Object.keys(PROFESSIONS);
  expect(keys).toEqual(expect.arrayContaining(['journalist','infiltrator','courier']));
  for(const key of keys){
   const profession=PROFESSIONS[key as keyof typeof PROFESSIONS];
   expect(profession.name.length).toBeGreaterThan(0);
   expect(profession.overview.length).toBeGreaterThan(10);
   expect(profession.passive.length).toBeGreaterThan(10);
  }
  for(const text of [
   'profession.name','profession.en','profession.overview','profession.passive',
   '我還能走多遠，取決於我帶了什麼',
   '這座被封鎖的城區，到底還藏了多少沒有說出口的事',
  ])expect(page).toContain(text);
  expect(page).toContain('character-v0819__story-card--passive');
  expect(css).toContain('.character-v0819__quote');
  expect(css).toContain('.character-v0819__story-card');
 });
 it('keeps one-page summaries and responsive safe overflow rather than clipped logs',()=>{
  expect(css).toContain('flex:1 1 0');
  expect(css).toContain('min-height:0');
  expect(css).toContain('min-width:0');
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('@media(min-width:600px)');
  expect(css).toContain('@media(max-width:360px)');
  expect(css).toContain('@media(max-height:650px)');
  expect(css).toContain('grid-template-columns:repeat(3,minmax(0,1fr))');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.19');
 });
});
