import { useEffect, useMemo, useState } from 'react';
import { Coins, HeartHandshake, LockKeyhole, ShoppingBag, Tag, X, ArrowRight, Clock3 } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS } from '../../game/data/cards';
import { ITEMS } from '../../game/data/items';
import { ATTACK_CARDS } from '../../game/data/attacks';
import { getVendorStockKey, marketSellPrice } from '../../game/data/marketVendors';
import { getScheduledVendor } from '../../game/data/marketSchedule';
import { playCue } from '../../audio/sound';
import { bagWeight, worldPhaseToken, worldPhase, worldClock } from '../../game/engine/rules';
import MarketPortrait from './MarketPortrait';

type Tab='buy'|'sell'|'cards';
type CardMode='buy'|'sell';
interface Offer {
 id:string;name:string;emoji:string;description:string;type:'card'|'item';
 price:number;available:number;owned:number;canTrade:boolean;reason:string;
}
export default function BlackMarketPage(){
 const {state:s,dispatch}=useGame();
 const [tab,setTab]=useState<Tab>('buy');
 const [cardMode,setCardMode]=useState<CardMode>('sell');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const vendor=getScheduledVendor(s.world.minute);
 const phase=worldPhaseToken(s.world.minute);
 const inMission=s.mode==='adventure';
 const equipped=Object.values(s.equipment);
 const totalOwned=(id:string)=>(s.bag[id]??0)+(s.warehouse[id]??0);
 const protectedWeapon=(id:string)=>s.attackDeck.some(x=>ATTACK_CARDS[x]?.requiredItemId===id)&&totalOwned(id)<=1;
 const offers=useMemo<Offer[]>(()=>{
  if(tab==='cards')return vendor.cardIds.flatMap(id=>{
   const card=CARDS[id];if(!card)return [];
   const data=s.ownedCards[id];
   const price=cardMode==='buy'?(card.rarity==='normal'?360:card.rarity==='rare'?980:4000):(card.rarity==='normal'?18:card.rarity==='rare'?55:120);
   const disabled=!data||(cardMode==='sell'?data.copies<1:s.economy.coins<price);
   return [{id,name:card.name,emoji:card.emoji,description:card.description,type:'card' as const,price,
    available:cardMode==='sell'?data?.copies??0:99,owned:data?.copies??0,
    canTrade:!inMission&&!disabled,reason:!data?'尚未取得卡牌':cardMode==='sell'&&data.copies<1?'沒有可出售的複本':s.economy.coins<price&&cardMode==='buy'?'舊幣不足':'可交易'}];
  });
  return (tab==='buy'?vendor.sellItems:vendor.buyItems.map(id=>({id,price:marketSellPrice(id),stock:0}))).flatMap(offer=>{
   const item=ITEMS[offer.id];if(!item)return [];
   const stockKey=getVendorStockKey(vendor.id,item.id);
   const available=tab==='buy'?Math.max(0,offer.stock-(s.economy.marketStock[stockKey]??0)):totalOwned(item.id);
   const price=tab==='buy'?offer.price:marketSellPrice(item.id);
   const protectedItem=s.protectedItems.includes(item.id)||equipped.includes(item.id)||protectedWeapon(item.id);
   const canTrade=!inMission&&(tab==='buy'?available>0&&s.economy.coins>=price&&bagWeight(s.bag)+item.weight<=15:available>0&&!protectedItem);
   const reason=tab==='buy'?
    available<=0?'商品售完':s.economy.coins<price?'舊幣不足':bagWeight(s.bag)+item.weight>15?'背包負重不足':'可購買':
    available<=0?'沒有可出售的物品':protectedItem?'已裝備或受保護物品不能出售':'可出售';
   return [{id:item.id,name:item.name,emoji:item.emoji,description:item.description,type:'item' as const,
    price,available,owned:totalOwned(item.id),canTrade,reason}];
  });
 },[tab,cardMode,vendor.id,s]);
 const selected=offers.find(o=>o.id===selectedId)??null;
 useEffect(()=>setSelectedId(null),[vendor.id,tab,cardMode]);
 useEffect(()=>{
  if(!selected)return;
  const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setSelectedId(null);};
  window.addEventListener('keydown',close);
  return()=>window.removeEventListener('keydown',close);
 },[selected]);
 const trade=(offer:Offer)=>{
  if(!offer.canTrade)return;
  if(offer.type==='card')dispatch(cardMode==='sell'?
   {type:'MARKET_SELL',vendorId:vendor.id,cardId:offer.id}:
   {type:'MARKET_BUY',vendorId:vendor.id,cardId:offer.id});
  else dispatch(tab==='buy'?
   {type:'MARKET_BUY_ITEM',vendorId:vendor.id,itemId:offer.id}:
   {type:'MARKET_SELL_ITEM',vendorId:vendor.id,itemId:offer.id});
  playCue(tab==='buy'||tab==='cards'&&cardMode==='buy'?'confirm':'loot');
  setSelectedId(null);
 };
 const sellMode=tab==='sell'||tab==='cards'&&cardMode==='sell';
 return <div className={`page-stack viewport-page market-viewport market-viewport--v10 phase--${phase}`}>
  <header className="market-v10__heading">
   <div><span className="eyebrow">UNDERGROUND / BLACK MARKET</span><h1>黑市</h1></div>
   <div className="market-v10__wallet"><Coins size={17}/><strong>{s.economy.coins}</strong><small>舊幣</small></div>
  </header>
  <section className="market-v10__scene" aria-label={`${worldPhase(s.world.minute)}的黑市攤位`}>
   <div className="market-v10__world-light" aria-hidden="true"/>
   <div className="market-v10__vendor">
    <div className="market-v10__portrait"><MarketPortrait face={vendor.face} name={vendor.name}/></div>
    <div className="market-v10__identity"><span>ON DUTY / {worldPhase(s.world.minute)}</span><strong>{vendor.name}</strong><small>{vendor.role}</small></div>
    <p className="market-v10__quote">{vendor.line}</p>
   </div>
   <div className="market-v10__counter">
    <div className="market-v10__counter-edge"><span>EXCHANGE / {sellMode?'SELL':'BUY'}</span><span><Clock3 size={11}/>{worldClock(s.world.minute)}</span></div>
    <div className="market-v10__goods" role="group" aria-label="點選攤位上的物品查看詳情">
     {offers.map((offer,i)=><button type="button" key={offer.id}
       className={`market-v10__object ${offer.canTrade?'is-available':'is-unavailable'}`}
       style={{'--goods-shift':`${[-5,3,-8,5,0][i%5]}px`,'--goods-tilt':`${[-4,3,-2,5,0][i%5]}deg`} as React.CSSProperties}
       onClick={()=>{setSelectedId(offer.id);playCue('select')}}
       title={`${offer.name}，${offer.price} 舊幣`}>
       <span className="market-v10__object-art" aria-hidden="true">{offer.emoji}</span>
       <strong>{offer.name}</strong><small>{offer.price} <Coins size={10}/></small>
      </button>)}
     {offers.length===0&&<p className="market-v10__empty">今天沒有符合這個條件的交易品。</p>}
    </div>
   </div>
  </section>
  <nav className="market-v10__tabs" aria-label="黑市交易種類">
   <button type="button" className={tab==='buy'?'is-active':''} onClick={()=>setTab('buy')}><ShoppingBag size={16}/>購買</button>
   <button type="button" className={tab==='sell'?'is-active':''} onClick={()=>setTab('sell')}><Tag size={16}/>出售</button>
   <button type="button" className={tab==='cards'?'is-active':''} onClick={()=>setTab('cards')}><LockKeyhole size={16}/>卡牌</button>
  </nav>
  {tab==='cards'&&<div className="market-v10__card-mode" role="group" aria-label="卡牌交易方式">
   <button type="button" className={cardMode==='sell'?'is-active':''} onClick={()=>setCardMode('sell')}>賣出複本</button>
   <button type="button" className={cardMode==='buy'?'is-active':''} onClick={()=>setCardMode('buy')}>高價購買</button>
  </div>}
  <footer className="market-v10__footer"><HeartHandshake size={13}/> 黑市好感 {s.economy.blackMarketFavor}/100 <span>五個時段各有固定商人，攤位隨世界時間輪替。</span></footer>
  {selected&&<div className="market-v10__overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null);}}>
   <section className="market-v10__detail" role="dialog" aria-modal="true" aria-label={selected.name+'交易資訊'}>
    <button className="market-v10__close" type="button" aria-label="關閉商品資訊" onClick={()=>setSelectedId(null)}><X size={20}/></button>
    <span className="market-v10__detail-kicker">BLACK MARKET / {selected.type==='card'?'CARD':'SUPPLY'}</span>
    <span className="market-v10__detail-art" aria-hidden="true">{selected.emoji}</span>
    <h2>{selected.name}</h2><p>{selected.description}</p>
    <div className="market-v10__detail-facts">
     <span>交易價格 <strong>{selected.price} 舊幣</strong></span>
     <span>{sellMode?'目前持有／複本':'剩餘供貨'} <strong>{sellMode?selected.owned:selected.available===99?'可購買':selected.available}</strong></span>
     <span>商人 <strong>{vendor.name}</strong></span>
    </div>
    <p className={`market-v10__trade-status ${selected.canTrade?'':'is-disabled'}`}>{selected.reason}</p>
    <button type="button" className="market-v10__trade" disabled={!selected.canTrade} onClick={()=>trade(selected)}>
     {sellMode?'確認出售':'確認購買'} <ArrowRight size={18}/>
    </button>
   </section>
  </div>}
 </div>;
}
