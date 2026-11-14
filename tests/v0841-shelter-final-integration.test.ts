import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {loadGame,saveGame,clearPrototypeSave,resetPrototypeAndReload} from '../src/game/state/storage';
import {getWarehouseFurnitureLayers,getWarehouseVisualMode,normalizeShelterOwned,SHELTER_FURNITURE_IDS,WAREHOUSE_LAYOUT,WAREHOUSE_STAGE} from '../src/game/engine/shelterVisuals';
import {SHELTER_OPTIONS,INTRO_STORY_PAGES,TUTORIAL_PLACEHOLDER_STEPS} from '../src/game/engine/onboarding';
import {nextShelterBuildItem,randomShelterBuildOrder} from '../src/game/engine/shelterBuild';
import {clientToStagePoint,pickWarehouseFurniture,enqueueShelterAttention,dismissShelterAttention,availableShelterAttention,makeDemoShelterAttention} from '../src/game/engine/shelterInteractions';
import {SHELTER_DEMO_STEP_MS} from '../src/features/shelter/ShelterBuildDemoPanel';
import {BOOT_PRESENTATION_MS} from '../src/app/BootSplash';
import ShelterScene from '../src/features/shelter/ShelterScene';
import type {GameState,ShelterFurnitureId,ShelterId} from '../src/game/types';
const source=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const all=[...SHELTER_FURNITURE_IDS];
const startAndSelect=(id:ShelterId,skipStory=true)=>{
 let state=makeInitialState();
 if(skipStory)state=gameReducer(state,{type:'ONBOARDING_STORY_SKIP'});
 else for(let i=0;i<INTRO_STORY_PAGES.length;i++)state=gameReducer(state,{type:'ONBOARDING_STORY_NEXT'});
 expect(state.onboarding.phase).toBe('tutorial');
 for(let i=0;i<TUTORIAL_PLACEHOLDER_STEPS.length-1;i++){
  state=gameReducer(state,{type:'ONBOARDING_TUTORIAL_NEXT'});
 }
 state=gameReducer(state,{type:'ONBOARDING_TUTORIAL_DEFEAT'});
 expect(state.onboarding.phase).toBe('shelter');
 return gameReducer(state,{type:'ONBOARDING_SELECT_SHELTER',shelterId:id});
};
afterEach(()=>vi.unstubAllGlobals());

describe('v0.8.41 — six-batch shelter and first-play integration',()=>{
 it.each(['warehouse','apartment','bunker'] as ShelterId[])(
  'completes cold-start -> skippable story -> mandatory defeat -> %s and retains untouched game stats',id=>{
   const first=makeInitialState();
   expect(first.onboarding.phase).toBe('story');
   expect(first.shelterOwned).toEqual([]);
   expect(BOOT_PRESENTATION_MS).toBe(1100);
   const completed=startAndSelect(id);
   expect(completed.onboarding).toMatchObject({phase:'complete',shelter:id});
   expect(completed.player).toEqual(first.player);
   expect(completed.npc).toEqual(first.npc);
   expect(completed.bag).toEqual(first.bag);
   expect(completed.economy).toEqual(first.economy);
   expect(completed.world).toEqual(first.world);
   expect(completed.attempt).toBe(0);
   expect(completed.outcome).toBeNull();
   expect(completed.shelterOwned).toEqual([]);
   expect(gameReducer(completed,{type:'ONBOARDING_STORY_SKIP'})).toBe(completed);
   expect(gameReducer(completed,{type:'ONBOARDING_SELECT_SHELTER',shelterId:'warehouse'})).toBe(completed);
  }
 );
 it('allows reading every story page without bypassing the forced tutorial',()=>{
  const completed=startAndSelect('warehouse',false);
  expect(completed.onboarding.storyPage).toBe(INTRO_STORY_PAGES.length-1);
  expect(completed.onboarding.tutorialStep).toBe(TUTORIAL_PLACEHOLDER_STEPS.length-1);
  const s=gameReducer(makeInitialState(),{type:'ONBOARDING_STORY_SKIP'});
  expect(gameReducer(s,{type:'ONBOARDING_TUTORIAL_DEFEAT'})).toBe(s);
  expect(gameReducer(s,{type:'ONBOARDING_SELECT_SHELTER',shelterId:'bunker'})).toBe(s);
 });
 it('persists all three shelters, furniture ownership/order and changed profession across reloading',()=>{
  const map=new Map<string,string>();
  vi.stubGlobal('localStorage',{
   getItem:(k:string)=>map.get(k)??null,
   setItem:(k:string,v:string)=>{map.set(k,v)},
   removeItem:(k:string)=>{map.delete(k)}
  });
  for(const id of ['warehouse','apartment','bunker'] as ShelterId[]){
   let s=startAndSelect(id);
   s=gameReducer(s,{type:'SHELTER_DEMO_SET_OWNED',owned:['computer','bed','board'],order:['computer','bed','board']});
   s=gameReducer(s,{type:'SELECT_PROFESSION',profession:'journalist'});
   expect(s.onboarding.shelter).toBe(id);
   expect(s.shelterOwned).toEqual(['bed','board','computer']);
   expect(saveGame(s)).toBe(true);
   const reloaded=loadGame();
   expect(reloaded.onboarding).toMatchObject({phase:'complete',shelter:id});
   expect(reloaded.profession).toBe('journalist');
   expect(reloaded.shelterOwned).toEqual(['bed','board','computer']);
   expect(reloaded.shelterBuildOrder?.slice(0,3)).toEqual(['computer','bed','board']);
   expect(reloaded.economy).toEqual(s.economy);
   expect(reloaded.player.hunger).toBe(s.player.hunger);
  }
 });
 it('migrates a real legacy-game state without the new first-play or furniture fields',()=>{
  const legacy=makeInitialState('courier');
  legacy.player.health=2;legacy.player.hunger=94;legacy.economy.coins=918;
  legacy.chapterProgress.unlocked=2;legacy.bag.biscuit=8;legacy.warehouse.wrench=2;
  legacy.npc.hostility=88;
  const raw=JSON.parse(JSON.stringify(legacy)) as Record<string,unknown>;
  delete raw.onboarding;delete raw.shelterOwned;delete raw.shelterBuildOrder;
  let saved=JSON.stringify(raw);
  vi.stubGlobal('localStorage',{getItem:()=>saved,setItem:(_k:string,v:string)=>{saved=v}});
  let migrated=loadGame();
  expect(migrated.onboarding).toMatchObject({phase:'shelter',shelter:null});
  expect(migrated.shelterOwned).toEqual([]);
  expect(migrated.shelterBuildOrder).toEqual(all);
  expect(migrated.economy.coins).toBe(918);
  expect(migrated.player).toMatchObject({health:2,hunger:94});
  expect(migrated.bag.biscuit).toBe(8);
  expect(migrated.npc.hostility).toBe(88);
  expect(migrated.chapterProgress.unlocked).toBe(2);
  migrated=gameReducer(migrated,{type:'ONBOARDING_SELECT_SHELTER',shelterId:'apartment'});
  expect(migrated.onboarding).toMatchObject({phase:'complete',shelter:'apartment'});
  expect(saveGame(migrated)).toBe(true);
  expect(loadGame().onboarding.shelter).toBe('apartment');
 });
 it('reset removes only this game save and remounts boot on the next reload; not audio/unrelated data',()=>{
  const values=new Map([['ember-chronicles-prototype-v1','old player'],['audio-volume','0.7'],['unrelated','KEEP']]);
  vi.stubGlobal('localStorage',{removeItem:(k:string)=>{values.delete(k)},getItem:(k:string)=>values.get(k)??null});
  const reload=vi.fn();
  expect(resetPrototypeAndReload(reload)).toBe(true);
  expect(reload).toHaveBeenCalledOnce();
  expect(values.has('ember-chronicles-prototype-v1')).toBe(false);
  expect(values.get('audio-volume')).toBe('0.7');
  expect(values.get('unrelated')).toBe('KEEP');
  expect(clearPrototypeSave()).toBe(true);
  expect(source('src/app/App.tsx')).toContain('<GameBootGate><Frame><GameRoutes/></Frame></GameBootGate>');
 });
 it('simulates arbitrary player purchase priorities through all eight without charging gameplay resources',()=>{
  const sequences=[
   [...all],
   ['computer','board','radio','generator','bed','storage','workbench','cooking'] as ShelterFurnitureId[],
   randomShelterBuildOrder(()=>0)
  ];
  for(const id of ['warehouse','apartment','bunker'] as ShelterId[]){
   for(const order of sequences){
    const first=gameReducer(startAndSelect(id),{type:'SELECT_PROFESSION',profession:'journalist'});
    let current=gameReducer(first,{type:'SHELTER_DEMO_SET_ORDER',order});
    for(let count=1;count<=8;count++){
     const next=nextShelterBuildItem(current.shelterOwned,current.shelterBuildOrder);
     expect(next).not.toBeNull();
     current=gameReducer(current,{type:'SHELTER_DEMO_ADD_NEXT'});
     expect(current.shelterOwned).toHaveLength(count);
     expect(getWarehouseVisualMode(current.shelterOwned)).toBe(count===8?'full':'layers');
    }
    expect(current.onboarding.shelter).toBe(id);
    expect(current.player).toEqual(first.player);
    expect(current.economy).toEqual(first.economy);
    expect(current.bag).toEqual(first.bag);
    expect(current.warehouse).toEqual(first.warehouse);
    expect(current.npc).toEqual(first.npc);
    expect(current.world).toEqual(first.world);
    expect(gameReducer(current,{type:'SHELTER_DEMO_ADD_NEXT'})).toBe(current);
    const cleared=gameReducer(current,{type:'SHELTER_DEMO_SET_OWNED',owned:[]});
    expect(getWarehouseVisualMode(cleared.shelterOwned)).toBe('empty');
    expect(cleared.onboarding.shelter).toBe(id);
    expect(cleared.player).toEqual(first.player);
   }
  }
 });
 it('exhaustively validates all 256 possible furniture combinations with different acquisition order',()=>{
  expect(all).toHaveLength(8);
  for(let mask=0;mask<1<<8;mask++){
   const selected=all.filter((_id,i)=>Boolean(mask&(1<<i)));
   const reversed=[...selected].reverse();
   const byFirst=getWarehouseFurnitureLayers(selected);
   const byReverse=getWarehouseFurnitureLayers(reversed);
   expect(byFirst).toEqual(byReverse);
   expect(byFirst.map(x=>x.id).sort()).toEqual([...selected].sort());
   expect(byFirst.map(x=>x.z)).toEqual([...byFirst.map(x=>x.z)].sort((a,b)=>a-b));
   expect(normalizeShelterOwned([...selected,...selected])).toEqual(selected);
   expect(getWarehouseVisualMode(selected)).toBe(mask===0?'empty':mask===255?'full':'layers');
  }
  expect(WAREHOUSE_STAGE).toEqual({width:768,height:1376});
  expect(WAREHOUSE_LAYOUT.assets.bed.x).toBe(-23);
  expect(WAREHOUSE_LAYOUT.assets.cooking.x).toBe(-52);
 });
 it('renders 0, 1, 7, 8 furniture correctly, full-quality JPEG gets markers but no duplicate furniture images',()=>{
  for(const count of [0,1,7,8]){
   const items=all.slice(0,count);
   const html=renderToStaticMarkup(createElement(ShelterScene,{owned:items,onSelect:()=>{}}));
   const sourceName=count===8?'background_full.jpg':'background_empty.jpg';
   expect(html).toContain(sourceName);
   expect((html.match(/data-furniture-marker=/g)??[])).toHaveLength(count);
   expect((html.match(/class="shelter-scene__furniture"/g)??[])).toHaveLength(count===8?0:count);
   expect(html).toContain('data-shelter-scene="warehouse"');
  }
  const onlyOne=renderToStaticMarkup(createElement(ShelterScene,{owned:['computer'],onSelect:()=>{}}));
  expect(onlyOne).toContain('data-furniture-marker="computer"');
  expect(onlyOne).not.toContain('data-furniture-marker="bed"');
 });
 it('3 shelter types retain separate scene choices and only warehouse preview uses warehouse artwork',()=>{
  expect(SHELTER_OPTIONS.map(x=>x.id)).toEqual(['warehouse','apartment','bunker']);
  const home=source('src/features/shelter/ShelterHomePage.tsx');
  expect(home).toContain("shelterId==='warehouse'||previewWarehouse");
  expect(home).toContain('setPreviewWarehouse(v=>!v)');
  expect(home).toContain('不會以廢棄倉庫圖片代替');
  expect(home).toContain('aria-label={`${name}室內場景尚待製作`}');
  const updated=source('src/features/onboarding/OnboardingPage.tsx');
  expect(updated).toContain('倉庫已有正式場景與家具配置');
  expect(updated).not.toContain('將在 v0.8.38 起陸續接上');
 });
 it('mobile coordinate math is consistent at 320,360,390,720,1280 and 200% zoom',()=>{
  for(const w of [320,360,390,720,1280]){
   const stageWidth=Math.min(w,468);
   for(const zoom of [1,2]){
    const width=stageWidth/zoom;
    const height=width*1376/768;
    const point=clientToStagePoint({x:20+width*.5,y:42+height*.5},
     {left:20,top:42,width,height},WAREHOUSE_STAGE);
    expect(point?.x).toBeCloseTo(384);
    expect(point?.y).toBeCloseTo(688);
    const clamped=clientToStagePoint({x:20+width+1,y:42+height*.5},
     {left:20,top:42,width,height},WAREHOUSE_STAGE);
    expect(clamped).toBeNull();
   }
  }
 });
 it('all three hint types enqueue, dedupe, show only owned items and dismiss, without using a real quest flag',()=>{
  const values=['tutorial','quest','ready'] as const;
  let items=values.map(v=>makeDemoShelterAttention(v));
  let queue=items.reduce((q,x)=>enqueueShelterAttention(q,x),[] as typeof items);
  expect(queue).toHaveLength(3);
  queue=enqueueShelterAttention(queue,items[1]);
  expect(queue).toHaveLength(3);
  expect(availableShelterAttention(queue,['board','computer'])).toHaveLength(2);
  expect(availableShelterAttention(queue,[])).toHaveLength(0);
  queue=dismissShelterAttention(queue,items[0].id);
  expect(queue).toHaveLength(2);
  const src=source('src/features/shelter/ShelterHomePage.tsx');
  expect(src).toContain('setQueue(previous=>');
  expect(src).toContain('setSelectedId(previous=>previous&&!installed.has(previous)?null:previous)');
 });
 it('respects old mission gate, Taipei realtime clock and original HUD, untouched by sample furniture interaction',()=>{
  const home=startAndSelect('warehouse');
  home.mode='adventure';
  const actions=[
   {type:'SHELTER_DEMO_ADD_NEXT'} as const,
   {type:'SHELTER_DEMO_TOGGLE',furnitureId:'computer'} as const,
   {type:'SHELTER_DEMO_SET_ORDER',order:['computer']} as const
  ];
  for(const a of actions)expect(gameReducer(home,a)).toBe(home);
  const app=source('src/app/App.tsx');
  const frame=source('src/components/Frame.tsx');
  expect(app).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
  expect(app).toContain('<Route path="/world-map"');
  expect(frame).toContain('<GameFeedback/>');
  expect(frame).toContain('<GameUtilities className="game-utilities--dock"/>');
  expect(source('src/app/GameContext.tsx')).toContain("if(action.type!=='WORLD_CLOCK_SYNC')");
  expect(source('src/game/engine/resolve.ts')).toContain("if(action.type==='WORLD_CLOCK_SYNC')");
 });
 it('exposes a keyboard/touch-accessible explicit facility index and clears stale selection on removal',()=>{
  const home=source('src/features/shelter/ShelterHomePage.tsx');
  expect(home).toContain('data-facility-access={id}');
  expect(home).toContain('aria-pressed={activeSelected===id}');
  expect(home).toContain('onClick={()=>onInspect(id)}');
  expect(home).toContain('setSelectedId(previous=>previous&&!installed.has(previous)?null:previous)');
  expect(home).toContain('owned.length>0&&<section');
  const scene=source('src/features/shelter/ShelterScene.tsx');
  expect(scene).toContain("target.closest('[data-furniture-marker]')");
  expect(scene).toContain('onClick={event=>{event.stopPropagation();onSelect?.(layer.id)}}');
  expect(source('src/features/shelter/ShelterFacilityPanel.tsx')).toContain('aria-label="關閉設施資訊"');
 });
 it('has focused RWD CSS contracts for all five widths, short landscape and reduced-motion',()=>{
  const css=source('src/styles/_v0841-shelter-integration.scss');
  const oldCss=source('src/styles/_v0837-onboarding.scss');
  expect(css).toContain('min-height:44px');
  expect(css).toContain('touch-action:manipulation');
  expect(css).toContain('@media(max-width:320px)');
  expect(css).toContain('@media(max-width:390px)');
  expect(oldCss).toContain('@media(max-width:340px)');
  expect(css).toContain('@media(min-width:720px)');
  expect(css).toContain('@media(max-height:520px)');
  expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  expect(source('src/styles/main.scss').trimEnd()).toMatch(/@import "v0841-shelter-integration";$/);
  expect(JSON.parse(source('package.json')).version).toBe('0.8.41');
  expect(JSON.parse(source('package-lock.json')).packages[''].version).toBe('0.8.41');
  expect(source('src/app/BootSplash.tsx')).toContain('position'); // test CSS below is the authority for full-screen coverage
  expect(source('src/styles/_v0836-boot-splash.scss')).toContain('position:fixed;inset:0');
 });
});
