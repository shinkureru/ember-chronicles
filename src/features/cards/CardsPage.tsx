import { useEffect, useMemo, useState } from 'react';
import { ArrowUpCircle, BookOpenText, LockKeyhole, MapPin, Package, Sparkles, X } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS, getUpgradeRequirement } from '../../game/data/cards';
import { CARD_LORE } from '../../game/data/cardLore';
import { PROFESSIONS } from '../../game/data/professions';
import PageStepper from '../../components/PageStepper';
import { playCue } from '../../audio/sound';
import { CARD_LIBRARY_PAGE_SIZE } from '../../game/data/uiConfig';

const PAGE_SIZE=CARD_LIBRARY_PAGE_SIZE;
const LEVELS=['','I','II','III','IV','V'];
const RARITY:Record<string,string>={normal:'普通',rare:'稀有',chaos:'混沌'};
export default function CardsPage(){
 const {state:s,dispatch}=useGame();
 const [page,setPage]=useState(0);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [filter,setFilter]=useState<'all'|'owned'>('all');
 const cardIds=useMemo(()=>Object.keys(CARDS).filter(id=>filter==='all'||!!s.ownedCards[id]).sort((a,b)=>Number(!!s.ownedCards[b])-Number(!!s.ownedCards[a])||a.localeCompare(b)),[filter,s.ownedCards]);
 const pages=Math.max(1,Math.ceil(cardIds.length/PAGE_SIZE));
 const visible=cardIds.slice(Math.min(page,pages-1)*PAGE_SIZE,(Math.min(page,pages-1)+1)*PAGE_SIZE);
 const selected=selectedId?CARDS[selectedId]:null;
 const owned=selectedId?s.ownedCards[selectedId]:null;
 const requirement=selected&&owned?getUpgradeRequirement(selected.rarity,owned.level):null;
 useEffect(()=>{if(!selectedId)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setSelectedId(null)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[selectedId]);
 return <div className="page-stack viewport-page cards-viewport">
  <section className="page-heading"><span className="eyebrow">CARD ARCHIVE / COLLECTION</span><h1>牌組圖鑑</h1><p>每頁十二格。點選卡牌查看能力、經歷、獲取途徑與升級需求。</p></section>
  <section className="card-library-toolbar"><div className="card-library-toolbar__count"><Package size={14}/><strong>{Object.keys(s.ownedCards).length} / {Object.keys(CARDS).length}</strong><small>已解鎖種類</small><span>牌組 {s.activeDeck.length} / 20</span></div><div className="card-library-toolbar__filter" role="group" aria-label="卡牌篩選"><button type="button" className={filter==='all'?'is-active':''} onClick={()=>{setFilter('all');setPage(0)}}>全部</button><button type="button" className={filter==='owned'?'is-active':''} onClick={()=>{setFilter('owned');setPage(0)}}>已持有</button></div></section>
  <div className="card-library-grid" aria-label="卡牌圖鑑每頁三欄四列">
   {Array.from({length:PAGE_SIZE},(_,i)=>{
    const id=visible[i];if(!id)return <div key={`vacant-${i}`} className="card-library-empty" aria-hidden="true"><span>—</span></div>;
    const card=CARDS[id]!,holding=s.ownedCards[id];
    return <button type="button" key={id} className={`card-library-tile rarity-tile--${card.rarity} ${holding?'':'is-locked'}`} onClick={()=>{setSelectedId(id);playCue('card')}} aria-label={`${card.name}，${holding?`已持有 ${1+holding.copies} 張`:'尚未取得'}，開啟詳情`}>
      <span className="card-library-tile__rarity">{RARITY[card.rarity]}</span>
      <span className="card-library-tile__art" aria-hidden="true">{holding?card.emoji:<LockKeyhole size={23}/>}</span>
      <strong className="card-library-tile__name">{card.name}</strong>
      <span className="card-library-tile__meta"><span>Lv.{holding?LEVELS[holding.level]:'—'}</span><span>持有 {holding?holding.copies+1:0}</span></span>
    </button>;
   })}
  </div>
  <PageStepper page={Math.min(page,pages-1)} pages={pages} onChange={setPage}/>
  <div className="card-library-footer"><Sparkles size={13}/>同卡複本可升級至 V 階，未取得的卡牌也能查看取得線索。</div>
  {selected&&<div className="card-detail-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null)}}>
    <section className="card-detail-dialog" role="dialog" aria-modal="true" aria-label={`${selected.name}卡牌詳情`}>
      <header className="card-detail-dialog__head"><span className="eyebrow">CARD ARCHIVE / {selected.id.toUpperCase()}</span><button type="button" onClick={()=>setSelectedId(null)} aria-label="關閉卡牌詳情"><X size={20}/></button></header>
      <div className="card-detail-dialog__hero"><div className="card-detail-dialog__icon">{selected.emoji}</div><div><span className={`rarity rarity--${selected.rarity}`}>{RARITY[selected.rarity]}</span><h2>{selected.name}</h2>{selected.profession&&<small>{PROFESSIONS[selected.profession].name}專屬</small>}</div></div>
      <div className="card-detail-dialog__stats"><span>等級 <strong>{owned?LEVELS[owned.level]:'未解鎖'}</strong></span><span>已持有 <strong>{owned?owned.copies+1:0} 張</strong></span><span>可消耗複本 <strong>{owned?.copies??0} 張</strong></span></div>
      <div className="card-detail-dialog__content">
        <section><h3>卡牌效果</h3><p>{selected.description}</p><p className="card-detail-dialog__numbers">成功率 +{selected.chanceBonus} 個百分點 · 職業資源 -{selected.resourceCost}{selected.staminaSaved?` · 省下體力 ${selected.staminaSaved}`:''}{selected.courageSaved?` · 減少膽量損失 ${selected.courageSaved}`:''}</p></section>
        <section><h3><BookOpenText size={16}/>這張卡的故事</h3><p>{CARD_LORE[selected.id]?.story??'這張卡牌的經歷尚待整理。'}</p></section>
        <section><h3><MapPin size={16}/>取得方式</h3><p>{CARD_LORE[selected.id]?.acquisition??'可從指定情境及 NPC 獎勵獲得。'}</p></section>
      </div>
      <footer className="card-detail-dialog__upgrade"><div><strong>{!owned?'尚未取得':requirement===null?'已達 V 階':`升級需要 ${requirement} 張複本`}</strong><small>{owned?`目前持有 ${owned.copies} 張複本`:'取得後才能升級'}</small></div><button type="button" className="primary-button" disabled={!owned||requirement===null||owned.copies<requirement} onClick={()=>{dispatch({type:'UPGRADE_CARD',cardId:selected.id});playCue('reward')}}><ArrowUpCircle size={15}/>升級</button></footer>
    </section>
   </div>}
 </div>;
}
