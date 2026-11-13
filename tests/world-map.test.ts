import { describe,expect,it } from 'vitest';
import { CHAPTER_ONE } from '../src/game/data/maps/ch01';
import { EQUIPMENT_SLOTS } from '../src/game/data/equipment';
import { makeInitialState } from '../src/game/state/initial';
import { gameReducer } from '../src/game/engine/resolve';

describe('第一章地圖與關卡進度',()=>{
 it('有十二關，初始只能進第一關',()=>{
  expect(CHAPTER_ONE.stages).toHaveLength(12);
  expect(CHAPTER_ONE.stages.map(s=>s.sequence)).toEqual(Array.from({length:12},(_,i)=>i+1));
  const state=makeInitialState('journalist');
  expect(state.chapterProgress.unlocked).toBe(1);
 });
 it('第1關勝利後只解鎖第2關',()=>{
  let s=makeInitialState('courier');s.mode='adventure';s.sceneId='loot';s.attempt=1;
  const result=gameReducer(s,{type:'CHOOSE',choiceId:'loot_exit',skillId:null});
  expect(result.chapterProgress.unlocked).toBe(2);
  expect(result.chapterProgress.completed).toContain(1);
 });
});
describe('黑市與裝備',()=>{
 it('出售重複卡增加金錢與商人好感',()=>{
  const s=makeInitialState('journalist');s.world.minute=16*60;s.ownedCards.question!.copies=2;
  const result=gameReducer(s,{type:'MARKET_SELL',vendorId:'broker',cardId:'question'});
  expect(result.ownedCards.question!.copies).toBe(1);
  expect(result.economy.coins).toBe(138);
  expect(result.economy.blackMarketFavor).toBe(2);
 });
 it('買不到超過持有金錢的卡牌',()=>{
  const s=makeInitialState('journalist');
  expect(gameReducer(s,{type:'MARKET_BUY',vendorId:'broker',cardId:'question'})).toBe(s);
 });
 it('七個裝備欄位有效，卸下裝備不會丟掉物品',()=>{
  const s=makeInitialState('journalist');s.bag.vest=1;
  const equipped=gameReducer(s,{type:'EQUIP_ITEM',slot:'body',itemId:'vest'});
  expect(EQUIPMENT_SLOTS).toHaveLength(7);
  expect(equipped.equipment.body).toBe('vest');
  const unequipped=gameReducer(equipped,{type:'UNEQUIP_ITEM',slot:'body'});
  expect(unequipped.equipment.body).toBeNull();
  expect(unequipped.bag.vest).toBe(1);
 });
});
