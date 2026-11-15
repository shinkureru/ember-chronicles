/** Developer-only permanent preview goods. These are NEVER entered into
 * ITEMS, MARKET_VENDORS, drops, marketStock or a saved account.
 * All five time-shift merchants show these two selectable test surfaces
 * in buy mode, even after other inventory has sold out. */
export type MarketPreviewRarity='purple'|'gold';
export const MARKET_VISUAL_TEST_OFFERS=[
 {id:'dev_visual_purple',name:'禁忌樣本・紫晶',emoji:'◆',
  description:'供開發階段驗證紫階底盤、選取輪廓與亮光；永久展示，不可交易。',
  type:'item' as const,category:'demo',price:0,available:1,owned:0,
  canTrade:false,reason:'開發測試展示品・不進入背包或正式掉落',previewRarity:'purple' as const},
 {id:'dev_visual_gold',name:'傳說樣本・金紋',emoji:'✦',
  description:'供開發階段驗證金色水波、星芒與柔和放射位移；永久展示，不可交易。',
  type:'item' as const,category:'demo',price:0,available:1,owned:0,
  canTrade:false,reason:'開發測試展示品・不進入背包或正式掉落',previewRarity:'gold' as const},
] as const;
export const marketVisualTestPresentation=(rarity:MarketPreviewRarity)=>rarity==='gold'
 ?{tier:'gold' as const,name:'傳說',level:99,isDisplayOnly:true}
 :{tier:'forbidden' as const,name:'禁忌',level:50,isDisplayOnly:true};
