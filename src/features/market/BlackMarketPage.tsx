import { useState } from 'react';
import { Coins, HeartHandshake, LockKeyhole, ShoppingBag, Tag } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS } from '../../game/data/cards';
import { playCue } from '../../audio/sound';
import ViewTabs from '../../components/ViewTabs';
import PageStepper from '../../components/PageStepper';
export default function BlackMarketPage(){
 const {state:s,dispatch}=useGame();const [tab,setTab]=useState('sell'),[page,setPage]=useState(0);
 const owned=Object.entries(s.ownedCards).filter(([id])=>!!CARDS[id]);
 const entries=tab==='buy'?owned.slice(0,5):owned;
 const pages=Math.max(1,Math.ceil(entries.length/4)),activePage=Math.min(page,pages-1);
 return <div className="page-stack viewport-page market-viewport">
  <section className="page-heading"><span className="eyebrow">UNDERGROUND / CONTRABAND</span><h1>無名黑市</h1><p>「那傢伙根本沒抬頭。我看了一眼價格……貴得離譜。」</p></section>
  <section className="market-merchant"><div className="market-merchant__face">?</div><div><span>無名交易者</span><p>「帶了什麼？我只收有價值的東西。」</p></div></section>
  <section className="surface-card viewport-summary"><div className="market-summary"><div><Coins size={17}/><span>舊幣</span><b>{s.economy.coins}</b></div><div><HeartHandshake size={17}/><span>商人好感</span><b>{s.economy.blackMarketFavor}/100</b></div></div><div className="capacity-bar"><div style={{width:`${s.economy.blackMarketFavor}%`}}/></div><p className="muted"><LockKeyhole size={13}/>好感 80 解鎖隱藏交易（後續版本）。</p></section>
  <ViewTabs value={tab} onChange={v=>{setTab(v);setPage(0)}} tabs={[{id:'sell',label:'出售重複卡牌'},{id:'buy',label:'購買升級素材'}]}/>
  <section className="surface-card viewport-list"><h3>{tab==='sell'?<Tag size={17}/>:<ShoppingBag size={17}/>} {tab==='sell'?'出售複本':'高價購買'}</h3><div className="market-rows">{entries.slice(activePage*4,(activePage+1)*4).map(([id,data])=>{
   const card=CARDS[id]!;const price=tab==='sell'?(card.rarity==='normal'?18:card.rarity==='rare'?55:120):(card.rarity==='normal'?360:card.rarity==='rare'?980:4000);
   return <div className="market-row" key={id}><div><strong>{card.name}</strong><small>{tab==='sell'?`重複 ${data.copies} 張 · 收購 ${price} 舊幣`:`單張素材 · ${price} 舊幣`}</small></div><button type="button" disabled={tab==='sell'?data.copies<1:s.economy.coins<price} onClick={()=>{dispatch(tab==='sell'?{type:'MARKET_SELL',cardId:id}:{type:'MARKET_BUY',cardId:id});playCue(tab==='sell'?'loot':'confirm')}}>{tab==='sell'?'出售':'購買'}</button></div>;
  })}</div></section>
  <PageStepper page={activePage} pages={pages} onChange={setPage}/>
  <div className="tip-panel viewport-tip">{tab==='buy'?'黑市買卡價格偏高，適合只缺最後一兩張時補足。':'販售重複卡可增加好感度，不會失去已解鎖卡牌。'}</div>
 </div>;
}
