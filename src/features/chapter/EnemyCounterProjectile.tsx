import { useEffect, useState } from 'react';
import { playCue } from '../../audio/sound';
import ActionObjectArt from './ActionObjectArt';
import { ITEMS } from '../../game/data/items';
import type { GameState } from '../../game/types';

/** A new attack id spawns one visual throw toward the player's camera.
 * The reducer has already resolved hit/miss and armor mitigation; animation never rolls RNG. */
export default function EnemyCounterProjectile({strike}:{strike:NonNullable<GameState['enemyStrike']>}){
 const [show,setShow]=useState(true);
 useEffect(()=>{
  setShow(true);
  playCue('warning');
  const hit=window.setTimeout(()=>playCue(strike.hit?'impact':'sneakStep'),470);
  const close=window.setTimeout(()=>setShow(false),1120);
  return()=>{window.clearTimeout(hit);window.clearTimeout(close)};
 },[strike.id,strike.hit]);
 if(!show)return null;
 return <div key={strike.id} className={`enemy-counter ${strike.hit?'enemy-counter--hit':'enemy-counter--miss'}`}
  role="status" aria-live="polite" aria-label={`敵人丟出${ITEMS[strike.itemId]?.name??'物品'}，${strike.hit?`造成 ${strike.damage} 點傷害`:'沒有擊中'}`}>
  <div className="enemy-counter__speedlines" aria-hidden="true"/>
  <div className="enemy-counter__object"><ActionObjectArt kind={strike.itemId} className="enemy-counter__svg"/></div>
  <div className="enemy-counter__impact" aria-hidden="true"/>
  <span className="enemy-counter__text">{strike.hit?`遭受攻擊 −${strike.damage}`:'閃避成功'}</span>
 </div>;
}
