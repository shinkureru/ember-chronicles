import {useEffect,useState} from 'react';
import {ENEMY_TAUNTS,ENEMY_TAUNT_INTERVAL_MS,ENEMY_TAUNT_DURATION_MS} from '../../game/data/enemyTaunts';

/** Single autonomous line in the scene while NPC is visible and has not been attacked. */
export default function EnemyTaunt({active,enemyName,stageId}:{active:boolean;enemyName:string;stageId:number}){
 const [line,setLine]=useState<string|null>(null);
 useEffect(()=>{
  setLine(null);
  if(!active)return;
  let previous=-1;
  let timeout:ReturnType<typeof setTimeout>|undefined;
  const choose=()=>{
   const count=ENEMY_TAUNTS.length;
   const raw=Math.floor(Math.random()*(count-1));
   const index=previous<0?Math.floor(Math.random()*count):raw>=previous?raw+1:raw;
   previous=index;
   setLine(ENEMY_TAUNTS[index]!);
   timeout=setTimeout(()=>setLine(null),ENEMY_TAUNT_DURATION_MS);
  };
  const start=setTimeout(choose,2500);
  const interval=setInterval(choose,ENEMY_TAUNT_INTERVAL_MS);
  return()=>{clearTimeout(start);clearInterval(interval);if(timeout)clearTimeout(timeout);};
 },[active,stageId]);
 if(!active||!line)return null;
 return <div className="enemy-taunt-bubble" role="status" aria-label={enemyName+'：'+line}>
  <small>{enemyName}</small><span>「{line}」</span>
 </div>;
}
