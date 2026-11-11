import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getTownServiceLock} from '../src/game/engine/townActions';
import {previewInnRest,remainingDailyRest} from '../src/game/engine/innRest';
import {majorStateChanges} from '../src/components/GameFeedback';
import MissionTransition,{TRANSITION_DURATION} from '../src/features/chapter/MissionTransition';

describe('v1.7.2 inn facility entry and recovery',()=>{
 it('opens the REST preview from the inn tile instead of only reselecting the already-selected facility',()=>{
  const ui=readFileSync(new URL('../src/features/town/TownPage.tsx',import.meta.url),'utf8');
  const modal=readFileSync(new URL('../src/features/town/InnRestDialog.tsx',import.meta.url),'utf8');
  expect(ui).toContain("if(f.id==='inn')setRestDialog('rest_cot')");
  expect(ui).toContain('onConfirm={selectedBed=>{enact(selectedBed);setRestDialog(null)}}');
  expect(modal).toContain("const BED_OPTIONS:RestServiceId[]=['rest_cot','rest_private','rest_short']");
  expect(modal).toContain('onClick={()=>onConfirm(selected)}');
  expect(modal).toContain('createPortal(');
  expect(modal).toContain("pauseClock('dialog',true)");
 });
 it('does not lock resting even when all meters are full; preview uses real recovery rules',()=>{
  let s=makeInitialState('journalist');
  expect(getTownServiceLock(s,'rest_cot')).toBeNull();
  expect(previewInnRest(s,'rest_cot').predictedHealth).toBe(10);
  s.player.health=1;s.player.stamina=0;
  const cot=previewInnRest(s,'rest_cot'),privateRoom=previewInnRest(s,'rest_private');
  expect(cot.predictedHealth).toBe(9);
  expect(privateRoom.predictedHealth).toBe(10);
  expect(cot.predictedStamina).toBe(10);
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(s.player.health).toBe(9);expect(s.player.stamina).toBe(10);
  expect(remainingDailyRest(s)).toBe(1);
 });
 it('allows a player to choose the private room on the next rest, honoring the two-rest cap',()=>{
  let s=makeInitialState('journalist');s.player.health=1;s.player.stamina=0;
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  s.player.health=1;s.player.stamina=0;
  const preview=previewInnRest(s,'rest_private');
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_private'});
  expect(s.player.health).toBe(preview.predictedHealth);
  expect(remainingDailyRest(s)).toBe(0);
  expect(gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_short'})).toBe(s);
 });
});
describe('v1.7.2 defeat screen is player-dismissed only',()=>{
 it('has no timer for defeat while retaining other transition durations',()=>{
  expect(TRANSITION_DURATION.defeat).toBeNull();
  expect(TRANSITION_DURATION.entry).toBeGreaterThan(0);
  expect(TRANSITION_DURATION.victory).toBeGreaterThan(0);
  const html=renderToStaticMarkup(createElement(MissionTransition,{
   kind:'defeat',enemyName:'阿忠',stageId:1,onFinish:()=>{}
  }));
  expect(html).toContain('MISSION FAILED');
  expect(html).toContain('結束戰敗 · 返回地圖');
 });
 it('does not enqueue a second temporary defeat popup over the full-screen result',()=>{
  const before=makeInitialState('journalist');before.mode='adventure';
  const after=structuredClone(before);
  after.mode='result';after.outcome='defeat';after.player.health=1;
  after.clues.push('又找到了新情報');
  expect(majorStateChanges(before,after)).toEqual([]);
 });
 it('does not return to the hub merely because a fatal counterattack finished',()=>{
  let s=makeInitialState('journalist');s.mode='adventure';s.sceneId='confrontation';s.attempt=1;s.player.health=1;
  s.enemyCounter={id:1,itemId:'radio',damage:6,hit:true,phase:'throwing'};
  s=gameReducer(s,{type:'ENEMY_COUNTER_HIT'});
  s=gameReducer(s,{type:'ENEMY_COUNTER_FINISH'});
  expect(s.mode).toBe('result');
  expect(s.outcome).toBe('defeat');
  const time=gameReducer(s,{type:'WORLD_CLOCK_TICK',minutes:5});
  expect(time.mode).toBe('result');
  expect(time.outcome).toBe('defeat');
  const exit=gameReducer(time,{type:'RETURN_HUB'});
  expect(exit.mode).toBe('home');
 });
});