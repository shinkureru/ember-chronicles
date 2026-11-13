import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {ITEMS} from '../src/game/data/items';
import {CARDS} from '../src/game/data/cards';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {
 MARKET_PRODUCT_TIERS,getMarketProductPresentation,formatMarketOfferQuantity,
} from '../src/features/market/marketProductPresentation';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read('src/features/market/BlackMarketPage.tsx');
const css=read('src/styles/_v0822-market-product-tiers.scss');

describe('v0.8.22 black-market four-tier presentation only',()=>{
 it('declares exactly four distinct, predictable cosmetic product tiers',()=>{
  expect(Object.keys(MARKET_PRODUCT_TIERS)).toEqual(['scrap','field','special','forbidden']);
  expect(new Set(Object.values(MARKET_PRODUCT_TIERS).map(x=>x.color)).size).toBe(4);
  expect(Object.values(MARKET_PRODUCT_TIERS).map(x=>x.displayLevel)).toEqual([5,15,30,50]);
  expect(getMarketProductPresentation('item','biscuit')).toEqual({tier:'scrap',name:'一般',level:5,isDisplayOnly:true});
  expect(getMarketProductPresentation('item','wrench')).toEqual({tier:'field',name:'優良',level:15,isDisplayOnly:true});
  expect(getMarketProductPresentation('item','scarf')).toEqual({tier:'special',name:'稀有',level:30,isDisplayOnly:true});
  expect(getMarketProductPresentation('card','question')).toEqual({tier:'field',name:'優良',level:1,isDisplayOnly:false});
  expect(getMarketProductPresentation('card','record')).toEqual({tier:'special',name:'稀有',level:1,isDisplayOnly:false});
  expect(css).toContain('market-v0822__product--forbidden');
 });
 it('covers every existing seller item, purchaser item and card without save migration',()=>{
  expect(MARKET_VENDORS).toHaveLength(5);
  for(const vendor of MARKET_VENDORS){
   for(const entry of vendor.sellItems){
    expect(ITEMS[entry.id]).toBeDefined();
    const o=getMarketProductPresentation('item',entry.id);
    expect(o.level).toBeGreaterThan(0);
    expect(Object.keys(MARKET_PRODUCT_TIERS)).toContain(o.tier);
   }
   for(const id of vendor.buyItems){
    expect(ITEMS[id]).toBeDefined();
    expect(getMarketProductPresentation('item',id).isDisplayOnly).toBe(true);
   }
   for(const id of vendor.cardIds){
    expect(CARDS[id]).toBeDefined();
    expect(getMarketProductPresentation('card',id).level).toBe(1);
   }
  }
  const s=makeInitialState('journalist');
  const before=structuredClone(s);
  for(const vendor of MARKET_VENDORS){
   for(const item of vendor.sellItems)getMarketProductPresentation('item',item.id);
   for(const id of vendor.cardIds)getMarketProductPresentation('card',id);
  }
  expect(s).toEqual(before);
 });
 it('distinguishes finite physical stock, unlimited card-copy supply and owned duplicates',()=>{
  expect(formatMarketOfferQuantity('item','buy',4)).toBe('4');
  expect(formatMarketOfferQuantity('item','buy',0)).toBe('0');
  expect(formatMarketOfferQuantity('card','buy',99)).toBe('不限');
  expect(formatMarketOfferQuantity('card','sell',2)).toBe('2');
  expect(formatMarketOfferQuantity('card','sell',0)).toBe('0');
  expect(formatMarketOfferQuantity('item','sell',3)).toBe('3');
  expect(formatMarketOfferQuantity('item','sell',-1)).toBe('0');
 });
 it('retains genuine market buy/sell prices, world-shift guards and stock changes',()=>{
  let s=makeInitialState('journalist');
  s.world.minute=12*60;s.economy.coins=5000;
  const initialCoins=s.economy.coins;
  const initialQty=s.bag.bandage??0;
  s=gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'medic',itemId:'bandage'});
  expect(s.economy.coins).toBe(initialCoins-90);
  expect(s.bag.bandage??0).toBe(initialQty+1);
  expect(s.economy.marketStock['medic:bandage']).toBe(1);
  const paid=s.economy.coins;
  const notCurrent=gameReducer(s,{type:'MARKET_BUY_ITEM',vendorId:'runner',itemId:'water'});
  expect(notCurrent).toBe(s);
  expect(notCurrent.economy.coins).toBe(paid);
  s.ownedCards.breathe={level:1,copies:2};
  s=gameReducer(s,{type:'MARKET_SELL',vendorId:'medic',cardId:'breathe'});
  expect(s.ownedCards.breathe?.copies).toBe(1);
  expect(s.economy.coins).toBeGreaterThan(paid);
 });
 it('renders each of level, name, price and quantity in the product, with actual trade controls',()=>{
  for(const token of [
   'getMarketProductPresentation(offer.type,offer.id)',
   'formatMarketOfferQuantity(offer.type,mode,offer.available)',
   'market-v0822__product--${appearance.tier}',
   'Lv.{appearance.level}',
   'market-v0822__product-name','{offer.name}',
   'market-v0822__product-footer','<Coins size={11}/>{offer.price}',
   'market-v0822__quantity',
   "mode==='buy'?'庫存':'持有'",
   'getMarketProductPresentation(selected.type,selected.id)',
   '商品展示級別，不改變物品效果',
   '交易 Lv.1 升級複本',
   'selected&&mode&&',
   'onClick={()=>trade(selected)}',
   'ref={offersScroll.scrollRef}',
   'onPointerMove={offersScroll.onPointerMove}',
   "type:'MARKET_BUY_ITEM'",
   "type:'MARKET_SELL_ITEM'",
   "type:'MARKET_BUY'",
   "type:'MARKET_SELL'",
  ])expect(page).toContain(token);
 });
 it('uses four rarity-specific muted surfaces and scroll-only catalog at phone widths',()=>{
  for(const token of [
   '--market-product-edge:#6b737c',
   '--market-product-edge:#378d5a',
   '--market-product-edge:#397cb7',
   '--market-product-edge:#9753b5',
   'grid-auto-rows:clamp(115px,12dvh,137px)',
   'grid-template-columns:repeat(2,minmax(0,1fr))!important',
   'overflow-wrap:anywhere',
   '-webkit-line-clamp:2',
   'font-variant-numeric:tabular-nums',
   '@media(max-width:375px)',
   '@media(max-height:700px)',
   '@media(max-height:520px)',
   '@media(prefers-reduced-motion:reduce)',
  ])expect(css).toContain(token);
  expect(read('src/styles/main.scss')).toContain('@import "v0822-market-product-tiers"');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.22');
 });
});
