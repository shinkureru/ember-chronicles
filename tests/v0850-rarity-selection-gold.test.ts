import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import RarityArtwork from '../src/components/ui/RarityArtwork';
import SquareRaritySlot from '../src/components/ui/SquareRaritySlot';
import UiShowcasePage from '../src/features/ui-showcase/UiShowcasePage';
import {URBAN_RARITIES} from '../src/components/ui/urbanUiTokens';
import {MARKET_TO_URBAN_RARITY,CARD_TO_URBAN_RARITY} from '../src/components/ui/urbanUiAdapters';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=(e:ReturnType<typeof createElement>)=>renderToStaticMarkup(e);

describe('v0.8.50 — selected-only rarity and gold display-only glimmer',()=>{
 it('renders five rarity bases with one semantic button each and selected ARIA state',()=>{
  for(const rarity of URBAN_RARITIES.map(x=>x.id)){
   const idle=html(createElement(SquareRaritySlot,{rarity,name:'測試樣本',icon:'◆'}));
   const chosen=html(createElement(SquareRaritySlot,{rarity,name:'測試樣本',icon:'◆',selected:true}));
   expect(idle).toContain('aria-pressed="false"');
   expect(idle).not.toContain('urban-slot--'+rarity+' is-selected');
   expect(chosen).toContain('aria-pressed="true"');
   expect(chosen).toContain('urban-slot--'+rarity+' is-selected');
   expect((chosen.match(/<button/g)??[])).toHaveLength(1);
   expect(chosen).toContain('urban-slot__square');
  }
  expect(html(createElement(RarityArtwork,{rarity:'gold',icon:'♛'}))).not.toContain('<button');
 });
 it('preserves UI laboratory selected preview and forbids live gold rarity mapping',()=>{
  const view=html(createElement(MemoryRouter,null,createElement(UiShowcasePage)));
  expect((view.match(/data-urban-rarity="/g)??[])).toHaveLength(5);
  expect(view).toContain('金色仍未加入正式掉落表');
  expect(URBAN_RARITIES.find(x=>x.id==='gold')?.description).toContain('未有實際掉落規則');
  expect(MARKET_TO_URBAN_RARITY).toEqual({scrap:'gray',field:'green',special:'blue',forbidden:'purple'});
  expect(CARD_TO_URBAN_RARITY).toEqual({normal:'gray',rare:'blue',chaos:'purple'});
 });
 it('links live market and card visual selection to existing buttons without changing actions',()=>{
  const market=read('src/features/market/BlackMarketPage.tsx');
  const codex=read('src/features/cards/CardsPage.tsx');
  const skill=read('src/features/chapter/SkillHand.tsx');
  expect(market).toContain("selectedId===offer.id?'is-selected':''");
  expect(market).toContain('aria-pressed={selectedId===offer.id}');
  expect(market).toContain('aria-haspopup="dialog"');
  expect(market).toContain("onClick={()=>{setSelectedId(offer.id);playCue('select')}}");
  expect(codex).toContain("selectedId===variant.id&&selectedLevel===variant.level?'is-selected':''");
  expect(codex).toContain('aria-pressed={selectedId===variant.id&&selectedLevel===variant.level}');
  expect(codex).toContain('aria-haspopup="dialog"');
  expect(codex).toContain("dispatch({type:'UPGRADE_CARD',cardId:selected.id})");
  expect(skill).toContain("skillId===id?'is-selected':''");
  expect(skill).toContain('aria-pressed={skillId===id}');
  for(const src of [market,codex,skill])expect(src).not.toContain('<SquareRaritySlot');
 });
 it('hides rarity rims on unselected square and outer market/codex cards even on hover',()=>{
  const css=read('src/styles/_v0850-rarity-selection-gold.scss');
  for(const s of [
   '.urban-rarity-artwork.urban-slot__square',
   '.urban-slot:not(.is-selected) > .urban-slot__square',
   'border-color:transparent!important',
   '.urban-v0845-market-product:not(.is-selected)',
   '.card-library-tile.urban-v0845-codex-card:not(.is-selected)',
   '.urban-v0845-codex-card.is-selected.rarity-tile--rare',
   '.urban-v0845-codex-card.is-selected.rarity-tile--chaos',
   '.urban-v0845-market-product.is-selected .urban-rarity-artwork',
   '.urban-v0845-codex-card.is-selected .urban-rarity-artwork',
   '.urban-v0845-skill-tile.is-selected:not(:disabled)',
   '.urban-slot.is-selected > .urban-slot__square',
   'border-color:var(--urban-slot-edge)!important'
  ])expect(css).toContain(s);
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0851-brushed-metal-final";$/);
 });
 it('runs sparse selected gold ripple, starbursts and sheen with low-motion protection',()=>{
  const css=read('src/styles/_v0850-rarity-selection-gold.scss');
  for(const s of ['.urban-slot--gold:not(.is-selected)', '.urban-slot--gold.is-selected',
   'v0850-gold-ripple','v0850-gold-star','v0850-gold-sheen',
   'repeating-radial-gradient','clip-path:polygon(','11.3s','13.7s','10.7s','11.9s',
   '@media(prefers-reduced-motion:reduce),(update:slow)',
   '@media(forced-colors:active)'])expect(css).toContain(s);
  expect(css).not.toContain('requestAnimationFrame(');
  expect(css).not.toContain('setInterval(');
  expect(css).not.toContain('url(');
 });
 it('does not alter original trade economy, original images, HUD or stored game data',()=>{
  const state=makeInitialState('journalist');
  state.world.minute=12*60;state.economy.coins=1000;
  const before=structuredClone(state);
  const after=gameReducer(state,{type:'MARKET_BUY_ITEM',vendorId:'medic',itemId:'bandage'});
  expect(after.economy.coins).toBe(910);
  expect(after.bag.bandage).toBe((state.bag.bandage??0)+1);
  expect(state).toEqual(before);
  expect(read('tests/v0846-urban-final-integration.test.ts')).toContain('c11ea263d83d5f933b76b937b178ecee');
  expect(read('tests/v0849-hud-liquid-particles.test.ts')).toContain('108eb1e5f1c3f45f');
  expect(read('src/game/state/storage.ts')).toContain('ember-chronicles-prototype-v1');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.51');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.51');
 });
});
