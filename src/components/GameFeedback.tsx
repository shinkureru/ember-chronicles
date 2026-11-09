import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, HeartCrack, Sparkles, X } from 'lucide-react';
import { useGame } from '../app/GameContext';
import { playCue } from '../audio/sound';
import { CARDS } from '../game/data/cards';
import { ATTACK_CARDS } from '../game/data/attacks';
import { getVisibleActions } from '../game/engine/rules';
import type { GameState } from '../game/types';

type Notice={id:number;title:string;detail:string;kind:'danger'|'major'};
let nextId=0;
/** Only the truly consequential changes interrupt gameplay. Minor pickups and costs remain in the story log. */
export const majorStateChanges=(previous:GameState,current:GameState):Notice[]=>{
 const result:Notice[]=[];
 const add=(title:string,detail:string,kind:Notice['kind']='major')=>
  result.push({id:++nextId,title,detail,kind});
 if(previous.mode!==current.mode&&current.mode==='result')
  add(current.outcome==='victory'?'任務完成':current.outcome==='defeat'?'戰敗':'已撤退',
    current.lastEvent??'這次事件已經結束。',current.outcome==='defeat'?'danger':'major');
 const lost=previous.player.health-current.player.health;
 if(lost>=15||previous.player.health>20&&current.player.health<=20)
  add('嚴重受傷',`生命 ${previous.player.health} → ${current.player.health}`, 'danger');
 if(previous.player.courage>=40&&current.player.courage<40)
  add('膽量跌破臨界值','畏縮狀態已觸發；休息或完成勇氣事件可恢復。','danger');
 if(current.clues.length>previous.clues.length)
  add('關鍵情報',current.clues[current.clues.length-1]??'取得了新的線索。');
 if(current.chapterProgress.unlocked>previous.chapterProgress.unlocked)
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
 const notice=queue[0];
 useEffect(()=>{
  if(previous.current===state)return;
  const old=previous.current;
  previous.current=state;
  const notable=majorStateChanges(old,state);
  if(state.log.length>old.log.length&&old.mode==='adventure'){
    const line=state.log[state.log.length-1]??'';
    const chosen=getVisibleActions(old).find(c=>line.startsWith(c.title));
    if(chosen?.attackCardId)playCue(state.enemy.health<old.enemy.health?'impact':'warning');
    else if(chosen?.tags.includes('run'))playCue('footsteps');
    else if(chosen?.tags.includes('search'))playCue('loot');
  }
  if(state.player.stamina<old.player.stamina&&old.player.stamina-state.player.stamina>=8)playCue('breath');
  if(state.player.health<old.player.health)playCue('injury');
  if(notable.length)setQueue(q=>[...q,...notable].slice(0,5));
 },[state]);
 useEffect(()=>{
  if(!notice)return;
  playCue(notice.kind==='danger'?'warning':'reward');
  const timer=window.setTimeout(()=>setQueue(q=>q.filter(n=>n.id!==notice.id)),notice.kind==='danger'?3300:2700);
  return()=>window.clearTimeout(timer);
 },[notice]);
 if(!notice)return null;
 const Icon=notice.kind==='danger'?HeartCrack:Sparkles;
 return <div className="critical-notice-layer" aria-live="assertive">
   <section key={notice.id} className={`critical-notice critical-notice--${notice.kind}`} role="alertdialog" aria-modal="true" aria-label={notice.title}>
    <Icon size={29} className="critical-notice__icon"/>
    <strong>{notice.title}</strong><p>{notice.detail}</p>
    <button type="button" aria-label="關閉重大事件提示" onClick={()=>setQueue(q=>q.slice(1))}><X size={18}/>關閉</button>
    {notice.kind==='danger'&&<AlertTriangle size={15} className="critical-notice__danger"/>}
   </section>
 </div>;
}
