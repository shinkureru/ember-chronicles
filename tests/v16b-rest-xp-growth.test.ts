import {afterEach,describe,expect,it,vi} from 'vitest';
import {makeInitialState} from '../src/game/state/initial';
import {loadGame,saveGame} from '../src/game/state/storage';
import {gameReducer} from '../src/game/engine/resolve';
import {awardExperience,DAILY_XP_CAP,xpNeededForLevel} from '../src/game/engine/progression';
import {previewInnRest,remainingDailyRest} from '../src/game/engine/innRest';

afterEach(()=>vi.unstubAllGlobals());

describe('v1.6b zero-base stats and experience',()=>{
 it('starts with 10 stamina and all 18 growth attributes at zero',()=>{
  const s=makeInitialState('journalist');
  expect([s.player.health,s.player.maxHealth,s.player.stamina,s.player.maxStamina]).toEqual([10,10,10,10]);
  expect(Object.keys(s.player.attributes)).toHaveLength(18);
  expect(Object.values(s.player.attributes)).toEqual(Array(18).fill(0));
  expect(s.progression).toMatchObject({level:1,xp:0,points:0});
 });
 it('awards XP once per in-world day and limits maximum gained XP',()=>{
  const s=makeInitialState('journalist');
  expect(awardExperience(s,'talk:npc',12)).toBe(12);
  expect(awardExperience(s,'talk:npc',12)).toBe(0);
  expect(awardExperience(s,'talk:new-npc',200)).toBe(DAILY_XP_CAP-12);
  expect(awardExperience(s,'talk:newer-npc',15)).toBe(0);
  expect(s.progression!.totalXp).toBe(DAILY_XP_CAP);
  expect(s.progression!.level).toBeGreaterThan(1);
  s.world.day=2;
  expect(awardExperience(s,'talk:npc',12)).toBe(12);
 });
 it('gains points from leveling and allocates a permanent HP upgrade',()=>{
  let s=makeInitialState('journalist');
  awardExperience(s,'chapter:complete',xpNeededForLevel(1));
  expect(s.progression?.level).toBe(2);
  expect(s.progression?.points).toBe(1);
  s=gameReducer(s,{type:'ALLOCATE_POINT',attribute:'maxHealth'});
  expect(s.progression?.points).toBe(0);
  expect(s.player.attributes.maxHealth).toBe(1);
  expect(s.player.maxHealth).toBe(11);
  expect(s.player.health).toBe(11);
  const noMore=gameReducer(s,{type:'ALLOCATE_POINT',attribute:'melee'});
  expect(noMore).toBe(s);
 });
 it('converts an old save only once, preserving previously trained ranks',()=>{
  const old=makeInitialState('journalist');
  delete old.growthRulesVersion;delete old.hpRulesVersion;
  old.player.health=93;old.player.maxHealth=100;old.player.stamina=48;old.player.maxStamina=84;
  old.player.attributes.observation=13;old.player.attributes.maxStamina=11;
  old.player.attributes.melee=10;old.bag.bandage=4;
  let raw=JSON.stringify(old);
  vi.stubGlobal('localStorage',{getItem:()=>raw,setItem:(_key:string,val:string)=>{raw=val}});
  const converted=loadGame();
  expect(converted.player.health).toBe(9);
  expect(converted.player.maxHealth).toBe(10);
  expect(converted.player.maxStamina).toBe(11);
  expect(converted.player.stamina).toBe(6);
  expect(converted.player.attributes.observation).toBe(3);
  expect(converted.player.attributes.maxStamina).toBe(1);
  expect(converted.player.attributes.melee).toBe(0);
  expect(converted.bag.bandage).toBe(4);
  saveGame(converted);
  expect(loadGame().player.attributes.observation).toBe(3);
 });
});
describe('v1.6b inn recovery and light defeat penalty',()=>{
 it('predicts exactly 3/10 HP and 8/10 stamina becoming 5/10 and 10/10',()=>{
  const s=makeInitialState('journalist');
  s.player.health=3;s.player.stamina=8;
  const prediction=previewInnRest(s,'rest_cot');
  expect(prediction.predictedHealth).toBe(5);
  expect(prediction.predictedStamina).toBe(10);
  expect(prediction.recommendation).toContain('體力');
  const spent=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(spent.player.health).toBe(prediction.predictedHealth);
  expect(spent.player.stamina).toBe(prediction.predictedStamina);
 });
 it('uses proportional missing stamina even for an upgraded 30-point stamina capacity',()=>{
  const s=makeInitialState('journalist');
  s.player.health=3;s.player.maxStamina=30;s.player.stamina=24;
  expect(previewInnRest(s,'rest_cot').healthGain).toBe(2);
  s.player.stamina=0;
  expect(previewInnRest(s,'rest_cot').predictedHealth).toBe(10);
 });
 it('prevents more than two rests per calendar day, shared between different rooms',()=>{
  let s=makeInitialState('journalist');
  expect(remainingDailyRest(s)).toBe(2);
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_short'});
  expect(remainingDailyRest(s)).toBe(0);
  const old=s;
  expect(gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_private'})).toBe(old);
  s={...s,world:{...s.world,day:s.world.day+1}};
  expect(remainingDailyRest(s)).toBe(2);
 });
 it('does not secretly heal after a failed mission; loss costs time and leaves useful info',()=>{
  let s=makeInitialState('journalist');
  s.mode='adventure';s.attempt=1;s.player.health=1;s.sceneId='confrontation';
  s.enemyCounter={id:1,itemId:'radio',damage:6,hit:true,phase:'throwing'};
  s=gameReducer(s,{type:'ENEMY_COUNTER_HIT'});
  const before=s.world.day*1440+s.world.minute;
  s=gameReducer(s,{type:'ENEMY_COUNTER_FINISH'});
  expect(s.mode).toBe('result');expect(s.player.health).toBe(1);
  expect(s.conditions!.wounds).toBeGreaterThanOrEqual(1);
  expect(s.clues.length).toBeGreaterThan(0);
  expect(s.world.day*1440+s.world.minute-before).toBe(120);
  s=gameReducer(s,{type:'RETURN_HUB'});
  expect(s.mode).toBe('home');
  expect(s.player.health).toBe(1);
  expect(s.player.stamina).toBe(10);
 });
});
