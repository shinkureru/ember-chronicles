import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, HeartCrack, Sparkles, X } from 'lucide-react';
import { useGame } from '../app/GameContext';
import { playCue } from '../audio/sound';
import { CARDS } from '../game/data/cards';
import { ITEMS } from '../game/data/items';
import PickupFly, { type PickupVisual } from './PickupFly';
import { ATTACK_CARDS } from '../game/data/attacks';
import { getVisibleActions } from '../game/engine/rules';
import { getActionSoundCue } from '../audio/actionCues';
import type { GameState } from '../game/types';

type Notice={id:number;title:string;detail:string;kind:'danger'|'major'};
let nextId=0;
let nextPickupId=0;
/** Only the truly consequential changes interrupt gameplay. Minor pickups and costs remain in the story log. */
export const majorStateChanges=(previous:GameState,current:GameState):Notice[]=>{
 const result:Notice[]=[];
 const add=(title:string,detail:string,kind:Notice['kind']='major')=>
  result.push({id:++nextId,title,detail,kind});
 // MissionTransition owns the entire result screen; never stack a short-lived
 // duplicate "defeat" popup that disappears automatically after 3.3 seconds.
 const ended=previous.mode!==current.mode&&current.mode==='result';
 if(ended||current.mode==='result')return [];
 const lost=previous.player.health-current.player.health;
 // Result screens already present serious injuries and gained clues; do not stack several modals.
 const criticalThreshold=Math.max(1,Math.ceil(current.player.maxHealth*.2));
 // Avoid stacking a modal over every 4-6 HP combat hit in the 10 HP system.
 if(!ended&&(lost>=Math.max(15,Math.ceil(current.player.maxHealth*.6))||
   previous.player.health>criticalThreshold&&current.player.health<=criticalThreshold))
  add('嚴重受傷',`生命 ${previous.player.health} → ${current.player.health}`, 'danger');
 if(!ended&&previous.player.courage>=40&&current.player.courage<40)
  add('膽量跌破臨界值','畏縮狀態已觸發；休息或完成勇氣事件可恢復。','danger');
 if(!ended&&current.clues.length>previous.clues.length)
  add('關鍵情報',current.clues[current.clues.length-1]??'取得了新的線索。');
 if(!ended&&current.chapterProgress.unlocked>previous.chapterProgress.unlocked)
  add('新關卡解鎖',`第 ${current.chapterProgress.unlocked} 關現已開放。`);
 for(const [id,data] of Object.entries(current.ownedCards)){
  const card=CARDS[id]??ATTACK_CARDS[id],old=previous.ownedCards[id];
  if(card&&!old&&card.rarity!=='normal')add('取得稀有卡牌',`「${card.name}」已加入收藏。`);
  if(card&&old&&data.level>old.level&&data.level>=5)add('卡牌升至最高階',`「${card.name}」達到 V 階。`);
 }
 return result.slice(0,3);
};
export default function GameFeedback(){
 const {state}=useGame();
 const previous=useRef(state);
 const [queue,setQueue]=useState<Notice[]>([]);
 const [pickups,setPickups]=useState<PickupVisual[]>([]);
 const pickup=pickups[0];
 const notice=queue[0];
 useEffect(()=>{
  if(previous.current===state)return;
  const old=previous.current;
  previous.current=state;
  const notable=majorStateChanges(old,state);
  if(state.log.length>old.log.length&&old.mode==='adventure'){
    const line=state.log[state.log.length-1]??'';
    const chosen=getVisibleActions(old).find(c=>line.startsWith(c.title));
    if(chosen)playCue(chosen.attackCardId&&state.enemy.health>=old.enemy.health?'warning':getActionSoundCue(chosen));
  }
  if(state.player.stamina<old.player.stamina&&old.player.stamina-state.player.stamina>=8)playCue('breath');
  if(state.player.health<old.player.health)playCue('injury');
  // Discard any queued notices when the persistent mission result takes over.
  if(state.mode==='result'){setQueue([]);setPickups([]);return;}
  if(notable.length)setQueue(q=>[...q,...notable].slice(0,5));
  // A committed loot event plays exactly once: global time ticks do not replay it.
  const found=state.mode==='adventure'&&state.log.length>old.log.length?state.lastLoot:null;
  let pickupItem=found?.itemId,quantity=found?.quantity??1;
  if(!pickupItem&&state.economy.marketPurchases>old.economy.marketPurchases){
   const bought=Object.entries(state.bag).find(([id,count])=>(count-(old.bag[id]??0))>0&&ITEMS[id]);
   if(bought){pickupItem=bought[0];quantity=bought[1]-(old.bag[bought[0]]??0);}
  }
  if(!pickupItem&&state.lastEvent?.startsWith('我從倉庫領出了')){
   const gained=Object.entries(state.bag).find(([id,count])=>count>(old.bag[id]??0)&&ITEMS[id]);
   if(gained){pickupItem=gained[0];quantity=gained[1]-(old.bag[gained[0]]??0);}
  }
  const item=pickupItem?ITEMS[pickupItem]:undefined;
  if(item&&quantity>0)setPickups(q=>[...q,{id:++nextPickupId,itemId:item.id,name:item.name,quantity}].slice(0,8));
  // Currency is awarded to the wallet, not invented as a backpack item.
  const coinsFound=state.economy.coins-old.economy.coins;
  if(state.mode==='adventure'&&coinsFound>0&&state.lastEvent?.startsWith('我從現場找到'))
    setPickups(q=>[...q,{id:++nextPickupId,emoji:'🪙',name:'舊幣',quantity:coinsFound}].slice(0,8));
 },[state]);
 useEffect(()=>{
  if(!notice)return;
  playCue(notice.kind==='danger'?'warning':'reward');
  const timer=window.setTimeout(()=>setQueue(q=>q.filter(n=>n.id!==notice.id)),notice.kind==='danger'?4600:2700);
  return()=>window.clearTimeout(timer);
 },[notice]);
 useEffect(()=>{
  if(!pickup)return;
  playCue('loot');
  const timer=window.setTimeout(()=>setPickups(q=>q.filter(item=>item.id!==pickup.id)),1920);
  return()=>window.clearTimeout(timer);
 },[pickup]);
 if(!notice&&!pickup)return null;
 const Icon=notice?.kind==='danger'?HeartCrack:Sparkles;
 const healthNumbers=notice?.title==='嚴重受傷'?notice.detail.match(/^生命 (\\d+) → (\\d+)$/):null;
 return <>
  {pickup&&<PickupFly key={pickup.id} pickup={pickup}/>}
  {notice&&<div className="critical-notice-layer" aria-live="assertive">
   <section key={notice.id} className={`critical-notice critical-notice--${notice.kind}`} role="alertdialog" aria-modal="true" aria-label={notice.title}>
    <header className="critical-notice__header">
     <span className="critical-notice__symbol"><Icon size={29} className="critical-notice__icon"/></span>
     <div><small>{notice.kind==='danger'?'TRAUMA / CRITICAL CONDITION':'EVENT / NOTIFICATION'}</small><h2>{notice.title}</h2></div>
     {notice.kind==='danger'&&<AlertTriangle size={18} className="critical-notice__danger"/>}
    </header>
    {healthNumbers?<div className="critical-notice__readout">
     <span>生命狀態 / HP</span>
     <div className="critical-notice__numbers"><strong>{healthNumbers[1]}</strong><span>→</span><strong className="critical-notice__number--after">{healthNumbers[2]}</strong></div>
     <svg className="critical-notice__pulse" viewBox="0 0 320 44" preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round"
       points="0,23 55,23 70,18 85,30 99,6 117,40 132,23 183,23 201,16 216,29 231,23 320,23"/>
     </svg>
    </div>:<p className="critical-notice__detail">{notice.detail}</p>}
    {healthNumbers&&<p className="critical-notice__detail">傷勢已影響生存狀態，請評估撤退與治療。</p>}
    <button type="button" className="critical-notice__dismiss" aria-label="關閉重大事件提示" onClick={()=>setQueue(q=>q.slice(1))}><X size={16}/>關閉提示</button>
   </section>
 </div>}
 </>;
}
