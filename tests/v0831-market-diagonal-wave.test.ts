import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {
 marketWaveDelay,marketWavePhase,MARKET_WAVE_DURATION_MS,
 MARKET_WAVE_MAX_PHASE,MARKET_WAVE_STEP_MS,MARKET_WAVE_WINDOW_MS,
} from '../src/features/market/marketDiagonalWave';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getMarketShiftCountdown} from '../src/features/market/marketShiftCountdown';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ui=read('src/features/market/BlackMarketPage.tsx');
const css=read('src/styles/_v0831-market-diagonal-wave.scss');

describe('v0.8.31 true diagonal, overlapping wave phases',()=>{
 it('groups three-column grid diagonals by row + col rather than sequential index',()=>{
  const phases=Array.from({length:12},(_,i)=>marketWavePhase(i,3));
  expect(phases).toEqual([0,1,2,1,2,3,2,3,4,3,4,5]);
  expect(marketWaveDelay(1,3)).toBe(marketWaveDelay(3,3));
  expect(marketWaveDelay(2,3)).toBe(marketWaveDelay(4,3));
  expect(marketWaveDelay(5,3)).toBe(marketWaveDelay(7,3));
  expect(marketWaveDelay(0,3)).toBe(0);
  expect(marketWaveDelay(8,3)).toBe(4*MARKET_WAVE_STEP_MS);
 });
 it('uses two-column diagonals on narrow screens, with adjacent card groups simultaneous',()=>{
  expect(Array.from({length:10},(_,i)=>marketWavePhase(i,2)))
   .toEqual([0,1,1,2,2,3,3,4,4,5]);
  expect(marketWaveDelay(1,2)).toBe(marketWaveDelay(2,2));
  expect(marketWaveDelay(3,2)).toBe(marketWaveDelay(4,2));
  expect(marketWaveDelay(3,2)).toBeGreaterThan(marketWaveDelay(1,2));
  expect(marketWaveDelay(9,2)).toBe(5*MARKET_WAVE_STEP_MS);
 });
 it('works for 0,1,2,3,7,20 cards and never creates a long one-by-one cascade',()=>{
  for(const count of [0,1,2,3,7,20]){
   for(const columns of [2,3] as const){
    const timings=Array.from({length:count},(_,i)=>marketWaveDelay(i,columns));
    expect(timings).toHaveLength(count);
    expect(timings[0]??0).toBe(0);
    expect(timings.every(ms=>ms>=0&&ms<=MARKET_WAVE_MAX_PHASE*MARKET_WAVE_STEP_MS)).toBe(true);
    if(count>=columns+1)expect(new Set(timings).size).toBeLessThan(count);
   }
  }
  expect(MARKET_WAVE_DURATION_MS).toBe(720);
  expect(MARKET_WAVE_STEP_MS).toBe(82);
  expect(MARKET_WAVE_DURATION_MS).toBeGreaterThan(MARKET_WAVE_STEP_MS*5);
  expect(MARKET_WAVE_WINDOW_MS).toBeGreaterThan(
   MARKET_WAVE_MAX_PHASE*MARKET_WAVE_STEP_MS+MARKET_WAVE_DURATION_MS,
  );
  expect(marketWaveDelay(999,2)).toBe(984);
  expect(marketWaveDelay(-10,3)).toBe(0);
  expect(marketWaveDelay(1.4,3)).toBe(0);
 });
});

describe('v0.8.31 React markup, trigger lifecycle and visual isolation',()=>{
 it('wraps EVERY visual card with an independently animatable grid cell',()=>{
  for(const token of [
   'type CSSProperties',
   'filteredOffers.map((offer,index)=>',
   'key={`${waveEpoch}:${offer.type}:${offer.id}`}',
   'className="market-v0831__wave-slot"',
   "'--market-wave-delay-three':`${marketWaveDelay(index,3)}ms`",
   "'--market-wave-delay-two':`${marketWaveDelay(index,2)}ms`",
   'as CSSProperties',
   'market-v0822__product--${appearance.tier}',
   "offer.canTrade?'':'is-unavailable'",
   'onClick={()=>{setSelectedId(offer.id);playCue(\'select\')}}',
   'title={offer.canTrade?',
   'aria-label={`${offer.name}',
   'market-v0822__product-name',
   'market-v0822__product-footer',
  ])expect(ui).toContain(token);
  expect(ui).not.toContain('market-v0827__wave-item');
  expect(ui).not.toContain('animationDelay:`${Math.min(index,28)*66}ms`');
  expect(css).toContain('> .market-v0831__wave-slot > .market-v12__offer.market-v0822__product');
  expect(css).toContain('width:100%!important');
  expect(css).toContain('height:100%!important');
 });
 it('replays on every real mode toggle, including rapid buy->sell->buy switches',()=>{
  for(const token of [
   'const [waveEpoch,setWaveEpoch]=useState(0)',
   'const [waveActive,setWaveActive]=useState(false)',
   'setWaveEpoch(n=>n+1);setWaveActive(true)',
   'mode!==value',
   'waveActive?\'market-v0831__wave-active\':\'\'',
   'window.setTimeout(()=>setWaveActive(false),MARKET_WAVE_WINDOW_MS)',
   'window.clearTimeout(timeout)',
   '},[waveActive,waveEpoch])',
   "onClick={()=>chooseMode(mode==='sell'?'buy':'sell')}",
  ])expect(ui).toContain(token);
  expect(css).toContain('.market-v12__table.market-v0831__wave-active');
  expect(ui).toContain('setSwitchCount(n=>n+1)');
 });
 it('does NOT replay on initial page entry, filters, merchant changes or trade results',()=>{
  expect(ui).toContain('const [waveActive,setWaveActive]=useState(false)');
  for(const token of [
   'setWaveActive(false);setKind(value)',
   'setWaveActive(false);setMore(x=>!x)',
   'setWaveActive(false);setNarrow(f.id)',
   "setKind('all');setNarrow('any');setMore(false);setWaveActive(false)",
   "playCue(mode==='buy'?'confirm':'loot');",
  ])expect(ui).toContain(token);
  expect(ui).toContain("offersScroll.scrollRef.current?.scrollTo({top:0})");
  expect(css).not.toContain('animation-iteration-count:infinite');
 });
 it('keeps filters and outer frame static, only slot transforms the entire card',()=>{
  const oldGrid=read('src/styles/_v081-market-grid.scss');
  expect(oldGrid).toContain('translate:none!important');
  expect(oldGrid).toContain('scale:1!important');
  expect(oldGrid).toContain('transform:none!important');
  expect(css).toContain('.market-v081__catalog > .market-v0831__wave-slot{');
  expect(css).toContain('animation-name:market-v0831-diagonal-rise');
  expect(css).toContain('animation-duration:720ms');
  expect(css).toContain('animation-delay:var(--market-wave-delay-three,0ms)');
  expect(css).toContain('@keyframes market-v0831-diagonal-rise');
  expect(css).toContain('translate3d(0,-4px,0)');
  expect(css).toContain('scale(1.006)');
  expect(css).toContain('translate3d(0,.8px,0)');
  expect(css).not.toContain('animation-name:market-v0831-diagonal-rise;\n animation-duration:720ms;\n animation-delay:var(--market-wave-delay-two,0ms)');
  expect(read('src/styles/_v0827-market-final-polish.scss')).toContain('animation:none!important');
 });
 it('matches true 3-column and <=375px 2-column catalog and honors reduced motion',()=>{
  const grid=read('src/styles/_v0813-market-expanded-catalog.scss');
  expect(grid).toContain('grid-template-columns:repeat(3,minmax(0,1fr))!important');
  expect(grid).toContain('grid-template-columns:repeat(2,minmax(0,1fr))!important');
  expect(css).toContain('@media(max-width:375px)');
  expect(css).toContain('animation-delay:var(--market-wave-delay-two,0ms)');
  expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  expect(css).toContain('animation:none!important');
  expect(css).toContain('transform:none!important');
  expect(css).not.toContain('overflow:hidden');
  expect(read('src/styles/main.scss').trimEnd().endsWith('@import "v0831-market-diagonal-wave";')).toBe(true);
 });
 it('preserves mouse drag, touch scrolling, dialog, original buy/sell dispatch and clock',()=>{
  for(const token of [
   'ref={offersScroll.scrollRef}',
   'onPointerDown={offersScroll.onPointerDown}',
   'onPointerMove={offersScroll.onPointerMove}',
   'onClickCapture={offersScroll.onClickCapture}',
   "mode==='buy'?vendor.sellItems:getBackpackMarketItemIds(s.bag).map(id=>",
   'getVendorStockKey(vendor.id,item.id)',
   'doesVendorAcceptMarketItem(vendor,item.id)',
   'disabled={!selected.canTrade}',
   'selected&&mode&&',
   "type:'MARKET_BUY_ITEM'","type:'MARKET_SELL_ITEM'",
   "type:'MARKET_BUY'","type:'MARKET_SELL'",
   '<BlackMarketSceneArt key={vendor.id} vendor={vendor}/>',
   '<MarketShiftCountdown minute={s.world.minute} compact/>',
  ])expect(ui).toContain(token);
  const state=makeInitialState('journalist');
  state.world.minute=16*60;state.bag.notes=1;state.warehouse.notes=4;
  const previous=structuredClone(state);
  for(let i=0;i<50;i++)marketWaveDelay(i,3);
  expect(state).toEqual(previous);
  expect(getMarketShiftCountdown(state.world.minute).currentVendorId).toBe('broker');
  const after=gameReducer(state,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(after.bag.notes).toBeUndefined();
  expect(after.warehouse.notes).toBe(4);
  expect(state).toEqual(previous);
 });
 it('does not migrate data, change real-time clock or add hunger costs in this batch',()=>{
  expect(JSON.parse(read('package.json')).version).toBe('0.8.31');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.31');
  expect(read('src/app/GameContext.tsx')).toContain('WORLD_TICK_REAL_MS=10000');
  expect(read('src/app/GameContext.tsx')).toContain('WORLD_TICK_GAME_MINUTES=5');
  expect(read('src/game/engine/consumables.ts')).toContain('p.hunger-20');
 });
});
