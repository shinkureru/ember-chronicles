import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getProgression,awardExperience,xpNeededForLevel} from '../src/game/engine/progression';
import {ATTRIBUTE_LABELS} from '../src/game/data/attributes';
import {ATTRIBUTE_GROUPS,CHARACTER_TABS} from '../src/features/player/characterSections';

const read=(file:string)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const page=read('src/features/player/CharacterPage.tsx');
const css=read('src/styles/_v0818-compact-character-attributes.scss');

describe('v0.8.18 compact one-screen permanent attributes',()=>{
 it('keeps 18 unique attributes in the same three original groups with five character tabs',()=>{
  const ids=ATTRIBUTE_GROUPS.flatMap(group=>group.ids);
  expect(ids).toHaveLength(18);
  expect(new Set(ids).size).toBe(18);
  expect(ids.slice().sort()).toEqual(Object.keys(ATTRIBUTE_LABELS).sort());
  expect(ATTRIBUTE_GROUPS.map(g=>g.ids.length)).toEqual([6,6,6]);
  expect(CHARACTER_TABS.map(t=>t.id)).toEqual(['equipment','attributes','town','record','story']);
  expect(page).toContain("tab==='attributes'&&");
  expect(page).toContain('ATTRIBUTE_GROUPS.map(group=>');
  expect(page).toContain('group.ids.map(id=>');
  expect(page).toContain('character-v0818__groups');
 });
 it('lays out all cards without redundant navigation or two-row property placeholders',()=>{
  expect(page).not.toContain('character-attribute-index');
  expect(page).not.toContain('scrollIntoView(');
  expect(page).not.toContain('永久成長屬性</small>');
  expect(page).toContain('character-v0818__stat-name');
  expect(page).toContain('character-v0818__stat-level');
  expect(page).toContain('character-v0818__upgrade');
  expect(page).toContain('character-attribute-heading-');
  expect(page).toContain('目前沒有可分配點數');
  expect(page).toContain('點數可跨類別分配');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
  expect(css).toContain('@media(min-width:540px)');
  expect(css).toContain('grid-template-columns:repeat(3,minmax(0,1fr))');
  expect(css).toContain('grid-template-columns:minmax(0,1fr)');
  expect(css).toContain('grid-template-columns:minmax(0,1fr) auto 27px');
 });
 it('preserves original point allocation and visibly distinguishes locked reasons and capped level',()=>{
  expect(page).toContain("type:'ALLOCATE_POINT',attribute:id");
  expect(page).toContain("progression.points>0&&s.player.attributes[id]<20&&s.mode==='home'");
  expect(page).toContain('disabled={!canUpgrade}');
  expect(page).toContain("level>=20?'已達 Lv.20 上限'");
  expect(page).toContain("s.mode!=='home'?'回到避難所才能加點'");
  expect(page).toContain("progression.points<=0?'沒有可分配點數'");
  expect(page).toContain('aria-label={`升級');
  let s=makeInitialState('journalist');
  s.progression!.points=18;
  for(const attr of ATTRIBUTE_GROUPS.flatMap(group=>group.ids)){
   s=gameReducer(s,{type:'ALLOCATE_POINT',attribute:attr});
   expect(s.player.attributes[attr]).toBe(1);
  }
  expect(getProgression(s).points).toBe(0);
  expect(gameReducer(s,{type:'ALLOCATE_POINT',attribute:'planning'})).toBe(s);
  s.progression!.points=3;
  s.player.attributes.focus=20;
  expect(gameReducer(s,{type:'ALLOCATE_POINT',attribute:'focus'})).toBe(s);
  s.mode='adventure';
  expect(gameReducer(s,{type:'ALLOCATE_POINT',attribute:'memory'})).toBe(s);
 });
 it('keeps real HP/ST side effects plus leveling and accurate XP feedback',()=>{
  let s=makeInitialState('journalist');
  s.progression!.points=2;
  s=gameReducer(s,{type:'ALLOCATE_POINT',attribute:'maxHealth'});
  expect(s.player.attributes.maxHealth).toBe(1);
  expect([s.player.health,s.player.maxHealth]).toEqual([11,11]);
  s=gameReducer(s,{type:'ALLOCATE_POINT',attribute:'maxStamina'});
  expect(s.player.attributes.maxStamina).toBe(1);
  expect([s.player.stamina,s.player.maxStamina]).toEqual([11,11]);
  const fresh=makeInitialState('journalist');
  expect(awardExperience(fresh,'story:lesson',xpNeededForLevel(1))).toBe(40);
  expect(getProgression(fresh)).toMatchObject({level:2,points:1});
  expect(page).toContain('const xpGoal=xpNeededForLevel(progression.level)');
  expect(page).toContain('aria-valuemax={xpGoal}');
  expect(page).toContain('aria-valuenow={progression.xp}');
  expect(page).toContain('Math.min(100,100*progression.xp/xpNeededForLevel(progression.level))');
 });
 it('protects focus, labels, smaller screens, scroll fallback, reduced motion and rest pages',()=>{
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('overscroll-behavior-y:contain');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('@media(max-width:360px)');
  expect(css).toContain('@media(max-height:650px)');
  expect(css).toContain('@media(max-height:420px)');
  expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  expect(css).toContain('.character-v0818__upgrade:focus-visible');
  expect(css).toContain('min-width:0');
  expect(page).toContain('aria-describedby="character-v0818-upgrade-hint"');
  for(const s of ["tab==='equipment'","tab==='town'","tab==='record'","tab==='story'"])
   expect(page).toContain(s);
  expect(read('src/styles/main.scss')).toContain('@import "v0818-compact-character-attributes"');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.18');
 });
});
