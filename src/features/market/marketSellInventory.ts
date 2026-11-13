import {ITEMS} from '../../game/data/items';
import type {GameState} from '../../game/types';
import type {MarketVendor} from '../../game/data/marketVendors';

/** Physical sell catalog from the backpack only, regardless of current vendor
 * purchasing policy. Warehouse storage never appears as backpack stock.
 */
export const getBackpackMarketItemIds=(bag:GameState['bag']):string[] =>
 Object.entries(bag).filter(([id,quantity])=>Boolean(ITEMS[id])&&quantity>0)
  .map(([id])=>id).sort((a,b)=>a.localeCompare(b));

/** Whitelist controls whether a visible item can be sold, not visibility. */
export const doesVendorAcceptMarketItem=(vendor:Pick<MarketVendor,'buyItems'>,itemId:string)=>
 vendor.buyItems.includes(itemId);
