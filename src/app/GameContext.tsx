import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type PropsWithChildren } from 'react';
import { gameReducer, type GameAction } from '../game/engine/resolve';
import { loadGame, saveGame } from '../game/state/storage';
import type { GameState } from '../game/types';
const GameContext=createContext<{state:GameState; dispatch:Dispatch<GameAction>}|null>(null);
export const GameProvider=({children}:PropsWithChildren)=>{
  const [state,dispatch]=useReducer(gameReducer,undefined,loadGame);
  useEffect(()=>{saveGame(state)},[state]);
  const value=useMemo(()=>({state,dispatch}),[state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
export const useGame=()=>{
  const ctx=useContext(GameContext);
  if(!ctx)throw new Error('useGame must be used within GameProvider');
  return ctx;
};
