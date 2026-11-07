import { makeInitialState } from './initial';
import { STARTER_ATTACK_CARDS, makeInitialEnemy } from '../data/attacks';
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
    const attackDeck=Array.isArray(old.attackDeck)?old.attackDeck:[];
    const ownedCards={...old.ownedCards};
    // One-time migration: existing v0.6 saves retain achievements, gain starter attack cards.
    if(!Array.isArray(old.attackDeck)&&old.profession){
      for(const id of STARTER_ATTACK_CARDS[old.profession])if(!ownedCards[id])ownedCards[id]={copies:0,level:1};
    }
    const warehouse={...old.warehouse};
    if(!Array.isArray(old.attackDeck)){
      const starter=old.profession==='courier'?{wrench:1,screwdriver:1}:{pen:1,notebook:1};
      for(const [id,count] of Object.entries(starter))if(!((old.bag[id]??0)>0)&&!((warehouse[id]??0)>0))warehouse[id]=count;
    }
    return { ...old, attackDeck,enemy:old.enemy??makeInitialEnemy(),ownedCards,warehouse,
      chapterProgress: old.chapterProgress ?? { completed: old.npc?.remembers?.includes('player_victory')?[1]:[], unlocked:old.npc?.remembers?.includes('player_victory')?2:1 },
      economy: old.economy ?? {coins:120,blackMarketFavor:0,marketPurchases:0},
      equipment: old.equipment ?? {head:null,body:null,hands:null,mainHand:null,utility:null,accessory:null},
    };
  }catch{return makeInitialState();}
};
export const saveGame=(s:GameState):boolean=>{
  try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}
};
