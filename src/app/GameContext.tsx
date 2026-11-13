import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type Dispatch, type PropsWithChildren } from 'react';
import { gameReducer, type GameAction } from '../game/engine/resolve';
import { loadGame, saveGame } from '../game/state/storage';
import type { GameState } from '../game/types';
import { DAMAGE_FEEDBACK_MS } from '../features/chapter/combatFeedbackTiming';
import {REALTIME_CLOCK_REFRESH_MS} from '../game/engine/taipeiClock';

// Real wall-clock refresh, without game-time acceleration.
/** Central phase timing. The reducer is the single source of truth; timers never roll damage. */
export const COUNTER_PHASE_MS={
 waiting:500, windup:650, throwing:480, hit:650
} as const;
type PauseReason='route'|'dialog';
interface GameContextValue {
 state:GameState;
 dispatch:Dispatch<GameAction>;
 pauseClock:(reason:PauseReason,paused:boolean)=>void;
}
const GameContext=createContext<GameContextValue|null>(null);
export const GameProvider=({children}:PropsWithChildren)=>{
 const [state,rawDispatch]=useReducer(gameReducer,undefined,loadGame);
 // Sync before user actions even if a click happens at the exact daily boundary.
 const dispatch=useCallback<Dispatch<GameAction>>((action)=>{
  if(action.type!=='WORLD_CLOCK_SYNC')rawDispatch({type:'WORLD_CLOCK_SYNC'});
  rawDispatch(action);
 },[]);
 // Dialogs cannot pause civil time. Keep the old API for unaffected components.
 const pauseClock=useCallback((_reason:PauseReason,_paused:boolean)=>{},[]);
 useEffect(()=>{saveGame(state)},[state]);
 useEffect(()=>{
  const refresh=()=>rawDispatch({type:'WORLD_CLOCK_SYNC'});
  refresh();
  const timer=window.setInterval(()=>{
   if(document.visibilityState==='visible')refresh();
  },REALTIME_CLOCK_REFRESH_MS);
  const onVisibility=()=>{if(document.visibilityState==='visible')refresh()};
  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('focus',refresh);
  return()=>{
   window.clearInterval(timer);
   document.removeEventListener('visibilitychange',onVisibility);
   window.removeEventListener('focus',refresh);
  };
 },[]);
 useEffect(()=>{
  if(state.mode!=='adventure'||!state.enemyCounter)return;
  const phase=state.enemyCounter.phase;
  const action:GameAction=phase==='waiting'?{type:'ENEMY_COUNTER_WINDUP'}:
   phase==='windup'?{type:'ENEMY_COUNTER_THROW'}:
   phase==='throwing'?{type:'ENEMY_COUNTER_HIT'}:{type:'ENEMY_COUNTER_FINISH'};
  // A fatal blow must finish showing the exact HP loss before the defeat cutscene.
  const hold=phase==='hit'&&state.player.health<=0?DAMAGE_FEEDBACK_MS.lethalHitPause:COUNTER_PHASE_MS[phase];
  const timer=window.setTimeout(()=>dispatch(action),hold);
  return()=>window.clearTimeout(timer);
 },[state.mode,state.enemyCounter?.id,state.enemyCounter?.phase]);
 const value=useMemo(()=>({state,dispatch,pauseClock}),[state,pauseClock]);
 return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
export const useGame=()=>{
 const ctx=useContext(GameContext);
 if(!ctx)throw new Error('useGame must be used within GameProvider');
 return ctx;
};
