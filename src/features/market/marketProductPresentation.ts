import {CARDS} from '../../game/data/cards';
import {ITEMS} from '../../game/data/items';

/** UI-only display grades. Existing items have no gameplay level or rarity.
 * These values never gate trades or modify price, owned quantity, or the save.
 */
export type MarketProductTier='scrap'|'field'|'special'|'forbidden';
export const MARKET_PRODUCT_TIERS={
 scrap:{name:'一般',color:'灰',displayLevel:5},
 field:{name:'優良',color:'綠',displayLevel:15},
 special:{name:'稀有',color:'藍',displayLevel:30},
 forbidden:{name:'禁忌',color:'紫',displayLevel:50},
} as const satisfies Record<MarketProductTier,{name:string;color:string;displayLevel:number}>;

export function getMarketProductPresentation(type:'item'|'card',id:string){
 if(type==='card'){
  const rarity=CARDS[id]?.rarity;
  const tier:MarketProductTier=rarity==='chaos'?'forbidden':rarity==='rare'?'special':'field';
  // The black market trades basic upgrade copies; an owned higher-level card
  // does not make the merchant's sold copy level IV/V.
  return {tier,name:MARKET_PRODUCT_TIERS[tier].name,level:1,isDisplayOnly:false} as const;
 }
 const kind=ITEMS[id]?.type;
 const tier:MarketProductTier=kind==='gear'?'special':
  kind==='tool'||kind==='medical'||kind==='card'?'field':'scrap';
 return {tier,name:MARKET_PRODUCT_TIERS[tier].name,level:MARKET_PRODUCT_TIERS[tier].displayLevel,isDisplayOnly:true} as const;
}

/** A legacy 99 value denotes unconstrained card-copy sales, NOT 99 stock.
 * Sell mode always shows actual duplicate copies, including zero.
 */
export const formatMarketOfferQuantity=(type:'item'|'card',mode:'buy'|'sell',available:number)=>
 type==='card'&&mode==='buy'?'不限':String(Math.max(0,Math.floor(available)));
