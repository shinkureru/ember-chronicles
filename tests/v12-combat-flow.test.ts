import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {gameReducer} from '../src/game/engine/resolve';
import {makeInitialState} from '../src/game/state/initial';
import {getAttackDamage} from '../src/game/data/attacks';
import {TRANSITION_DURATION} from '../src/features/chapter/MissionTransition';
import EnemyPresence from '../src/features/chapter/EnemyPresence';
import SurvivorFigure from '../src/components/SurvivorFigure';
import MarketPortrait from '../src/features/market/MarketPortrait';

describe('v1.2 — enemy has a distinct offensive turn',()=>{
 const prepare=()=>{
  let s=makeInitialState('journalist');
  s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  s.sceneId='confrontation';s.rngSeed=0;
  return s;
 };
 it('throws an actual item after a nonlethal player attack',()=>{
  const s=prepare(),after=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
  expect(after.sceneId).toBe('confrontation');
  expect(after.enemy.health).toBe(s.enemy.health-getAttackDamage(s,'pen_thrust'));
  expect(after.enemyStrike).not.toBeNull();
  expect(['radio','flashlight','keyring']).toContain(after.enemyStrike?.itemId);
  expect(after.enemyStrike?.id).toBeGreaterThan(0);
  expect(after.player.health).toBeLessThanOrEqual(s.player.health);
  expect(after.bag.pen).toBe(s.bag.pen);
 });
 it('enemy never retaliates after lethal damage and loot remains unlocked',()=>{
  const s=prepare();
  s.enemy.health=getAttackDamage(s,'pen_thrust');
  const after=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
  expect(after.enemy.health).toBe(0);
  expect(after.sceneId).toBe('loot');
  expect(after.enemyStrike).toBeNull();
  expect(after.flags).toContain('won_by_combat');
 });
 it('the guard cannot throw persistent items already taken by the player',()=>{
  const s=prepare();s.npc.stolenGear=['radio','flashlight'];
  const after=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
  expect(after.enemyStrike?.itemId).toBe('keyring');
 });
 it('can finish and return home without losing loot or progress',()=>{
  let s=prepare();s.sceneId='loot';s.bag.keyring=2;
  s=gameReducer(s,{type:'CHOOSE',choiceId:'loot_exit',skillId:null});
  expect(s.mode).toBe('result');expect(s.chapterProgress.unlocked).toBeGreaterThan(1);
  const before=(s.bag.keyring??0)+(s.warehouse.keyring??0);
  s=gameReducer(s,{type:'RETURN_HUB'});
  expect(s.mode).toBe('home');expect(s.chapterProgress.unlocked).toBeGreaterThan(1);
  expect((s.bag.keyring??0)+(s.warehouse.keyring??0)).toBe(before);
 });
});
describe('v1.2 — visual contracts',()=>{
 it('renders a fallen guard on zero HP',()=>{
  const html=renderToStaticMarkup(createElement(EnemyPresence,{health:0,maxHealth:28,name:'阿忠'}));
  expect(html).toContain('enemy-presence__model--fallen');
 });
 it('keeps one player avatar component for front and exchange profile',()=>{
  const equipment={head:'cap',body:'vest',hands:null,mainHand:'wrench',utility:null,accessory:null};
  const front=renderToStaticMarkup(createElement(SurvivorFigure,{equipment}));
  const side=renderToStaticMarkup(createElement(SurvivorFigure,{equipment,view:'profile'}));
  expect(front).toContain('主角全身裝備輪廓示意');
  expect(side).toContain('與人物檔案同步裝備');
  expect(front).not.toBe(side);
  expect(side).toContain('profile-coat');
 });
 it('merchant profile has five character-specific variants',()=>{
  const profiles=Array.from({length:5},(_,face)=>renderToStaticMarkup(createElement(MarketPortrait,{face,name:'商人',profile:true})));
  expect(new Set(profiles).size).toBe(5);
 });
 it('gives mission and outcome transitions enough reading time',()=>{
  expect(TRANSITION_DURATION.entry).toBeGreaterThanOrEqual(2000);
  expect(TRANSITION_DURATION.enemy).toBeGreaterThan(TRANSITION_DURATION.entry);
  expect(TRANSITION_DURATION.victory).toBeGreaterThanOrEqual(3200);
 });
});
