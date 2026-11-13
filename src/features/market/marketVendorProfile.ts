import type {MarketVendor} from '../../game/data/marketVendors';
import {getScheduledVendor} from '../../game/data/marketSchedule';
import {worldClock} from '../../game/engine/rules';
import {MARKET_SHIFT_START_MINUTES} from './marketShiftCountdown';
import {getMarketIdleLines} from './marketIdleLines';
import {getMarketSceneLighting} from './marketSceneLighting';

/** Every vendor is planned to have THREE original scenes; no synthetic or
 * borrowed portraits. Derive info from the existing authoritative vendor
 * catalog and schedule rather than duplicating role, times or trade prices.
 */
export const MARKET_VENDOR_SCENE_TARGET=3;
export type MarketVendorSceneStatus='missing'|'partial'|'complete';
export type MarketVendorSceneFallback='neutral-environment'|'none';
export function getMarketVendorProfile(vendor:MarketVendor){
 const index=MARKET_SHIFT_START_MINUTES.findIndex(minute=>getScheduledVendor(minute).id===vendor.id);
 if(index<0)throw Error(`Unknown black-market schedule: ${vendor.id}`);
 const start=MARKET_SHIFT_START_MINUTES[index];
 const end=MARKET_SHIFT_START_MINUTES[(index+1)%MARKET_SHIFT_START_MINUTES.length];
 const count=vendor.visual.sceneAssets.length;
 const status:MarketVendorSceneStatus=count===0?'missing':count<MARKET_VENDOR_SCENE_TARGET?'partial':'complete';
 const fallback:MarketVendorSceneFallback=count===0?'neutral-environment':'none';
 return {
  vendorId:vendor.id,
  name:vendor.name,
  role:vendor.role,
  appearance:vendor.visual.appearance,
  face:vendor.face,
  shiftStartMinute:start,
  shiftEndMinute:end,
  shiftLabel:`${worldClock(start)}–${worldClock(end)}`,
  sceneAssets:vendor.visual.sceneAssets,
  sceneTarget:MARKET_VENDOR_SCENE_TARGET,
  sceneCount:count,
  sceneStatus:status,
  sceneFallback:fallback,
  sceneStatusLabel:count===0?'場景待補':`圖像 ${count}/${MARKET_VENDOR_SCENE_TARGET}`,
  lighting:vendor.visual.lighting,
  sceneLighting:vendor.visual.sceneAssets.map(file=>getMarketSceneLighting(file)),
  soldItemCount:vendor.sellItems.length,
  acceptedItemCount:vendor.buyItems.length,
  cardCount:vendor.cardIds.length,
  speechCount:getMarketIdleLines(vendor).length,
 };
}
