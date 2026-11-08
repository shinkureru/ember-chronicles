import { useEffect, useMemo, useState } from 'react';
import { ArrowUpCircle, BookOpenText, LockKeyhole, MapPin, Package, Sparkles, Swords, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGame } from '../../app/GameContext';
import { CARDS, getUpgradeRequirement } from '../../game/data/cards';
import { ATTACK_CARDS, getAttackDamage } from '../../game/data/attacks';
import { CARD_LORE } from '../../game/data/cardLore';
import { ITEMS } from '../../game/data/items';
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
 const [category,setCategory]=useState<'skill'|'attack'>('skill');
 const registry=category==='skill'?CARDS:ATTACK_CARDS;
 const cardIds=useMemo(()=>Object.keys(registry).filter(id=>filter==='all'||!!s.ownedCards[id]).sort((a,b)=>Number(!!s.ownedCards[b])-Number(!!s.ownedCards[a])||a.localeCompare(b)),[filter,s.ownedCards,registry]);
 const pages=Math.max(1,Math.ceil(cardIds.length/PAGE_SIZE));
 const visible=cardIds.slice(Math.min(page,pages-1)*PAGE_SIZE,(Math.min(page,pages-1)+1)*PAGE_SIZE);
 const skill=selectedId?CARDS[selectedId]:undefined;
 const attack=selectedId?ATTACK_CARDS[selectedId]:undefined;
 const selected=skill??attack;
 const owned=selectedId?s.ownedCards[selectedId]:null;
 const requirement=selected&&owned?getUpgradeRequirement(selected.rarity,owned.level):null;
 const item=attack?ITEMS[attack.requiredItemId]:null;
 useEffect(()=>{if(!selectedId)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setSelectedId(null)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[selectedId]);
 return <div className="page-stack viewport-page cards-viewport">
  <section className="page-heading"><span className="eyebrow">CARD ARCHIVE / COLLECTION</span><h1>牌組圖鑑</h1><p>功能型與攻擊型分開收藏，點擊卡牌查看完整詳情與取得方式。</p></section>
  <div className="card-kind-tabs" role="group" aria-label="卡牌種類">
    <button className={category==='skill'?'is-active':''} onClick={()=>{setCategory('skill');setPage(0);setSelectedId(null)}}>功能／附加技能</button>
    <button className={category==='attack'?'is-active':''} onClick={()=>{setCategory('attack');setPage(0);setSelectedId(null)}}><Swords size={15}/>攻擊型主動牌</button>
    <Link to="/preparation">事前準備</Link>
  </div>
  <section className="card-library-toolbar">
    <div className="card-library-toolbar__count"><Package size={14}/><strong>{Object.keys(registry).filter(id=>!!s.ownedCards[id]).length} / {Object.keys(registry).length}</strong><small>已解鎖種類</small><span>{category==='skill'?`技能牌組 ${s.activeDeck.length} / 20`:`攻擊已備妥 ${s.attackDeck.length} / 5`}</span></div>
    <div className="card-library-toolbar__filter" role="group" aria-label="卡牌篩選">
      <button type="button" className={filter==='all'?'is-active':''} onClick={()=>{setFilter('all');setPage(0)}}>全部</button>
      <button type="button" className={filter==='owned'?'is-active':''} onClick={()=>{setFilter('owned');setPage(0)}}>已持有</button>
    </div>
  </section>
  <div className="card-library-grid" aria-label="卡牌圖鑑每頁三欄四列">
   {Array.from({length:PAGE_SIZE},(_,i)=>{
    const id=visible[i];if(!id)return <div key={`vacant-${i}`} className="card-library-empty" aria-hidden="true"><span>—</span></div>;
    const card=registry[id]!,holding=s.ownedCards[id];
    return <button type="button" key={id} className={`card-library-tile rarity-tile--${card.rarity} ${holding?'':'is-locked'}`} onClick={()=>{setSelectedId(id);playCue('card')}} aria-label={`${card.name}，${holding?`已持有 ${1+holding.copies} 張`:'尚未取得'}，開啟詳情`}>
      <span className="card-library-tile__rarity">{RARITY[card.rarity]}</span>
      <span className="card-library-tile__art" aria-hidden="true">{holding?card.emoji:<LockKeyhole size={23}/>}</span>
      <strong className="card-library-tile__name">{card.name}</strong>
      <span className="card-library-tile__meta"><span>Lv.{holding?LEVELS[holding.level]:'—'}</span><span>持有 {holding?holding.copies+1:0}</span></span>
    </button>;
   })}
  </div>
  <PageStepper page={Math.min(page,pages-1)} pages={pages} onChange={setPage}/>
  <div className="card-library-footer"><Sparkles size={13}/>同卡複本可升級至 V 階。攻擊卡需有對應武器，才能在關卡內使用。</div>
  {selected&&<div className="card-detail-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null)}}>
    <section className="card-detail-dialog" role="dialog" aria-modal="true" aria-label={`${selected.name}卡牌詳情`}>
      <header className="card-detail-dialog__head"><span className="eyebrow">CARD ARCHIVE / {selected.id.toUpperCase()}</span><button type="button" onClick={()=>setSelectedId(null)} aria-label="關閉卡牌詳情"><X size={20}/></button></header>
      <div className="card-detail-dialog__hero"><div className="card-detail-dialog__icon">{selected.emoji}</div><div><span className={`rarity rarity--${selected.rarity}`}>{RARITY[selected.rarity]}</span><h2>{selected.name}</h2>{selected.profession&&<small>{PROFESSIONS[selected.profession].name}專屬</small>}</div></div>
      <div className="card-detail-dialog__stats"><span>等級 <strong>{owned?LEVELS[owned.level]:'未解鎖'}</strong></span><span>已持有 <strong>{owned?owned.copies+1:0} 張</strong></span><span>可消耗複本 <strong>{owned?.copies??0} 張</strong></span></div>
      <div className="card-detail-dialog__content">
        <section><h3>卡牌效果</h3><p>{selected.description}</p>
          {attack?<p className="card-detail-dialog__numbers">傷害 {getAttackDamage(s,attack.id)} · 基礎成功率 {attack.baseChance}% · 體力 -{attack.staminaCost} · 必備物品：{item?.name??attack.requiredItemId}</p>:
          skill?<p className="card-detail-dialog__numbers">成功率 +{skill.chanceBonus} 個百分點 · 資源 -{skill.resourceCost}{skill.staminaSaved?` · 省下體力 ${skill.staminaSaved}`:''}{skill.courageSaved?` · 減少膽量損失 ${skill.courageSaved}`:''}</p>:null}
        </section>
        <section><h3><BookOpenText size={16}/>這張卡的故事</h3><p>{attack?`我曾經只把「${item?.name??attack.name}」當成日常工具。現在這個地方，卻逼得我不得不考慮它另一種用途。`:(CARD_LORE[selected.id]?.story??'這張卡牌的經歷尚待整理。')}</p></section>
        <section><h3><MapPin size={16}/>取得方式</h3><p>{attack?`選擇對應職業時可取得部分初始攻擊牌，後續可從搜查、戰利品與特殊人物事件取得複本。要使用這張卡，還需在背包中持有「${item?.name??attack.requiredItemId}」。`:(CARD_LORE[selected.id]?.acquisition??'可從指定情境及 NPC 獎勵獲得。')}</p></section>
      </div>
      <footer className="card-detail-dialog__upgrade"><div><strong>{!owned?'尚未取得':requirement===null?'已達 V 階':`升級需要 ${requirement} 張複本`}</strong><small>{owned?`目前持有 ${owned.copies} 張複本`:'取得後才能升級'}</small></div><button type="button" className="primary-button" disabled={!owned||requirement===null||owned.copies<requirement} onClick={()=>{dispatch({type:'UPGRADE_CARD',cardId:selected.id});playCue('reward')}}><ArrowUpCircle size={15}/>升級</button></footer>
    </section>
   </div>}
 </div>;
}
