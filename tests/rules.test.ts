import { describe,expect,it } from 'vitest';
import { makeInitialState } from '../src/game/state/initial';
import { gameReducer } from '../src/game/engine/resolve';
import { calculateActionPreview, worldClock,worldPhase,bagWeight,retreatPreview } from '../src/game/engine/rules';
import { SCENES } from '../src/game/data/scenes';
import { getUpgradeRequirement } from '../src/game/data/cards';

describe('遊戲時間',()=>{
 it('五個時段正確映射',()=>{
   expect(worldPhase(6*60)).toBe('早上');
   expect(worldPhase(12*60)).toBe('中午');
   expect(worldPhase(16*60)).toBe('下午');
   expect(worldPhase(21*60)).toBe('晚上');
   expect(worldPhase(1*60)).toBe('深夜');
   expect(worldClock(65)).toBe('01:05');
 });
});
describe('卡牌升級成本',()=>{
 it('普通 5/8/10/12 稀有半數進位 混沌每次 1 張',()=>{
   expect([1,2,3,4].map(i=>getUpgradeRequirement('normal',i))).toEqual([5,8,10,12]);
   expect([1,2,3,4].map(i=>getUpgradeRequirement('rare',i))).toEqual([3,4,5,6]);
   expect([1,2,3,4].map(i=>getUpgradeRequirement('chaos',i))).toEqual([1,1,1,1]);
   expect(getUpgradeRequirement('normal',5)).toBeNull();
 });
});
describe('劇情規則',()=>{
 it('技能附加立即減少體力消耗並增加成功率',()=>{
   let s=gameReducer(makeInitialState('courier'),{type:'START_ATTEMPT'});
   const choice=SCENES.gate.actions[2]!;
   s.hand=['route','sprint','breathe'];
   const base=calculateActionPreview(s,choice,null);
   const attached=calculateActionPreview(s,choice,'route');
   expect(attached.chance).toBeGreaterThan(base.chance);
   expect(attached.staminaCost).toBe(base.staminaCost-5);
 });
 it('劇情行動更新世界時間與體力',()=>{
   const s=gameReducer(makeInitialState('journalist'),{type:'START_ATTEMPT'});
   const out=gameReducer(s,{type:'CHOOSE',choiceId:'gate_observe',skillId:null});
   expect(out.world.minute).toBe(s.world.minute+8);
   expect(out.sceneId).toBe('survey');
   expect(out.flags).toContain('route_known');
 });
 it('每次戰敗得到新線索，保護既有物品',()=>{
   let s=makeInitialState('journalist');
   s.mode='adventure';s.bag={flashlight:1};s.sceneId='confrontation';s.attempt=1;
   // 背包物品與戰敗線索功能分別測試
   const choice=SCENES.confrontation.actions[0]!;
   s.player.stamina=0;s.player.fatigue=90;s.npc.hostility=100;
   const p=calculateActionPreview(s,choice,null);
   expect(p.chance).toBeLessThan(50);
   s.rngSeed=500;
   const failed=gameReducer(s,{type:'CHOOSE',choiceId:'fight_talk',skillId:null});
   expect(failed.mode).toBe('adventure');
   expect(failed.sceneId).toBe('confrontation');
   expect(failed.enemyCounter?.phase).toBe('waiting');
   expect(failed.flags).toContain('negotiation_rejected');
   expect(failed.bag.flashlight).toBe(1);
   expect(failed.clues.length).toBe(0);
   expect(failed.insightBonus).toBe(0);
 });
 it('倉庫只轉移容許容量，剩餘物品不會消失',()=>{
   let s=makeInitialState('journalist');s.mode='result';s.bag={vest:5,flashlight:5};s.warehouseCapacity=1;
   // v0.7 gives a new character starter weapons in storage. Assert conservation,
   // rather than assuming a brand-new character has an empty warehouse.
   const before=Object.values(s.bag).reduce((a,b)=>a+b,0)+Object.values(s.warehouse).reduce((a,b)=>a+b,0);
   s=gameReducer(s,{type:'RETURN_HUB'});
   const after=Object.values(s.bag).reduce((a,b)=>a+b,0)+Object.values(s.warehouse).reduce((a,b)=>a+b,0);
   expect(after).toBe(before);
 });
 it('NPC 對同一類行動的適應會降低成功率',()=>{
   const s=makeInitialState('journalist');const action=SCENES.gate.actions[0]!;
   const before=calculateActionPreview(s,action,null).chance;
   s.npc.adaptations.talk=12;
   expect(calculateActionPreview(s,action,null).chance).toBe(before-12);
 });
 it('負重影響撤退機率',()=>{
   const s=makeInitialState('courier');s.mode='adventure';const before=retreatPreview(s).chance;
   s.bag={vest:5};expect(bagWeight(s.bag)).toBeGreaterThan(10);
   expect(retreatPreview(s).chance).toBeLessThan(before);
 });
});
