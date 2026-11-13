import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {ATTRIBUTE_LABELS} from '../src/game/data/attributes';
import {CHARACTER_TABS,ATTRIBUTE_GROUPS} from '../src/features/player/characterSections';
import {getProgression,makeInitialProgression} from '../src/game/engine/progression';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('src/features/player/CharacterPage.tsx');
const css=read('src/styles/_v0816-character-navigation.scss');

describe('v0.8.16 character navigation and unified attribute entry',()=>{
 it('provides five unique top-level destinations instead of seven',()=>{
  expect(CHARACTER_TABS.map(t=>t.id)).toEqual(['equipment','attributes','town','record','story']);
  expect(CHARACTER_TABS.map(t=>t.label)).toEqual(['全身裝備','屬性','城鎮成長','NPC 記憶','人物故事']);
  expect(page).toContain('CHARACTER_TABS.map(item=>');
  expect(page).toContain("useState<CharacterTab>('equipment')");
  for(const t of CHARACTER_TABS)expect(t.id==='equipment'
   ?read('src/features/player/CharacterEquipmentPanel.tsx'):page).toContain(`character-panel-${t.id}`);
  for(const old of ["tab==='physical'","tab==='mental'","tab==='social'"])expect(page).not.toContain(old);
 });
 it('keeps every one of the original 18 permanent attributes visible in one panel',()=>{
  expect(ATTRIBUTE_GROUPS.map(g=>g.id)).toEqual(['physical','mental','social']);
  expect(ATTRIBUTE_GROUPS.map(g=>g.title)).toEqual(['身體與生存','觀察與思維','社交與心理']);
  const ids=ATTRIBUTE_GROUPS.flatMap(g=>g.ids);
  expect(ids.length).toBe(18);
  expect(new Set(ids).size).toBe(18);
  expect(ids.slice().sort()).toEqual(Object.keys(ATTRIBUTE_LABELS).sort());
  expect(ATTRIBUTE_GROUPS.every(g=>g.ids.length===6)).toBe(true);
  expect(page).toContain("tab==='attributes'&&");
  expect(page).toContain('ATTRIBUTE_GROUPS.map(group=>');
  expect(page).toContain('group.ids.map(id=>');
  expect(page).toContain('character-attribute-index');
  expect(page).toContain('scrollIntoView({block:');
 });
 it('preserves original allocation actions and checks actual level-point mechanics',()=>{
  expect(page).toContain("type:'ALLOCATE_POINT',attribute:id");
  expect(page).toContain("progression.points<=0||s.player.attributes[id]>=20||s.mode!=='home'");
  expect(page).toContain('xpNeededForLevel(progression.level)');
  let s=makeInitialState('journalist');
  s.mode='home';s.progression=makeInitialProgression();s.progression.points=2;
  s=gameReducer(s,{type:'ALLOCATE_POINT',attribute:'observation'});
  expect(s.player.attributes.observation).toBe(1);
  expect(getProgression(s).points).toBe(1);
  s=gameReducer(s,{type:'ALLOCATE_POINT',attribute:'empathy'});
  expect(s.player.attributes.empathy).toBe(1);
  expect(getProgression(s).points).toBe(0);
  expect(gameReducer(s,{type:'ALLOCATE_POINT',attribute:'planning'})).toBe(s);
  s={...s,mode:'adventure',progression:{...getProgression(s),points:1}};
  expect(gameReducer(s,{type:'ALLOCATE_POINT',attribute:'planning'})).toBe(s);
 });
 it('retains equipment, town growth, NPC logs, story and mission-only routing',()=>{
  for(const token of [
   "type:'EQUIP_ITEM',slot,itemId:id","type:'UNEQUIP_ITEM',slot",
   'getEquippedDefense(s)','s.town?.lastTrainingDay','npc.defeatMemories',
   's.clues.slice().reverse()','profession.overview','profession.passive',
  ])expect(token.startsWith("type:'EQUIP_ITEM'")||token.startsWith("type:'UNEQUIP_ITEM'")
   ?read('src/features/player/CharacterEquipmentPanel.tsx'):page).toContain(token);
  const router=read('src/app/App.tsx');
  expect(router).toContain('<Route path="/character" element={<CharacterPage/>}/>');
  expect(router).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
 });
 it('uses five-column responsive navigation with a scrollable inner attribute viewport',()=>{
  expect(css).toContain('grid-template-columns:repeat(5,minmax(0,1fr))');
  expect(css).toContain('overflow:visible');
  expect(css).toContain('grid-template-columns:repeat(3,minmax(0,1fr))');
  expect(css).toContain('@media(max-width:360px)');
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('scroll-margin-top:48px');
  expect(css).not.toContain('.equipment-stage{');
  expect(read('src/styles/main.scss')).toContain('@import "v0816-character-navigation"');
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
 });
});
