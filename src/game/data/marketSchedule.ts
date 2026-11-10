import { worldPhaseToken } from '../engine/rules';
import { MARKET_VENDORS, type MarketVendor } from './marketVendors';

/** One fixed trader per world-time phase, never a user-selectable list. */
export const MARKET_SHIFT_IDS={
 morning:'mechanic',
 noon:'medic',
 afternoon:'broker',
 evening:'runner',
 'late-night':'scavenger',
} as const satisfies Record<ReturnType<typeof worldPhaseToken>,string>;

export const getScheduledVendorId=(minute:number):string=>MARKET_SHIFT_IDS[worldPhaseToken(minute)];
export const getScheduledVendor=(minute:number):MarketVendor=>{
 const id=getScheduledVendorId(minute);
 const vendor=MARKET_VENDORS.find(item=>item.id===id);
 if(!vendor)throw Error(`No market vendor scheduled for ${id}`);
 return vendor;
};
