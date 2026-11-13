import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {MARKET_VENDORS,vendorById} from '../src/game/data/marketVendors';
import {getMarketShiftCountdown} from '../src/features/market/marketShiftCountdown';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('src/features/market/BlackMarketPage.tsx');
const component=read('src/features/market/MarketShiftCountdown.tsx');
const css=read('src/styles/_v0828-typography-market-rail.scss');

describe('v0.8.28 global typography: restrained UI, explicit story emphasis',()=>{
 it('keeps labels, controls, numerals and ordinary headings <= 500 and never changes point sizes',()=>{
  for(const token of [
   '.game-frame :is(button,a,input,textarea,select,option,label,small,[role="tab"],[role="button"])',
   'font-weight:400!important',
   '.game-frame :is(h1,h2,h3,h4,h5,h6,strong,b,output,summary,legend)',
   'font-weight:500!important',
   '.eyebrow,.muted,.app-header__status,.market-v12__table-heading,.chapter-kicker',
   '@import "v0828-typography-market-rail"',
  ])expect(token.includes('@import')?read('src/styles/main.scss'):css).toContain(token);
  expect(css).not.toContain('font-size:24px');
  expect(css).not.toContain('line-height:2.2');
 });
 it('retains narrative emphasis on the named important story and warning text, not all card content',()=>{
  for(const token of ['.home-hero h1','.chapter-hero h1',
   '.story-panel__scroll strong','.game-story-modal blockquote strong',
   '.warning-panel strong','.mission-exit-dialog h3','.enemy-taunt-bubble span',
   'font-weight:700!important'])expect(css).toContain(token);
  expect(css).not.toContain('.game-frame *{');
  expect(css).not.toContain('.game-frame :is(*');
  expect(read('src/features/chapter/ChapterPage.tsx')).toContain('story-panel__scroll');
 });
});

describe('v0.8.28 minimal and unobstructed black-market shift rail',()=>{
 it('places the real countdown in the unused left operation rail, not over the hero portrait',()=>{
  const hero=page.split('className="market-v12__meeting market-v0823__meeting"')[1]?.split('className="market-v0824__exchange"')[0]??'';
  expect(hero).toContain('<BlackMarketSceneArt key={vendor.id} vendor={vendor}/>');
  expect(hero).toContain('market-v0823__favor');
  expect(hero).not.toContain('market-v0826__shift');
  expect(page).toContain('market-v12__modes market-v0824__switch');
  expect(page).toContain('market-v12__time market-v0823__time market-v0826__shift market-v0828__rail-shift');
  expect(page).toContain('<MarketShiftCountdown minute={s.world.minute} compact/>');
  expect(page).toContain('worldPhase(s.world.minute)');
  expect(page).toContain('worldClock(s.world.minute)');
  expect(page).toContain('market-v0824__toggle');
  expect(page).toContain("onClick={()=>chooseMode(mode==='sell'?'buy':'sell')}");
 });
 it('keeps actual shift time, real vendor name and accessible semantics in compact format',()=>{
  for(const token of [
   "compact=false", "if(compact)return", 'role="status"',
   'shift.nextVendorName', 'shift.nextStartClock', 'shift.nextVendorRole',
   'shift.remainingMinutes', 'shift.remainingClock',
   'market-v0828__countdown-kicker',
   'market-v0828__countdown-value',
   'market-v0828__countdown-time',
   'market-v0828__countdown-vendor',
  ])expect(component).toContain(token);
  const shift=getMarketShiftCountdown(4*60+3);
  expect(shift.currentVendorId).toBe('scavenger');
  expect(shift.remainingClock).toBe('00:57');
  expect(shift.nextStartClock).toBe('05:00');
  expect(shift.nextVendorName).toBe('灰手羅恩');
  expect(read('src/features/market/marketShiftCountdown.ts')).not.toContain('setInterval(');
 });
 it('removes the clock panel background and border; maintains fully clickable original rail',()=>{
  for(const token of [
   '.market-v0824__switch>.market-v12__time.market-v0823__time.market-v0826__shift.market-v0828__rail-shift',
   'position:absolute!important',
   'border:0!important','background:none!important','box-shadow:none!important',
   'pointer-events:none','bottom:10px!important',
   '.market-v0824__switch .market-v0826__countdown.market-v0828__countdown',
   'border-top:0!important','background:transparent',
   'font-variant-numeric:tabular-nums',
   '@media(max-width:375px)','@media(max-height:700px)',
   '@media(max-height:520px)',
   '@media(prefers-reduced-motion:reduce)',
  ])expect(css).toContain(token);
  expect(page).toContain('aria-pressed={mode===\'sell\'}');
 });
 it('makes the copper switch about sixty percent of its previous diameter, keeping rotation unchanged',()=>{
  expect(read('src/styles/_v0827-market-final-polish.scss')).toContain('width:35px');
  expect(css).toContain('width:21px!important');
  expect(css).toContain('height:21px!important');
  expect(css).toContain('width:19px!important');
  expect(css).toContain('width:16px!important');
  expect(read('src/styles/_v0824-market-toggle.scss')).toContain('transform:rotate(180deg)');
  expect(page).not.toContain('<span className="market-v0824__switch-foot">切換</span>');
 });
});

describe('v0.8.28 real market vendor identities, future scene schema and commerce safety',()=>{
 it('extends all five existing vendor records without inventing a name, artwork or product',()=>{
  expect(MARKET_VENDORS).toHaveLength(5);
  expect(MARKET_VENDORS.map(v=>v.name)).toEqual([
   '墨鏡阿黛','灰手羅恩','傷疤醫師','白髮信使','防毒面具',
  ]);
  expect(MARKET_VENDORS.map(v=>v.id)).toEqual([
   'broker','mechanic','medic','runner','scavenger',
  ]);
  for(const vendor of MARKET_VENDORS){
   expect(vendor.visual.appearance.length).toBeGreaterThan(12);
   expect(['ambient','violet-mask','workbench-weld']).toContain(vendor.visual.lighting);
   expect(Array.isArray(vendor.visual.sceneAssets)).toBe(true);
   expect(vendorById(vendor.id)).toBe(vendor);
   expect(vendor.sellItems.length).toBeGreaterThan(0);
   expect(vendor.cardIds.length).toBeGreaterThan(0);
  }
  expect(vendorById('scavenger')?.visual.sceneAssets).toEqual(['black-market-merchant.webp','black-market-scavenger-rummage.webp','black-market-scavenger-weld.webp']);
  for(const id of ['broker','mechanic','medic','runner']){
   expect(vendorById(id)?.visual.sceneAssets).toEqual([]);
  }
  expect(vendorById('mechanic')?.visual.lighting).toBe('ambient');
  expect(vendorById('scavenger')?.visual.lighting).toBe('workbench-weld');
 });
 it('preserves all five real shift identities and does not migrate or mutate save state',()=>{
  const s=makeInitialState('journalist');
  s.world.minute=16*60;s.bag.notes=1;s.warehouse.notes=4;
  const before=structuredClone(s);
  for(const v of MARKET_VENDORS){
   expect(v.visual.appearance).toBeTruthy();
   expect(getMarketShiftCountdown(s.world.minute).currentVendorId).toBe('broker');
  }
  expect(s).toEqual(before);
  const sold=gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(sold.bag.notes).toBeUndefined();
  expect(sold.warehouse.notes).toBe(4);
  expect(s).toEqual(before);
 });
 it('bumped version only; world-time and hunger migration remain deferred',()=>{
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe(JSON.parse(read('package.json')).version);
  expect(read('src/app/GameContext.tsx')).toContain('REALTIME_CLOCK_REFRESH_MS');
  expect(read('src/game/engine/consumables.ts')).toContain('p.hunger-20');
  expect(read('src/game/state/initial.ts')).toContain('hunger:20');
 });
});
