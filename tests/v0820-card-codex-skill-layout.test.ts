import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {CARDS,getUpgradeRequirement} from '../src/game/data/cards';
import {ATTACK_CARDS} from '../src/game/data/attacks';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {buildCardArchiveVariants} from '../src/game/engine/cardArchiveVariants';
import {CODEX_RARITIES,CODEX_PROFESSIONS,filterSkillCodexIds} from '../src/features/cards/cardCodexFilters';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ui=read('src/features/cards/CardsPage.tsx');
const css=read('src/styles/_v0820-card-codex.scss');

describe('v0.8.20 card codex skill archive and filtering',()=>{
 it('defines four rarity options, five profession options and includes each skill once',()=>{
  expect(CODEX_RARITIES.map(x=>x.id)).toEqual(['all','normal','rare','chaos']);
  expect(CODEX_PROFESSIONS.map(x=>x.id)).toEqual(['all','shared','journalist','infiltrator','courier']);
  const state=makeInitialState('journalist');
  const ids=filterSkillCodexIds(state.ownedCards,{owned:'all',rarity:'all',profession:'all'});
  expect(ids.length).toBe(Object.keys(CARDS).length);
  expect(new Set(ids).size).toBe(Object.keys(CARDS).length);
 });
 it('intersects ownership, rarity and profession without touching stored collection',()=>{
  const state=makeInitialState('journalist'),original=structuredClone(state.ownedCards);
  const ids=(owned:'all'|'owned',rarity:'all'|'normal'|'rare'|'chaos',profession:'all'|'shared'|'journalist'|'infiltrator'|'courier')=>
   filterSkillCodexIds(state.ownedCards,{owned,rarity,profession});
  expect(ids('all','rare','journalist')).toContain('record');
  expect(ids('all','normal','journalist')).toContain('question');
  expect(ids('all','rare','journalist')).not.toContain('question');
  expect(ids('all','normal','shared')).toContain('breathe');
  expect(ids('all','normal','shared')).not.toContain('record');
  expect(ids('all','chaos','all')).toHaveLength(0);
  expect(ids('owned','all','journalist').every(id=>!!state.ownedCards[id])).toBe(true);
  expect(ids('owned','all','courier')).toHaveLength(0);
  expect(state.ownedCards).toEqual(original);
 });
 it('retains owned-first sort and true per-level quantities and upgrade costs',()=>{
  const state=makeInitialState('journalist');
  const ids=filterSkillCodexIds(state.ownedCards,{owned:'all',rarity:'all',profession:'all'});
  const lockedIndex=ids.findIndex(id=>!state.ownedCards[id]);
  expect(lockedIndex).toBeGreaterThan(0);
  expect(ids.slice(0,lockedIndex).every(id=>!!state.ownedCards[id])).toBe(true);
  state.ownedCards.question={level:3,copies:9};
  expect(buildCardArchiveVariants(['question'],state.ownedCards,'owned')).toEqual([
   {id:'question',level:3,quantity:1,locked:false},
   {id:'question',level:1,quantity:9,locked:false},
  ]);
  expect(getUpgradeRequirement(CARDS.question.rarity,3)).toBe(10);
  state.ownedCards.question.copies=12;
  const after=gameReducer(state,{type:'UPGRADE_CARD',cardId:'question'});
  expect(after.ownedCards.question).toEqual({level:4,copies:2});
 });
 it('preserves attack category, preparation route and upgrade/detail actions',()=>{
  for(const needle of [
   "const [category,setCategory]=useState<'skill'|'attack'>('skill')",
   "category==='skill'?CARDS:ATTACK_CARDS",
   'filterSkillCodexIds(s.ownedCards,{owned:filter,rarity,profession})',
   'filterAttackCodexIds(s.ownedCards,{owned:filter,rarity:attackRarity,profession:attackProfession})',
   'className="card-kind-tabs cards-v0820__tabs"',
   'to="/preparation"',
   '功能／附加技能','攻擊型主動牌',
   'role="group" aria-label="稀有度"','role="group" aria-label="職業歸屬"',
   'aria-pressed={activeRarity===item.id}','aria-pressed={activeProfession===item.id}',
   "aria-pressed={filter==='owned'}",
   'buildCardArchiveVariants','setSelectedLevel(variant.level)',
   'getUpgradeRequirement(selected.rarity,owned.level)',
   "dispatch({type:'UPGRADE_CARD',cardId:selected.id})",
   'getAttackDamage(s,attack.id)',
   'CARD_LORE[selected.id]?.story','CARD_LORE[selected.id]?.acquisition',
   '<GameUtilities className="game-utilities--cards"/>',
   '<ReturnMainLink className="return-main-link--cards"/>',
  ])expect(ui).toContain(needle);
  expect(ATTACK_CARDS.pen_thrust).toBeDefined();
 });
 it('keeps mouse/touch scroll, five level colors, rarity and per-variant labels',()=>{
  for(const needle of [
   'useVerticalDragScroll()','onPointerDown={dragScroll.onPointerDown}',
   'onPointerMove={dragScroll.onPointerMove}',
   'onClickCapture={dragScroll.onClickCapture}',
   'role="region" tabIndex={0}',
   'LV.${variant.level}','×{variant.quantity}',
   'rarity-tile--${card.rarity}','skillCard.chanceBonus','skillCard.resourceCost',
   'card-library-empty-note','aria-live="polite"',
  ])expect(ui).toContain(needle);
  expect(ui).toContain('[category,filter,rarity,profession,attackRarity,attackProfession]');
  for(let i=1;i<=5;i++)expect(read('src/styles/_v082-card-archive.scss')).toContain(`card-library-tile--level-${i}`);
 });
 it('renders compact four-column skill-only tiles and responsive local overflow',()=>{
  for(const needle of [
   '.cards-viewport.cards-v0820--skills .card-library-grid--scroll.cards-v0820__skill-grid',
   'grid-template-columns:repeat(4,minmax(0,1fr))!important',
   'grid-auto-rows:clamp(','overflow-y:auto!important','touch-action:pan-y',
   'grid-template-columns:repeat(5,minmax(0,1fr))',
   '.cards-v0820__skill-effect','.cards-v0820__skill-tile .card-library-tile__name',
   '.cards-v0820--skills .card-detail-dialog',
   '@media(max-width:365px)','@media(max-height:700px)',
   '@media(max-height:490px)','@media(prefers-reduced-motion:reduce)',
   'focus-visible',
  ])expect(css).toContain(needle);
  expect(read('src/styles/main.scss')).toContain('@import "v0820-card-codex"');
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
 });
});
