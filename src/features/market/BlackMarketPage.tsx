import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Coins, HeartHandshake, ShoppingBag, Tag, X, ArrowRight, Clock3, SlidersHorizontal, Handshake, Eye, LockKeyhole } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS } from '../../game/data/cards';
import { ITEMS } from '../../game/data/items';
import { ATTACK_CARDS } from '../../game/data/attacks';
import { getVendorStockKey, marketSellPrice } from '../../game/data/marketVendors';
import { getScheduledVendor } from '../../game/data/marketSchedule';
import { playCue } from '../../audio/sound';
import { bagWeight, worldPhaseToken, worldPhase, worldClock } from '../../game/engine/rules';
import MarketPortrait from './MarketPortrait';
import SurvivorFigure from '../../components/SurvivorFigure';

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
 const [mode,setMode]=useState<Mode|null>(null);
 const [kind,setKind]=useState<Kind>('all');
 const [narrow,setNarrow]=useState<Narrow>('any');
 const [more,setMore]=useState(false);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const vendor=getScheduledVendor(s.world.minute);
 const phase=worldPhaseToken(s.world.minute);
 const equipped=Object.values(s.equipment);
 const totalOwned=(id:string)=>(s.bag[id]??0)+(s.warehouse[id]??0);
 const protectedWeapon=(id:string)=>s.attackDeck.some(card=>ATTACK_CARDS[card]?.requiredItemId===id)&&totalOwned(id)<=1;

 const offers=useMemo<Offer[]>(()=>{
  if(mode===null)return [];
  const cardOffers=vendor.cardIds.flatMap(id=>{
   const card=CARDS[id];if(!card)return [];
   const data=s.ownedCards[id],price=CARD_PRICES[card.rarity][mode];
   const canTrade=s.mode!=='adventure'&&!!data&&(mode==='sell'?data.copies>=1:s.economy.coins>=price);
   const reason=!data?'須先取得原卡才能交易複本':
    mode==='sell'&&data.copies<1?'沒有可出售的複本':
    mode==='buy'&&s.economy.coins<price?'舊幣不足':'可交易';
   return [{id,name:card.name,emoji:card.emoji,description:card.description,type:'card' as const,category:'card',
    price,available:mode==='sell'?data?.copies??0:99,owned:data?.copies??0,canTrade,reason}];
  });
  const list=mode==='buy'?vendor.sellItems:vendor.buyItems.map(id=>({id,price:marketSellPrice(id),stock:0}));
  const itemOffers=list.flatMap(entry=>{
   const item=ITEMS[entry.id];if(!item)return [];
   const stockKey=getVendorStockKey(vendor.id,item.id);
   const available=mode==='buy'?Math.max(0,entry.stock-(s.economy.marketStock[stockKey]??0)):totalOwned(item.id);
   const price=mode==='buy'?entry.price:marketSellPrice(item.id);
   const protectedItem=s.protectedItems.includes(item.id)||equipped.includes(item.id)||protectedWeapon(item.id);
   const canTrade=s.mode!=='adventure'&&(mode==='buy'?available>0&&s.economy.coins>=price&&bagWeight(s.bag)+item.weight<=15:available>0&&!protectedItem);
   const reason=mode==='buy'?
    available<=0?'商品已售完':s.economy.coins<price?'舊幣不足':bagWeight(s.bag)+item.weight>15?'背包負重不足':'可購買':
    available<=0?'沒有持有此物品':protectedItem?'裝備中或常用物品不得出售':'可出售';
   return [{id:item.id,name:item.name,emoji:item.emoji,description:item.description,type:'item' as const,category:item.type,
    price,available,owned:totalOwned(item.id),canTrade,reason}];
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
 useEffect(()=>{
  if(!selected)return;
  const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setSelectedId(null);};
  window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);
 },[selected]);
 const chooseMode=(value:Mode)=>{
  if(mode===value){setMode(null);setSelectedId(null);}
  else {setMode(value);setKind('all');setNarrow('any');setMore(false);}
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
 return <div className={`page-stack viewport-page market-viewport market-viewport--v10 market-v12 market-v13 phase--${phase}`}>
  <header className="market-v10__heading">
   <div><span className="eyebrow">UNDERGROUND / SECRET EXCHANGE</span><h1>黑市</h1></div>
   <div className="market-v10__wallet"><Coins size={17}/><strong>{s.economy.coins}</strong><small>舊幣</small></div>
  </header>
  <section className="market-v12__scene" aria-label={`${worldPhase(s.world.minute)}的秘密交易地點`}>
   <div className="market-v12__meeting">
    <div className="market-v12__lantern" aria-hidden="true"/>
    <div className="market-v12__person market-v12__person--merchant">
     <MarketPortrait profile face={vendor.face} name={vendor.name}/>
     <div className="market-v12__person-name"><strong>{vendor.name}</strong><small>{vendor.role}</small></div>
    </div>
    <div className="market-v12__wall" aria-hidden="true"><span className="market-v12__slot"/><i/><i/><i/></div>
    <div className="market-v12__person market-v12__person--player">
     <SurvivorFigure view="profile" equipment={s.equipment}/>
     <div className="market-v12__person-name"><strong>我</strong></div>
    </div>
    <p className="market-v12__dialogue">{vendor.line}</p>
    <div className="market-v12__time"><Clock3 size={11}/>{worldPhase(s.world.minute)} {worldClock(s.world.minute)}</div>
    <div className="market-v13__favor"><HeartHandshake size={13}/><span>商人好感</span><strong>{s.economy.blackMarketFavor}/100</strong></div>
   </div>
   <div className="market-v12__table">
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
     <div className="market-v12__offers" role="group" aria-label={mode==='buy'?'販售商品':'商人收購商品'}>
      {filteredOffers.map((offer,i)=><button type="button" key={offer.type+offer.id}
       className={`market-v12__offer ${offer.canTrade?'':'is-unavailable'}`}
       style={{'--offer-angle':`${[-7,4,-3,6,-5,3,2][i%7]}deg`,'--offer-y':`${[0,9,-4,7,1,-6,3][i%7]}px`} as CSSProperties}
       onClick={()=>{setSelectedId(offer.id);playCue('select')}}
       aria-label={`${offer.name}，${offer.price} 舊幣`}>
       <span className="market-v12__offer-type">{offer.type==='card'?'CARD':'ITEM'}</span>
       <span className="market-v12__offer-icon" aria-hidden="true">{offer.emoji}</span>
       <strong>{offer.name}</strong>
       <small>{offer.price} <Coins size={10}/></small>
      </button>)}
      {!filteredOffers.length&&<p className="market-v12__empty">沒有符合條件的交易品，試試其他篩選。</p>}
     </div>}
   </div>
  </section>
  <nav className="market-v12__modes" aria-label="先選擇購買或出售">
   <button type="button" aria-pressed={mode==='buy'} className={mode==='buy'?'is-active':''} onClick={()=>chooseMode('buy')}><ShoppingBag size={16}/>購買</button>
   <button type="button" aria-pressed={mode==='sell'} className={mode==='sell'?'is-active':''} onClick={()=>chooseMode('sell')}><Tag size={16}/>出售</button>
  </nav>
  <footer className="market-v10__footer"><Eye size={13}/> {vendor.name}只在{worldPhase(s.world.minute)}出現
   <span>每位商人都會記住交易，卡牌複本價格昂貴。</span>
  </footer>
  {selected&&mode&&<div className="market-v10__overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setSelectedId(null);}}>
   <section className="market-v10__detail" role="dialog" aria-modal="true" aria-label={selected.name+'交易資訊'}>
    <button className="market-v10__close" type="button" aria-label="關閉商品資訊" onClick={()=>setSelectedId(null)}><X size={20}/></button>
    <span className="market-v10__detail-kicker">BLACK MARKET / {selected.type==='card'?'CARD':'SUPPLY'}</span>
    <span className="market-v10__detail-art" aria-hidden="true">{selected.emoji}</span>
    <h2>{selected.name}</h2><p>{selected.description}</p>
    <div className="market-v10__detail-facts">
     <span>交易價格 <strong>{selected.price} 舊幣</strong></span>
     <span>{mode==='sell'?'可出售數量':'剩餘供貨'} <strong>{mode==='sell'?selected.available:selected.available===99?'可購買':selected.available}</strong></span>
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
