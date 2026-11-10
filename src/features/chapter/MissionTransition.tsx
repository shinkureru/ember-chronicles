import { useEffect } from 'react';
import EnemyPresence from './EnemyPresence';
export type MissionTransitionKind='entry'|'enemy';
const DURATION:Record<MissionTransitionKind,number>={entry:1450,enemy:2900};
/** Full-viewport cinematic interruption with different pacing for travel and enemy reveal. */
export default function MissionTransition({kind,enemyName,onFinish}:{kind:MissionTransitionKind;enemyName:string;onFinish:()=>void}){
 useEffect(()=>{
  const timer=window.setTimeout(onFinish,DURATION[kind]);
  return()=>window.clearTimeout(timer);
 },[kind,onFinish]);
 return <div className={`mission-cinematic mission-cinematic--${kind}`} role="status" aria-live="polite"
  aria-label={kind==='entry'?'進入關卡':enemyName+'出現'}>
  <div className="mission-cinematic__grain" aria-hidden="true"/>
  {kind==='entry'?<div className="mission-cinematic__entry">
    <span>CHAPTER 01 / MISSION 01</span>
    <strong>失蹤的倉庫員工</strong>
    <p>南區 · 舊物流站</p>
    <i/>
    <small>「我還是來了……」</small>
   </div>:
   <div className="mission-cinematic__enemy">
    <span className="mission-cinematic__warning">ENCOUNTER / HOSTILE CONTACT</span>
    <div className="mission-cinematic__figure"><EnemyPresence health={100} maxHealth={100} name={enemyName}/></div>
    <span className="mission-cinematic__enemy-label">敵人現身</span>
    <strong>{enemyName}</strong>
    <p>「我守的東西，誰也別想從這裡帶出去。」</p>
    <small>座右銘：守住秘密，才能守住自己的命。</small>
   </div>}
  <button type="button" className="mission-cinematic__skip" onClick={onFinish}>略過 <span>›</span></button>
 </div>;
}
