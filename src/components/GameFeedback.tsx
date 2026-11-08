import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, HeartCrack, PackagePlus, Sparkles, X } from 'lucide-react';
import { useGame } from '../app/GameContext';
import { playCue } from '../audio/sound';
import { ITEMS } from '../game/data/items';
import { CARDS } from '../game/data/cards';
import { getVisibleActions } from '../game/engine/rules';
import type { GameState } from '../game/types';
type Notice={id:number;title:string;detail:string;kind:'normal'|'loot'|'danger'|'major'};
let nextId=0;
/** The gameplay state is the only source of truth. Notices reflect committed changes, not predicted ones. */
function changes(previous:GameState,current:GameState):Notice[]{
 const result:Notice[]=[];
 const add=(title:string,detail:string,kind:Notice['kind']='normal')=>result.push({id:++nextId,title,detail,kind});
 if(previous.mode!==current.mode&&current.mode==='result')add(current.outcome==='victory'?'任務完成':current.outcome==='defeat'?'嚴重事件：戰敗':'已撤退',current.lastEvent??'事件已結束。',current.outcome==='defeat'?'danger':'major');
 if(previous.enemy&&current.enemy&&previous.enemy.health>current.enemy.health)add('攻擊命中',`對方生命 ${previous.enemy.health} → ${current.enemy.health}（-${previous.enemy.health-current.enemy.health}）`,'normal');
 if(previous.player.health>current.player.health)add('受傷',`生命 ${previous.player.health} → ${current.player.health}`,'danger');
 if(previous.player.stamina>current.player.stamina&&previous.mode==='adventure'){
   const difference=previous.player.stamina-current.player.stamina;
   if(difference>=8)add('體力消耗',`體力 -${difference}，目前剩餘 ${current.player.stamina}`,'normal');
 }
 if(previous.player.courage>=40&&current.player.courage<40)add('膽量低於臨界值','進入畏縮狀態；休息或完成勇氣事件可恢復。','danger');
 for(const [id,count] of Object.entries(current.bag)){
  const diff=count-(previous.bag[id]??0);
  if(diff>0)add('獲得物資',`「${ITEMS[id]?.name??id}」 × ${diff}`,'loot');
 }
 for(const [id,data] of Object.entries(current.ownedCards)){
  const old=previous.ownedCards[id];
  if(data.copies>(old?.copies??0))add('獲得卡牌',`「${CARDS[id]?.name??id}」複本 +${data.copies-(old?.copies??0)}`,'loot');
  if(data.level>(old?.level??1))add('卡牌升級',`「${CARDS[id]?.name??id}」升至 ${['','I','II','III','IV','V'][data.level]} 階`,'major');
 }
 if(current.clues.length>previous.clues.length)add('獲得新情報',current.clues[current.clues.length-1]??'已掌握新的線索。','major');
 if(current.chapterProgress.unlocked>previous.chapterProgress.unlocked)add('章節進度更新',`第 ${current.chapterProgress.unlocked} 關已解鎖。`,'major');
 if(current.lastEvent&&current.lastEvent!==previous.lastEvent && !result.some(r=>r.detail===current.lastEvent))add('事件紀錄',current.lastEvent,'normal');
 if(current.log.length>previous.log.length && result.length===0)add('行動結算',current.log[current.log.length-1]??'這次行動已經結束。','normal');
 return result;
}
export default function GameFeedback(){
 const {state}=useGame();const previous=useRef(state);
 const [queue,setQueue]=useState<Notice[]>([]);
 const notice=queue[0];
 useEffect(()=>{
  if(previous.current===state)return;
  const oldState=previous.current;
  const notices=changes(oldState,state);previous.current=state;
  if(state.log.length>oldState.log.length&&oldState.mode==='adventure'){
    const last=state.log[state.log.length-1]??'';
    const selected=getVisibleActions(oldState).find(c=>last.startsWith(c.title));
    if(selected?.tags.includes('fight'))playCue('impact');
    else if(selected?.tags.includes('run'))playCue('footsteps');
    else if(selected?.tags.includes('search'))playCue('loot');
  }
  if(state.player.stamina<oldState.player.stamina)playCue('breath');
  if(state.player.health<oldState.player.health)playCue('injury');
  if(notices.length)setQueue(old=>[...old,...notices].slice(0,18));
 },[state]);
 useEffect(()=>{
  if(!notice)return;
  playCue(notice.kind==='danger'?'injury':notice.kind==='major'?'reward':notice.kind==='loot'?'loot':'open');
  if(notice.kind==='danger'||notice.kind==='major')return;
  const timer=window.setTimeout(()=>setQueue(q=>q.filter(i=>i.id!==notice.id)),2100);
  return()=>window.clearTimeout(timer);
 },[notice]);
 if(!notice)return null;
 const major=notice.kind==='danger'||notice.kind==='major';
 const Icon=notice.kind==='danger'?HeartCrack:notice.kind==='major'?Sparkles:notice.kind==='loot'?PackagePlus:CheckCircle2;
 return <div className={`game-feedback-layer ${major?'game-feedback-layer--modal':''}`} aria-live={major?'assertive':'polite'}>
   <div className={`game-feedback game-feedback--${notice.kind}`} role={major?'alertdialog':'status'} aria-modal={major} aria-label={notice.title}>
     <div className="game-feedback__icon"><Icon size={25}/></div><div className="game-feedback__content"><strong>{notice.title}</strong><p>{notice.detail}</p></div>
     {major?<button className="game-feedback__dismiss" onClick={()=>setQueue(q=>q.slice(1))}>我知道了</button>:<button className="game-feedback__close" onClick={()=>setQueue(q=>q.slice(1))} aria-label="關閉提示"><X size={16}/></button>}
     {notice.kind==='danger'&&<AlertTriangle size={22} className="game-feedback__warning"/>}
   </div>
 </div>;
}
