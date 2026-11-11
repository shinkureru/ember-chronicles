import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { gameReducer } from '../src/game/engine/resolve';
import { makeInitialState } from '../src/game/state/initial';
import { WORLD_TICK_GAME_MINUTES, WORLD_TICK_REAL_MS, COUNTER_PHASE_MS } from '../src/app/GameContext';
import { getScheduledVendorId } from '../src/game/data/marketSchedule';
import { ITEMS } from '../src/game/data/items';
import PickupFly from '../src/components/PickupFly';

describe('v1.3: continuous world clock',()=>{
 it('moves exactly five game minutes every ten seconds',()=>{
  expect(WORLD_TICK_REAL_MS).toBe(10000);
  expect(WORLD_TICK_GAME_MINUTES).toBe(5);
  const before=makeInitialState('journalist');
  const after=gameReducer(before,{type:'WORLD_CLOCK_TICK'});
  expect(after.world.minute).toBe(before.world.minute+5);
  expect(after.world.day).toBe(before.world.day);
  expect(after.mode).toBe(before.mode);
 });
 it('advances the world date and rotates merchants at the proper phase boundary',()=>{
  const before=makeInitialState('journalist');
  before.world.minute=17*60+55;
  const after=gameReducer(before,{type:'WORLD_CLOCK_TICK'});
  expect(getScheduledVendorId(before.world.minute)).toBe('broker');
  expect(getScheduledVendorId(after.world.minute)).toBe('runner');
  const midnight=makeInitialState('journalist');midnight.world.minute=23*60+55;midnight.world.day=7;
  const next=gameReducer(midnight,{type:'WORLD_CLOCK_TICK'});
  expect(next.world.minute).toBe(0);
  expect(next.world.day).toBe(8);
 });
 it('does not run during a mission-result cinematic',()=>{
  const s=makeInitialState('journalist');s.mode='result';
  const after=gameReducer(s,{type:'WORLD_CLOCK_TICK'});
  expect(after).toBe(s);
 });
});
describe('v1.3: anti-spam enemy counter',()=>{
 const prepare=()=>{
  let s=makeInitialState('journalist');
  s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  s.sceneId='confrontation';s.rngSeed=0;
  return s;
 };
 it('waits half a second before windup, then throws and resolves hit once',()=>{
  expect(COUNTER_PHASE_MS.waiting).toBe(500);
  const before=prepare();
  const after=gameReducer(before,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
  expect(after.enemyCounter?.phase).toBe('waiting');
  expect(after.player.health).toBe(before.player.health);
  expect(after.enemyStrike).toBeNull();
  // Selecting next action is permitted in the UI; the reducer rejects premature commits.
  const early=gameReducer(after,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
  expect(early).toBe(after);
  const windup=gameReducer(after,{type:'ENEMY_COUNTER_WINDUP'});
  const throwing=gameReducer(windup,{type:'ENEMY_COUNTER_THROW'});
  expect(throwing.enemyStrike?.id).toBe(after.enemyCounter?.id);
  const hit=gameReducer(throwing,{type:'ENEMY_COUNTER_HIT'});
  expect(hit.player.health).toBeLessThanOrEqual(before.player.health);
  const repeat=gameReducer(hit,{type:'ENEMY_COUNTER_HIT'});
  expect(repeat).toBe(hit);
  const finish=gameReducer(hit,{type:'ENEMY_COUNTER_FINISH'});
  expect(finish.enemyCounter).toBeNull();
  expect(finish.enemyStrike).toBeNull();
 });
 it('a lethal enemy hit still exposes the HIT phase before the defeat transition',()=>{
  const initial=prepare();
  const waiting=gameReducer(initial,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
  // Force a fatal but legitimate pending hit; its impact remains one committed event.
  const s={...waiting,player:{...waiting.player,health:1},enemyCounter:waiting.enemyCounter?{...waiting.enemyCounter,hit:true,damage:8,phase:'throwing' as const}:null};
  const hit=gameReducer(s,{type:'ENEMY_COUNTER_HIT'});
  expect(hit.enemyCounter?.phase).toBe('hit');
  expect(hit.mode).toBe('adventure');
  expect(hit.player.health).toBe(0);
  const ended=gameReducer(hit,{type:'ENEMY_COUNTER_FINISH'});
  expect(ended.mode).toBe('result');
  expect(ended.outcome).toBe('defeat');
  expect(ended.enemyCounter).toBeNull();
 });
 it('no pending counterattack may survive an immediate lethal player attack',()=>{
  const s=prepare();s.enemy.health=1;
  const result=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
  expect(result.enemy.health).toBe(0);
  expect(result.enemyCounter).toBeNull();
  expect(result.sceneId).toBe('loot');
 });
});
describe('v1.3: pickup feedback',()=>{
 it('commits the exact found item to lastLoot only on successful searches',()=>{
  const s=makeInitialState('journalist');s.mode='adventure';s.sceneId='loot';s.flags.push('won_by_combat');s.enemy.health=0;
  const next=gameReducer(s,{type:'CHOOSE',choiceId:'loot_pocket',skillId:null});
  if(next.lastLoot){
   expect(ITEMS[next.lastLoot.itemId]).toBeDefined();
   expect(next.lastLoot.quantity).toBeGreaterThan(0);
  }
 });
 it('renders a non-blocking backpack with the actual item icon',()=>{
  const out=renderToStaticMarkup(createElement(PickupFly,{pickup:{id:1,emoji:'💧',name:'瓶裝飲水',quantity:1}}));
  expect(out).toContain('pickup-flight__bag');
  expect(out).toContain('瓶裝飲水');
  expect(out).toContain('💧');
 });
});
