import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {filterAttackCodexIds} from '../src/features/cards/attackCodexFilters';
import {filterSkillCodexIds} from '../src/features/cards/cardCodexFilters';
import {getPreparationReadiness} from '../src/features/preparation/preparationReadiness';
import {ATTACK_CARDS,MAX_ATTACK_DECK,STARTER_ATTACK_CARDS,getAttackDamage,attackStatus} from '../src/game/data/attacks';
import {CARDS,getUpgradeRequirement} from '../src/game/data/cards';
import {ITEMS} from '../src/game/data/items';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {bagWeight} from '../src/game/engine/rules';
import {buildCardArchiveVariants} from '../src/game/engine/cardArchiveVariants';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const codex=read('src/features/cards/CardsPage.tsx');
const prep=read('src/features/preparation/PreparationPage.tsx');
const css=read('src/styles/_v0821-attack-codex-preparation.scss');

describe('v0.8.21 attack codex filtering and card upgrades',()=>{
 it('intersects ownership, rarity and class without losing attack cards or changing saves',()=>{
  const state=makeInitialState('journalist');
  const before=structuredClone(state.ownedCards);
  const all=filterAttackCodexIds(state.ownedCards,{owned:'all',rarity:'all',profession:'all'});
  expect(all).toHaveLength(Object.keys(ATTACK_CARDS).length);
  expect(new Set(all).size).toBe(all.length);
  expect(filterAttackCodexIds(state.ownedCards,{owned:'all',rarity:'rare',profession:'shared'})).toContain('flashlight_strike');
  expect(filterAttackCodexIds(state.ownedCards,{owned:'all',rarity:'rare',profession:'journalist'})).toContain('camera_swing');
  expect(filterAttackCodexIds(state.ownedCards,{owned:'all',rarity:'normal',profession:'courier'})).toContain('screwdriver_guard');
  expect(filterAttackCodexIds(state.ownedCards,{owned:'all',rarity:'chaos',profession:'all'})).toEqual([]);
  expect(filterAttackCodexIds(state.ownedCards,{owned:'owned',rarity:'all',profession:'all'}).every(id=>!!state.ownedCards[id])).toBe(true);
  expect(filterAttackCodexIds(state.ownedCards,{owned:'owned',rarity:'all',profession:'courier'})).toEqual([]);
  expect(state.ownedCards).toEqual(before);
  expect(filterSkillCodexIds(state.ownedCards,{owned:'all',rarity:'all',profession:'all'})).toHaveLength(Object.keys(CARDS).length);
 });
 it('keeps level I duplicates separate from upgraded attack cards and the original reducer costs',()=>{
  const state=makeInitialState('journalist');
  state.ownedCards.pen_thrust={level:3,copies:12};
  expect(buildCardArchiveVariants(['pen_thrust'],state.ownedCards,'owned')).toEqual([
   {id:'pen_thrust',level:3,quantity:1,locked:false},
   {id:'pen_thrust',level:1,quantity:12,locked:false},
  ]);
  expect(getUpgradeRequirement(ATTACK_CARDS.pen_thrust.rarity,3)).toBe(10);
  const previousDamage=getAttackDamage(state,'pen_thrust');
  const upgraded=gameReducer(state,{type:'UPGRADE_CARD',cardId:'pen_thrust'});
  expect(upgraded.ownedCards.pen_thrust).toEqual({level:4,copies:2});
  expect(getAttackDamage(upgraded,'pen_thrust')).toBe(previousDamage+2);
 });
 it('shares visible filters but keeps independent category filters and original card detail behavior',()=>{
  for(const token of [
   "category==='skill'?rarity:attackRarity",
   "category==='skill'?profession:attackProfession",
   'filterSkillCodexIds(s.ownedCards,{owned:filter,rarity,profession})',
   'filterAttackCodexIds(s.ownedCards,{owned:filter,rarity:attackRarity,profession:attackProfession})',
   'aria-pressed={activeRarity===item.id}','aria-pressed={activeProfession===item.id}',
   'cards-v0821__attack-grid','cards-v0821__attack-tile',
   'getAttackDamage(s,attackCard.id)','attackCard.baseChance','attackCard.staminaCost',
   'attackStatus(s,attackCard.id)','attackStatus(s,attack.id)',
   'requiredWeapon?.name','cards-v0821__weapon',
   "getUpgradeRequirement(selected.rarity,owned.level)",
   "dispatch({type:'UPGRADE_CARD',cardId:selected.id})",
   'buildCardArchiveVariants','useVerticalDragScroll()',
   'onPointerDown={dragScroll.onPointerDown}','onPointerMove={dragScroll.onPointerMove}',
   'onClickCapture={dragScroll.onClickCapture}',
   'to="/preparation"','role="region" tabIndex={0}',
   'card-library-empty-note',
  ])expect(codex).toContain(token);
  expect(codex).toContain("category==='skill'?'cards-v0820__skill-grid':'cards-v0821__attack-grid'");
  expect(codex).toContain('CARD_LORE[selected.id]?.story');
  expect(codex).toContain('CARD_LORE[selected.id]?.acquisition');
 });
 it('keeps four level-colored columns, local scroll, weapon text, and responsive heights',()=>{
  for(const token of [
   '.cards-viewport.cards-v0820--attacks .card-library-grid--scroll.cards-v0821__attack-grid',
   'grid-template-columns:repeat(4,minmax(0,1fr))!important',
   'grid-auto-rows:clamp(','overflow-y:auto!important','touch-action:pan-y',
   '.cards-v0821__attack-effect','.cards-v0821__weapon.is-ready',
   '.cards-v0821__weapon.is-stored','.cards-v0821__weapon.is-missing',
   '.cards-v0821__attack-tile .card-library-tile__name',
   '.cards-v0820--attacks .card-detail-dialog',
   '@media(max-width:380px)','@media(max-height:700px)',
   '@media(max-height:480px)','@media(prefers-reduced-motion:reduce)',
   'focus-visible',
  ])expect(css).toContain(token);
  for(let lv=1;lv<=5;lv++)expect(read('src/styles/_v082-card-archive.scss')).toContain(`card-library-tile--level-${lv}`);
 });
});

describe('v0.8.21 preparation visual redesign preserves loadout safety',()=>{
 it('prepares a warehouse weapon through the original reducer without changing save model',()=>{
  const s=makeInitialState('journalist');
  expect(s.attackDeck).toEqual([]);
  expect(getPreparationReadiness(s)).toMatchObject({invalid:[],readyCount:0});
  const prepared=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
  expect(prepared.attackDeck).toEqual(['pen_thrust']);
  expect(attackStatus(prepared,'pen_thrust').inBag).toBe(true);
  expect(getPreparationReadiness(prepared).readyCount).toBe(1);
  expect(getPreparationReadiness(prepared).invalid).toEqual([]);
  expect(getPreparationReadiness(prepared).projectedWeight).toBe(bagWeight(prepared.bag));
 });
 it('projects warehouse weapons with 15kg limit without mutating inventory',()=>{
  const s=makeInitialState('journalist');
  s.attackDeck=['camera_swing'];
  delete s.bag.camera;
  s.warehouse.camera=1;
  const beforeBag=structuredClone(s.bag);
  const beforeWarehouse=structuredClone(s.warehouse);
  const beforeDeck=s.attackDeck.slice();
  const ready=getPreparationReadiness(s);
  expect(ready.invalid).toEqual([]);
  expect(ready.readyCount).toBe(1);
  expect(ready.projectedWeight).toBeCloseTo(bagWeight(s.bag)+ITEMS.camera.weight,5);
  expect(s.bag).toEqual(beforeBag);
  expect(s.warehouse).toEqual(beforeWarehouse);
  expect(s.attackDeck).toEqual(beforeDeck);
  s.bag.water=Math.ceil(18/ITEMS.water.weight)+2;
  expect(bagWeight(s.bag)).toBeGreaterThan(15);
  expect(getPreparationReadiness(s).invalid).toEqual(['camera_swing']);
  expect(getPreparationReadiness(s).readyCount).toBe(0);
  delete s.warehouse.camera;
  expect(getPreparationReadiness(s).invalid).toEqual(['camera_swing']);
 });
 it('keeps five-attack cap and allows removing prepared cards with original reducer',()=>{
  let s=makeInitialState('journalist');
  for(const id of STARTER_ATTACK_CARDS.journalist)s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:id});
  expect(s.attackDeck).toHaveLength(MAX_ATTACK_DECK);
  s.ownedCards.wrench_hit={level:1,copies:0};
  expect(gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'wrench_hit'}).attackDeck).toHaveLength(MAX_ATTACK_DECK);
  s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
  expect(s.attackDeck).not.toContain('pen_thrust');
  expect(s.attackDeck).toHaveLength(MAX_ATTACK_DECK-1);
 });
 it('keeps live readiness metrics, five slots, weapon states and select/unselect controls',()=>{
  for(const token of [
   'getPreparationReadiness(s)','readyCount','projectedWeight',
   's.attackDeck.length}/{MAX_ATTACK_DECK}',
   'Array.from({length:MAX_ATTACK_DECK}',
   'preparation-v0821__overview','preparation-v0821__slots','preparation-v0821__card-grid',
   'preparation-v0821__option-stats','preparation-v0821__option-foot',
   'getAttackDamage(s,id)','card.baseChance','card.staminaCost',
   'attackStatus(s,id)','aria-pressed={selected}',
   "dispatch({type:'PREPARE_ATTACK_CARD',cardId:id})",
   "dispatch({type:'PREPARE_ATTACK_CARD',cardId:card.id})",
   "status.inBag?'背包已持有':status.inWarehouse?'倉庫可備妥':'缺少武器'",
   'ids.length===0','to="/cards"','to="/"',
   '<GameUtilities className="game-utilities--preparation"/>',
   '<ReturnMainLink className="return-main-link--preparation"/>',
  ])expect(prep).toContain(token);
 });
 it('keeps the original warning-and-confirm entry path even with no selected or invalid attacks',()=>{
  for(const token of [
   "if(!s.attackDeck.length||invalid.length){setConfirm(true);playCue('warning');return;}",
   "dispatch({type:'START_ATTEMPT'})",
   "navigate('/chapter')",
   'role="alertdialog" aria-modal="true"',
   "onClick={()=>setConfirm(false)}",
   'onClick={begin}>我知道了，仍要進關',
   '尚未選擇攻擊牌。可以進關',
   '缺少對應武器，進關卡時無法使用',
   "if(status.inWarehouse&&item&&projectedWeight+item.weight<=15)",
  ])expect(token.startsWith('if(status.inWarehouse')?read('src/features/preparation/preparationReadiness.ts'):prep).toContain(token);
  expect(read('src/app/App.tsx')).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
 });
 it('keeps inventory-only scroll, five-slot grid, footer visibility and safe responsive fallback',()=>{
  for(const token of [
   '.preparation-page.preparation-v0821',
   'grid-template-columns:repeat(5,minmax(0,1fr))',
   '.preparation-available__list.preparation-v0821__card-grid',
   'grid-template-columns:repeat(2,minmax(0,1fr))',
   'overflow-y:auto!important','overscroll-behavior-y:contain',
   'touch-action:pan-y',
   'min-height:0','min-width:0',
   '.preparation-footer__actions',
   '.preparation-warning',
   '@media(max-width:380px)','@media(min-width:650px)',
   '@media(max-height:700px)','@media(max-height:480px)',
   '@media(prefers-reduced-motion:reduce)',
  ])expect(css).toContain(token);
  expect(read('src/styles/main.scss')).toContain('@import "v0821-attack-codex-preparation"');
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
 });
});
