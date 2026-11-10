import { useEffect, useRef } from 'react';
import EnemyPresence from './EnemyPresence';
export type MissionTransitionKind='entry'|'enemy'|'victory'|'defeat'|'retreat';
export const TRANSITION_DURATION:Record<MissionTransitionKind,number>={entry:2500,enemy:3400,victory:3800,defeat:3600,retreat:3000};
export default function MissionTransition({
 kind,enemyName,onFinish,summary
}:{
 kind:MissionTransitionKind;enemyName:string;onFinish:()=>void;summary?:string|null;
}){
 const finishRef=useRef(onFinish);
 useEffect(()=>{finishRef.current=onFinish},[onFinish]);
 useEffect(()=>{
  const timer=window.setTimeout(()=>finishRef.current(),TRANSITION_DURATION[kind]);
  return()=>window.clearTimeout(timer);
 },[kind]);
 const completed=kind==='victory'||kind==='defeat'||kind==='retreat';
 return <div className={`mission-cinematic mission-cinematic--${kind} ${completed?'mission-cinematic--ending':''}`}
  role="status" aria-live="polite" aria-label={
   kind==='entry'?'進入任務':kind==='enemy'?enemyName+'出現':kind==='victory'?'任務完成':kind==='defeat'?'任務戰敗':'已撤退'}>
  <div className="mission-cinematic__grain" aria-hidden="true"/>
  {kind==='entry'?<div className="mission-cinematic__entry">
    <span>CHAPTER 01 / MISSION 01</span>
    <strong>失蹤的倉庫員工</strong>
    <p>南區 · 舊物流站</p>
    <i/>
    <small>「我還是來了……」</small>
   </div>:kind==='enemy'?<div className="mission-cinematic__enemy">
    <div className="mission-cinematic__enemy-background" aria-hidden="true">
     <EnemyPresence health={100} maxHealth={100} name={enemyName}/>
    </div>
    <div className="mission-cinematic__enemy-foreground">
     <span className="mission-cinematic__warning">ENCOUNTER / HOSTILE CONTACT</span>
     <span className="mission-cinematic__enemy-label">敵人現身</span>
     <strong>{enemyName}</strong>
     <p>「我守的東西，誰也別想從這裡帶出去。」</p>
     <small>座右銘：守住秘密，才能守住自己的命。</small>
    </div>
   </div>:<div className="mission-cinematic__ending">
    <span>{kind==='victory'?'MISSION CLEAR':kind==='defeat'?'MISSION FAILED':'MISSION WITHDRAWN'}</span>
    <strong>{kind==='victory'?'任務完成':kind==='defeat'?'這次我失敗了':'選擇撤退'}</strong>
    <i aria-hidden="true"/>
    <p>{summary??(kind==='victory'?'終於可以離開這裡了。':'我至少還記得這次發生的事。')}</p>
    <small>{kind==='victory'?'戰利品將自動整理至倉庫。':kind==='defeat'?'本次新線索已記錄，物品不會遺失。':'撤退代價與現有情報已保存。'}</small>
   </div>}
  <button type="button" className="mission-cinematic__skip" onClick={()=>finishRef.current()}>{completed?'立即返回地圖':'略過'} <span>›</span></button>
 </div>;
}
