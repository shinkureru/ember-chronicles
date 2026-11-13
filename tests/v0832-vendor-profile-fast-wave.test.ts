import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {MARKET_VENDORS,marketSellPrice} from '../src/game/data/marketVendors';
import {getScheduledVendor,getScheduledVendorId} from '../src/game/data/marketSchedule';
import {getMarketVendorProfile,MARKET_VENDOR_SCENE_TARGET} from '../src/features/market/marketVendorProfile';
import {marketWaveDelay,marketWavePhase,MARKET_WAVE_STEP_MS,MARKET_WAVE_DURATION_MS,MARKET_WAVE_WINDOW_MS} from '../src/features/market/marketDiagonalWave';
import {getMarketShiftCountdown} from '../src/features/market/marketShiftCountdown';
import {getMarketIdleLines} from '../src/features/market/marketIdleLines';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ui=read('src/features/market/BlackMarketPage.tsx');
const css=read('src/styles/_v0831-market-diagonal-wave.scss');
describe('v0.8.32 five official market profiles',()=>{
 it('derives identity, role, appearance, image coverage, trading metadata and dialogue from canonical vendor data',()=>{
  expect(MARKET_VENDORS.map(v=>v.name)).toEqual(['墨鏡阿黛','灰手羅恩','傷疤醫師','白髮信使','防毒面具']);
  expect(MARKET_VENDOR_SCENE_TARGET).toBe(3);
  for(const v of MARKET_VENDORS){
   const p=getMarketVendorProfile(v);
   expect(p.vendorId).toBe(v.id);
   expect(p.name).toBe(v.name);
   expect(p.role).toBe(v.role);
   expect(p.appearance).toBe(v.visual.appearance);
   expect(p.sceneAssets).toBe(v.visual.sceneAssets);
   expect(p.sceneTarget).toBe(3);
   expect(p.sceneCount).toBe(v.visual.sceneAssets.length);
   expect(p.lighting).toBe(v.visual.lighting);
   expect(p.acceptedItemCount).toBe(v.buyItems.length);
   expect(p.soldItemCount).toBe(v.sellItems.length);
   expect(p.cardCount).toBe(v.cardIds.length);
   expect(p.speechCount).toBe(getMarketIdleLines(v).length);
   expect(p.speechCount).toBe(10);
  }
 });
 it('only 防毒面具 owns three original scenes; missing assets show the neutral environment',()=>{
  const p=getMarketVendorProfile(MARKET_VENDORS.find(v=>v.id==='scavenger')!);
  expect(p.sceneCount).toBe(3);
  expect(p.sceneStatus).toBe('complete');
  expect(p.sceneFallback).toBe('none');
  expect(p.sceneLighting).toEqual(['portrait','workbench','welding']);
  expect(p.sceneAssets).toEqual([
   'black-market-merchant.webp','black-market-scavenger-rummage.webp','black-market-scavenger-weld.webp',
  ]);
  for(const v of MARKET_VENDORS.filter(v=>v.id!=='scavenger')){
   const other=getMarketVendorProfile(v);
   expect(other.sceneCount).toBe(0);
   expect(other.sceneStatus).toBe('missing');
   expect(other.sceneFallback).toBe('neutral-environment');
   expect(other.sceneStatusLabel).toBe('場景待補');
  }
 });
 it('derives five correct shift windows, including midnight, from the existing schedule',()=>{
  for(const [id,label,start,end] of [
   ['mechanic','05:00–11:00',300,660],
   ['medic','11:00–14:00',660,840],
   ['broker','14:00–18:00',840,1080],
   ['runner','18:00–23:00',1080,1380],
   ['scavenger','23:00–05:00',1380,300],
  ] as const){
   const v=MARKET_VENDORS.find(v=>v.id===id)!;
   const p=getMarketVendorProfile(v);
   expect(p.shiftLabel).toBe(label);
   expect([p.shiftStartMinute,p.shiftEndMinute]).toEqual([start,end]);
   expect(getScheduledVendor(start)).toBe(v);
   expect(getScheduledVendorId(start)).toBe(v.id);
   expect(getMarketShiftCountdown(start).nextStartMinute).toBe(end);
  }
 });
 it('uses sourced profile for lightweight caption without changing trade/stock/favor/game state',()=>{
  for(const token of [
   'getMarketVendorProfile(vendor)','vendorProfile.name','vendorProfile.role',
   'vendorProfile.appearance','vendorProfile.shiftLabel','vendorProfile.sceneStatusLabel',
   'vendorProfile.acceptedItemCount','vendorProfile.soldItemCount','vendorProfile.cardCount',
   '<BlackMarketSceneArt key={vendor.id} vendor={vendor}/>',
   'useMarketSceneLoad(vendor.visual.sceneAssets)','s.economy.blackMarketFavor',
   "mode==='buy'?vendor.sellItems","getBackpackMarketItemIds(s.bag)",
  ])expect(ui).toContain(token);
  const caption=read('src/styles/_v0832-market-vendor-profile.scss');
  expect(caption).toContain('font:400 8px/1.2');
  expect(caption).toContain('text-overflow:ellipsis');
  expect(caption).toContain('@media(max-width:375px)');
  expect(caption).toContain('@media(max-height:520px)');
  expect(caption).not.toContain('background:');
  const s=makeInitialState('journalist');
  s.world.minute=15*60;s.bag.notes=1;s.warehouse.notes=4;s.economy.coins=1500;
  const before=structuredClone(s);
  expect(marketSellPrice('notes')).toBe(19);
  const after=gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(after.bag.notes).toBeUndefined();
  expect(after.warehouse.notes).toBe(4);
  expect(after.economy.coins).toBe(1519);
  expect(s).toEqual(before);
 });
});
describe('v0.8.32 twice-faster regional waves with half bounce',()=>{
 it('halves travel timing and bounce length while preserving 2/3-column diagonal groups',()=>{
  expect(MARKET_WAVE_STEP_MS).toBe(41);
  expect(MARKET_WAVE_DURATION_MS).toBe(360);
  expect(MARKET_WAVE_WINDOW_MS).toBe(892);
  expect(marketWaveDelay(999,2)).toBe(492);
  expect(marketWavePhase(1,3)).toBe(marketWavePhase(3,3));
  expect(marketWavePhase(1,2)).toBe(marketWavePhase(2,2));
  expect(marketWaveDelay(3,3)).toBe(41);
  expect(marketWaveDelay(3,2)).toBe(82);
 });
 it('renders half-size physical displacement and doubles playback speed without whole-panel motion',()=>{
  for(const v of [
   'animation-duration:360ms','translate3d(0,-1.25px,0) scale(1.002)',
   'translate3d(0,-2px,0) scale(1.003)',
   'translate3d(0,-1px,0) scale(1.0015)',
   'translate3d(0,.4px,0) scale(1)',
   'animation-delay:var(--market-wave-delay-three,0ms)',
   'animation-delay:var(--market-wave-delay-two,0ms)',
   '@media(prefers-reduced-motion:reduce)',
   'animation:none!important',
  ])expect(css).toContain(v);
  expect(css).not.toContain('translate3d(0,-4px,0)');
  expect(ui).toContain('window.setTimeout(()=>setWaveActive(false),MARKET_WAVE_WINDOW_MS)');
  expect(ui).toContain('window.clearTimeout(timeout)');
  expect(ui).toContain('setWaveEpoch(n=>n+1);setWaveActive(true)');
  expect(read('src/styles/main.scss')).toContain('@import "v0832-market-vendor-profile"');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0835-final-integrated";$/);
 });
 it('keeps clocks and hunger untouched, with only this minor version updated',()=>{
  expect(JSON.parse(read('package.json')).version).toBe('0.8.35');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.35');
  expect(read('src/app/GameContext.tsx')).toContain('REALTIME_CLOCK_REFRESH_MS');
  expect(read('src/game/engine/consumables.ts')).toContain('p.hunger-20');
 });
});
