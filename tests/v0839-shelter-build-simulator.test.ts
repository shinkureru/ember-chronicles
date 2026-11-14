import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {loadGame,saveGame} from '../src/game/state/storage';
import {DEFAULT_SHELTER_BUILD_ORDER,normalizeShelterBuildOrder,nextShelterBuildItem,randomShelterBuildOrder} from '../src/game/engine/shelterBuild';
import {getWarehouseFurnitureLayers,getWarehouseVisualMode,SHELTER_FURNITURE_IDS,WAREHOUSE_LAYOUT} from '../src/game/engine/shelterVisuals';
import {SHELTER_DEMO_STEP_MS} from '../src/features/shelter/ShelterBuildDemoPanel';
import type {GameState,ShelterFurnitureId,ShelterId} from '../src/game/types';
const source=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const asShelter=(id:ShelterId='warehouse')=>{
 const s=makeInitialState('journalist');
 s.onboarding={phase:'complete',storyPage:2,tutorialStep:2,shelter:id};
 return s;
};
const stripBuild=(s:GameState)=>{
 const {shelterOwned:_owned,shelterBuildOrder:_order,...rest}=s;
 return rest;
};
afterEach(()=>vi.unstubAllGlobals());

describe('v0.8.39 — prototype furniture purchase, animations and persistence',()=>{
 it('has one stable ID sequence; no initial owned furniture and no arbitrary layout edits',()=>{
  expect([...DEFAULT_SHELTER_BUILD_ORDER]).toEqual([...SHELTER_FURNITURE_IDS]);
  expect(makeInitialState().shelterOwned).toEqual([]);
  expect(makeInitialState().shelterBuildOrder).toEqual([...SHELTER_FURNITURE_IDS]);
  expect(WAREHOUSE_LAYOUT.stage).toEqual({width:768,height:1376});
  expect(WAREHOUSE_LAYOUT.assets.bed.x).toBe(-23);
  expect(WAREHOUSE_LAYOUT.assets.cooking.x).toBe(-52);
 });
 it('sanitizes old/invalid orders, duplicates and missing IDs without ever dropping a furniture type',()=>{
  expect(normalizeShelterBuildOrder(null)).toEqual(SHELTER_FURNITURE_IDS);
  expect(normalizeShelterBuildOrder('random')).toEqual(SHELTER_FURNITURE_IDS);
  expect(normalizeShelterBuildOrder(['computer','computer',123,'unknown','bed','radio']).slice(0,3))
   .toEqual(['computer','bed','radio']);
  expect(new Set(normalizeShelterBuildOrder(['computer','bed'])).size).toBe(8);
  expect(normalizeShelterBuildOrder(['computer','bed']).length).toBe(8);
 });
 it('Fisher-Yates can create reproducible purchase orders without altering the game random seed',()=>{
  const a=randomShelterBuildOrder(()=>0);
  const b=randomShelterBuildOrder(()=>0);
  const c=randomShelterBuildOrder(()=>.999999);
  expect(a).toEqual(b);
  expect(c).toEqual(SHELTER_FURNITURE_IDS);
  expect(a).not.toEqual(c);
  expect([...a].sort()).toEqual([...SHELTER_FURNITURE_IDS].sort());
  expect(randomShelterBuildOrder(()=>NaN)).toEqual(a);
 });
 it('purchases next furniture by persisted order and never charges coins/food/stamina/XP',()=>{
  const original=asShelter();
  original.shelterBuildOrder=['computer','bed','radio','board','generator','storage','cooking','workbench'];
  let s=original;
  expect(nextShelterBuildItem(s.shelterOwned,s.shelterBuildOrder)).toBe('computer');
  s=gameReducer(s,{type:'SHELTER_DEMO_ADD_NEXT'});
  expect(s.shelterOwned).toEqual(['computer']);
  expect(nextShelterBuildItem(s.shelterOwned,s.shelterBuildOrder)).toBe('bed');
  const s2=gameReducer(s,{type:'SHELTER_DEMO_ADD_NEXT'});
  expect(s2.shelterOwned).toEqual(['bed','computer']); // stable canonical ID order, not acquisition order
  expect(stripBuild(s2)).toEqual(stripBuild(original));
  expect(original.shelterOwned).toEqual([]);
 });
 it('builds all 8 items sequentially, then automatically displays the clean full-quality scene',()=>{
  const order=['computer','radio','bed','board','cooking','workbench','storage','generator'];
  let s=gameReducer(asShelter(),{type:'SHELTER_DEMO_SET_ORDER',order});
  expect(s.shelterBuildOrder).toEqual(order);
  for(let n=1;n<=8;n++){
   const next=nextShelterBuildItem(s.shelterOwned,s.shelterBuildOrder);
   expect(next).not.toBeNull();
   s=gameReducer(s,{type:'SHELTER_DEMO_ADD_NEXT'});
   expect(s.shelterOwned).toHaveLength(n);
   expect(getWarehouseVisualMode(s.shelterOwned)).toBe(n===8?'full':'layers');
  }
  expect(getWarehouseVisualMode(s.shelterOwned)).toBe('full');
  expect(nextShelterBuildItem(s.shelterOwned,s.shelterBuildOrder)).toBeNull();
  expect(gameReducer(s,{type:'SHELTER_DEMO_ADD_NEXT'})).toBe(s);
  expect(stripBuild(s)).toEqual(stripBuild(asShelter()));
 });
 it('supports manually toggling any individual furniture on or off without prerequisites',()=>{
  let s=asShelter();
  s=gameReducer(s,{type:'SHELTER_DEMO_TOGGLE',furnitureId:'computer'});
  expect(s.shelterOwned).toEqual(['computer']);
  s=gameReducer(s,{type:'SHELTER_DEMO_TOGGLE',furnitureId:'bed'});
  expect(s.shelterOwned).toEqual(['bed','computer']);
  s=gameReducer(s,{type:'SHELTER_DEMO_TOGGLE',furnitureId:'computer'});
  expect(s.shelterOwned).toEqual(['bed']);
  expect(gameReducer(s,{type:'SHELTER_DEMO_TOGGLE',furnitureId:'fake_unsafe_item'})).toBe(s);
 });
 it('rerolling purchase order preserves already owned items, including a computer-first playthrough',()=>{
  let s=gameReducer(asShelter(),{type:'SHELTER_DEMO_TOGGLE',furnitureId:'computer'});
  const previous=stripBuild(s);
  const newOrder=['cooking','radio','bed','computer','generator','board','workbench','storage'];
  s=gameReducer(s,{type:'SHELTER_DEMO_SET_ORDER',order:newOrder});
  expect(s.shelterOwned).toEqual(['computer']);
  expect(s.shelterBuildOrder).toEqual(newOrder);
  expect(nextShelterBuildItem(s.shelterOwned,s.shelterBuildOrder)).toBe('cooking');
  expect(stripBuild(s)).toEqual(previous);
  expect(gameReducer(s,{type:'SHELTER_DEMO_SET_ORDER',order:newOrder})).toBe(s);
 });
 it('can set random 3/5/0/8 subsets, then clear just furniture, without touching other game state',()=>{
  const original=asShelter();
  const order=randomShelterBuildOrder(()=>0);
  for(const n of [0,3,5,8]){
   const s=gameReducer(original,{type:'SHELTER_DEMO_SET_OWNED',owned:order.slice(0,n),order});
   expect(s.shelterOwned).toHaveLength(n);
   expect(s.shelterBuildOrder).toEqual(order);
   expect(stripBuild(s)).toEqual(stripBuild(original));
   const cleared=gameReducer(s,{type:'SHELTER_DEMO_SET_OWNED',owned:[]});
   expect(cleared.shelterOwned).toEqual([]);
   expect(cleared.onboarding.shelter).toBe('warehouse');
   expect(cleared.economy.coins).toBe(original.economy.coins);
   expect(cleared.warehouse).toEqual(original.warehouse);
  }
  const malformed=gameReducer(original,{type:'SHELTER_DEMO_SET_OWNED',owned:['bed','bed','not_a_furniture','computer']});
  expect(malformed.shelterOwned).toEqual(['bed','computer']);
 });
 it('renders identical visual layout for all acquisition histories with the same eight IDs',()=>{
  const first=['computer','board','bed','radio'];
  const second=['radio','bed','computer','board'];
  expect(getWarehouseFurnitureLayers(first)).toEqual(getWarehouseFurnitureLayers(second));
  expect(getWarehouseFurnitureLayers(first).map(x=>x.id)).toEqual(['board','bed','radio','computer']);
  expect(getWarehouseVisualMode(first)).toBe('layers');
 });
 it('does not run prototype mutations during a mission, before onboarding or without a shelter',()=>{
  const actions=[
   {type:'SHELTER_DEMO_SET_ORDER',order:['computer']},
   {type:'SHELTER_DEMO_ADD_NEXT'},
   {type:'SHELTER_DEMO_TOGGLE',furnitureId:'bed'},
   {type:'SHELTER_DEMO_SET_OWNED',owned:['bed']}
  ] as const;
  const intro=makeInitialState();
  const withoutShelter=makeInitialState('journalist');
  const mission=asShelter();
  mission.mode='adventure';
  for(const action of actions){
   expect(gameReducer(intro,action)).toBe(intro);
   expect(gameReducer(withoutShelter,action)).toBe(withoutShelter);
   expect(gameReducer(mission,action)).toBe(mission);
  }
 });
 it('allows visiting warehouse prototype from apartment/bunker without changing selected shelter',()=>{
  for(const id of ['apartment','bunker'] as const){
   let s=asShelter(id);
   s=gameReducer(s,{type:'SHELTER_DEMO_SET_OWNED',owned:['computer','bed']});
   expect(s.onboarding.shelter).toBe(id);
   expect(s.shelterOwned).toEqual(['bed','computer']);
   const next=gameReducer(s,{type:'SHELTER_DEMO_ADD_NEXT'});
   expect(next.onboarding.shelter).toBe(id);
   expect(next.shelterOwned).toHaveLength(3);
  }
 });
 it('loads old v0.8.38 saves with a valid default build queue and retains all other progress',()=>{
  let raw=JSON.parse(JSON.stringify(asShelter())) as Record<string,unknown>;
  delete raw.shelterBuildOrder;
  raw.shelterOwned=['radio','computer'];
  (raw.economy as Record<string,unknown>).coins=420;
  const values=new Map([['ember-chronicles-prototype-v1',JSON.stringify(raw)]]);
  vi.stubGlobal('localStorage',{
   getItem:(k:string)=>values.get(k)??null,
   setItem:(k:string,v:string)=>{values.set(k,v)}
  });
  const migrated=loadGame();
  expect(migrated.shelterBuildOrder).toEqual([...SHELTER_FURNITURE_IDS]);
  expect(migrated.shelterOwned).toEqual(['radio','computer']);
  expect(migrated.economy.coins).toBe(420);
  expect(migrated.onboarding.shelter).toBe('warehouse');
  expect(saveGame(migrated)).toBe(true);
  expect(loadGame().shelterBuildOrder).toEqual([...SHELTER_FURNITURE_IDS]);
 });
 it('preserves chosen route and furniture on profession choice; keeps build order after save/reload',()=>{
  const before=makeInitialState();
  before.onboarding={phase:'complete',shelter:'warehouse',storyPage:2,tutorialStep:2};
  before.shelterBuildOrder=['computer','bed','radio','board','generator','storage','cooking','workbench'];
  before.shelterOwned=['computer'];
  const next=gameReducer(before,{type:'SELECT_PROFESSION',profession:'courier'});
  expect(next.onboarding.shelter).toBe('warehouse');
  expect(next.shelterOwned).toEqual(['computer']);
  expect(next.shelterBuildOrder).toEqual(before.shelterBuildOrder);
  expect(next.profession).toBe('courier');
  const map=new Map<string,string>();
  vi.stubGlobal('localStorage',{getItem:(key:string)=>map.get(key)??null,setItem:(key:string,val:string)=>map.set(key,val)});
  expect(saveGame(next)).toBe(true);
  expect(loadGame().shelterOwned).toEqual(['computer']);
  expect(loadGame().shelterBuildOrder).toEqual(before.shelterBuildOrder);
 });
 it('keeps visible prototype tools in published GitHub Pages and provides stop-safe animation',()=>{
  const ui=source('src/features/shelter/ShelterBuildDemoPanel.tsx');
  const home=source('src/features/shelter/ShelterHomePage.tsx');
  const styles=source('src/styles/_v0839-shelter-build.scss');
  expect(SHELTER_DEMO_STEP_MS).toBeGreaterThanOrEqual(550);
  expect(SHELTER_DEMO_STEP_MS).toBeLessThanOrEqual(1500);
  expect(ui).toContain('window.setTimeout');
  expect(ui).toContain('window.clearTimeout');
  expect(ui).toContain('data-prototype-only="true"');
  // Comments can name the DEV flag; the rendered component must not be guarded by it.
  expect(ui).not.toMatch(/\{\s*import\.meta\.env\.DEV\s*&&\s*<section/);
  expect(ui).toContain('export default function ShelterBuildDemoPanel()');
  expect(ui).toContain('SHELTER_DEMO_ADD_NEXT');
  expect(ui).toContain('隨機 0～8 件');
  expect(ui).toContain('一鍵滿配');
  expect(ui).toContain('清空家具');
  expect(home).toContain('previewWarehouse');
  expect(home).toContain('預覽倉庫家具建設');
  expect(home).toContain("shelterId==='warehouse'||previewWarehouse");
  expect(home).toContain('<ShelterBuildDemoPanel/>');
  expect(styles).toContain('shelter-furniture-reveal');
  expect(styles).toContain('prefers-reduced-motion:reduce');
  expect(styles).toContain('max-width:360px');
  expect(source('src/styles/main.scss').trimEnd()).toMatch(/@import "v0840-shelter-interactions";$/);
  expect(JSON.parse(source('package.json')).version).toBe('0.8.40');
  expect(JSON.parse(source('package-lock.json')).packages[''].version).toBe('0.8.40');
 });
});
