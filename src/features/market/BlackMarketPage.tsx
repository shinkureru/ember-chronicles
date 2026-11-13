import { useEffect, useMemo, useState } from 'react';
import { Coins, HeartHandshake, X, ArrowRight, Clock3, SlidersHorizontal, Handshake, Eye, LockKeyhole } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS } from '../../game/data/cards';
import { ITEMS } from '../../game/data/items';
import { ATTACK_CARDS } from '../../game/data/attacks';
import { getVendorStockKey, marketSellPrice } from '../../game/data/marketVendors';
import { getScheduledVendor } from '../../game/data/marketSchedule';
import { playCue } from '../../audio/sound';
import { bagWeight, worldPhaseToken, worldPhase, worldClock } from '../../game/engine/rules';
import BlackMarketSceneArt from './BlackMarketSceneArt';
import MarketIdleSpeech from './MarketIdleSpeech';
import MarketShiftCountdown from './MarketShiftCountdown';
import MarketLoadingScreen from './MarketLoadingScreen';
import {useMarketSceneLoad} from './useMarketSceneLoad';
import MarketTradeSwitchIcon from './MarketTradeSwitchIcon';
import {getBackpackMarketItemIds,doesVendorAcceptMarketItem} from './marketSellInventory';
import ItemArt from '../../components/ItemArt';
import {getMarketProductPresentation,formatMarketOfferQuantity} from './marketProductPresentation';
import GameUtilities from '../../components/GameUtilities';
import ReturnMainLink from '../../components/ReturnMainLink';
import {useVerticalDragScroll} from '../../components/useVerticalDragScroll';

type Mode='buy'|'sell';
type Kind='all'|'item'|'card';
type Narrow='any'|'owned'|'tradable'|'supply'|'tools';
interface Offer {
 id:string;name:string;emoji:string;description:string;type:'item'|'card';category:string;
 price:number;available:number;owned:number;canTrade:boolean;reason:string;
}
const CARD_PRICES={normal:{buy:360,sell:18},rare:{buy:980,sell:55},chaos:{buy:4000,sell:120}} as const;

export default function BlackMarketPage(){
 const {state:s,dispatch}=useGame();
 // The first visit shows ONLY the primary buy/sell decision, not a second permanent tab bar.
 const [mode,setMode]=useState<Mode|null>('buy');
 const [kind,setKind]=useState<Kind>('all');
 const [narrow,setNarrow]=useState<Narrow>('any');
 const [more,setMore]=useState(false);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [switchCount,setSwitchCount]=useState(0);
 const {status:sceneLoadStatus,retry:retrySceneLoad}=useMarketSceneLoad();
 const offersScroll=useVerticalDragScroll();
 const vendor=getScheduledVendor(s.world.minute);
 const phase=worldPhaseToken(s.world.minute);
 const equipped=Object.values(s.equipment);
 const totalOwned=(id:string)=>(s.bag[id]??0)+(s.warehouse[id]??0);
 const protectedWeapon=(id:string)=>s.attackDeck.some(card=>ATTACK_CARDS[card]?.requiredItemId===id)&&totalOwned(id)<=1;

 const offers=useMemo<Offer[]>(()=>{
  if(mode===null)return [];
  const cardIds=mode==='buy'?vendor.cardIds:Object.keys(s.ownedCards).filter(id=>(s.ownedCards[id]?.copies??0)>0);
  const cardOffers=cardIds.flatMap(id=>{
   const card=CARDS[id];if(!card)return [];
   const data=s.ownedCards[id],price=CARD_PRICES[card.rarity][mode];
   const accepted=vendor.cardIds.includes(id);
   const canTrade=s.mode!=='adventure'&&!!data&&accepted&&(mode==='sell'?data.copies>=1:s.economy.coins>=price);
   const reason=mode==='sell'&&!accepted?'這位商人不收購此卡牌':
    !data?'須先取得原卡才能交易複本':
    mode==='sell'&&data.copies<1?'沒有可出售的複本':
    mode==='buy'&&s.economy.coins<price?'舊幣不足':'可交易';
   return [{id,name:card.name,emoji:card.emoji,description:card.description,type:'card' as const,category:'card',
    price,available:mode==='sell'?data?.copies??0:99,owned:data?.copies??0,canTrade,reason}];
  });
  const list=mode==='buy'?vendor.sellItems:getBackpackMarketItemIds(s.bag).map(id=>({id,price:marketSellPrice(id),stock:0}));
  const itemOffers=list.flatMap(entry=>{
   const item=ITEMS[entry.id];if(!item)return [];
   const stockKey=getVendorStockKey(vendor.id,item.id);
   const available=mode==='buy'?Math.max(0,entry.stock-(s.economy.marketStock[stockKey]??0)):(s.bag[item.id]??0);
   const price=mode==='buy'?entry.price:marketSellPrice(item.id);
   const accepted=doesVendorAcceptMarketItem(vendor,item.id);
   const protectedItem=s.protectedItems.includes(item.id)||equipped.includes(item.id)||protectedWeapon(item.id);
   const canTrade=s.mode!=='adventure'&&(mode==='buy'?available>0&&s.economy.coins>=price&&bagWeight(s.bag)+item.weight<=15:available>0&&accepted&&!protectedItem);
   const reason=mode==='buy'?
    available<=0?'商品已售完':s.economy.coins<price?'舊幣不足':bagWeight(s.bag)+item.weight>15?'背包負重不足':'可購買':
    available<=0?'背包沒有此物品':!accepted?'這位商人不收購此物品':protectedItem?'裝備中或常用物品不得出售':'可出售';
   return [{id:item.id,name:item.name,emoji:item.emoji,description:item.description,type:'item' as const,category:item.type,
    price,available,owned:mode==='sell'?available:totalOwned(item.id),canTrade,reason}];
  });
  return [...itemOffers,...cardOffers];
 },[mode,vendor.id,s]);
 const filteredOffers=useMemo(()=>offers.filter(o=>{
  if(kind!=='all'&&o.type!==kind)return false;
  if(narrow==='owned'&&o.owned<=0)return false;
  if(narrow==='tradable'&&!o.canTrade)return false;
  if(narrow==='supply'&&!(o.type==='item'&&['food','medical'].includes(o.category)))return false;
  if(narrow==='tools'&&!(o.type==='item'&&['tool','gear'].includes(o.category)))return false;
  return true;
 }),[offers,kind,narrow]);
 const selected=offers.find(o=>o.id===selectedId)??null;
 useEffect(()=>setSelectedId(null),[mode,kind,narrow,vendor.id]);
 // A new shift means a different inventory and purchasing policy.
 // Clear stale filters so the incoming vendor's catalog is visible at once.
 useEffect(()=>{
  setKind('all');setNarrow('any');setMore(false);
  offersScroll.scrollRef.current?.scrollTo({top:0});
 },[vendor.id]);
 useEffect(()=>{
  if(!selected)return;
  const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setSelectedId(null);};
  window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);
 },[selected]);
 const chooseMode=(value:Mode)=>{
  if(mode!==value){setMode(value);setSwitchCount(n=>n+1);setKind('all');setNarrow('any');setMore(false);setSelectedId(null);offersScroll.scrollRef.current?.scrollTo({top:0});}
  playCue('open');
 };
 const trade=(offer:Offer)=>{
  if(!mode||!offer.canTrade)return;
  if(offer.type==='card')dispatch(mode==='sell'?
   {type:'MARKET_SELL',vendorId:vendor.id,cardId:offer.id}:
   {type:'MARKET_BUY',vendorId:vendor.id,cardId:offer.id});
  else dispatch(mode==='buy'?
   {type:'MARKET_BUY_ITEM',vendorId:vendor.id,itemId:offer.id}:
   {type:'MARKET_SELL_ITEM',vendorId:vendor.id,itemId:offer.id});
  playCue(mode==='buy'?'confirm':'loot');
  setSelectedId(null);
 };
 if(sceneLoadStatus!=='ready')return <MarketLoadingScreen status={sceneLoadStatus} onRetry={retrySceneLoad}/>;
 return <div className={`page-stack viewport-page market-viewport market-viewport--v10 market-v12 market-v13 phase--${phase}`}>
  <header className="market-v10__heading">
   <div><span className="eyebrow">UNDERGROUND / SECRET EXCHANGE</span><h1>黑市</h1></div>
   <div className="market-v10__wallet"><Coins size={17}/><strong>{s.economy.coins}</strong><small>舊幣</small></div>
  </header>
  <section className="market-v12__scene" aria-label={`${worldPhase(s.world.minute)}的秘密交易地點`}>
   <div className="market-v12__meeting market-v0823__meeting">
    <BlackMarketSceneArt/>
    <div className="market-v0823__shade" aria-hidden="true"/>
    <div className="market-v0823__vendor" aria-label="當班商人">
     <span>BLACK MARKET / CURRENT VENDOR</span>
     <strong>{vendor.name}</strong><small>{vendor.role}</small>
    </div>
    <p className="market-v12__dialogue market-v0823__dialogue market-v0825__speech" aria-label="商人自言自語">
     <MarketIdleSpeech key={vendor.id} vendor={vendor}/>
    </p>
    <div className="market-v12__time market-v0823__time market-v0826__shift">
     <div className="market-v0826__now"><Clock3 size={12}/><span>{worldPhase(s.world.minute)} {worldClock(s.world.minute)}</span></div>
     <MarketShiftCountdown minute={s.world.minute}/>
    </div>
    <div className="market-v13__favor market-v0823__favor">
     <div className="market-v0823__favor-line">
      <HeartHandshake size={15}/><span>商人好感度</span>
      <strong>{s.economy.blackMarketFavor}/100</strong>
     </div>
     <div className="market-v0823__favor-meter" role="progressbar"
      aria-label="商人好感度" aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={Math.max(0,Math.min(100,s.economy.blackMarketFavor))}>
      <i style={{width:`${Math.max(0,Math.min(100,s.economy.blackMarketFavor))}%`}}/>
     </div>
    </div>
   </div>
   <div className="market-v0824__exchange">
    <nav className="market-v12__modes market-v0824__switch" aria-label="黑市購買與販賣模式">
     <button type="button" className={`market-v0824__toggle ${mode==='sell'?'is-sell':'is-buy'}`}
      aria-pressed={mode==='sell'} aria-label={mode==='sell'?'目前販賣模式，點擊切換購買':'目前購買模式，點擊切換販賣'}
      onClick={()=>chooseMode(mode==='sell'?'buy':'sell')}>
      <span className="market-v0824__switch-label market-v0824__switch-label--buy" aria-hidden="true"><span>購</span><span>買</span></span>
      <span className="market-v0824__switch-arrow" aria-hidden="true">
       <MarketTradeSwitchIcon/>
      </span>
      <span className="market-v0824__switch-label market-v0824__switch-label--sell" aria-hidden="true"><span>販</span><span>賣</span></span>
     </button>
    </nav>
    <div className={`market-v12__table ${switchCount>0?`market-v0825__catalog market-v0825__catalog--${mode}`:''}`}>
    <div className="market-v12__table-heading"><span>EXCHANGE / {mode===null?'WAITING':mode.toUpperCase()}</span><span>{mode===null?'選擇交易方式':'點選卡片查看詳細內容'}</span></div>
    {mode!==null&&<div className="market-v13__filter-wrap">
     <div className="market-v13__filters" role="group" aria-label="商品篩選">
      {(['all','item','card'] as Kind[]).map(value=><button type="button" key={value}
       aria-pressed={kind===value} className={kind===value?'is-active':''}
       onClick={()=>{setKind(value);setNarrow('any');playCue('select')}}>{value==='all'?'所有':value==='item'?'物品':'卡牌'}</button>)}
      <button type="button" className={more?'is-active':''} aria-expanded={more} onClick={()=>setMore(x=>!x)}><SlidersHorizontal size={13}/>更多…</button>
     </div>
     {more&&<div className="market-v13__extra-filters" role="group" aria-label="進階篩選">
      {([{id:'any',label:'不限'},{id:'owned',label:'已持有'},{id:'tradable',label:'可交易'},{id:'supply',label:'補給'},{id:'tools',label:'工具'}] as {id:Narrow;label:string}[]).map(f=><button type="button" key={f.id}
       aria-pressed={narrow===f.id} className={narrow===f.id?'is-active':''} onClick={()=>setNarrow(f.id)}>{f.label}</button>)}
     </div>}
    </div>}
    {mode===null?
     <div className="market-v13__waiting"><Handshake size={31}/><strong>隔著牆，交易才有機會開始。</strong><p>「先聽聽他打算買什麼，或者賣些什麼。」</p></div>:
     <div className="market-v12__offers market-v081__catalog" role="group" tabIndex={0} ref={offersScroll.scrollRef}
       aria-label={mode==='buy'?'可上下滾動或拖曳的販售商品':'背包持有物品與卡牌複本，可上下滾動或拖曳'}
       onPointerDown={offersScroll.onPointerDown} onPointerMove={offersScroll.onPointerMove}
       onPointerUp={offersScroll.onPointerUp} onPointerCancel={offersScroll.onPointerCancel}
       onClickCapture={offersScroll.onClickCapture}>
      {filteredOffers.map((offer,index)=>{
       const appearance=getMarketProductPresentation(offer.type,offer.id);
       const count=formatMarketOfferQuantity(offer.type,mode,offer.available);
       return <button type="button" key={offer.type+offer.id}
        className={`market-v12__offer market-v0822__product market-v0827__wave-item market-v0822__product--${appearance.tier} ${offer.canTrade?'':'is-unavailable'}`}
        style={{animationDelay:`${Math.min(index,28)*66}ms`}}
        onClick={()=>{setSelectedId(offer.id);playCue('select')}}
        title={offer.canTrade?'點擊查看交易資訊':offer.reason}
        aria-label={`${offer.name}，${appearance.name}階，${appearance.isDisplayOnly?'展示級別':'卡牌等級'} ${appearance.level}，${mode==='buy'?'庫存':'持有'} ${count}，${offer.price} 舊幣${offer.canTrade?'':`，無法交易：${offer.reason}`}`}>
        <span className="market-v0822__product-top">
         <span className="market-v0822__level" title={appearance.isDisplayOnly?'商品展示級別，不改變物品效果':'交易的是 Lv.1 升級複本'}>Lv.{appearance.level}</span>
         <span className="market-v12__offer-type">{appearance.name}</span>
        </span>
        <span className="market-v12__offer-icon" aria-hidden="true">{offer.type==='item'?<ItemArt id={offer.id}/>:offer.emoji}</span>
        <strong className="market-v0822__product-name" title={offer.name}>{offer.name}</strong>
        <span className="market-v0822__product-footer">
         <small><Coins size={11}/>{offer.price}</small>
         <span className="market-v0822__quantity">{mode==='buy'?'庫存':'持有'} {count}</span>
        </span>
       </button>;
      })}
      {!filteredOffers.length&&<p className="market-v12__empty">{mode==='sell'?'背包目前沒有符合條件的物品或卡牌複本。':'沒有符合條件的交易品，試試其他篩選。'}</p>}
     </div>}
     {mode!==null&&filteredOffers.length>6&&<div className="market-v081__scroll-hint" aria-hidden="true">向上拖曳或滾動，查看下方更多商品</div>}
   </div>
   </div>
  </section>
  <footer className="market-v10__footer"><Eye size={13}/> {vendor.name}只在{worldPhase(s.world.minute)}出現
   <span>每位商人都會記住交易，卡牌複本價格昂貴。</span>
   <GameUtilities className="game-utilities--market"/>
   <ReturnMainLink className="return-main-link--market"/>
  </footer>
  {selected&&mode&&<div className="market-v10__overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setSelectedId(null);}}>
   <section className="market-v10__detail" role="dialog" aria-modal="true" aria-label={selected.name+'交易資訊'}>
    <button className="market-v10__close" type="button" aria-label="關閉商品資訊" onClick={()=>setSelectedId(null)}><X size={20}/></button>
    <span className="market-v10__detail-kicker">BLACK MARKET / {selected.type==='card'?'CARD':'SUPPLY'}</span>
    <span className="market-v10__detail-art" aria-hidden="true">{selected.type==='item'?<ItemArt id={selected.id}/>:selected.emoji}</span>
    <h2>{selected.name}</h2>
    <p className="market-v0822__detail-grade">{getMarketProductPresentation(selected.type,selected.id).name}階 · Lv.{getMarketProductPresentation(selected.type,selected.id).level}{selected.type==='item'?'（展示級別，不影響裝備能力）':'（交易 Lv.1 升級複本）'}</p>
    <p>{selected.description}</p>
    <div className="market-v10__detail-facts">
     <span>交易價格 <strong>{selected.price} 舊幣</strong></span>
     <span>{mode==='sell'?'可出售數量':'剩餘供貨'} <strong>{formatMarketOfferQuantity(selected.type,mode,selected.available)}</strong></span>
     <span>商人 <strong>{vendor.name}</strong></span>
    </div>
    {selected.type==='card'&&<p className="market-v12__card-remark"><LockKeyhole size={13}/> 黑市卡牌以升級複本販售，原卡須先在任務中取得。</p>}
    <p className={`market-v10__trade-status ${selected.canTrade?'':'is-disabled'}`}>{selected.reason}</p>
    <button type="button" className="market-v10__trade" disabled={!selected.canTrade} onClick={()=>trade(selected)}>
     {mode==='sell'?'確認出售':'確認購買'} <ArrowRight size={18}/>
    </button>
   </section>
  </div>}
 </div>;
}
