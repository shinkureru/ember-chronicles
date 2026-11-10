import { useState } from 'react';
import { Coins, HeartHandshake, LockKeyhole, ShoppingBag, Tag } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS } from '../../game/data/cards';
import { ITEMS } from '../../game/data/items';
import { ATTACK_CARDS } from '../../game/data/attacks';
import { MARKET_VENDORS, getVendorStockKey, marketSellPrice } from '../../game/data/marketVendors';
import { playCue } from '../../audio/sound';
import { bagWeight, worldPhaseToken, worldPhase, worldClock } from '../../game/engine/rules';
import MarketPortrait from './MarketPortrait';

export default function BlackMarketPage(){
 const {state:s,dispatch}=useGame();
 const [vendorId,setVendorId]=useState(MARKET_VENDORS[0]!.id);
 const [tab,setTab]=useState<'buy'|'sell'|'cards'>('buy');
 const [cardMode,setCardMode]=useState<'buy'|'sell'>('sell');
 const vendor=MARKET_VENDORS.find(v=>v.id===vendorId)??MARKET_VENDORS[0]!;
 const inMission=s.mode==='adventure';
 const itemRows=tab==='buy'?vendor.sellItems:vendor.buyItems.map(id=>({id,price:marketSellPrice(id),stock:1}));
 const rows=tab==='cards'?vendor.cardIds:itemRows.map(x=>x.id);
 const countOwned=(id:string)=>(s.bag[id]??0)+(s.warehouse[id]??0);
 const equipped=Object.values(s.equipment);
 const selectedWeapon=(id:string)=>s.attackDeck.some(card=>ATTACK_CARDS[card]?.requiredItemId===id);
 return <div className="page-stack viewport-page market-viewport market-viewport--v09">
  <header className="market-v09__heading"><div><span className="eyebrow">UNDERGROUND / BLACK MARKET</span><h1>黑市</h1></div><div><Coins size={15}/>{s.economy.coins} <small>舊幣</small></div></header>
  <nav className="market-vendor-nav" aria-label="黑市交易 NPC">
   {MARKET_VENDORS.map(v=><button key={v.id} type="button" aria-pressed={vendor.id===v.id} className={vendor.id===v.id?'is-active':''}
     onClick={()=>{setVendorId(v.id);playCue('select')}}><MarketPortrait face={v.face} name={v.name}/><span>{v.name}</span></button>)}
  </nav>
  <section className={`market-vendor-profile phase--${worldPhaseToken(s.world.minute)}`} aria-label={`黑市交易 · ${worldPhase(s.world.minute)} ${worldClock(s.world.minute)}`}>
   <MarketPortrait face={vendor.face} name={vendor.name}/>
   <div><strong>{vendor.name}</strong><small>{vendor.role}</small><p>{vendor.line}</p>
    <span className="market-vendor-profile__favor"><HeartHandshake size={12}/>黑市聲望 {s.economy.blackMarketFavor}/100 · {worldPhase(s.world.minute)} {worldClock(s.world.minute)}</span></div>
  </section>
  <nav className="market-v09__tabs" aria-label="交易分類">
   <button type="button" className={tab==='buy'?'is-active':''} onClick={()=>setTab('buy')}><ShoppingBag size={14}/>買物資</button>
   <button type="button" className={tab==='sell'?'is-active':''} onClick={()=>setTab('sell')}><Tag size={14}/>賣物資</button>
   <button type="button" className={tab==='cards'?'is-active':''} onClick={()=>setTab('cards')}><LockKeyhole size={14}/>卡牌</button>
  </nav>
  {tab==='cards'&&<div className="market-v09__card-mode">
   <button type="button" className={cardMode==='sell'?'is-active':''} onClick={()=>setCardMode('sell')}>出售重複卡</button>
   <button type="button" className={cardMode==='buy'?'is-active':''} onClick={()=>setCardMode('buy')}>高價購買</button>
  </div>}
  <section className="market-v09__inventory" aria-label={vendor.name+'的商品清單'}>
   {rows.map(id=>{
    const item=ITEMS[id],card=CARDS[id];
    if(tab==='cards'&&card){
      const data=s.ownedCards[id];
      const price=cardMode==='buy'?(card.rarity==='normal'?360:card.rarity==='rare'?980:4000):(card.rarity==='normal'?18:card.rarity==='rare'?55:120);
      const disabled=inMission||!data||(cardMode==='sell'?data.copies<1:s.economy.coins<price);
      return <div className="market-v09__row" key={id}>
       <span className="market-v09__row-icon">{card.emoji}</span>
       <div><strong>{card.name}</strong><small>{cardMode==='sell'? `複本 ${data?.copies??0} 張 · 收購 ${price}`:`升級素材 · ${price} 舊幣`}</small></div>
       <button type="button" disabled={disabled} onClick={()=>{dispatch(cardMode==='sell'?{type:'MARKET_SELL',vendorId:vendor.id,cardId:id}:{type:'MARKET_BUY',vendorId:vendor.id,cardId:id});playCue(cardMode==='sell'?'loot':'confirm')}}>{cardMode==='sell'?'出售':'購買'}</button>
      </div>;
    }
    if(!item)return null;
    const offer=vendor.sellItems.find(x=>x.id===id);
    const bought=offer?(s.economy.marketStock[getVendorStockKey(vendor.id,id)]??0):0;
    const available=offer?Math.max(0,offer.stock-bought):0;
    const price=tab==='buy'?offer?.price??0:marketSellPrice(id);
    const owned=countOwned(id);
    const untradeable=tab==='sell'&&(s.protectedItems.includes(id)||equipped.includes(id)||(selectedWeapon(id)&&owned<=1));
    const disabled=inMission||(tab==='buy'?s.economy.coins<price||available<=0||bagWeight(s.bag)+item.weight>15:owned<=0||untradeable);
    return <div className="market-v09__row" key={id}>
     <span className="market-v09__row-icon">{item.emoji}</span>
     <div><strong>{item.name}</strong><small>{tab==='buy'?`${price} 舊幣 · 尚有 ${available} 件`:`收購 ${price} 舊幣 · 持有 ${owned} 件`}</small></div>
     <button type="button" disabled={disabled} onClick={()=>{dispatch(tab==='buy'?{type:'MARKET_BUY_ITEM',vendorId:vendor.id,itemId:id}:{type:'MARKET_SELL_ITEM',vendorId:vendor.id,itemId:id});playCue(tab==='buy'?'confirm':'loot')}}>{tab==='buy'?'購買':'出售'}</button>
    </div>;
   })}
   {rows.length===0&&<p>這名交易者目前沒有可交易的物品。</p>}
  </section>
  <p className="market-v09__footer">{tab==='buy'?'黑市價格偏高；請衡量食物、裝備與卡牌升級的機會成本。':tab==='sell'?'交易者只收自己感興趣的品項，已裝備和受保護的物品不能出售。':'每位交易者只收購特定卡牌。稀有卡價格很高，請斟酌。'}</p>
 </div>;
}
