import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {getScheduledVendor} from '../src/game/data/marketSchedule';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {MARKET_IDLE_INTERVAL_MS,MARKET_IDLE_EXTRAS,getMarketIdleLines,getMarketIdleLine} from '../src/features/market/marketIdleLines';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('src/features/market/BlackMarketPage.tsx');
const speech=read('src/features/market/MarketIdleSpeech.tsx');
const loader=read('src/features/market/useMarketSceneLoad.ts');
const loadUI=read('src/features/market/MarketLoadingScreen.tsx');
const scene=read('src/features/market/BlackMarketSceneArt.tsx');
const css=read('src/styles/_v0825-market-dialogue-loading-polish.scss');

describe('v0.8.25 vendor-specific ambient speech',()=>{
 it('offers ten unique phrases for each of all five scheduled vendors and keeps their original greeting',()=>{
  expect(MARKET_VENDORS).toHaveLength(5);
  expect(MARKET_IDLE_INTERVAL_MS).toBe(10_000);
  for(const vendor of MARKET_VENDORS){
   expect(MARKET_IDLE_EXTRAS[vendor.id]).toHaveLength(9);
   const lines=getMarketIdleLines(vendor);
   expect(lines).toHaveLength(10);
   expect(new Set(lines).size).toBe(10);
   expect(lines[0]).toBe(vendor.line);
   expect(lines.every(line=>line.length>=15)).toBe(true);
   expect(getMarketIdleLine(vendor,0)).toBe(vendor.line);
   expect(getMarketIdleLine(vendor,9)).toBe(lines[9]);
   expect(getMarketIdleLine(vendor,10)).toBe(vendor.line);
   expect(getMarketIdleLine(vendor,11)).toBe(lines[1]);
   expect(getMarketIdleLine(vendor,29)).toBe(lines[9]);
  }
  expect(getScheduledVendor(2*60).id).toBe('scavenger');
  expect(getScheduledVendor(6*60).id).toBe('mechanic');
  expect(getScheduledVendor(12*60).id).toBe('medic');
  expect(getScheduledVendor(16*60).id).toBe('broker');
  expect(getScheduledVendor(20*60).id).toBe('runner');
 });
 it('changes text only, uses one visibility-aware 10-second interval, cleans up on shift/unmount',()=>{
  for(const token of [
   "const [index,setIndex]=useState(0)",
   "timer=setInterval(()=>setIndex(previous=>(previous+1)%10),MARKET_IDLE_INTERVAL_MS)",
   "document.addEventListener('visibilitychange',syncVisibility)",
   "document.removeEventListener('visibilitychange',syncVisibility)",
   "if(timer!==undefined)clearInterval(timer)",
   "if(!document.hidden)",
   "},[vendor.id])",
   "key={index}",
   "getMarketIdleLine(vendor,index)",
  ])expect(speech).toContain(token);
  expect(page).toContain('<MarketIdleSpeech key={vendor.id} vendor={vendor}/>');
  expect(page).toContain('getScheduledVendor(s.world.minute)');
  expect(page).toContain('market-v12__dialogue market-v0823__dialogue market-v0825__speech');
  expect(css).toContain('background:transparent!important');
  expect(css).toContain('border:0!important');
  expect(css).toContain('box-shadow:none!important');
  expect(css).toContain('text-shadow:');
  expect(css).toContain('market-v0825-speech-in');
  expect(css).toContain('overflow-wrap:anywhere');
  const s=makeInitialState('journalist');
  const before=structuredClone(s);
  for(const vendor of MARKET_VENDORS)for(let i=0;i<20;i++)getMarketIdleLine(vendor,i);
  expect(s).toEqual(before);
 });
});

describe('v0.8.25 full-screen loading and recovery',()=>{
 it('waits for the real compressed scene image, not an arbitrary timeout to reveal the page',()=>{
  for(const token of [
   "const {status:sceneLoadStatus,retry:retrySceneLoad}=useMarketSceneLoad()",
   "if(sceneLoadStatus!=='ready')return <MarketLoadingScreen status={sceneLoadStatus} onRetry={retrySceneLoad}/>",
   "const vendor=getScheduledVendor(s.world.minute)",
   "const offers=useMemo<Offer[]>",
   "role=\"progressbar\"",
  ])expect(page).toContain(token);
  expect(scene).toContain('export const BLACK_MARKET_SCENE_URL=');
  expect(scene).toContain('black-market-merchant.webp');
  for(const token of [
   "import {BLACK_MARKET_SCENE_URL} from './BlackMarketSceneArt'",
   "const img=new Image()",
   "img.src=BLACK_MARKET_SCENE_URL",
   "img.decode().then(done)",
   "if(img.complete&&img.naturalWidth>0)onLoaded()",
   "img.onerror=fail",
   "setStatus('ready')",
   "setStatus('error')",
   "window.setTimeout(fail,15_000)",
   "img.onload=null","img.onerror=null",
   "active=false","window.clearTimeout(timeout)",
   "setAttempt(i=>i+1)",
  ])expect(loader).toContain(token);
  expect(loader).not.toContain('setTimeout(done');
 });
 it('shows a true viewport cover with an actionable error/retry and no inert buttons',()=>{
  for(const token of [
   'role={status===\'error\'?\'alert\':\'status\'}',
   'aria-busy={status===\'loading\'}',
   "status==='loading'?'正在確認交易現場…':'無法載入黑市場景'",
   "status==='error'&&",
   'onClick={onRetry}',
   'to="/"',
  ])expect(loadUI).toContain(token);
  for(const token of [
   '.market-v0825__loading{',
   'position:fixed;',
   'inset:0;',
   'z-index:9999;',
   'min-height:100dvh;',
   '.market-v0825__loading-actions button:focus-visible',
  ])expect(css).toContain(token);
 });
});

describe('v0.8.25 centered copper switch and gentle synchronized bounce',()=>{
 it('has centered two-glyph buy/sell labels and the tiny upright word inside the icon',()=>{
  for(const token of [
   '<span>購</span><span>買</span>',
   '<span>販</span><span>賣</span>',
   '<MarketTradeSwitchIcon/>',
   '<MarketTradeSwitchIcon/>',
   "onClick={()=>chooseMode(mode==='sell'?'buy':'sell')}",
   "aria-pressed={mode==='sell'}",
  ])expect(page).toContain(token);
  expect(page).not.toContain('<span className="market-v0824__switch-foot">切換</span>');
  for(const token of [
   'left:0!important','right:0!important',
   'display:flex!important','flex-direction:column!important',
   'align-items:center!important','width:100%!important',
   'writing-mode:horizontal-tb!important',
   '.market-v0824__switch-arrow .market-v0824__switch-foot',
   'inset:0;','place-items:center',
   '.market-v0824__switch-label--buy','.market-v0824__switch-label--sell',
   'translateY(109px)','translateY(-109px)',
  ])expect(css).toContain(token);
  // The underlying vector rotates, but the center word is a sibling overlay.
  expect(read('src/styles/_v0824-market-toggle.scss')).toContain('transform:rotate(180deg)');
  expect(read('src/features/market/MarketTradeSwitchIcon.tsx')).toContain('fill="currentColor"');
 });
 it('animates only the right-side catalog after a mode change, with two restartable directions',()=>{
  for(const token of [
   'const [switchCount,setSwitchCount]=useState(0)',
   'setSwitchCount(n=>n+1)',
   'market-v0825__catalog--${mode}',
   "mode==='sell'?'buy':'sell'",
  ])expect(page).toContain(token);
  for(const token of [
   'market-v0825__catalog--buy','market-v0825__catalog--sell',
   '@keyframes market-v0825-catalog-buy',
   '@keyframes market-v0825-catalog-sell',
   'translateY(5px) scale(.993)',
   'translateY(-2px) scale(1.002)',
   'translateY(0) scale(1)',
  ])expect(css).toContain(token);
  expect(page).toContain("setKind('all')");
  expect(page).toContain("setNarrow('any')");
  expect(page).toContain("setSelectedId(null)");
  expect(page).toContain('offersScroll.scrollRef.current?.scrollTo({top:0})');
 });
 it('retains reduced motion, phones and lower height fallback',()=>{
  for(const token of [
   '@media(max-width:375px)',
   '@media(max-height:700px)',
   '@media(max-height:520px)',
   '@media(prefers-reduced-motion:reduce)',
   'animation:none!important',
   'transition:none!important',
   '.market-v0825__speech-text',
   '.market-v0825__loading-icon',
   'font-size:10px',
   'text-shadow:',
  ])expect(css).toContain(token);
  expect(read('src/styles/main.scss')).toContain('@import "v0825-market-dialogue-loading-polish"');
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
 });
 it('preserves the backpack-only selling and all existing trade guards',()=>{
  const state=makeInitialState('journalist');
  state.world.minute=16*60;
  state.bag.notes=1;
  state.warehouse.notes=4;
  const beforeCoins=state.economy.coins;
  const after=gameReducer(state,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(after.bag.notes).toBeUndefined();
  expect(after.warehouse.notes).toBe(4);
  expect(after.economy.coins).toBeGreaterThan(beforeCoins);
  for(const token of [
   'getBackpackMarketItemIds(s.bag).map(id=>',
   'doesVendorAcceptMarketItem(vendor,item.id)',
   "type:'MARKET_BUY_ITEM'","type:'MARKET_SELL_ITEM'",
   "type:'MARKET_BUY'","type:'MARKET_SELL'",
   'market-v0822__product--${appearance.tier}',
   'market-v0823__meeting',
   'market-v0823__favor',
   'onPointerMove={offersScroll.onPointerMove}',
   'disabled={!selected.canTrade}',
   '<ReturnMainLink className="return-main-link--market"/>',
  ])expect(page).toContain(token);
 });
});
