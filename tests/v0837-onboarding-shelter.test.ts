import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {gameReducer} from '../src/game/engine/resolve';
import {makeInitialState} from '../src/game/state/initial';
import {loadGame,saveGame} from '../src/game/state/storage';
import {INTRO_STORY_PAGES,TUTORIAL_PLACEHOLDER_STEPS,SHELTER_OPTIONS,isShelterId,restoreOnboarding} from '../src/game/engine/onboarding';
import type {GameState,ShelterId} from '../src/game/types';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
afterEach(()=>vi.unstubAllGlobals());

const reachShelter=()=>{
 let s=gameReducer(makeInitialState(),{type:'ONBOARDING_STORY_SKIP'});
 for(let i=0;i<TUTORIAL_PLACEHOLDER_STEPS.length-1;i++)s=gameReducer(s,{type:'ONBOARDING_TUTORIAL_NEXT'});
 return gameReducer(s,{type:'ONBOARDING_TUTORIAL_DEFEAT'});
};

describe('v0.8.37 first-launch story, forced-defeat placeholder and chosen shelter',()=>{
 it('starts a fresh player in story but preserves direct-profession fixtures used by existing game tests',()=>{
  const fresh=makeInitialState();
  expect(fresh.onboarding).toMatchObject({phase:'story',storyPage:0,tutorialStep:0,shelter:null});
  expect(fresh.profession).toBeNull();
  const scripted=makeInitialState('journalist');
  expect(scripted.onboarding.phase).toBe('complete');
  expect(scripted.mode).toBe('home');
  expect(INTRO_STORY_PAGES).toHaveLength(3);
  expect(TUTORIAL_PLACEHOLDER_STEPS).toHaveLength(3);
 });
 it('story pages advance deterministically and the skip button goes ONLY to mandatory tutorial',()=>{
  let s=makeInitialState();
  s=gameReducer(s,{type:'ONBOARDING_STORY_NEXT'});
  expect(s.onboarding).toMatchObject({phase:'story',storyPage:1});
  s=gameReducer(s,{type:'ONBOARDING_STORY_NEXT'});
  expect(s.onboarding).toMatchObject({phase:'story',storyPage:2});
  s=gameReducer(s,{type:'ONBOARDING_STORY_NEXT'});
  expect(s.onboarding).toMatchObject({phase:'tutorial',tutorialStep:0});
  expect(gameReducer(s,{type:'ONBOARDING_STORY_SKIP'})).toBe(s);
  const direct=gameReducer(makeInitialState(),{type:'ONBOARDING_STORY_SKIP'});
  expect(direct.onboarding.phase).toBe('tutorial');
  expect(direct.onboarding.shelter).toBeNull();
  expect(gameReducer(direct,{type:'ONBOARDING_SELECT_SHELTER',shelterId:'apartment'})).toBe(direct);
 });
 it('never allows an early victory or shelter bypass, and scripted defeat has zero real penalties',()=>{
  const initial=makeInitialState();
  const afterSkip=gameReducer(initial,{type:'ONBOARDING_STORY_SKIP'});
  expect(gameReducer(afterSkip,{type:'ONBOARDING_TUTORIAL_DEFEAT'})).toBe(afterSkip);
  expect(gameReducer(afterSkip,{type:'ONBOARDING_SELECT_SHELTER',shelterId:'warehouse'})).toBe(afterSkip);
  const first=gameReducer(afterSkip,{type:'ONBOARDING_TUTORIAL_NEXT'});
  expect(first.onboarding.tutorialStep).toBe(1);
  const last=gameReducer(first,{type:'ONBOARDING_TUTORIAL_NEXT'});
  expect(last.onboarding.tutorialStep).toBe(2);
  expect(gameReducer(last,{type:'ONBOARDING_TUTORIAL_NEXT'})).toBe(last);
  const defeated=gameReducer(last,{type:'ONBOARDING_TUTORIAL_DEFEAT'});
  expect(defeated.onboarding.phase).toBe('shelter');
  expect(defeated.player).toEqual(initial.player);
  expect(defeated.npc).toEqual(initial.npc);
  expect(defeated.economy).toEqual(initial.economy);
  expect(defeated.bag).toEqual(initial.bag);
  expect(defeated.progression).toEqual(initial.progression);
  expect(defeated.world).toEqual(initial.world);
  expect(defeated.attempt).toBe(0);
  expect(defeated.mode).toBe('home');
  expect(defeated.outcome).toBeNull();
  expect(defeated.log).toEqual([]);
  expect(defeated.enemyCounter).toBeNull();
 });
 it('offers only the three distinct shelters and persists the same choice, never overwriting it',()=>{
  const choices:ShelterId[]=['warehouse','apartment','bunker'];
  expect(SHELTER_OPTIONS.map(x=>x.id)).toEqual(choices);
  expect(SHELTER_OPTIONS.find(x=>x.id==='warehouse')?.art).toContain('已備妥');
  expect(SHELTER_OPTIONS.filter(x=>x.id!=='warehouse').every(x=>x.art.includes('尚待製作'))).toBe(true);
  expect(choices.every(isShelterId)).toBe(true);
  expect(isShelterId('clinic')).toBe(false);
  for(const id of choices){
   const before=reachShelter();
   const after=gameReducer(before,{type:'ONBOARDING_SELECT_SHELTER',shelterId:id});
   expect(after.onboarding).toMatchObject({phase:'complete',shelter:id});
   expect(gameReducer(after,{type:'ONBOARDING_SELECT_SHELTER',shelterId:'warehouse'})).toBe(after);
   expect(after.player).toEqual(before.player);
   expect(after.chapterProgress).toEqual(before.chapterProgress);
  }
 });
 it('keeps chosen shelter when the old character profession selection finishes',()=>{
  const base=gameReducer(reachShelter(),{type:'ONBOARDING_SELECT_SHELTER',shelterId:'apartment'});
  const after=gameReducer(base,{type:'SELECT_PROFESSION',profession:'courier'});
  expect(after.profession).toBe('courier');
  expect(after.onboarding).toMatchObject({phase:'complete',shelter:'apartment'});
  expect(after.bag).toEqual(makeInitialState('courier').bag);
  expect(after.onboarding.storyPage).toBe(base.onboarding.storyPage);
  expect(gameReducer(after,{type:'SELECT_PROFESSION',profession:'journalist'})).toBe(after);
  expect(gameReducer(makeInitialState(),{type:'SELECT_PROFESSION',profession:'journalist'})).toMatchObject({onboarding:{phase:'story'}});
 });
 it('retains mid-intro, mid-tutorial and finished shelter selection after save/load and clock refresh',()=>{
  const entries=new Map<string,string>();
  vi.stubGlobal('localStorage',{
   getItem:(k:string)=>entries.get(k)??null,
   setItem:(k:string,v:string)=>{entries.set(k,v)},
  });
  let s=gameReducer(makeInitialState(),{type:'ONBOARDING_STORY_NEXT'});
  expect(saveGame(s)).toBe(true);
  let restored=loadGame();
  expect(restored.onboarding).toMatchObject({phase:'story',storyPage:1});
  s=gameReducer(restored,{type:'ONBOARDING_STORY_SKIP'});
  s=gameReducer(s,{type:'ONBOARDING_TUTORIAL_NEXT'});
  expect(saveGame(s)).toBe(true);
  restored=loadGame();
  expect(restored.onboarding).toMatchObject({phase:'tutorial',tutorialStep:1});
  s=gameReducer(reachShelter(),{type:'ONBOARDING_SELECT_SHELTER',shelterId:'bunker'});
  expect(saveGame(s)).toBe(true);
  restored=loadGame();
  expect(restored.onboarding).toMatchObject({phase:'complete',shelter:'bunker'});
  expect(gameReducer(restored,{type:'WORLD_CLOCK_SYNC',nowMs:Date.parse('2026-11-15T11:00:00Z')}).onboarding).toEqual(restored.onboarding);
 });
 it('migrates historical v0.8.36 saves directly to shelter choice without erasing quests or replaying defeat',()=>{
  const old=makeInitialState('journalist');
  old.mode='adventure';
  old.attempt=11;
  old.player.health=3;
  old.player.hunger=92;
  old.bag.biscuit=7;
  old.warehouse.wrench=4;
  old.economy.coins=639;
  old.npc.hostility=88;
  old.chapterProgress.unlocked=2;
  old.ownedCards['special_test_card']={copies:2,level:3};
  const saved=JSON.parse(JSON.stringify(old)) as Partial<GameState>;
  delete saved.onboarding;
  let storage=JSON.stringify(saved);
  vi.stubGlobal('localStorage',{getItem:()=>storage,setItem:(_k:string,v:string)=>{storage=v}});
  const migrated=loadGame();
  expect(migrated.onboarding).toMatchObject({phase:'shelter',shelter:null});
  expect(migrated.mode).toBe('adventure');
  expect(migrated.attempt).toBe(11);
  expect(migrated.player.health).toBe(3);
  expect(migrated.player.hunger).toBe(92);
  expect(migrated.bag.biscuit).toBe(7);
  expect(migrated.warehouse.wrench).toBe(4);
  expect(migrated.economy.coins).toBe(639);
  expect(migrated.npc.hostility).toBe(88);
  expect(migrated.chapterProgress.unlocked).toBe(2);
  expect(migrated.ownedCards.special_test_card).toEqual({copies:2,level:3});
  const selected=gameReducer(migrated,{type:'ONBOARDING_SELECT_SHELTER',shelterId:'apartment'});
  expect(selected.onboarding).toMatchObject({phase:'complete',shelter:'apartment'});
  expect(selected.mode).toBe('adventure');
  expect(selected.outcome).toBeNull();
  expect(saveGame(selected)).toBe(true);
  expect(loadGame().onboarding).toMatchObject({phase:'complete',shelter:'apartment'});
 });
 it('normalizes malformed onboarding data and refuses to skip already finished scenes',()=>{
  expect(restoreOnboarding(null).phase).toBe('shelter');
  expect(restoreOnboarding({phase:'complete',shelter:'bogus'})).toMatchObject({phase:'shelter',shelter:null});
  expect(restoreOnboarding({phase:'story',storyPage:999,tutorialStep:-10,shelter:null})).toMatchObject({phase:'story',storyPage:2,tutorialStep:0});
  const done=gameReducer(reachShelter(),{type:'ONBOARDING_SELECT_SHELTER',shelterId:'warehouse'});
  expect(gameReducer(done,{type:'ONBOARDING_STORY_SKIP'})).toBe(done);
  expect(gameReducer(done,{type:'ONBOARDING_TUTORIAL_DEFEAT'})).toBe(done);
 });
 it('routes all first-play phases before normal mission locks; skip, art placeholders and size adaptations exist',()=>{
  const app=read('src/app/App.tsx');
  const ui=read('src/features/onboarding/OnboardingPage.tsx');
  const frame=read('src/components/Frame.tsx');
  const css=read('src/styles/_v0837-onboarding.scss');
  expect(app.indexOf("if(state.onboarding.phase!=='complete')")).toBeLessThan(app.indexOf("if(state.mode!=='home'"));
  expect(ui).toContain('aria-label="跳過故事介紹，進入必經的新手教學"');
  expect(ui).toContain('ONBOARDING_STORY_SKIP');
  expect(ui).toContain('ONBOARDING_TUTORIAL_DEFEAT');
  expect(ui).toContain('data-shelter-id={s.id}');
  expect(ui).toContain("navigate('/',{replace:true})");
  expect(ui).not.toContain('src="assets/warehouse');
  expect(frame).toContain('!inMission&&!inOnboarding&&!onMap');
  expect(css).toContain('max-width:390px');
  expect(css).toContain('max-height:560px');
  expect(css).toContain('prefers-reduced-motion:reduce');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0838-shelter-hub";$/);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.38');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.38');
 });
});
