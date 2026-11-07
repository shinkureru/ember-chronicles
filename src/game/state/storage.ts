import { makeInitialState } from './initial';
import type { GameState } from '../types';
const KEY='ember-chronicles-prototype-v1';
export const loadGame=():GameState=>{
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return makeInitialState();
    const parsed:unknown=JSON.parse(raw);
    if(!parsed||typeof parsed!=='object')return makeInitialState();
    const state=parsed as Partial<GameState>;
    if(state.version!==1||!state.player||!state.world||!state.npc||!state.bag||!state.warehouse||!state.ownedCards)return makeInitialState();
    const old=state as GameState;
    return { ...old,
      chapterProgress: old.chapterProgress ?? { completed: old.npc?.remembers?.includes('player_victory')?[1]:[], unlocked:old.npc?.remembers?.includes('player_victory')?2:1 },
      economy: old.economy ?? {coins:120,blackMarketFavor:0,marketPurchases:0},
      equipment: old.equipment ?? {head:null,body:null,hands:null,mainHand:null,utility:null,accessory:null},
    };
  }catch{return makeInitialState();}
};
export const saveGame=(s:GameState):boolean=>{
  try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}
};
