import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {calculateActionPreview,getVisibleActions} from '../src/game/engine/rules';
import {getPeacefulResolutionCap} from '../src/game/engine/encounterBalance';
import {getEquippedDefense} from '../src/game/data/equipmentEffects';
import {TOWN_FACILITIES,TOWN_QUESTS,TOWN_SERVICES,isTownOpen,townQuestReady} from '../src/game/data/town';
import {getTownServiceLock} from '../src/game/engine/townActions';
import {LICENSED_TRACKS,SCENE_TRACKS} from '../src/audio/licensedMusic';
import {SCENES} from '../src/game/data/scenes';

describe('v1.5: slow peaceful boss resolution',()=>{
 it('only reaches 50% at the tenth stage-specific NPC visit, regardless of skill bonuses',()=>{
  const s=makeInitialState('journalist');s.mode='adventure';s.sceneId='confrontation';
  s.hand=['question','pressure','focus'];s.player.resource=6;
  const choice=SCENES.confrontation.actions[0]!;
  s.npc.met=1;expect(getPeacefulResolutionCap(s,choice)).toBe(14);
  expect(calculateActionPreview(s,choice,'question').chance).toBeLessThanOrEqual(14);
  s.npc.met=7;expect(getPeacefulResolutionCap(s,choice)).toBe(38);
  s.npc.met=9;expect(getPeacefulResolutionCap(s,choice)).toBe(46);
  s.npc.met=10;expect(getPeacefulResolutionCap(s,choice)).toBe(50);
  s.npc.met=15;expect(getPeacefulResolutionCap(s,choice)).toBe(70);
  s.stageId=2;s.alleyNpc!.met=1;
  expect(getPeacefulResolutionCap(s,choice)).toBe(14);
 });
 it('failed diplomacy transitions to enemy counter, disables repeated peace-tap and never silently defeats',()=>{
  let s=makeInitialState('journalist');s.mode='adventure';s.sceneId='confrontation';s.npc.met=1;s.rngSeed=500;
  s=gameReducer(s,{type:'CHOOSE',choiceId:'fight_talk',skillId:null});
  expect(s.mode).toBe('adventure');
  expect(s.enemyCounter?.phase).toBe('waiting');
  expect(s.flags).toContain('negotiation_rejected');
  expect(getVisibleActions(s).some(c=>c.id==='fight_talk')).toBe(false);
  const unchanged=gameReducer(s,{type:'CHOOSE',choiceId:'fight_talk',skillId:null});
  expect(unchanged).toBe(s);
 });
});
describe('v1.5: town facilities are actually functional',()=>{
 it('provides eight unique venues and business hours including overnight tavern',()=>{
  expect(TOWN_FACILITIES).toHaveLength(8);
  expect(new Set(TOWN_FACILITIES.map(f=>f.id)).size).toBe(8);
  expect(TOWN_SERVICES.length).toBeGreaterThanOrEqual(15);
  expect(isTownOpen('tavern',21*60)).toBe(true);
  expect(isTownOpen('tavern',1*60)).toBe(true);
  expect(isTownOpen('tavern',9*60)).toBe(false);
 });
 it('changes real player stats, currency and in-game time',()=>{
  let s=makeInitialState('journalist');s.player.health=47;s.player.fatigue=45;s.player.stamina=32;
  const before=s.economy.coins;
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(s.player.health).toBe(59);expect(s.player.stamina).toBe(67);
  expect(s.player.fatigue).toBe(23);
  expect(s.economy.coins).toBe(before-15);
  expect(s.world.minute).toBe(16*60+20+120);
  expect(s.town?.visits.inn).toBe(1);
 });
 it('medical treatment actually resolves wounds and requires a condition to perform',()=>{
  let s=makeInitialState('journalist');s.player.health=45;s.conditions!.wounds=3;
  expect(getTownServiceLock(s,'clinic_wounds')).toBeNull();
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'clinic_wounds'});
  expect(s.conditions?.wounds).toBe(1);expect(s.player.health).toBe(70);
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'clinic_wounds'});
  expect(s.conditions?.wounds).toBe(0);
  expect(getTownServiceLock(s,'clinic_wounds')).not.toBeNull();
 });
 it('one permanent attribute gain per in-game day, no repeat spam, chosen attribute only',()=>{
  let s=makeInitialState('journalist');
  const before=s.player.attributes.observation;
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'train',attribute:'observation'});
  expect(s.player.attributes.observation).toBe(before+1);
  expect(s.player.attributes.persuasion).toBe(10);
  expect(s.town?.lastTrainingDay).toBe(1);
  const same=s;
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'train',attribute:'persuasion'});
  expect(s).toBe(same);
  s={...s,world:{...s.world,day:2,minute:16*60}};
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'train',attribute:'persuasion'});
  expect(s.player.attributes.persuasion).toBe(11);
 });
 it('workshop requires materials and applies measurable armor bonus',()=>{
  let s=makeInitialState('journalist');s.bag.cap=1;s.bag.tape=1;
  s=gameReducer(s,{type:'EQUIP_ITEM',slot:'head',itemId:'cap'});
  const defense=getEquippedDefense(s);expect(defense).toBe(2);
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'workshop_upgrade',itemId:'cap'});
  expect(s.town?.upgrades.cap).toBe(1);
  expect(getEquippedDefense(s)).toBe(defense+2);
  expect(s.bag.tape??0).toBe(0);
  expect(getTownServiceLock(s,'workshop_upgrade',undefined,'cap')).toContain('缺少');
  s.town!.wear.cap=61;
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'workshop_repair',itemId:'cap'});
  expect(s.town?.wear.cap).toBe(100);
 });
 it('side quests have genuine conditions, one-time rewards, inventory transfer and permanence',()=>{
  let s=makeInitialState('journalist');expect(TOWN_QUESTS).toHaveLength(5);
  s=gameReducer(s,{type:'TOWN_ACCEPT_QUEST',questId:'emergency_water'});
  expect(s.town?.quests.emergency_water).toBe('accepted');
  expect(townQuestReady(s,TOWN_QUESTS.find(q=>q.id==='emergency_water')!)).toBe(false);
  const failed=s;
  s=gameReducer(s,{type:'TOWN_COMPLETE_QUEST',questId:'emergency_water'});expect(s).toBe(failed);
  s.bag.water=2;
  const balance=s.economy.coins,empathy=s.player.attributes.empathy;
  s=gameReducer(s,{type:'TOWN_COMPLETE_QUEST',questId:'emergency_water'});
  expect(s.town?.quests.emergency_water).toBe('completed');
  expect(s.economy.coins).toBe(balance+48);
  expect(s.player.attributes.empathy).toBe(empathy+1);
  expect(s.bag.water??0).toBe(0);
  expect(gameReducer(s,{type:'TOWN_COMPLETE_QUEST',questId:'emergency_water'})).toBe(s);
 });
 it('bath grants a time-limited persuasion buff; rumor collection has a daily cap',()=>{
  let s=makeInitialState('journalist');s.mode='adventure';s.sceneId='gate';
  const choice=SCENES.gate.actions[0]!;
  const initial=calculateActionPreview(s,choice,null).chance;
  s.mode='home';s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'bath'});
  s.mode='adventure';
  expect(calculateActionPreview(s,choice,null).chance).toBe(initial+5);
  s.world.minute+=200;
  expect(calculateActionPreview(s,choice,null).chance).toBe(initial);
  s.mode='home';s.world.minute=16*60;
  const before=s.clues.length;
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'tavern_rumor'});
  expect(s.clues.length).toBe(before+1);
  expect(getTownServiceLock(s,'tavern_rumor')).not.toBeNull();
 });
});
describe('v1.5: commercial-safe recorded music',()=>{
 it('records a real CC0 track for every gameplay soundscape except intentional silence',()=>{
  for(const [scene,id] of Object.entries(SCENE_TRACKS)){
   if(scene==='silence'){expect(id).toBeNull();continue;}
   expect(id).not.toBeNull();
   expect(LICENSED_TRACKS[id!]?.license).toBe('CC0-1.0');
  }
  expect(SCENE_TRACKS.map).not.toBe(SCENE_TRACKS.gate);
  expect(SCENE_TRACKS.gate).not.toBe(SCENE_TRACKS.confrontation);
 });
 it('actually ships five nonempty OGG recordings rather than fake zero-byte placeholders',()=>{
  for(const track of Object.values(LICENSED_TRACKS)){
   const path=join(process.cwd(),'public/audio/cc0-music',track.filename);
   expect(existsSync(path)).toBe(true);
   expect(statSync(path).size).toBeGreaterThan(40000);
   expect(readFileSync(path).subarray(0,4).toString('ascii')).toBe('OggS');
  }
 });
});
