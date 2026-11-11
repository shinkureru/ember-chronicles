import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ENEMY_TAUNTS,ENEMY_TAUNT_INTERVAL_MS} from '../src/game/data/enemyTaunts';
import {COUNTER_PHASE_MS} from '../src/app/GameContext';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import EnemyTaunt from '../src/features/chapter/EnemyTaunt';
import {previewInnRest} from '../src/game/engine/innRest';
import {getTownServiceLock} from '../src/game/engine/townActions';
describe('v1.7 visible battle/inn contract',()=>{
 it('begins enemy counter in 500 ms while keeping animation phases untouched',()=>{
  expect(COUNTER_PHASE_MS.waiting).toBe(500);
  expect(COUNTER_PHASE_MS.windup).toBe(650);
 });
 it('has 20 short nonduplicate taunts with a ten-second rhythm',()=>{
  expect(ENEMY_TAUNTS).toHaveLength(20);
  expect(new Set(ENEMY_TAUNTS).size).toBe(20);
  for(const text of ENEMY_TAUNTS){expect([...text].length).toBeGreaterThanOrEqual(5);expect([...text].length).toBeLessThanOrEqual(15);}
  expect(ENEMY_TAUNT_INTERVAL_MS).toBe(10000);
  expect(renderToStaticMarkup(createElement(EnemyTaunt,{active:false,enemyName:'阿忠',stageId:1}))).toBe('');
 });
 it('marks first committed weapon attack, stopping pre-combat taunts',()=>{
  let s=makeInitialState('journalist');
  s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  s.sceneId='confrontation';s.rngSeed=10;
  const next=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
  expect(next.flags).toContain('attacked_enemy');
 });
 it('permits rest while both HP and stamina are full',()=>{
  const s=makeInitialState('journalist');
  expect(s.player.health).toBe(s.player.maxHealth);expect(s.player.stamina).toBe(s.player.maxStamina);
  expect(getTownServiceLock(s,'rest_cot')).toBeNull();
  const preview=previewInnRest(s,'rest_cot');
  expect(preview.healthGain).toBe(0);expect(preview.staminaGain).toBe(0);
  const after=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(after.town?.restsToday).toBe(1);
  expect(after.economy.coins).toBe(s.economy.coins-15);
 });
});
