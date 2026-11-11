import {describe,expect,it} from 'vitest';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getVisibleActions,calculateActionPreview} from '../src/game/engine/rules';
import {maySearchSource,activeEnemyInsight} from '../src/game/engine/encounterAccess';
import {remainingSearches} from '../src/game/engine/lootLimits';

describe('v1.7.3 enemy loot requires an actual combat takedown',()=>{
 for(const stage of [1,2] as const){
  it(`blocks enemy personal loot in peaceful stage ${stage} and allows scene evidence`,()=>{
   const s=makeInitialState('journalist');
   s.stageId=stage;s.mode='adventure';s.sceneId='loot';
   s.flags.push(stage===1?'won_by_talk':'alley_witness_statement');
   const actions=getVisibleActions(s);
   expect(actions.some(x=>['pockets','npcGear','alley_pockets'].includes(x.lootSource??''))).toBe(false);
   expect(actions.some(x=>x.lootSource&&!['pockets','npcGear','alley_pockets'].includes(x.lootSource))).toBe(true);
   const target=stage===1?'loot_pockets':'alley_loot_pockets';
   expect(gameReducer(s,{type:'CHOOSE',choiceId:target,skillId:null})).toBe(s);
   expect(s.economy.coins).toBe(120);
   expect(remainingSearches(s,stage===1?'pockets':'alley_pockets')).toBe(0);
   s.flags.push('won_by_combat');s.enemy.health=0;
   expect(maySearchSource(s,stage===1?'pockets':'alley_pockets')).toBe(true);
   expect(getVisibleActions(s).some(x=>x.lootSource===(stage===1?'pockets':'alley_pockets'))).toBe(true);
  });
 }
 it('environment searches can yield a finite 2-5 old coins with correct currency transfer',()=>{
  let s=makeInitialState('journalist');s.mode='adventure';s.sceneId='loot';
  s.rngSeed=12345;const before=s.economy.coins;
  const result=gameReducer(s,{type:'CHOOSE',choiceId:'loot_desk',skillId:null});
  expect(result.economy.coins).toBeGreaterThanOrEqual(before+2);
  expect(result.economy.coins).toBeLessThanOrEqual(before+5);
  expect(result.lastEvent).toContain('舊幣');
  expect(result.lastLoot).toBeNull();
  expect(result.lootSearches.desk).toBe(1);
  expect(result.bag).toEqual(s.bag);
 });
 it('exhausted search sources never generate additional coins',()=>{
  const s=makeInitialState('journalist');s.mode='adventure';s.sceneId='loot';s.lootSearches.desk=3;s.rngSeed=12345;
  expect(getVisibleActions(s).some(x=>x.id==='loot_desk')).toBe(false);
  expect(gameReducer(s,{type:'CHOOSE',choiceId:'loot_desk',skillId:null})).toBe(s);
 });
});
describe('v1.7.3 per-enemy failure reflections and one-time chance bonus',()=>{
 it('tracks failures separately and never transfers the first-enemy bonus to the next',()=>{
  let s=makeInitialState('journalist');
  s.mode='adventure';s.attempt=1;s.stageId=1;
  s.player.health=1;s.enemyCounter={id:12,itemId:'radio',damage:6,hit:true,phase:'throwing'};
  s=gameReducer(s,{type:'ENEMY_COUNTER_HIT'});
  s=gameReducer(s,{type:'ENEMY_COUNTER_FINISH'});
  expect(s.mode).toBe('result');
  const old=s.insightByEnemy?.warehouse_guard??0;
  expect(old).toBeGreaterThan(0);
  const firstCount=s.npc.playerDefeats??0;
  s=gameReducer(s,{type:'RETURN_HUB'});
  s.chapterProgress.unlocked=2;
  s=gameReducer(s,{type:'SELECT_STAGE',stageId:2});
  s=gameReducer(s,{type:'START_ATTEMPT'});
  expect(activeEnemyInsight(s)).toBe(0);
  expect(s.insightByEnemy?.warehouse_guard).toBe(old);
  const base=structuredClone(s);
  base.insightByEnemy={};
  const choice=getVisibleActions(s).find(x=>x.baseChance<100)!;
  expect(calculateActionPreview(s,choice,null).chance).toBe(calculateActionPreview(base,choice,null).chance);
  s.player.health=1;s.sceneId='confrontation';
  s.enemyCounter={id:99,itemId:'wire_piece',damage:9,hit:true,phase:'throwing'};
  s=gameReducer(s,{type:'ENEMY_COUNTER_HIT'});s=gameReducer(s,{type:'ENEMY_COUNTER_FINISH'});
  expect(s.outcome).toBe('defeat');
  expect(s.alleyNpc?.playerDefeats).toBe(1);
  expect(s.npc.playerDefeats??0).toBe(firstCount);
  expect(s.lastEvent).toContain('第 1 次失敗反思');
  expect(s.insightByEnemy?.alley_watchman).toBe(6);
  expect(s.insightByEnemy?.warehouse_guard).toBe(old);
 });
 it('consumes only the current enemy bonus on the first genuine chance roll',()=>{
  let s=makeInitialState('journalist');s.mode='adventure';s.stageId=2;s.sceneId='gate';
  s.insightByEnemy={warehouse_guard:6,alley_watchman:6};
  s=gameReducer(s,{type:'CHOOSE',choiceId:'alley_gate_talk',skillId:null});
  expect(s.insightByEnemy?.alley_watchman).toBe(0);
  expect(s.insightByEnemy?.warehouse_guard).toBe(6);
 });
});
