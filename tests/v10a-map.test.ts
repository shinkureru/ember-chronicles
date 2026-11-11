import {describe,expect,it} from 'vitest';
import {CHAPTER_ONE} from '../src/game/data/maps/ch01';
import {makeInitialState} from '../src/game/state/initial';
describe('v1.0-a cinematic map contract',()=>{
 it('keeps all twelve chapter nodes and the same original map geometry',()=>{
  expect(CHAPTER_ONE.stages).toHaveLength(12);
  expect(CHAPTER_ONE.stages.map(s=>s.sequence)).toEqual(Array.from({length:12},(_,i)=>i+1));
  expect(CHAPTER_ONE.stages.every(s=>s.x>=0&&s.x<=1540&&s.y>=0&&s.y<=430)).toBe(true);
 });
 it('unlocks the first mission only and exposes two authored playable missions',()=>{
  const state=makeInitialState('journalist');
  expect(state.chapterProgress.unlocked).toBe(1);
  expect(CHAPTER_ONE.stages.filter(n=>n.implementation==='playable').map(n=>n.sequence)).toEqual([1,2]);
 });
});