import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getVisibleActions} from '../src/game/engine/rules';
import {groupChoices} from '../src/features/chapter/choiceGroups';
import SceneArtwork from '../src/features/chapter/SceneArtwork';
import type {SceneId} from '../src/game/types';

describe('v1.1 semantic action choices',()=>{
 it('keeps exactly the same actions after grouping',()=>{
  for(const scene of ['gate','survey','inside','confrontation','loot'] as SceneId[]){
   const state=makeInitialState('journalist');state.mode='adventure';state.sceneId=scene;state.attempt=4;
   const actual=getVisibleActions(state);
   const groups=groupChoices(actual);
   expect(groups.flatMap(g=>g.actions).map(a=>a.id).sort()).toEqual(actual.map(a=>a.id).sort());
   expect(groups.every(g=>g.actions.length>0)).toBe(true);
  }
 });
 it('puts attack cards in the offensive group, rather than dialogue',()=>{
  const state=makeInitialState('journalist');state.mode='adventure';state.sceneId='confrontation';state.attempt=3;
  const groups=groupChoices(getVisibleActions(state));
  expect(groups.some(g=>g.id==='attack')).toBe(true);
  expect(groups.some(g=>g.id==='talk')).toBe(true);
 });
});
describe('v1.1 warehouse transfers',()=>{
 it('deposits one item at a time and keeps total count unchanged',()=>{
  const s=makeInitialState('journalist');s.bag.pen=2;
  const count=(s.bag.pen??0)+(s.warehouse.pen??0);
  const after=gameReducer(s,{type:'DEPOSIT_ITEM',itemId:'pen'});
  expect(after.bag.pen).toBe(1);
  expect(after.warehouse.pen).toBe((s.warehouse.pen??0)+1);
  expect((after.bag.pen??0)+(after.warehouse.pen??0)).toBe(count);
 });
 it('does not silently move marked favorite or equipped items',()=>{
  const s=makeInitialState('journalist');s.bag.vest=1;s.protectedItems=['vest'];
  const a=gameReducer(s,{type:'DEPOSIT_ITEM',itemId:'vest'});
  expect(a.bag.vest).toBe(1);expect(a.warehouse.vest??0).toBe(0);
  s.protectedItems=[];s.equipment.body='vest';
  const b=gameReducer(s,{type:'DEPOSIT_ITEM',itemId:'vest'});
  expect(b.bag.vest).toBe(1);
 });
 it('refuses over-capacity storage without losing the bag item',()=>{
  const s=makeInitialState('journalist');s.bag.pen=1;
  s.warehouseCapacity=.01;
  const out=gameReducer(s,{type:'DEPOSIT_ITEM',itemId:'pen'});
  expect(out.bag.pen).toBe(1);
  expect(out.warehouse.pen??0).toBe(1);
 });
});
describe('v1.1 scene-specific vector illustrations',()=>{
 it('renders five visibly different scenes, without image downloads',()=>{
  const scenes:SceneId[]=['gate','survey','inside','confrontation','loot'];
  const pictures=scenes.map(scene=>renderToStaticMarkup(createElement(SceneArtwork,{scene})));
  expect(new Set(pictures).size).toBe(5);
  expect(pictures.every(p=>p.includes('<svg')&&p.length>200)).toBe(true);
 });
});
