import {afterEach,describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {loadGame,saveGame} from '../src/game/state/storage';
import {gameReducer} from '../src/game/engine/resolve';
import {calculateActionPreview,getVisibleActions,retreatPreview} from '../src/game/engine/rules';
import {getTaipeiClock,taipeiDate} from '../src/game/engine/taipeiClock';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {getScheduledVendor,getScheduledVendorId} from '../src/game/data/marketSchedule';
import {getMarketShiftCountdown} from '../src/features/market/marketShiftCountdown';
import {MARKET_WAVE_STEP_MS,MARKET_WAVE_DURATION_MS} from '../src/features/market/marketDiagonalWave';
import {townServiceHungerCost,townHungerProjection,hungerProjection,
 projectedHunger,normalizeHunger,hungerSuccessPenalty} from '../src/game/engine/hungerCosts';
import {getTownServiceLock} from '../src/game/engine/townActions';
import {remainingDailyRest,previewInnRest} from '../src/game/engine/innRest';
import {previewConsumable} from '../src/game/engine/consumables';
const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const inTown=()=>{const s=makeInitialState('journalist');s.world.minute=16*60;s.economy.coins=2000;return s};
afterEach(()=>vi.unstubAllGlobals());

describe('v0.8.35 final integration: real time, hunger, equipment, market and UI',()=>{
 it('converts civil midnight and all five Taipei merchant boundaries without day drift',()=>{
  const before=getTaipeiClock(Date.parse('2026-11-13T15:59:59Z'));
  const after=getTaipeiClock(Date.parse('2026-11-13T16:00:00Z'));
  expect(before.minute).toBe(1439);expect(after.minute).toBe(0);
  expect(after.day).toBe(before.day+1);
  expect(taipeiDate(after.day)).toBe('2026/11/14');
  for(const [hour,id] of [[5,'mechanic'],[11,'medic'],[14,'broker'],[18,'runner'],[23,'scavenger']] as const){
   expect(getScheduledVendorId(hour*60)).toBe(id);
   const forecast=getMarketShiftCountdown(hour*60-1);
   expect(forecast.remainingMinutes).toBe(1);
   expect(forecast.nextVendorId).toBe(id);
  }
  const late=getMarketShiftCountdown(23*60+59);
  expect(late.nextStartClock).toBe('05:00');
  expect(late.crossesMidnight).toBe(true);
 });
 it('preserves five authentic vendors, original three scavenger frames and exact fast wave',()=>{
  expect(MARKET_VENDORS).toHaveLength(5);
  expect(new Set(MARKET_VENDORS.map(v=>v.id)).size).toBe(5);
  expect(getScheduledVendor(14*60).name).toBe('墨鏡阿黛');
  expect(MARKET_VENDORS.find(v=>v.id==='scavenger')?.visual.sceneAssets).toEqual([
   'black-market-merchant.webp','black-market-scavenger-rummage.webp','black-market-scavenger-weld.webp',
  ]);
  expect(MARKET_VENDORS.filter(v=>v.id!=='scavenger').every(v=>v.visual.sceneAssets.length===0)).toBe(true);
  expect(MARKET_WAVE_STEP_MS).toBe(41);
  expect(MARKET_WAVE_DURATION_MS).toBe(360);
  const scss=read('src/styles/_v0831-market-diagonal-wave.scss');
  expect(scss).toContain('-2px');
  expect(scss).toContain('prefers-reduced-motion:reduce');
 });
 it('keeps zero food hunger, 100 cap and preserves finite 0-100 on old saves',()=>{
  expect([NaN,Infinity,-Infinity,null,undefined].map(normalizeHunger)).toEqual([20,20,20,20,20]);
  expect(normalizeHunger(-4)).toBe(0);
  expect(normalizeHunger(135)).toBe(100);
  expect(normalizeHunger(44.6)).toBe(45);
  expect(projectedHunger(99,8)).toBe(100);
  expect(hungerProjection(99,8)).toMatchObject({hungerDelta:8,appliedDelta:1,projectedHunger:100});
  expect(hungerProjection(3,-38)).toMatchObject({hungerDelta:-38,appliedDelta:-3,projectedHunger:0});
  const old=makeInitialState('journalist');old.player.hunger=190;old.economy.coins=777;
  old.bag.biscuit=2;old.chapterProgress.unlocked=2;
  let stored=JSON.stringify(old);
  vi.stubGlobal('localStorage',{getItem:()=>stored,setItem:(_key:string,value:string)=>{stored=value}});
  const first=loadGame();
  expect(first.player.hunger).toBe(100);
  expect(first.economy.coins).toBe(777);
  expect(first.bag.biscuit).toBe(2);
  expect(first.chapterProgress.unlocked).toBe(2);
  expect(saveGame(first)).toBe(true);
  expect(loadGame().player.hunger).toBe(100);
 });
 it('reduces passive rest and medical costs, leaves strenuous services and meals unchanged',()=>{
  const costs:Record<string,number>={
   rest_cot:3,rest_private:5,rest_short:2,
   clinic_wounds:2,clinic_infection:3,clinic_poison:3,clinic_illness:3,clinic_general:2,
   workshop_repair:3,workshop_upgrade:5,train:5,tavern_rumor:2,
   bath:3,wash_clothes:4,hot_meal:0,canteen_talk:2,
  };
  for(const [id,cost] of Object.entries(costs))expect(townServiceHungerCost(id),id).toBe(cost);
  const city=inTown();city.player.hunger=99;city.player.health=4;city.player.stamina=3;
  const predicted=previewInnRest(city,'rest_cot');
  const hunger=townHungerProjection(city,'rest_cot');
  expect(hunger).toMatchObject({hungerDelta:3,appliedDelta:1,projectedHunger:100});
  const next=gameReducer(city,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(next.player.hunger).toBe(100);
  expect(next.player.health).toBe(predicted.predictedHealth);
  expect(next.player.stamina).toBe(predicted.predictedStamina);
  expect(next.world).toEqual(city.world);
  expect(next.economy.coins).toBe(city.economy.coins-15);
  expect(next.log.at(-1)).toContain('飢餓 +1');
  expect(city.player.hunger).toBe(99);
 });
 it('recovery, shopping and completed quests never apply an extra hunger cost after being blocked',()=>{
  const city=inTown();city.economy.coins=0;city.player.hunger=99;
  expect(getTownServiceLock(city,'rest_cot')).toBeTruthy();
  expect(gameReducer(city,{type:'TOWN_SERVICE',serviceId:'rest_cot'})).toBe(city);
  expect(gameReducer(city,{type:'CLINIC_BUY_ITEM',itemId:'sterile_bandage'})).toBe(city);
  expect(gameReducer(city,{type:'TOWN_COMPLETE_QUEST',questId:'emergency_water'})).toBe(city);
  expect(city.player.hunger).toBe(99);
  const food=inTown();food.player.hunger=99;
  const meal=townHungerProjection(food,'hot_meal');
  expect(meal).toMatchObject({hungerDelta:-38,projectedHunger:61,appliedDelta:-38});
  expect(gameReducer(food,{type:'TOWN_SERVICE',serviceId:'hot_meal'}).player.hunger).toBe(61);
  food.player.hunger=5;food.bag.biscuit=1;
  expect(gameReducer(food,{type:'USE_ITEM',itemId:'biscuit'}).player.hunger).toBe(previewConsumable(food,'biscuit')?.player.hunger);
 });
 it('uses actual applied hunger in an action, without moving the Taipei clock',()=>{
  let game=inTown();game=gameReducer(game,{type:'START_ATTEMPT'});
  game.player.hunger=99;
  const action=getVisibleActions(game).find(c=>c.id==='gate_observe')!;
  const preview=calculateActionPreview(game,action,null);
  expect(preview.hungerCost).toBeGreaterThan(0);
  expect(preview.appliedHungerCost).toBe(1);
  expect(preview.projectedHunger).toBe(100);
  const after=gameReducer(game,{type:'CHOOSE',choiceId:action.id,skillId:null});
  expect(after.player.hunger).toBe(preview.projectedHunger);
  expect(after.world).toEqual(game.world);
  expect(hungerSuccessPenalty(after.player.hunger)).toBe(16);
  expect(game.player.hunger).toBe(99);
 });
 it('retreat confirmation cost is consistent and returning home/clock refresh never charges twice',()=>{
  let game=inTown();game=gameReducer(game,{type:'START_ATTEMPT'});
  game.player.hunger=94;game.rngSeed=0;
  const preview=retreatPreview(game);
  const after=gameReducer(game,{type:'RETREAT'});
  expect(after.player.hunger).toBeGreaterThanOrEqual(preview.projectedHunger);
  expect(after.player.hunger).toBeLessThanOrEqual(100);
  expect(after.world).toEqual(game.world);
  const back=gameReducer(after,{type:'RETURN_HUB'});
  expect(back.player.hunger).toBe(after.player.hunger);
  const sync=gameReducer(back,{type:'WORLD_CLOCK_SYNC',nowMs:Date.parse('2026-11-13T16:00:00Z')});
  expect(sync.player.hunger).toBe(after.player.hunger);
 });
 it('resets daily rest at Taipei midnight without modifying hunger or rerolling stocks',()=>{
  const state=inTown();state.player.hunger=30;
  state.world.day=getTaipeiClock(Date.parse('2026-11-12T16:00:00Z')).day;
  const used=gameReducer(state,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(remainingDailyRest(used)).toBe(1);
  const usedAgain=gameReducer(used,{type:'TOWN_SERVICE',serviceId:'rest_short'});
  expect(remainingDailyRest(usedAgain)).toBe(0);
  const nextMidnight=getTaipeiClock(Date.parse('2026-11-13T16:00:00Z'));
  const reset=gameReducer(usedAgain,{type:'WORLD_CLOCK_SYNC',nowMs:Date.parse('2026-11-13T16:00:00Z')});
  expect(reset.world.day).toBe(nextMidnight.day);
  expect(remainingDailyRest(reset)).toBe(2);
  expect(reset.player.hunger).toBe(usedAgain.player.hunger);
  expect(reset.economy.marketStock).toEqual(usedAgain.economy.marketStock);
 });
 it('removes active obsolete game-time copy without touching the one-second wall clock',()=>{
  const strings=[
   ['src/features/chapter/ChapterPage.tsx','搜刮會推進世界時間'],
   ['src/features/market/MarketShiftCountdown.tsx','分鐘遊戲時間'],
   ['src/game/data/chapters/ch01-warehouse/scenes.ts','消耗世界時間'],
   ['src/game/data/chapters/ch01-warehouse/scenes.ts','花費 4 分鐘'],
  ] as const;
  for(const [path,outdated] of strings)expect(read(path),path).not.toContain(outdated);
  const ctx=read('src/app/GameContext.tsx'),resolver=read('src/game/engine/resolve.ts');
  expect(ctx).toContain("type:'WORLD_CLOCK_SYNC'");
  expect(ctx).not.toContain('WORLD_CLOCK_TICK');
  expect(resolver).not.toContain('advanceTime(');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.41');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.41');
 });
 it('keeps warnings visible, mobile cost lines untruncated, scrollable short modals and reduced motion',()=>{
  const css=read('src/styles/_v0835-final-integrated.scss');
  for(const breakpoint of ['320px','360px','390px','720px','520px'])expect(css).toContain(breakpoint);
  for(const marker of ['overflow-wrap:anywhere','max-width:calc(100vw','prefers-reduced-motion:reduce','overscroll-behavior-y:contain','min-height:0'])expect(css).toContain(marker);
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0841-shelter-integration";$/);
  expect(read('src/features/town/ClinicDialog.tsx')).toContain('hunger.appliedDelta');
  expect(read('src/features/town/TownFacilityDialog.tsx')).toContain('hunger.appliedDelta');
  expect(read('src/features/chapter/ActionCard.tsx')).toContain('preview.appliedHungerCost');
  expect(read('src/features/chapter/RetreatDialog.tsx')).toContain('r.projectedHunger-state.player.hunger');
 });
});
