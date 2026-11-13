import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {getBackpackMarketItemIds,doesVendorAcceptMarketItem} from '../src/features/market/marketSellInventory';
import {getScheduledVendor} from '../src/game/data/marketSchedule';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {CARDS} from '../src/game/data/cards';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ui=read('src/features/market/BlackMarketPage.tsx');
const css=read('src/styles/_v0824-market-toggle.scss');
const icon=read('src/features/market/MarketTradeSwitchIcon.tsx');
const reducer=read('src/game/engine/resolve.ts');

describe('v0.8.24 black market whole-rail switch',()=>{
 it('has exactly one accessible mode toggle and uses the original switch/reset flow',()=>{
  for(const s of [
   'market-v0824__exchange','market-v12__modes market-v0824__switch',
   'market-v0824__toggle','aria-pressed={mode===\'sell\'}',
   'aria-label={mode===\'sell\'?','onClick={()=>chooseMode(mode===\'sell\'?\'buy\':\'sell\')}',
   'market-v0824__switch-label--buy','market-v0824__switch-label--sell',
   '>購買</span>','>販賣</span>','<MarketTradeSwitchIcon/>',
   "setKind('all')","setNarrow('any')","setMore(false)","setSelectedId(null)",
   'offersScroll.scrollRef.current?.scrollTo({top:0})',
  ])expect(ui).toContain(s);
  expect(ui).not.toContain('onClick={()=>chooseMode(\'buy\')}');
  expect(ui).not.toContain('onClick={()=>chooseMode(\'sell\')}');
  expect(ui).toContain("const [mode,setMode]=useState<Mode|null>('buy');");
  expect(ui).toContain('market-v12__table');
  expect(ui).toContain('market-v12__offers market-v081__catalog');
 });
 it('recolors a faithful two-arrow SVG from the user image and rotates in its own center',()=>{
  expect(icon).toContain('viewBox="0 0 512 512"');
  expect(icon).toContain('fill="currentColor"');
  expect(icon).toContain('M327,16');
  expect(icon).toContain('M90,0');
  expect(icon).toContain('market-v0824__switch-icon');
  for(const s of [
   '.market-v0824__toggle.is-sell .market-v0824__switch-icon',
   'transform:rotate(180deg)','transform-origin:50% 50%',
   '.market-v0824__switch-label--buy','.market-v0824__switch-label--sell',
   'translateY(126px)','translateY(-126px)',
   'color:#c9a781','transition:transform',
   ':focus-visible','@media(max-width:375px)',
   '@media(max-height:700px)','@media(max-height:520px)',
   '@media(prefers-reduced-motion:reduce)','transition:none!important',
  ])expect(css).toContain(s);
  expect(css).not.toContain('position:fixed');
  expect(read('src/styles/main.scss')).toContain('@import "v0824-market-toggle"');
 });
});

describe('v0.8.24 seller catalog equals the actual backpack, not vendor whitelist/warehouse',()=>{
 it('shows all known, positive-count backpack items including those this vendor will not buy',()=>{
  const bag={notes:2,bandage:1,wrench:1,scarf:0,unknown_id:10};
  expect(getBackpackMarketItemIds(bag)).toEqual(['bandage','notes','wrench']);
  const broker=MARKET_VENDORS.find(v=>v.id==='broker')!;
  expect(doesVendorAcceptMarketItem(broker,'notes')).toBe(true);
  expect(doesVendorAcceptMarketItem(broker,'bandage')).toBe(false);
  const s=makeInitialState('journalist');
  s.bag={notes:2,bandage:1};s.warehouse={wrench:5,scarf:3};
  expect(getBackpackMarketItemIds(s.bag)).toEqual(['bandage','notes']);
  expect(getBackpackMarketItemIds(s.bag)).not.toContain('wrench');
  expect(ui).toContain('getBackpackMarketItemIds(s.bag).map(id=>');
  expect(ui).not.toContain('vendor.buyItems.map(id=>');
  expect(ui).toContain('doesVendorAcceptMarketItem(vendor,item.id)');
  expect(ui).toContain("mode==='sell'?available:totalOwned(item.id)");
  expect(ui).toContain("mode==='buy'?'庫存':'持有'");
  expect(ui).toContain('title={offer.canTrade?\'點擊查看交易資訊\':offer.reason}');
  expect(ui).toContain("!accepted?'這位商人不收購此物品'");
 });
 it('only removes a backpack item on sale and never consumes a warehouse copy first',()=>{
  const s=makeInitialState('journalist');
  s.world.minute=16*60; // broker
  expect(getScheduledVendor(s.world.minute).id).toBe('broker');
  s.bag.notes=1;s.warehouse.notes=4;
  const coin=s.economy.coins, favor=s.economy.blackMarketFavor;
  const sold=gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(sold.bag.notes).toBeUndefined();
  expect(sold.warehouse.notes).toBe(4);
  expect(sold.economy.coins).toBeGreaterThan(coin);
  expect(sold.economy.blackMarketFavor).toBe(favor+1);
  expect(reducer).toContain('if((s.bag[item.id]??0)<=0)return state;');
  expect(reducer).toContain('if(s.bag[item.id]===0)delete s.bag[item.id];');
  expect(reducer).not.toContain("const source=(s.warehouse[item.id]??0)>0?'warehouse':'bag';");
 });
 it('refuses a warehouse-only sale even if the current merchant would buy that item',()=>{
  const s=makeInitialState('journalist');
  s.world.minute=16*60;
  delete s.bag.notes;
  s.warehouse.notes=5;
  const rejected=gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'});
  expect(rejected).toBe(s);
  expect(rejected.warehouse.notes).toBe(5);
 });
 it('leaves unaccepted and protected backpack items visible but safely unsellable',()=>{
  const s=makeInitialState('journalist');s.world.minute=16*60;
  s.bag.bandage=2;s.bag.notes=2;
  const before=structuredClone(s.bag);
  expect(getBackpackMarketItemIds(s.bag)).toEqual(expect.arrayContaining(['bandage','notes']));
  expect(doesVendorAcceptMarketItem(getScheduledVendor(s.world.minute),'bandage')).toBe(false);
  const disallowed=gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'bandage'});
  expect(disallowed).toBe(s);
  expect(disallowed.bag).toEqual(before);
  s.protectedItems=['notes'];
  expect(gameReducer(s,{type:'MARKET_SELL_ITEM',vendorId:'broker',itemId:'notes'})).toBe(s);
  expect(ui).toContain("protectedItem?'裝備中或常用物品不得出售'");
  expect(ui).toContain("available>0&&accepted&&!protectedItem");
  expect(ui).toContain('selected.canTrade');
  expect(ui).toContain('disabled={!selected.canTrade}');
  expect(ui).toContain('{selected.reason}');
 });
 it('preserves original card-copy sales but lists owned copies even if this shift rejects them',()=>{
  const s=makeInitialState('journalist');s.world.minute=16*60;
  s.ownedCards.question={level:2,copies:2};s.ownedCards.breathe={level:1,copies:3};
  expect(CARDS.question).toBeDefined();
  expect(CARDS.breathe).toBeDefined();
  expect(ui).toContain('Object.keys(s.ownedCards).filter(id=>(s.ownedCards[id]?.copies??0)>0)');
  expect(ui).toContain('vendor.cardIds.includes(id)');
  expect(ui).toContain("mode==='sell'&&!accepted?'這位商人不收購此卡牌'");
  const sale=gameReducer(s,{type:'MARKET_SELL',vendorId:'broker',cardId:'question'});
  expect(sale.ownedCards.question?.copies).toBe(1);
  const rejected=gameReducer(s,{type:'MARKET_SELL',vendorId:'broker',cardId:'breathe'});
  expect(rejected).toBe(s);
 });
 it('preserves original buy prices, seller stock, filters, drag and five vendor shifts',()=>{
  for(const str of [
   "mode==='buy'?vendor.sellItems",
   "type:'MARKET_BUY_ITEM'","type:'MARKET_SELL_ITEM'",
   "type:'MARKET_BUY'","type:'MARKET_SELL'",
   'getVendorStockKey(vendor.id,item.id)',
   'bagWeight(s.bag)+item.weight<=15',
   's.protectedItems.includes(item.id)',
   'equipped.includes(item.id)','protectedWeapon(item.id)',
   'market-v13__filters','market-v13__extra-filters',
   'onPointerDown={offersScroll.onPointerDown}',
   'onPointerMove={offersScroll.onPointerMove}',
   'onClickCapture={offersScroll.onClickCapture}',
   'market-v0822__product--${appearance.tier}',
   'market-v0823__meeting','market-v0823__favor',
   'GameUtilities','ReturnMainLink',
  ])expect(ui).toContain(str);
  expect(MARKET_VENDORS).toHaveLength(5);
  expect(new Set(MARKET_VENDORS.map(v=>v.id)).size).toBe(5);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.24');
 });
});
