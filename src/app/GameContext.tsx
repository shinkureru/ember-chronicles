import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type PropsWithChildren } from 'react';
import { gameReducer, type GameAction } from '../game/engine/resolve';
import { loadGame, saveGame } from '../game/state/storage';
import type { GameState } from '../game/types';

export const WORLD_TICK_REAL_MS=10000;
export const WORLD_TICK_GAME_MINUTES=5;
/** Central phase timing. The reducer is the single source of truth; timers never roll damage. */
export const COUNTER_PHASE_MS={
 waiting:2000, windup:650, throwing:480, hit:650
} as const;
type PauseReason='route'|'dialog';
interface GameContextValue {
 state:GameState;
 dispatch:Dispatch<GameAction>;
 pauseClock:(reason:PauseReason,paused:boolean)=>void;
}
const GameContext=createContext<GameContextValue|null>(null);
export const GameProvider=({children}:PropsWithChildren)=>{
 const [state,dispatch]=useReducer(gameReducer,undefined,loadGame);
 const [pauseReasons,setPauseReasons]=useState<Record<PauseReason,boolean>>({route:false,dialog:false});
 const pauseClock=useCallback((reason:PauseReason,paused:boolean)=>{
  setPauseReasons(old=>old[reason]===paused?old:{...old,[reason]:paused});
 },[]);
 useEffect(()=>{saveGame(state)},[state]);
 useEffect(()=>{
  if(pauseReasons.route||pauseReasons.dialog||state.mode==='result')return;
  // Background tabs do not accumulate an unexpected pile of catch-up time.
  const timer=window.setInterval(()=>{
   if(document.visibilityState==='visible')dispatch({type:'WORLD_CLOCK_TICK',minutes:WORLD_TICK_GAME_MINUTES});
  },WORLD_TICK_REAL_MS);
  return()=>window.clearInterval(timer);
 },[pauseReasons.route,pauseReasons.dialog,state.mode]);
 useEffect(()=>{
  if(state.mode!=='adventure'||!state.enemyCounter)return;
  const phase=state.enemyCounter.phase;
  const action:GameAction=phase==='waiting'?{type:'ENEMY_COUNTER_WINDUP'}:
   phase==='windup'?{type:'ENEMY_COUNTER_THROW'}:
   phase==='throwing'?{type:'ENEMY_COUNTER_HIT'}:{type:'ENEMY_COUNTER_FINISH'};
  const timer=window.setTimeout(()=>dispatch(action),COUNTER_PHASE_MS[phase]);
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
