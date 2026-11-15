import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {CARDS} from '../src/game/data/cards';
import {ATTACK_CARDS} from '../src/game/data/attacks';
import {ITEMS} from '../src/game/data/items';
import {getMarketProductPresentation} from '../src/features/market/marketProductPresentation';
import {CARD_TO_URBAN_RARITY,MARKET_TO_URBAN_RARITY,cardRarityToUrbanRarity,marketTierToUrbanRarity} from '../src/components/ui/urbanUiAdapters';
import RarityArtwork from '../src/components/ui/RarityArtwork';
import SquareRaritySlot from '../src/components/ui/SquareRaritySlot';
import StatBar from '../src/components/StatBar';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {TOWN_DISTRICT_HOTSPOTS} from '../src/features/town/townDistrictHotspots';
import type {TownFacilityId} from '../src/game/types';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const market=read('src/features/market/BlackMarketPage.tsx');
const codex=read('src/features/cards/CardsPage.tsx');
const skill=read('src/features/chapter/SkillHand.tsx');
const hud=read('src/components/Hud.tsx');
const town=read('src/features/town/TownDistrictPage.tsx');
const css=read('src/styles/_v0845-urban-selective-adoption.scss');

describe('v0.8.45 — staged adoption in actual gameplay UI without new economy',()=>{
 it('exhaustively maps the four existing market tiers into four styles, never gold',()=>{
  expect(Object.entries(MARKET_TO_URBAN_RARITY)).toEqual([
   ['scrap','gray'],['field','green'],['special','blue'],['forbidden','purple'],
  ]);
  expect(Object.values(MARKET_TO_URBAN_RARITY)).not.toContain('gold');
  for(const vendor of MARKET_VENDORS){
   for(const id of vendor.cardIds){
    const view=getMarketProductPresentation('card',id);
    expect(['gray','green','blue','purple']).toContain(marketTierToUrbanRarity(view.tier));
   }
   for(const offer of vendor.sellItems){
    expect(ITEMS[offer.id]).toBeDefined();
    const view=getMarketProductPresentation('item',offer.id);
    expect(['gray','green','blue','purple']).toContain(marketTierToUrbanRarity(view.tier));
   }
  }
 });
 it('maps only three existing card rarity rules; never changes a card level or invents gold',()=>{
  expect(CARD_TO_URBAN_RARITY).toEqual({normal:'gray',rare:'blue',chaos:'purple'});
  expect(Object.values(CARD_TO_URBAN_RARITY)).not.toContain('gold');
  for(const card of [...Object.values(CARDS),...Object.values(ATTACK_CARDS)]){
   expect(['gray','blue','purple']).toContain(cardRarityToUrbanRarity(card.rarity));
  }
  const state=makeInitialState('courier');
  const before=JSON.stringify(state);
  for(const card of Object.values(CARDS))cardRarityToUrbanRarity(card.rarity);
  expect(JSON.stringify(state)).toBe(before);
 });
 it('builds shared display-only artwork rather than nesting a second button',()=>{
  const art=renderToStaticMarkup(createElement(RarityArtwork,{rarity:'purple',icon:'☣'}));
  expect(art).toContain('data-urban-artwork="purple"');
  expect(art).toContain('urban-slot__square');
  expect(art).toContain('urban-slot__rim');
  expect(art).not.toContain('<button');
  const wrapper=renderToStaticMarkup(createElement('button',{type:'button'},
   createElement(RarityArtwork,{rarity:'blue',icon:'▣'})));
  expect((wrapper.match(/<button/g)??[])).toHaveLength(1);
  const lab=renderToStaticMarkup(createElement(SquareRaritySlot,{rarity:'gold',name:'視覺預留',icon:'＊'}));
  expect((lab.match(/<button/g)??[])).toHaveLength(1);
  expect(lab).toContain('data-urban-artwork="gold"');
  expect(lab).toContain('aria-pressed="false"');
 });
 it('keeps real black-market trade choice and exact live stock/price/selected dialog',()=>{
  for(const t of [
   'getMarketProductPresentation(offer.type,offer.id)',
   'formatMarketOfferQuantity(offer.type,mode,offer.available)',
   'marketTierToUrbanRarity(appearance.tier)',
   '<RarityArtwork',
   'urban-v0845-market-product',
   'urban-v0845-market-art',
   'className="market-v0822__product-top"',
   'className="market-v0822__product-footer"',
   'className="market-v0822__quantity"',
   "onClick={()=>{setSelectedId(offer.id);playCue('select')}}",
   "disabled={!selected.canTrade}",
  ])expect(market).toContain(t);
  expect(market).not.toContain('<SquareRaritySlot');
  expect(market).not.toContain('urban-slot--gold');
  expect(market).toContain('offer.price');
 });
 it('retains card grade/levels/ownership, action details and upgrading while visualizing inside the old tile',()=>{
  for(const t of [
   'cardRarityToUrbanRarity(card.rarity)','<RarityArtwork',
   'urban-v0845-codex-card','urban-v0845-codex-art',
   'setSelectedId(variant.id)','setSelectedLevel(variant.level)',
   'card-library-tile__rarity','card-library-tile__footer',
   '×{variant.quantity}','getAttackDamage(s,attackCard.id)',
   "dispatch({type:'UPGRADE_CARD',cardId:selected.id})",
  ])expect(codex).toContain(t);
  expect(codex).not.toContain('<SquareRaritySlot');
 });
 it('preserves full skill scatter drag, compatibility, selected/disabled, cost and zero-skill card',()=>{
  for(const t of [
   'onPointerDown={onPointerDown}', 'onPointerMove={onPointerMove}', 'onPointerUp={onPointerUp}',
   'selectSkill(null)', 'isSkillCompatible(choice,card)',
   'state.player.resource>=card.resourceCost', 'disabled={!allowed}',
   "onClick={()=>selectSkill(id)}", 'aria-pressed={skillId===id}',
   'cardRarityToUrbanRarity(card.rarity)','urban-v0845-skill-art','<RarityArtwork',
   "card.resourceCost>0?",'skill-tile--none',
  ])expect(skill).toContain(t);
  expect(skill).not.toContain('<SquareRaritySlot');
 });
 it('uses a compact optional real-HUD glow without changing StatBar semantics or the real counters',()=>{
  expect(hud).toContain('hud--urban-v0845');
  expect(hud).toContain('<StatBar value={p.health} max={p.maxHealth}');
  expect(hud).toContain('<StatBar value={p.stamina} max={p.maxStamina}');
  expect(hud).toContain('color="red" urban');
  expect(hud).toContain('color="mint" urban');
  expect(hud).toContain('飢餓 {p.hunger}');
  const bar=renderToStaticMarkup(createElement(StatBar,{value:12,max:8,color:'red',label:'生命',urban:true}));
  expect(bar).toContain('statbar--urban');
  expect(bar).toContain('width:100%');
  expect(bar).not.toContain('width:150%');
  const plain=renderToStaticMarkup(createElement(StatBar,{value:4,max:8,color:'mint',label:'測試'}));
  expect(plain).not.toContain('statbar--urban');
 });
 it('adds CSS atmosphere to unchanged 768×1376 stage, not real scene images or clickable overlays',()=>{
  expect(town).toContain('city-district-scene__atmosphere--');
  expect(town).toContain('aria-hidden="true"');
  expect(town).toContain('getTownDistrictHotspots(district.id)');
  expect(town).toContain("onClick={event=>openFacility(h.facility,event)}");
  expect(town).toContain("dispatch({type:'TOWN_SERVICE',serviceId})");
  const ids=Object.values(TOWN_DISTRICT_HOTSPOTS).flatMap(h=>h.map(x=>x.facility));
  expect(ids).toHaveLength(7);
  expect(new Set<TownFacilityId>(ids).size).toBe(7);
  expect(css).toContain('pointer-events:none');
  expect(css).toContain('city-district-scene__atmosphere');
  expect(css).toContain('urban-v0845-beacon');
  expect(css).toContain('urban-v0845-fog');
 });
 it('limits visual changes to original buttons and 320px phones; honors reduced-motion',()=>{
  expect(css).toContain('.urban-v0845-market-art');
  expect(css).toContain('.urban-v0845-codex-art');
  expect(css).toContain('.urban-v0845-skill-art');
  expect(css).toContain('.statbar--urban');
  expect(css).toContain('aspect-ratio:1');
  expect(css).toContain('@media(max-width:375px),(max-height:590px)');
  expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  expect(css).toContain('animation:none!important');
  expect(css).not.toMatch(/\bvideo\s*\{|<video/);
  expect(css).not.toMatch(/\bcanvas\s*\{|<canvas/);
  expect(css).not.toContain('position:fixed');
  const imports=read('src/styles/main.scss');
  expect(imports.trimEnd()).toMatch(/@import "v0849-hud-liquid";$/);
  expect(imports.indexOf('@import "v0844-urban-ui-showcase";'))
   .toBeLessThan(imports.indexOf('@import "v0845-urban-selective-adoption";'));
 });
 it('preserves original engine economy while adding only artwork classes',()=>{
  const state=makeInitialState('journalist');
  state.world.minute=12*60;state.economy.coins=1000;
  const pre=structuredClone(state);
  const post=gameReducer(state,{type:'MARKET_BUY_ITEM',vendorId:'medic',itemId:'bandage'});
  expect(post.economy.coins).toBe(state.economy.coins-90);
  expect(post.bag.bandage).toBe((state.bag.bandage??0)+1);
  expect(state).toEqual(pre);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.49');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.49');
  expect(read('src/game/state/storage.ts')).toContain('localStorage');
 });
});
