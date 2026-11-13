import {describe,it,expect} from 'vitest';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {getScheduledVendor} from '../src/game/data/marketSchedule';
import {MARKET_VENDORS,vendorById} from '../src/game/data/marketVendors';
import {getMarketSceneUrls,BLACK_MARKET_SCENE_URL,MARKET_SCENE_ROTATION_MS} from '../src/features/market/BlackMarketSceneArt';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';

const read=(file:string)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const art=read('src/features/market/BlackMarketSceneArt.tsx');
const page=read('src/features/market/BlackMarketPage.tsx');
const loader=read('src/features/market/useMarketSceneLoad.ts');
const style=read('src/styles/_v0829-market-scene-carousel.scss');

describe('v0.8.29 correct vendor-specific scene inventory',()=>{
 it('maps source illustrations to the right people, never crossing vendors',()=>{
  expect(MARKET_VENDORS.map(v=>v.id)).toEqual(['broker','mechanic','medic','runner','scavenger']);
  expect(vendorById('mechanic')?.visual.sceneAssets).toEqual([]);
  expect(vendorById('scavenger')?.visual.sceneAssets).toEqual(['black-market-merchant.webp','black-market-scavenger-rummage.webp','black-market-scavenger-weld.webp']);
  for(const id of ['broker','mechanic','medic','runner'])expect(vendorById(id)?.visual.sceneAssets).toEqual([]);
  for(const v of MARKET_VENDORS){
   expect(new Set(v.visual.sceneAssets).size).toBe(v.visual.sceneAssets.length);
   expect(v.visual.sceneAssets.every(x=>x.endsWith('.webp'))).toBe(true);
  }
 });
 it('uses Vite BASE_URL for GitHub Pages assets; checks referenced compressed WebP exist',()=>{
  expect(art).toContain('import.meta.env.BASE_URL');
  expect(BLACK_MARKET_SCENE_URL.endsWith('black-market-merchant.webp')).toBe(true);
  expect(getMarketSceneUrls([])).toEqual([]);
  expect(getMarketSceneUrls(['one.webp','two.webp'])).toEqual([
   `${import.meta.env.BASE_URL}one.webp`,`${import.meta.env.BASE_URL}two.webp`
  ]);
  for(const v of MARKET_VENDORS)for(const asset of v.visual.sceneAssets){
   const path=new URL('../public/'+asset,import.meta.url);
   expect(existsSync(path)).toBe(true);
   const b=readFileSync(path);
   expect(b.subarray(0,4).toString('ascii')).toBe('RIFF');
   expect(b.subarray(8,12).toString('ascii')).toBe('WEBP');
   expect(statSync(path).size).toBeLessThan(65_000);
   expect(statSync(path).size).toBeGreaterThan(10_000);
  }
 });
 it('keeps exact existing phase and trade data untouched',()=>{
  const s=makeInitialState('journalist');
  const copy=structuredClone(s);
  expect(getScheduledVendor(6*60).id).toBe('mechanic');
  expect(getScheduledVendor(23*60).id).toBe('scavenger');
  expect(s).toEqual(copy);
  s.world.minute=16*60;s.bag.notes=1;s.warehouse.notes=4;
  const sold=gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(sold.bag.notes).toBeUndefined();
  expect(sold.warehouse.notes).toBe(4);
 });
});

describe('v0.8.29 predecoded, visibility-aware crossfade',()=>{
 it('cycles only when there are 2+ images, at 12-second intervals, with full timer cleanup',()=>{
  expect(MARKET_SCENE_ROTATION_MS).toBe(12000);
  for(const token of [
   "if(imageUrls.length<2)return",
   'window.setInterval(()=>setActive(old=>(old+1)%imageUrls.length),MARKET_SCENE_ROTATION_MS)',
   "document.visibilityState!=='visible'",
   "window.matchMedia?.('(prefers-reduced-motion: reduce)')",
   "setActive(0)",
   "document.addEventListener('visibilitychange',sync)",
   "document.removeEventListener('visibilitychange',sync)",
   "reduced?.addEventListener?.('change',sync)",
   "reduced?.removeEventListener?.('change',sync)",
   'window.clearInterval(timer)',
   '},[vendor.id,imageUrls.length])',
  ])expect(art).toContain(token);
  expect(page).toContain('<BlackMarketSceneArt key={vendor.id} vendor={vendor}/>');
  expect(art).toContain("if(imageUrls.length===0)");
  expect(art).toContain('market-v0829__empty-scene');
  expect(art).toContain("vendor.id==='scavenger'&&");
  expect(art).toContain('imageUrls.map((imageUrl,index)=>');
  expect(art).toContain('className={`market-v0829__frame');
 });
 it('crossfades only image frames; no movement or controls added to the buying interface',()=>{
  for(const token of [
   '.market-v0829__frame{',
   'opacity:0;',
   'transition:opacity 1.3s',
   '.market-v0829__frame--active{opacity:1}',
   '.market-v0829__empty-scene',
   'pointer-events:none',
   '@media(prefers-reduced-motion:reduce)',
   'transition:none!important',
  ])expect(style).toContain(token);
  expect(style).not.toContain('.market-v12__offers');
  expect(style).not.toContain('market-v0827__wave-item');
  expect(read('src/styles/main.scss')).toContain('@import "v0829-market-scene-carousel"');
 });
 it('waits for ALL images in the current vendor, handles URL changes, timeout and retries',()=>{
  for(const token of [
   'export function useMarketSceneLoad(sceneAssets:readonly string[])',
   "const key=sceneAssets.join('|')",
   "if(sceneAssets.length===0)",
   'remaining=sceneAssets.length',
   'for(const url of getMarketSceneUrls(sceneAssets))',
   'const img=new Image()',
   'img.src=url',
   "img.decode().then(completeOne)",
   'img.complete&&img.naturalWidth>0',
   'img.onerror=fail',
   'window.setTimeout(fail,15_000)',
   'window.clearTimeout(timeout)',
   'setSnapshot({key,status:\'ready\'})',
   'setSnapshot({key,status:\'error\'})',
   'img.onload=null;img.onerror=null',
   '},[key,attempt])',
   "snapshot.key===key?snapshot.status:'loading'",
   "retry:()=>{setSnapshot({key,status:'loading'});setAttempt(i=>i+1);}",
  ])expect(loader).toContain(token);
  expect(page).toContain('useMarketSceneLoad(vendor.visual.sceneAssets)');
  expect(page).toContain("if(sceneLoadStatus!=='ready')return <MarketLoadingScreen");
  expect(loader).not.toContain('setTimeout(completeOne');
 });
 it('preserves classic market violet eye only for scavenger and the scene lamp overlays',()=>{
  expect(art).toContain('market-v0823__warm-light');
  expect(art).toContain('market-v0823__cold-light');
  expect(art).toContain('market-v0827__fluorescent-bloom');
  expect(art).toContain('market-v0823__eyes');
  expect(art).toContain("vendor.id==='scavenger'&&");
  expect(page).toContain('market-v0823__vendor');
  expect(page).toContain('market-v0823__favor');
  expect(page).toContain('<MarketIdleSpeech key={vendor.id} vendor={vendor}/>');
  expect(page).toContain('<MarketShiftCountdown minute={s.world.minute} compact/>');
 });
 it('uses the new version but preserves old GameContext and hunger rules in this batch',()=>{
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe(JSON.parse(read('package.json')).version);
  expect(read('src/app/GameContext.tsx')).toContain('REALTIME_CLOCK_REFRESH_MS');
  expect(read('src/game/state/initial.ts')).toContain('hunger:20');
 });
});
