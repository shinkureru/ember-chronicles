import {worldClock,worldPhase,worldPhaseToken} from '../../game/engine/rules';
import {getScheduledVendor} from '../../game/data/marketSchedule';

/** Phase boundaries in world minutes after midnight, matching worldPhaseToken.
 * This module only reads the clock; the GameContext reducer advances it.
 */
export const MARKET_SHIFT_START_MINUTES=[5*60,11*60,14*60,18*60,23*60] as const;
export const MINUTES_PER_GAME_DAY=24*60;

/** Next trader update measured in GAME minutes, never real seconds. */
export function getMarketShiftCountdown(worldMinute:number){
 const minute=((Math.floor(worldMinute)%MINUTES_PER_GAME_DAY)+MINUTES_PER_GAME_DAY)%MINUTES_PER_GAME_DAY;
 const nextBoundary=MARKET_SHIFT_START_MINUTES.find(value=>value>minute)??MARKET_SHIFT_START_MINUTES[0]+MINUTES_PER_GAME_DAY;
 const nextStartMinute=nextBoundary%MINUTES_PER_GAME_DAY;
 const remainingMinutes=nextBoundary-minute;
 const nextVendor=getScheduledVendor(nextStartMinute);
 const currentVendor=getScheduledVendor(minute);
 return {
  minute,
  currentVendorId:currentVendor.id,
  nextVendorId:nextVendor.id,
  nextVendorName:nextVendor.name,
  nextVendorRole:nextVendor.role,
  nextPhaseToken:worldPhaseToken(nextStartMinute),
  nextPhaseName:worldPhase(nextStartMinute),
  nextStartMinute,
  nextStartClock:worldClock(nextStartMinute),
  remainingMinutes,
  remainingClock:`${String(Math.floor(remainingMinutes/60)).padStart(2,'0')}:${String(remainingMinutes%60).padStart(2,'0')}`,
  crossesMidnight:nextBoundary>=MINUTES_PER_GAME_DAY,
 };
}
