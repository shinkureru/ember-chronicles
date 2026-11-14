import {afterEach,describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {getTaipeiClock,taipeiDate,REALTIME_CLOCK_REFRESH_MS} from '../src/game/engine/taipeiClock';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getScheduledVendorId} from '../src/game/data/marketSchedule';
import {getMarketShiftCountdown} from '../src/features/market/marketShiftCountdown';
import {loadGame,saveGame} from '../src/game/state/storage';
import {remainingDailyRest} from '../src/game/engine/innRest';
import {awardExperience} from '../src/game/engine/progression';
const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const taipei=(date:string)=>getTaipeiClock(Date.parse(date));
afterEach(()=>vi.unstubAllGlobals());
describe('v0.8.33 Asia/Taipei civil clock as the only source of time',()=>{
 it('projects a UTC timestamp to an exact Taipei calendar minute with midnight rollover',()=>{
  const before=taipei('2026-11-13T15:59:59Z');
  const after=taipei('2026-11-13T16:00:00Z');
  expect(before.minute).toBe(1439);
  expect(after.minute).toBe(0);
  expect(after.day).toBe(before.day+1);
  expect(taipeiDate(after.day)).toBe('2026/11/14');
  expect(taipei('2026-11-14T00:00:00Z').minute).toBe(480);
  expect(()=>getTaipeiClock(NaN)).toThrow(RangeError);
 });
 it('projects exact vendor handovers without game-time acceleration',()=>{
  for(const [hour,expected] of [[4,'scavenger'],[5,'mechanic'],[11,'medic'],[14,'broker'],[18,'runner'],[23,'scavenger']] as const){
   const utc=Date.UTC(2026,10,14,hour-8,0,0);
   const clock=getTaipeiClock(utc);
   expect(clock.minute).toBe(hour*60);
   expect(getScheduledVendorId(clock.minute)).toBe(expected);
   expect(getMarketShiftCountdown(clock.minute).currentVendorId).toBe(expected);
  }
  expect(getMarketShiftCountdown(23*60+59).nextStartClock).toBe('05:00');
 });
 it('updates result screens too; a wall-clock refresh cannot change hunger, fatigue or money',()=>{
  const s=makeInitialState('journalist');s.mode='result';
  const before=structuredClone(s);
  const at=Date.parse('2026-11-13T16:00:00Z');
  const next=gameReducer(s,{type:'WORLD_CLOCK_SYNC',nowMs:at});
  expect(next.world).toMatchObject({...getTaipeiClock(at),clockBasis:'taipei-realtime'});
  expect(next.player).toEqual(before.player);
  expect(next.economy).toEqual(before.economy);
  expect(s).toEqual(before);
  expect(gameReducer(next,{type:'WORLD_CLOCK_SYNC',nowMs:at})).toBe(next);
  const shifted=gameReducer(next,{type:'WORLD_CLOCK_SYNC',nowMs:at+86400000});
  expect(shifted.world.day).toBe(next.world.day+1);
  expect(shifted.player.hunger).toBe(next.player.hunger);
 });
 it('sleep, missions, retreat, defeat and services do not fast-forward any minute',()=>{
  let s=makeInitialState('journalist');s.world.minute=12*60;
  s.player.health=3;s.player.stamina=8;
  const initial={...s.world},hunger=s.player.hunger,fatigue=s.player.fatigue;
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(s.world).toEqual(initial);
  expect(s.player.health).toBeGreaterThan(3);
  expect(s.player.hunger).toBe(hunger+3); // v0.8.35 reduces passive rest hunger
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_short'});
  expect(s.world).toEqual(initial);
  s=gameReducer(s,{type:'START_ATTEMPT'});
  const before=s.world;
  const chosen=gameReducer(s,{type:'CHOOSE',choiceId:'gate_observe',skillId:null});
  expect(chosen.world).toEqual(before);
  expect(chosen.player.fatigue).toBeLessThanOrEqual(fatigue);
  expect(gameReducer(chosen,{type:'RETREAT'}).world).toEqual(before);
 });
 it('switches daily limits on Taipei midnight and not on an action',()=>{
  const s=makeInitialState('journalist');
  const day1=Date.parse('2026-11-13T15:00:00Z');
  let a=gameReducer(s,{type:'WORLD_CLOCK_SYNC',nowMs:day1});
  a=gameReducer(a,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  a=gameReducer(a,{type:'TOWN_SERVICE',serviceId:'rest_short'});
  expect(remainingDailyRest(a)).toBe(0);
  expect(awardExperience(a,'test:key',5)).toBe(5);
  expect(awardExperience(a,'test:key',5)).toBe(0);
  const next=gameReducer(a,{type:'WORLD_CLOCK_SYNC',nowMs:day1+3600000});
  expect(remainingDailyRest(next)).toBe(2);
  expect(awardExperience(next,'test:key',5)).toBe(5);
 });
 it('preserves legacy inventory/progression when migrating synthetic days, expires old quotas once',()=>{
  const old=makeInitialState('journalist');
  delete old.world.clockBasis;old.world.day=3;old.world.minute=100;
  old.economy.coins=444;old.bag.bandage=3;old.town!.restsToday=2;old.town!.lastRestDay=3;
  old.town!.lastTrainingDay=3;old.town!.clinic={favor:4,acceptedDay:3,completedDay:3,purchases:{'3:pain_relief':2}};
  let raw=JSON.stringify(old);
  vi.stubGlobal('localStorage',{getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value}});
  const migrated=loadGame();
  expect(migrated.world).toMatchObject({...getTaipeiClock(),clockBasis:'taipei-realtime'});
  expect(migrated.economy.coins).toBe(444);
  expect(migrated.bag.bandage).toBe(3);
  expect(migrated.town?.lastRestDay).toBe(0);
  expect(migrated.town?.clinic?.favor).toBe(4);
  expect(migrated.town?.clinic?.acceptedDay).toBe(0);
  saveGame(migrated);
  const reopened=loadGame();
  expect(reopened.town?.clinic?.favor).toBe(4);
  expect(reopened.world.minute).toBe(getTaipeiClock().minute);
 });
 it('refreshes after tab focus and before clicks, with no accelerated timer left',()=>{
  const ctx=read('src/app/GameContext.tsx'),resolve=read('src/game/engine/resolve.ts');
  expect(REALTIME_CLOCK_REFRESH_MS).toBe(1000);
  expect(ctx).toContain("if(action.type!=='WORLD_CLOCK_SYNC')");
  expect(ctx).toContain("document.addEventListener('visibilitychange'");
  expect(ctx).toContain("window.addEventListener('focus',refresh)");
  expect(ctx).not.toContain('WORLD_TICK_GAME_MINUTES');
  expect(ctx).not.toContain('WORLD_CLOCK_TICK');
  expect(resolve).not.toContain('advanceTime(');
  expect(read('src/game/state/storage.ts')).toContain("clockBasis:'taipei-realtime'");
  expect(JSON.parse(read('package.json')).version).toBe('0.8.41');
 });
});
