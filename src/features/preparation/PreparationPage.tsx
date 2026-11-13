import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Backpack, BookOpenText, Check, CircleAlert, LockKeyhole, PackagePlus, ShieldAlert, Swords, X } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { ATTACK_CARDS, MAX_ATTACK_DECK, attackStatus, getAttackDamage } from '../../game/data/attacks';
import { ITEMS } from '../../game/data/items';
import { playCue } from '../../audio/sound';
import { bagWeight } from '../../game/engine/rules';
import { CHAPTER_ONE } from '../../game/data/maps/ch01';
import {getPreparationReadiness} from './preparationReadiness';
import ReturnMainLink from '../../components/ReturnMainLink';
import GameUtilities from '../../components/GameUtilities';

export default function PreparationPage(){
 const {state:s,dispatch}=useGame(),navigate=useNavigate();
 const [confirm,setConfirm]=useState(false);
 const mission=CHAPTER_ONE.stages[(s.stageId??1)-1]!;
 const ids=Object.keys(ATTACK_CARDS).filter(id=>!!s.ownedCards[id]);
 const {invalid,readyCount,projectedWeight}=getPreparationReadiness(s);
 const begin=()=>{
   playCue('confirm');
   dispatch({type:'START_ATTEMPT'});
   setConfirm(false);
   navigate('/chapter');
 };
 const requestStart=()=>{
   if(!s.attackDeck.length||invalid.length){setConfirm(true);playCue('warning');return;}
   begin();
 };
 return <div className="page-stack viewport-page preparation-page preparation-v0821">
  <header className="preparation-header">
   <div><span className="eyebrow">MISSION LOADOUT / CHAPTER 01</span><h1>事前準備 · {mission.name}</h1><p>我應該先想清楚，這次要把什麼帶進去。</p></div>
   <nav className="preparation-v0821__links" aria-label="準備頁導覽">
    <Link to="/cards" aria-label="返回牌組圖鑑"><BookOpenText size={14}/><span>牌組圖鑑</span></Link>
    <Link to="/" aria-label="返回地圖"><ArrowLeft size={17}/></Link>
   </nav>
  </header>
  <div className="preparation-v0821__overview" aria-label="本次準備摘要">
   <div><span>已選</span><strong>{s.attackDeck.length}/{MAX_ATTACK_DECK}</strong></div>
   <div><span>可用</span><strong>{readyCount} 張</strong></div>
   <div><span>背包負重</span><strong>{bagWeight(s.bag).toFixed(1)}/15 kg</strong></div>
   <div><span>備妥後預估</span><strong>{projectedWeight.toFixed(1)} kg</strong></div>
  </div>
  <section className="preparation-slots preparation-v0821__slots" aria-label="本次攻擊牌組">
    <div className="preparation-slots__heading"><strong>已挑選的攻擊牌</strong><span>{s.attackDeck.length} / {MAX_ATTACK_DECK}</span></div>
    <div className="preparation-slots__grid">
      {Array.from({length:MAX_ATTACK_DECK},(_,i)=>{
        const id=s.attackDeck[i],card=id?ATTACK_CARDS[id]:null,status=id?attackStatus(s,id):null;
        return card?<button key={id} type="button" className={`preparation-slot ${!invalid.includes(card.id)?'is-ready':'is-invalid'}`}
         aria-label={`從準備牌組移除${card.name}`} onClick={()=>{dispatch({type:'PREPARE_ATTACK_CARD',cardId:card.id});playCue('card')}} title="點擊移除這張攻擊牌">
          <span className="preparation-slot__number">{i+1}</span><strong>{card.emoji}</strong><small>{card.name}</small><span className="preparation-slot__state">{status?.inBag?'已備妥':!invalid.includes(card.id)?'倉庫可備妥':status?.inWarehouse?'負重不足':'缺少物品'}</span><X size={12} className="preparation-slot__remove"/>
        </button>:<div key={i} className="preparation-slot preparation-slot--empty" aria-label={`空的卡牌位置 ${i+1}`}><small>{i+1}</small><span>＋</span></div>;
      })}
    </div>
  </section>
  <section className="preparation-available preparation-v0821__available">
    <div className="preparation-available__heading"><strong>擁有的攻擊型主動牌</strong><span>點選加入／移除</span></div>
    <div className="preparation-available__list preparation-v0821__card-grid" role="region" tabIndex={0} aria-label="可選攻擊牌，垂直捲動查看更多">
      {ids.map(id=>{
        const card=ATTACK_CARDS[id],status=attackStatus(s,id),selected=s.attackDeck.includes(id);
        if(!card)return null;
        const item=ITEMS[card.requiredItemId];
        return <button key={id} type="button" aria-pressed={selected}
         aria-label={`${selected?'移除':'加入'}${card.name}，${status.inBag?'背包有武器':status.inWarehouse?'倉庫有武器':'缺少必要武器'}`}
         className={`preparation-option preparation-v0821__option ${status.inBag||status.inWarehouse?'is-ready':'is-invalid'} ${selected?'is-selected':''}`}
         onClick={()=>{dispatch({type:'PREPARE_ATTACK_CARD',cardId:id});playCue('card')}}>
         <span className="preparation-v0821__option-main">
          <span className="preparation-option__icon">{card.emoji}</span>
          <span className="preparation-option__info"><strong>{card.name} {selected&&<Check size={13}/>}</strong>
           <small title={card.description}>{card.description}</small></span>
         </span>
         <span className="preparation-v0821__option-stats">
          <em>傷害 {getAttackDamage(s,id)}</em><em>基礎成功 {card.baseChance}%</em><em>體力 -{card.staminaCost}</em>
         </span>
         <span className="preparation-v0821__option-foot">
          <small title={item?.name??card.requiredItemId}>{item?.name??card.requiredItemId}</small>
          <span className={`preparation-option__state ${status.inBag||status.inWarehouse?'is-ready':'is-invalid'}`}>
           {status.inBag?'背包已持有':status.inWarehouse?'倉庫可備妥':'缺少武器'}
          </span>
         </span>
        </button>;
      })}
      {ids.length===0&&<p className="empty-state"><LockKeyhole size={17}/>目前還沒有攻擊卡，仍可使用交涉或逃跑通關。</p>}
    </div>
  </section>
  <footer className="preparation-footer">
    <div className="preparation-footer__summary"><Backpack size={13}/>背包負重 {bagWeight(s.bag).toFixed(1)} / 15 kg <span>可用攻擊牌 {readyCount} 張</span></div>
    {invalid.length>0?<p className="preparation-footer__warning"><CircleAlert size={13}/>「{invalid.map(id=>ATTACK_CARDS[id]?.name).join('、')}」缺少對應武器，進關卡時無法使用。</p>:
     !s.attackDeck.length?<p className="preparation-footer__warning"><CircleAlert size={13}/>尚未選擇攻擊牌。可以進關，但只能依賴非攻擊解法。</p>:
     <p className="preparation-footer__hint"><PackagePlus size={13}/>選牌時倉庫的對應武器已自動移入背包。</p>}
    <div className="preparation-footer__utility-row"><GameUtilities className="game-utilities--preparation"/></div>
    <div className="preparation-footer__actions"><ReturnMainLink className="return-main-link--preparation"/><button type="button" className="primary-button" onClick={requestStart}><Swords size={16}/>帶著這些準備進關 <ArrowRight size={15}/></button></div>
  </footer>
  {confirm&&<div className="game-sheet-backdrop preparation-warning-overlay">
    <section role="alertdialog" aria-modal="true" aria-labelledby="prepare-warning-title" className="preparation-warning">
      <div className="preparation-warning__head"><ShieldAlert size={19}/><h2 id="prepare-warning-title">攻擊牌組尚未準備完整</h2></div>
      <p>{!s.attackDeck.length?'我還沒選任何攻擊牌。這次如果真的起衝突，只能嘗試交涉、潛行或撤退。':`「${invalid.map(id=>ATTACK_CARDS[id]?.name).join('、')}」目前沒有對應武器。進關後如果找到武器，這些卡才會啟用。`}</p>
      <p>這次仍然可以進入關卡，已取得的卡牌與物資不會因為警告而消失。</p>
      <div className="preparation-warning__actions"><button className="secondary-button" onClick={()=>setConfirm(false)}>返回調整</button><button className="primary-button" onClick={begin}>我知道了，仍要進關</button></div>
    </section>
  </div>}
 </div>;
}
