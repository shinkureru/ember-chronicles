import type {MarketProductTier} from '../../features/market/marketProductPresentation';
import type {UrbanRarity} from './urbanUiTokens';

/** Pure visual adapters; never map presentation grades to drop rates, price
 * multipliers, owned card levels or saved character progression.
 * Gold is intentionally excluded until a gameplay tier is designed.
 */
export const MARKET_TO_URBAN_RARITY:ReadOnly<Record<MarketProductTier,UrbanRarity>>={
 scrap:'gray',field:'green',special:'blue',forbidden:'purple',
};
export type ExistingCardRarity='normal'|'rare'|'chaos';
export const CARD_TO_URBAN_RARITY:Readonly<Record<ExistingCardRarity,UrbanRarity>>={
 normal:'gray',rare:'blue',chaos:'purple',
};
export function marketTierToUrbanRarity(tier:MarketProductTier):UrbanRarity{
 return MARKET_TO_URBAN_RARITY[tier];
}
export function cardRarityToUrbanRarity(rarity:ExistingCardRarity):UrbanRarity{
 return CARD_TO_URBAN_RARITY[rarity];
}
