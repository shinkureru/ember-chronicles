/** Scene-specific image-space illumination. The same exact artwork file
 * always receives the same lighting treatment, independent of trading mode,
 * merchant schedule, React render timing and scene transition order.
 */
export const SCAVENGER_PORTRAIT='black-market-merchant.webp';
export const SCAVENGER_RUMMAGE='black-market-scavenger-rummage.webp';
export const SCAVENGER_WELD='black-market-scavenger-weld.webp';

export type MarketSceneLighting='portrait'|'workbench'|'welding'|'ambient';

export function getMarketSceneLighting(asset:string):MarketSceneLighting{
 switch(asset){
  case SCAVENGER_PORTRAIT:return 'portrait';
  case SCAVENGER_RUMMAGE:return 'workbench';
  case SCAVENGER_WELD:return 'welding';
  default:return 'ambient';
 }
}

/** The weld pool is around (426,400) in the original 1376x768 artwork,
 * corresponding to (297,279) in the existing 960x536 market viewBox.
 * Keep every scene glow in picture coordinates so responsive cropping
 * and frame crossfade cannot detach a light source from its illustration.
 */
export const WELD_LIGHT={x:297,y:279} as const;
