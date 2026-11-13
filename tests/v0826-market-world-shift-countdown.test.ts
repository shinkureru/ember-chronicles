import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {getScheduledVendor} from '../src/game/data/marketSchedule';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {MARKET_SHIFT_START_MINUTES,MINUTES_PER_GAME_DAY,getMarketShiftCountdown} from '../src/features/market/marketShiftCountdown';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {worldPhaseToken,worldClock} from '../src/game/engine/rules';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ui=read('src/features/market/BlackMarketPage.tsx');
const component=read('src/features/market/MarketShiftCountdown.tsx');
const css=read('src/styles/_v0826-market-shift-countdown.scss');

describe('v0.8.26 world clock shift boundary calculations',()=>{
 it('matches the existing five merchant handovers exactly including minute before and on the boundary',()=>{
  expect(MARKET_SHIFT_START_MINUTES).toEqual([300,660,840,1080,1380]);
  expect(MINUTES_PER_GAME_DAY).toBe(1440);
  const cases:[
   number,string,string,number,number,string
  ][]=[
   [4*60+59,'scavenger','mechanic',1,300,'00:01'],
   [5*60,'mechanic','medic',360,660,'06:00'],
   [10*60+59,'mechanic','medic',1,660,'00:01'],
   [11*60,'medic','broker',180,840,'03:00'],
   [13*60+59,'medic','broker',1,840,'00:01'],
   [14*60,'broker','runner',240,1080,'04:00'],
   [17*60+59,'broker','runner',1,1080,'00:01'],
   [18*60,'runner','scavenger',300,1380,'05:00'],
   [22*60+59,'runner','scavenger',1,1380,'00:01'],
   [23*60,'scavenger','mechanic',360,300,'06:00'],
  ];
  for(const [minute,current,next,remaining,nextStart,clock] of cases){
   const actual=getMarketShiftCountdown(minute);
   expect(actual.currentVendorId).toBe(current);
   expect(actual.nextVendorId).toBe(next);
   expect(actual.nextStartMinute).toBe(nextStart);
   expect(actual.remainingMinutes).toBe(remaining);
   expect(actual.remainingClock).toBe(clock);
   expect(actual.nextVendorName).toBe(getScheduledVendor(nextStart).name);
   expect(actual.nextStartClock).toBe(worldClock(nextStart));
   expect(actual.nextPhaseToken).toBe(worldPhaseToken(nextStart));
   expect(actual.nextVendorRole).toBe(getScheduledVendor(nextStart).role);
  }
  expect(MARKET_VENDORS).toHaveLength(5);
 });
 it('computes midnight wrap and day-absolute/negative input without an off-by-one bug',()=>{
  const midnight=[
   [23*60+59,'05:00','05:01',301,true],
   [0,'05:00','05:00',300,false],
   [2*60+23,'05:00','02:37',157,false],
   [-1,'05:00','05:01',301,true],
   [24*60,'05:00','05:00',300,false],
   [24*60+5*60,'11:00','06:00',360,false],
   [2*1440+23*60,'05:00','06:00',360,true],
  ] as const;
  for(const [m,start,remaining,minutes,crossesMidnight] of midnight){
   const result=getMarketShiftCountdown(m);
   expect(result.nextStartClock).toBe(start);
   expect(result.remainingClock).toBe(remaining);
   expect(result.remainingMinutes).toBe(minutes);
   expect(result.crossesMidnight).toBe(crossesMidnight);
  }
 });
 it('never shows 00:00 for the current vendor at the exact shift threshold',()=>{
  for(let minute=0;minute<1440;minute++){
   const result=getMarketShiftCountdown(minute);
   expect(result.remainingMinutes).toBeGreaterThan(0);
   expect(result.remainingMinutes).toBeLessThanOrEqual(360);
   expect(result.currentVendorId).toBe(getScheduledVendor(minute).id);
   expect(result.nextVendorId).toBe(getScheduledVendor(result.nextStartMinute).id);
   expect(result.currentVendorId).not.toBe(result.nextVendorId);
  }
 });
 it('uses existing world time tick to update both the merchant and the countdown with no extra timer',()=>{
  const s=makeInitialState('journalist');
  s.world.minute=10*60+59;s.mode='home';
  const previous=getMarketShiftCountdown(s.world.minute);
  expect(previous.currentVendorId).toBe('mechanic');
  expect(previous.remainingMinutes).toBe(1);
  const next=gameReducer(s,{type:'WORLD_CLOCK_TICK',minutes:5});
  expect(next).not.toBe(s);
  expect(next.world.minute).toBe(s.world.minute+5);
  const upcoming=getMarketShiftCountdown(next.world.minute);
  expect(upcoming.currentVendorId).toBe('medic');
  expect(upcoming.nextVendorId).toBe('broker');
  expect(upcoming.nextStartClock).toBe('14:00');
  expect(upcoming.remainingMinutes).toBe(176);
  expect(getScheduledVendor(s.world.minute).sellItems).not.toEqual(getScheduledVendor(next.world.minute).sellItems);
  expect(read('src/app/GameContext.tsx')).toContain('WORLD_TICK_REAL_MS=10000');
  expect(read('src/app/GameContext.tsx')).toContain('WORLD_TICK_GAME_MINUTES=5');
  expect(read('src/app/GameContext.tsx')).toContain("if(document.visibilityState==='visible')dispatch({type:'WORLD_CLOCK_TICK',minutes:WORLD_TICK_GAME_MINUTES})");
  expect(read('src/game/engine/resolve.ts')).toContain("case 'WORLD_CLOCK_TICK':");
  expect(read('src/game/engine/resolve.ts')).toContain('advanceTime(s,minutes)');
  expect(read('src/app/GameContext.tsx')).toContain('if(pauseReasons.route||pauseReasons.dialog||state.mode===\'result\')return');
  expect(read('src/app/GameContext.tsx')).toContain("document.visibilityState==='visible'");
  expect(read('src/features/market/marketShiftCountdown.ts')).not.toContain('setInterval(');
  expect(component).not.toContain('setInterval(');
  expect(component).not.toContain('setTimeout(');
 });
 it('does not mutate the current game state or item stock through a read-only projection',()=>{
  const s=makeInitialState('journalist');
  s.world.minute=23*60;s.economy.marketStock['scavenger:canned']=2;
  const before=structuredClone(s);
  const next=getMarketShiftCountdown(s.world.minute);
  expect(next.currentVendorId).toBe('scavenger');
  expect(next.nextVendorId).toBe('mechanic');
  expect(s).toEqual(before);
 });
});

describe('v0.8.26 left-bottom scene UI and existing game safety',()=>{
 it('renders actual world time, next vendor, next boundary and game-minutes remaining',()=>{
  for(const token of [
   'import MarketShiftCountdown from',
   'market-v12__time market-v0823__time market-v0826__shift',
   '<MarketShiftCountdown minute={s.world.minute}/>',
   'worldPhase(s.world.minute)','worldClock(s.world.minute)',
   'getScheduledVendor(s.world.minute)',
   'useEffect(()=>setSelectedId(null),[mode,kind,narrow,vendor.id])',
   "setKind('all');setNarrow('any');setMore(false)",
   "offersScroll.scrollRef.current?.scrollTo({top:0})",
  ])expect(ui).toContain(token);
  for(const token of [
   'getMarketShiftCountdown(minute)',
   'shift.remainingMinutes','shift.remainingClock',
   'shift.nextPhaseName','shift.nextStartClock',
   'shift.nextVendorName','shift.nextVendorRole',
   'role="status"',
   '世界時間 · 換班時商品同步更新',
  ])expect(component).toContain(token);
  expect(ui).not.toContain('setInterval(');
 });
 it('preserves separate right favor and bottom footer, with mobile/short-viewport fallback',()=>{
  for(const token of [
   '.market-v12__time.market-v0823__time.market-v0826__shift',
   'left:8px','bottom:7px','z-index:5',
   'width:clamp(128px,37%,196px)',
   'max-width:calc(100% - 157px)',
   'market-v0826__countdown-main',
   'market-v0826__countdown-next',
   'font-variant-numeric:tabular-nums',
   '@media(max-width:375px)',
   '@media(max-height:700px)',
   '@media(max-height:520px)',
   '@media(prefers-reduced-motion:reduce)',
  ])expect(css).toContain(token);
  expect(read('src/styles/main.scss')).toContain('@import "v0826-market-shift-countdown"');
  for(const token of ['market-v0823__favor','market-v10__footer','GameUtilities','ReturnMainLink',
   'market-v0822__product--${appearance.tier}',
   'market-v0824__switch','<MarketIdleSpeech key={vendor.id} vendor={vendor}/>',
   "if(sceneLoadStatus!=='ready')return <MarketLoadingScreen",
  ])expect(ui).toContain(token);
 });
 it('preserves actual backpack-only selling, vendor-only buying, and off-shift market guards',()=>{
  for(const token of [
   "mode==='buy'?vendor.sellItems:getBackpackMarketItemIds(s.bag).map(id=>",
   'doesVendorAcceptMarketItem(vendor,item.id)',
   'getVendorStockKey(vendor.id,item.id)',
   "type:'MARKET_BUY_ITEM'","type:'MARKET_SELL_ITEM'",
   "type:'MARKET_BUY'","type:'MARKET_SELL'",
   'disabled={!selected.canTrade}',
  ])expect(ui).toContain(token);
  const s=makeInitialState('journalist');
  s.world.minute=10*60+59;s.economy.coins=5000;
  const offShift=gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'medic',itemId:'bandage'});
  expect(offShift).toBe(s);
  const shifted=gameReducer(s,{type:'WORLD_CLOCK_TICK',minutes:5});
  const nowInShift=gameReducer(shifted,{type:'MARKET_BUY_ITEM',vendorId:'medic',itemId:'bandage'});
  expect(nowInShift).not.toBe(shifted);
  expect(nowInShift.economy.coins).toBe(shifted.economy.coins-90);
 });
 it('bumps package and lock to v0.8.26 but does not rewrite save data',()=>{
  expect(JSON.parse(read('package.json')).version).toBe('0.8.26');
  expect(JSON.parse(read('package-lock.json')).version).toBe('0.8.26');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.26');
  expect(read('src/features/market/marketShiftCountdown.ts')).not.toContain('dispatch(');
  expect(read('src/features/market/MarketShiftCountdown.tsx')).not.toContain('dispatch(');
 });
});
