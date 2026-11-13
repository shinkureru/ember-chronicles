import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getScheduledVendor} from '../src/game/data/marketSchedule';
import {getMarketShiftCountdown} from '../src/features/market/marketShiftCountdown';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {getMarketIdleLines,MARKET_IDLE_INTERVAL_MS} from '../src/features/market/marketIdleLines';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('src/features/market/BlackMarketPage.tsx');
const scene=read('src/features/market/BlackMarketSceneArt.tsx');
const polish=read('src/styles/_v0827-market-final-polish.scss');
const oldMotion=read('src/styles/_v0825-market-dialogue-loading-polish.scss');

describe('v0.8.27 merchant dialogue screenshot regression',()=>{
 it('removes dark glyph strokes, repeated sharp outline and blur while retaining readable bare text',()=>{
  expect(page).toContain('market-v12__dialogue market-v0823__dialogue market-v0825__speech');
  for(const token of [
   '.market-v12__dialogue.market-v0823__dialogue.market-v0825__speech',
   '-webkit-text-stroke:0!important','filter:none!important',
   'paint-order:normal','text-shadow:0 1px 3px',
   'background:transparent!important','border:0!important','box-shadow:none!important',
   '.market-v0825__speech-text','animation:market-v0827-speech-fade',
   '@keyframes market-v0827-speech-fade',
  ])expect(polish).toContain(token);
  expect(polish).not.toContain('filter:blur(');
  expect(polish).not.toContain('text-shadow:\n  -1px -1px');
  expect(oldMotion).toContain('-webkit-text-stroke:.15px'); // regression source
  expect(polish).toContain('font-weight:650');
  expect(read('src/features/market/MarketIdleSpeech.tsx')).toContain('getMarketIdleLine(vendor,index)');
 });
 it('preserves ten dialogue lines per shift and the 10-second cycle',()=>{
  expect(MARKET_IDLE_INTERVAL_MS).toBe(10000);
  expect(MARKET_VENDORS).toHaveLength(5);
  for(const v of MARKET_VENDORS){
   expect(getMarketIdleLines(v)).toHaveLength(10);
   expect(new Set(getMarketIdleLines(v)).size).toBe(10);
  }
 });
});

describe('v0.8.27 smaller centered switch without the visible word',()=>{
 it('removes the center text but retains one entire rail button and original arrow rotation',()=>{
  expect(page).not.toContain('<span className="market-v0824__switch-foot">切換</span>');
  expect(page).toContain('<MarketTradeSwitchIcon/>');
  expect(page).toContain('onClick={()=>chooseMode(mode===\'sell\'?\'buy\':\'sell\')}');
  expect(page).toContain('aria-pressed={mode===\'sell\'}');
  expect(page).toContain('<span>購</span><span>買</span>');
  expect(page).toContain('<span>販</span><span>賣</span>');
  for(const token of ['width:35px','height:35px','width:31px','height:31px','width:27px','height:27px',
   'left:50%','transform:translateX(-50%)','display:none!important',
   'translateY(104px)','translateY(-104px)'])expect(polish).toContain(token);
  expect(read('src/styles/_v0824-market-toggle.scss')).toContain('transform:rotate(180deg)');
  expect(read('src/styles/_v0825-market-dialogue-loading-polish.scss')).toContain('align-items:center!important');
 });
});

describe('v0.8.27 staggered PER CARD wave instead of whole panel bounce',()=>{
 it('adds stable row-major index with a bounded CSS animation delay on each card',()=>{
  expect(page).toContain('filteredOffers.map((offer,index)=>');
  expect(page).toContain('market-v0827__wave-item');
  expect(page).toContain('style={{animationDelay:`${Math.min(index,28)*66}ms`}}');
  const delays=Array.from({length:12},(_,i)=>Math.min(i,28)*66);
  expect(delays).toEqual([0,66,132,198,264,330,396,462,528,594,660,726]);
  expect(Math.min(100,28)*66).toBe(1848);
  expect(page).toContain('market-v0825__catalog--${mode}');
  expect(page).toContain('setSwitchCount(n=>n+1)');
  expect(page).toContain('onPointerDown={offersScroll.onPointerDown}');
  expect(page).toContain('onClickCapture={offersScroll.onClickCapture}');
 });
 it('overrides whole panel animation and animates only item descendants',()=>{
  for(const token of [
   '.market-v12__table.market-v0825__catalog--buy,',
   '.market-v12__table.market-v0825__catalog--sell{',
   'animation:none!important','transform:none!important','opacity:1!important',
   '.market-v12__offers .market-v0827__wave-item',
   'animation-name:market-v0827-item-buy',
   'animation-name:market-v0827-item-sell',
   'animation-duration:.58s',
   '@keyframes market-v0827-item-buy',
   '@keyframes market-v0827-item-sell',
   'translate:0 -9px','translate:0 2px',
   'scroll-padding-top:12px',
   ':focus-visible',
  ])expect(polish).toContain(token);
  expect(oldMotion).toContain('@keyframes market-v0825-catalog-buy'); // original overridden
  expect(read('src/styles/_v0822-market-product-tiers.scss')).toContain('transform:none!important');
  // Individual translate & scale are not the blocked transform property.
  expect(polish).toContain('scale:1.016');
  expect(polish).not.toContain('@keyframes market-v0827-item-buy{\n 0%{transform:');
 });
 it('honors reduced motion on the cards, speech and lamp, not the underlying trade UI',()=>{
  expect(polish).toContain('@media(prefers-reduced-motion:reduce)');
  for(const token of [
   'animation:none!important',
   'translate:none!important',
   'scale:1!important',
   '.market-v0827__fluorescent-bloom',
   '.market-v0825__speech-text',
  ])expect(polish).toContain(token);
 });
});

describe('v0.8.27 fluorescent bar and final responsive behavior',()=>{
 it('adds image-space fluorescent soft blue-white glow and a gentle independent light pulse',()=>{
  expect(scene).toContain('viewBox="0 0 960 536"');
  expect(scene).toContain('market-v0823__cold-light');
  expect(scene).toContain('market-v0823__warm-light');
  expect(scene).toContain('market-v0823__eyes');
  expect(scene).toContain('market-v0827-fluorescent');
  expect(scene).toContain('market-v0827__fluorescent-bloom');
  expect(scene).toContain('cx="189" cy="88" rx="160" ry="50"');
  expect(scene).toContain('transform="rotate(13 189 88)"');
  expect(scene).toContain('stopColor="#efffff"');
  expect(polish).toContain('animation:market-v0827-fluorescent-pulse 6.5s ease-in-out infinite');
  expect(polish).toContain('@keyframes market-v0827-fluorescent-pulse');
  expect(polish).toContain('mix-blend-mode:screen');
  expect(polish).toContain('opacity:.35;');
  expect(polish).toContain('pointer-events:none');
 });
 it('keeps compact 2/3 column item grid, controls, both shift badges and footer in place',()=>{
  for(const token of [
   '@media(max-width:375px)',
   '@media(max-height:700px)',
   '@media(max-height:520px)',
   'min-width:0','min-height:0','overflow-wrap:anywhere',
  ])expect(polish).toContain(token);
  const grid=read('src/styles/_v0813-market-expanded-catalog.scss');
  expect(grid).toContain('grid-template-columns:repeat(3,minmax(0,1fr))!important');
  expect(grid).toContain('grid-template-columns:repeat(2,minmax(0,1fr))!important');
  for(const token of [
   'market-v0824__exchange','market-v0823__meeting','market-v0823__favor',
   'market-v0826__shift','<MarketShiftCountdown minute={s.world.minute} compact/>',
   'market-v10__footer','GameUtilities','ReturnMainLink',
   "getBackpackMarketItemIds(s.bag).map(id=>",
   "mode==='buy'?vendor.sellItems",
   "type:'MARKET_BUY_ITEM'","type:'MARKET_SELL_ITEM'",
   "type:'MARKET_BUY'","type:'MARKET_SELL'",
  ])expect(page).toContain(token);
  expect(read('src/styles/main.scss').trimEnd().endsWith('@import "v0827-market-final-polish";')).toBe(true);
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe(JSON.parse(read('package.json')).version);
 });
 it('does not alter game state when querying shifts and still protects bag vs warehouse on sale',()=>{
  const state=makeInitialState('journalist');state.world.minute=16*60;
  state.bag.notes=1;state.warehouse.notes=4;
  const before=structuredClone(state);
  expect(getMarketShiftCountdown(state.world.minute).currentVendorId).toBe('broker');
  expect(getScheduledVendor(state.world.minute).id).toBe('broker');
  expect(state).toEqual(before);
  const sold=gameReducer(state,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(sold.bag.notes).toBeUndefined();
  expect(sold.warehouse.notes).toBe(4);
  expect(state).toEqual(before);
 });
});
