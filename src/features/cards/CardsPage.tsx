import { useEffect, useMemo, useState } from 'react';
import { ArrowUpCircle, BookOpenText, LockKeyhole, MapPin, Package, Sparkles, Swords, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGame } from '../../app/GameContext';
import { CARDS, getUpgradeRequirement } from '../../game/data/cards';
import { ATTACK_CARDS, getAttackDamage } from '../../game/data/attacks';
import { CARD_LORE } from '../../game/data/cardLore';
import { ITEMS } from '../../game/data/items';
import { PROFESSIONS } from '../../game/data/professions';
import {useVerticalDragScroll} from '../../components/useVerticalDragScroll';
import {buildCardArchiveVariants} from '../../game/engine/cardArchiveVariants';
import {CODEX_RARITIES,CODEX_PROFESSIONS,filterSkillCodexIds,type CodexRarity,type CodexProfession} from './cardCodexFilters';
import { playCue } from '../../audio/sound';
import ReturnMainLink from '../../components/ReturnMainLink';
import GameUtilities from '../../components/GameUtilities';
const RARITY:Record<string,string>={normal:'普通',rare:'稀有',chaos:'混沌'};
export default function CardsPage(){
 const {state:s,dispatch}=useGame();
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [selectedLevel,setSelectedLevel]=useState(1);
 const dragScroll=useVerticalDragScroll();
 const [filter,setFilter]=useState<'all'|'owned'>('all');
 const [category,setCategory]=useState<'skill'|'attack'>('skill');
 const [rarity,setRarity]=useState<CodexRarity>('all');
 const [profession,setProfession]=useState<CodexProfession>('all');
 const registry=category==='skill'?CARDS:ATTACK_CARDS;
 const cardIds=useMemo(()=>category==='skill'
  ?filterSkillCodexIds(s.ownedCards,{owned:filter,rarity,profession})
  :Object.keys(ATTACK_CARDS).filter(id=>filter==='all'||!!s.ownedCards[id])
    .sort((a,b)=>Number(!!s.ownedCards[b])-Number(!!s.ownedCards[a])||a.localeCompare(b)),
  [category,filter,s.ownedCards,rarity,profession]);
 const variants=useMemo(()=>buildCardArchiveVariants(cardIds,s.ownedCards,filter),[cardIds,s.ownedCards,filter]);
 useEffect(()=>{if(dragScroll.scrollRef.current)dragScroll.scrollRef.current.scrollTop=0},[category,filter,rarity,profession]);
 const skill=selectedId?CARDS[selectedId]:undefined;
 const attack=selectedId?ATTACK_CARDS[selectedId]:undefined;
 const selected=skill??attack;
 const owned=selectedId?s.ownedCards[selectedId]:null;
 const isPrimary=!!owned&&owned.level===selectedLevel;
 const variantQuantity=owned?(owned.level===1&&selectedLevel===1?owned.copies+1:isPrimary?1:selectedLevel===1?owned.copies:0):0;
 const requirement=selected&&owned&&isPrimary?getUpgradeRequirement(selected.rarity,owned.level):null;
 const item=attack?ITEMS[attack.requiredItemId]:null;
 useEffect(()=>{if(!selectedId)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setSelectedId(null)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[selectedId]);
 return <div className={`page-stack viewport-page cards-viewport cards-v0820 ${category==='skill'?'cards-v0820--skills':'cards-v0820--attacks'}`}>
  <section className="page-heading cards-v0820__heading">
   <div><span className="eyebrow">CARD ARCHIVE / COLLECTION</span><h1>牌組圖鑑</h1></div>
   <p>功能型與攻擊型分開收藏，點擊卡牌查看完整詳情與取得方式。</p>
  </section>
  <nav className="card-kind-tabs cards-v0820__tabs" aria-label="牌組圖鑑分類">
   <button type="button" aria-current={category==='skill'?'page':undefined}
    className={category==='skill'?'is-active':''}
    onClick={()=>{setCategory('skill');setSelectedId(null);playCue('select')}}>功能／附加技能</button>
   <button type="button" aria-current={category==='attack'?'page':undefined}
    className={category==='attack'?'is-active':''}
    onClick={()=>{setCategory('attack');setSelectedId(null);playCue('select')}}><Swords size={14}/>攻擊型主動牌</button>
   <Link to="/preparation">事前準備</Link>
  </nav>
  <section className="card-library-toolbar cards-v0820__toolbar" aria-label="收藏進度和擁有狀態">
   <div className="card-library-toolbar__count">
    <Package size={14}/><strong>{Object.keys(registry).filter(id=>!!s.ownedCards[id]).length} / {Object.keys(registry).length}</strong>
    <small>已解鎖種類</small>
    <span>{category==='skill'?`技能牌組 ${s.activeDeck.length} / 20`:`攻擊已備妥 ${s.attackDeck.length} / 5`}</span>
   </div>
   <div className="card-library-toolbar__filter" role="group" aria-label="卡牌持有狀態">
    <button type="button" aria-pressed={filter==='all'} className={filter==='all'?'is-active':''}
     onClick={()=>setFilter('all')}>全部</button>
    <button type="button" aria-pressed={filter==='owned'} className={filter==='owned'?'is-active':''}
     onClick={()=>setFilter('owned')}>已持有</button>
   </div>
  </section>
  {category==='skill'&&<section className="cards-v0820__filters" aria-label="功能型技能篩選">
   <div className="cards-v0820__filter-line" role="group" aria-label="稀有度">
    <span>稀有度</span>
    <div>{CODEX_RARITIES.map(item=><button key={item.id} type="button"
     aria-pressed={rarity===item.id} className={rarity===item.id?'is-active':''}
     onClick={()=>setRarity(item.id)}>{item.label}</button>)}</div>
   </div>
   <div className="cards-v0820__filter-line" role="group" aria-label="職業歸屬">
    <span>卡牌歸屬</span>
    <div>{CODEX_PROFESSIONS.map(item=><button key={item.id} type="button"
     aria-pressed={profession===item.id} className={profession===item.id?'is-active':''}
     onClick={()=>setProfession(item.id)}>{item.label}</button>)}</div>
   </div>
   <small className="cards-v0820__results" role="status" aria-live="polite">
    顯示 {variants.length} 格 · 點選卡牌可查看效果與升級
   </small>
  </section>}
  <div className={`card-library-grid card-library-grid--scroll ${category==='skill'?'cards-v0820__skill-grid':''}`} role="region" tabIndex={0}
    aria-label={category==='skill'?'功能型技能圖鑑，每張依等級獨立顯示，格子可垂直捲動':'攻擊型主動牌圖鑑，每張依等級獨立顯示，格子可垂直捲動'}
    ref={dragScroll.scrollRef}
    onPointerDown={dragScroll.onPointerDown} onPointerMove={dragScroll.onPointerMove}
    onPointerUp={dragScroll.onPointerUp} onPointerCancel={dragScroll.onPointerCancel}
    onClickCapture={dragScroll.onClickCapture}>
   {variants.map(variant=>{
    const card=registry[variant.id]!;
    const skillCard=category==='skill'?CARDS[variant.id]:undefined;
    return <button type="button" key={`${variant.id}-lv${variant.level}`}
      className={`card-library-tile card-library-tile--level-${variant.level} rarity-tile--${card.rarity} ${variant.locked?'is-locked':''} ${skillCard?'cards-v0820__skill-tile':''}`}
      onClick={()=>{setSelectedId(variant.id);setSelectedLevel(variant.level);playCue('card')}}
      aria-label={`LV.${variant.level} ${card.name}，${variant.locked?'尚未取得':`已持有 ${variant.quantity} 張`}，開啟詳情`}>
     <span className="card-library-tile__rarity">{RARITY[card.rarity]}</span>
     <span className="card-library-tile__art" aria-hidden="true">{variant.locked?<LockKeyhole size={23}/>:card.emoji}</span>
     {skillCard&&<span className="cards-v0820__skill-effect">
      <b>成功率 +{skillCard.chanceBonus}%</b><small>資源 -{skillCard.resourceCost}</small>
     </span>}
     <div className="card-library-tile__footer">
      <strong className="card-library-tile__name"><b>LV.{variant.level}</b> {card.name}</strong>
      <span className="card-library-tile__quantity">×{variant.quantity}</span>
     </div>
    </button>;
   })}
   {!variants.length&&<div className="card-library-empty-note">目前沒有符合條件的卡牌。</div>}
  </div>
  <div className="card-library-footer"><span className="card-library-footer__hint"><Sparkles size={13}/>同卡複本可升級至 V 階。攻擊卡需有對應武器，才能在關卡內使用。</span><GameUtilities className="game-utilities--cards"/><ReturnMainLink className="return-main-link--cards"/></div>
  {selected&&<div className="card-detail-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null)}}>
    <section className="card-detail-dialog" role="dialog" aria-modal="true" aria-label={`${selected.name}卡牌詳情`}>
      <header className="card-detail-dialog__head"><span className="eyebrow">CARD ARCHIVE / {selected.id.toUpperCase()}</span><button type="button" onClick={()=>setSelectedId(null)} aria-label="關閉卡牌詳情"><X size={20}/></button></header>
      <div className="card-detail-dialog__hero"><div className="card-detail-dialog__icon">{selected.emoji}</div><div><span className={`rarity rarity--${selected.rarity}`}>{RARITY[selected.rarity]}</span><h2>LV.{selectedLevel} {selected.name}</h2>{selected.profession&&<small>{PROFESSIONS[selected.profession].name}專屬</small>}</div></div>
      <div className="card-detail-dialog__stats"><span>等級 <strong>LV.{selectedLevel}</strong></span><span>這個等級持有 <strong>{variantQuantity} 張</strong></span><span>可消耗複本 <strong>{owned?.copies??0} 張</strong></span></div>
      <div className="card-detail-dialog__content">
        <section><h3>卡牌效果</h3><p>{selected.description}</p>
          {attack?<p className="card-detail-dialog__numbers">傷害 {getAttackDamage(s,attack.id)} · 基礎成功率 {attack.baseChance}% · 體力 -{attack.staminaCost} · 必備物品：{item?.name??attack.requiredItemId}</p>:
          skill?<p className="card-detail-dialog__numbers">成功率 +{skill.chanceBonus} 個百分點 · 資源 -{skill.resourceCost}{skill.staminaSaved?` · 省下體力 ${skill.staminaSaved}`:''}{skill.courageSaved?` · 減少膽量損失 ${skill.courageSaved}`:''}</p>:null}
        </section>
        <section><h3><BookOpenText size={16}/>這張卡的故事</h3><p>{attack?`我曾經只把「${item?.name??attack.name}」當成日常工具。現在這個地方，卻逼得我不得不考慮它另一種用途。`:(CARD_LORE[selected.id]?.story??'這張卡牌的經歷尚待整理。')}</p></section>
        <section><h3><MapPin size={16}/>取得方式</h3><p>{attack?`選擇對應職業時可取得部分初始攻擊牌，後續可從搜查、戰利品與特殊人物事件取得複本。要使用這張卡，還需在背包中持有「${item?.name??attack.requiredItemId}」。`:(CARD_LORE[selected.id]?.acquisition??'可從指定情境及 NPC 獎勵獲得。')}</p></section>
      </div>
      <footer className="card-detail-dialog__upgrade"><div><strong>{!owned?'尚未取得':!isPrimary?'這是獨立的 LV.1 升級素材':requirement===null?'已達 V 階':`升級需要 ${requirement} 張複本`}</strong><small>{owned?`目前持有 ${owned.copies} 張複本`:'取得後才能升級'}</small></div><button type="button" className="primary-button" disabled={!owned||!isPrimary||requirement===null||owned.copies<requirement} onClick={()=>{dispatch({type:'UPGRADE_CARD',cardId:selected.id});setSelectedLevel(Math.min(5,(owned?.level??1)+1));playCue('reward')}}><ArrowUpCircle size={15}/>升級</button></footer>
    </section>
   </div>}
 </div>;
}
