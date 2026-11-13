import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {MARKET_VENDORS,vendorById} from '../src/game/data/marketVendors';
import {getScheduledVendor} from '../src/game/data/marketSchedule';
import {getMarketSceneUrls,MARKET_SCENE_ROTATION_MS} from '../src/features/market/BlackMarketSceneArt';
import {SCAVENGER_PORTRAIT,SCAVENGER_RUMMAGE,SCAVENGER_WELD,WELD_LIGHT,getMarketSceneLighting} from '../src/features/market/marketSceneLighting';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const art=read('src/features/market/BlackMarketSceneArt.tsx');
const style=read('src/styles/_v0830-market-scene-lights.scss');
describe('v0.8.30 user correction: all three scenes belong to 防毒面具',()=>{
 it('moves both original workbench images to scavenger without affecting vendor shifts',()=>{
  const names=[SCAVENGER_PORTRAIT,SCAVENGER_RUMMAGE,SCAVENGER_WELD];
  expect(vendorById('scavenger')?.visual.sceneAssets).toEqual(names);
  expect(vendorById('scavenger')?.visual.lighting).toBe('workbench-weld');
  for(const v of MARKET_VENDORS.filter(v=>v.id!=='scavenger')){
   expect(v.visual.sceneAssets).toEqual([]);
  }
  expect(vendorById('mechanic')?.visual.lighting).toBe('ambient');
  expect(getScheduledVendor(2*60).id).toBe('scavenger');
  expect(getScheduledVendor(6*60).id).toBe('mechanic');
  expect(getMarketSceneUrls(names)).toHaveLength(3);
  expect(MARKET_SCENE_ROTATION_MS).toBe(12000);
  for(const name of names){
   const path=new URL('../public/'+name,import.meta.url);
   expect(existsSync(path)).toBe(true);
   const bytes=readFileSync(path);
   expect(bytes.subarray(0,4).toString('ascii')).toBe('RIFF');
   expect(bytes.subarray(8,12).toString('ascii')).toBe('WEBP');
   expect(statSync(path).size).toBeGreaterThan(10000);
   expect(statSync(path).size).toBeLessThan(65000);
  }
  for(const oldName of ['black-market-mechanic-rummage.webp','black-market-mechanic-weld.webp']){
   expect(existsSync(new URL('../public/'+oldName,import.meta.url))).toBe(false);
  }
 });
 it('keeps trades and old game time intact',()=>{
  const s=makeInitialState('journalist');
  s.world.minute=16*60;s.bag.notes=1;s.warehouse.notes=4;
  const previous=structuredClone(s);
  const after=gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(after.bag.notes).toBeUndefined();
  expect(after.warehouse.notes).toBe(4);
  expect(s).toEqual(previous);
  expect(read('src/app/GameContext.tsx')).toContain('WORLD_TICK_GAME_MINUTES=5');
 });
});
describe('v0.8.30 frame-specific lighting / welding',()=>{
 it('maps light behavior to each named picture, and future unknown assets are ambient',()=>{
  expect(getMarketSceneLighting(SCAVENGER_PORTRAIT)).toBe('portrait');
  expect(getMarketSceneLighting(SCAVENGER_RUMMAGE)).toBe('workbench');
  expect(getMarketSceneLighting(SCAVENGER_WELD)).toBe('welding');
  expect(getMarketSceneLighting('another-vendor.webp')).toBe('ambient');
  expect(WELD_LIGHT).toEqual({x:297,y:279});
 });
 it('crossfades the grouped image WITH its lamps and optional scene-specific effects',()=>{
  for(const token of [
   'imageUrls.map((imageUrl,index)=>','getMarketSceneLighting(sceneAssets[index]',
   'market-v0830__scene-layer','href={imageUrl}','cx="202" cy="67"',
   'cx="189" cy="88"','market-v0830__pendant-glow',
   'market-v0830__tube-glow','market-v0830__tube-bloom',
   "vendor.id==='scavenger'&&lighting==='portrait'&&",
   "vendor.id==='scavenger'&&lighting==='welding'&&",
   'market-v0823__eyes','market-v0830__welding',
   'market-v0830__weld-flare','market-v0830__weld-center','market-v0830__weld-sparks',
   'cx={WELD_LIGHT.x} cy={WELD_LIGHT.y}',
  ])expect(art).toContain(token);
  expect(style).toContain('transition:opacity 1.3s');
  expect(style).toContain('.market-v0829__frame--active');
  expect(art).toContain('viewBox="0 0 960 536"');
 });
 it('provides asymmetric gentle pendants, tube pulses and irregular sparks only on weld picture',()=>{
  for(const token of [
   'market-v0830-pendant 6.6s','market-v0830-tube 7.8s',
   'market-v0830-tube-bloom 8.4s','market-v0830-weld-halo 2.4s',
   'market-v0830-weld-core 2.4s steps(1,end)',
   'market-v0830-weld-sparks 2.4s steps(1,end)',
   '@keyframes market-v0830-weld-halo','@keyframes market-v0830-weld-sparks',
   'mix-blend-mode:screen',
  ])expect(style).toContain(token);
 });
 it('respects reduced-motion and keeps light effects off the trading UI',()=>{
  const reduced=style.split('@media(prefers-reduced-motion:reduce)')[1]??'';
  expect(reduced).toContain('animation:none!important');
  expect(reduced).toContain('transition:none!important');
  expect(reduced).toContain('.market-v0830__weld-sparks{opacity:0}');
  expect(style).not.toContain('market-v12__offers');
  expect(read('src/styles/main.scss')).toContain('@import "v0830-market-scene-lights";');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.30');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.30');
 });
});
