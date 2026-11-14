import {afterEach,describe,expect,it,vi} from 'vitest';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {gameReducer} from '../src/game/engine/resolve';
import {makeInitialState} from '../src/game/state/initial';
import {loadGame,saveGame} from '../src/game/state/storage';
import {getWarehouseFurnitureLayers,getWarehouseVisualMode,normalizeShelterOwned,WAREHOUSE_LAYOUT,WAREHOUSE_STAGE,SHELTER_FURNITURE_IDS} from '../src/game/engine/shelterVisuals';
import {SHELTER_OPTIONS} from '../src/game/engine/onboarding';
import ShelterScene from '../src/features/shelter/ShelterScene';
import type {ShelterFurnitureId} from '../src/game/types';

const file=(p:string)=>readFileSync(new URL('../'+p,import.meta.url));
const src=(p:string)=>file(p).toString('utf8');
afterEach(()=>vi.unstubAllGlobals());

describe('v0.8.38: exact designer assets, shelter home and saved furniture ownership',()=>{
 it('ships both original 768×1376 scenes and all eight original PNGs unmodified',()=>{
  const expected:Record<string,string>={
   'background_empty.jpg':'582daa21c4902c4387fdc49f425441fed1491b557f0b4594c13ff3cc2cd1309a',
   'background_full.jpg':'8fe210d75125a343f59964f965194c7508a5fdf66fbdff27f439595d2e4aadb5',
   'bed.png':'e525c82d0f06b4000a9111d74eeb6e7609e72903efe1457355f277b52f18944f',
   'storage.png':'b3d36454e404677f36deda1ab855820a4b7fc933757e26d39aff12b3715c3af4',
   'workbench.png':'50e0bce6da084ed8e2f91f6ac5b1366528c556d67fa60d322732b9e9efa4ee40',
   'radio.png':'419126cff120eb7b71769d6dcdb6ad3627ac26acc8b7445043c5cd7997aa42c2',
   'board.png':'620f5b6a7f1cbb93a1f4c13057569e4dbb38b70492f6ecdf24ebb4e525dc8f03',
   'generator.png':'a8c2c018817c4f347fe1acc26dc4a0e6868856e3a20a05aacb24304061336faf',
   'cooking.png':'34313802346f1b098e8c309631f940671eef0cd4b42a2d5ceef5d943bd92b511', 
   'computer.png':'1ba16a0797c8b6ccbe5f14d01d1051bf03aaa9c078fec854165f980c7375037a',
  };
  // SHA-256 guard detects accidental recompression or altered alpha/shadow pixels.
  for(const [filename,sha] of Object.entries(expected)){
   expect(createHash('sha256').update(file('public/assets/shelter/warehouse/'+filename)).digest('hex')).toBe(sha);
  }
 });
 it('preserves exact user JSON stage and all x/y/scale/rotation/opacity/z slots including negatives',()=>{
  expect(WAREHOUSE_STAGE).toEqual({width:768,height:1376});
  expect(WAREHOUSE_LAYOUT.shelter).toBe('warehouse');
  expect(SHELTER_FURNITURE_IDS).toEqual(['bed','storage','workbench','radio','board','generator','cooking','computer']);
  const expected={
   bed:[-23,695,.205,20],storage:[135,547,.274,10],workbench:[327,631,.23,30],
   radio:[0,543,.655,40],board:[576,572,.22,15],generator:[504,738,.155,50],
   cooking:[-52,789,.4,60],computer:[442,736,.425,70]
  };
  for(const [id,values] of Object.entries(expected)){
   const lay=WAREHOUSE_LAYOUT.assets[id as ShelterFurnitureId];
   expect([lay.x,lay.y,lay.scale,lay.z]).toEqual(values);
   expect([lay.rotation,lay.opacity]).toEqual([0,1]);
  }
  // The user's updated cooking PNG is 914×1225, not the former 896×1200 editor canvas.
  // A wrong canvas dimension visibly shifts its calibrated 768×1376 placement.
  const cookingAsset=file('public/assets/shelter/warehouse/cooking.png');
  expect([cookingAsset.readUInt32BE(16),cookingAsset.readUInt32BE(20)]).toEqual([914,1225]);
  const cookingLayer=getWarehouseFurnitureLayers(['cooking'])[0];
  expect([cookingLayer.width,cookingLayer.height]).toEqual([914,1225]);
  expect(cookingLayer.widthPct).toBeCloseTo(914*.4/768*100);
  expect(cookingLayer.heightPct).toBeCloseTo(1225*.4/1376*100);
  const bed=getWarehouseFurnitureLayers(['bed'])[0];
  const cooking=getWarehouseFurnitureLayers(['cooking'])[0];
  expect(bed.leftPct).toBeCloseTo(-23/768*100);
  expect(cooking.leftPct).toBeCloseTo(-52/768*100);
  expect(bed.widthPct).toBeCloseTo(1200*.205/768*100);
  expect(getWarehouseFurnitureLayers(['computer'])[0].heightPct).toBeCloseTo(1376*.425/1376*100);
 });
 it('treats the editor JSON owned=[] as demo only; a new game actually begins empty',()=>{
  expect(WAREHOUSE_LAYOUT.owned).toHaveLength(8);
  expect(makeInitialState().shelterOwned).toEqual([]);
  expect(getWarehouseVisualMode(makeInitialState().shelterOwned)).toBe('empty');
  expect(normalizeShelterOwned(undefined)).toEqual([]);
  expect(normalizeShelterOwned(['bed','bed','hack','computer'])).toEqual(['bed','computer']);
 });
 it('uses clean full JPEG only when ALL eight unique furniture items are owned',()=>{
  const all=[...SHELTER_FURNITURE_IDS];
  expect(getWarehouseVisualMode([])).toBe('empty');
  expect(getWarehouseVisualMode(['computer'])).toBe('layers');
  expect(getWarehouseVisualMode(all.slice(0,7))).toBe('layers');
  expect(getWarehouseVisualMode([...all,...all,'invalid'])).toBe('full');
  expect(getWarehouseVisualMode(new Array(8).fill('bed'))).toBe('layers');
  const allMarkup=renderToStaticMarkup(createElement(ShelterScene,{owned:all}));
  expect(allMarkup).toContain('background_full.jpg');
  expect(allMarkup).not.toContain('shelter-scene__furniture');
  const emptyMarkup=renderToStaticMarkup(createElement(ShelterScene,{owned:[]}));
  expect(emptyMarkup).toContain('background_empty.jpg');
  expect(emptyMarkup).not.toContain('shelter-scene__furniture');
 });
 it('layers use calibrated slots sorted by z and are independent of purchase order',()=>{
  const one=getWarehouseFurnitureLayers(['bed','radio','generator','board']);
  const two=getWarehouseFurnitureLayers(['radio','board','bed','generator']);
  expect(one).toEqual(two);
  expect(one.map(x=>x.id)).toEqual(['board','bed','radio','generator']);
  expect(one.map(x=>x.z)).toEqual([15,20,40,50]);
  const html=renderToStaticMarkup(createElement(ShelterScene,{owned:['radio','bed','board']}));
  expect(html).toContain('background_empty.jpg');
  expect(html).toContain('radio.png');
  expect(html).toContain('bed.png');
  expect(html).toContain('board.png');
  expect(html).not.toContain('background_full.jpg');
  expect((html.match(/shelter-scene__furniture/g)||[])).toHaveLength(3);
 });
 it('preserves acquired items on profession change, old-save migration and reload',()=>{
  const before=makeInitialState();
  before.onboarding={phase:'complete',shelter:'warehouse',storyPage:2,tutorialStep:2};
  before.shelterOwned=['radio','bed'];
  const after=gameReducer(before,{type:'SELECT_PROFESSION',profession:'courier'});
  expect(after.shelterOwned).toEqual(['bed','radio']);
  expect(after.onboarding.shelter).toBe('warehouse');
  const entries=new Map<string,string>();
  vi.stubGlobal('localStorage',{getItem:(k:string)=>entries.get(k)??null,setItem:(k:string,v:string)=>entries.set(k,v)});
  expect(saveGame(after)).toBe(true);
  expect(loadGame().shelterOwned).toEqual(['bed','radio']);
  const old=JSON.parse(JSON.stringify(after));
  delete old.shelterOwned;
  entries.set('ember-chronicles-prototype-v1',JSON.stringify(old));
  const migrated=loadGame();
  expect(migrated.shelterOwned).toEqual([]);
  expect(migrated.onboarding.shelter).toBe('warehouse');
  expect(migrated.profession).toBe('courier');
 });
 it('makes selected apartment/bunker distinct missing-image placeholders, never warehouse artwork',()=>{
  expect(SHELTER_OPTIONS.map(s=>s.id)).toEqual(['warehouse','apartment','bunker']);
  const home=src('src/features/shelter/ShelterHomePage.tsx');
  expect(home).toContain("<ShelterPlaceholder shelterId={shelterId}/>");
  expect(home).toContain("shelterId==='warehouse'");
  expect(home).toContain('不會以廢棄倉庫圖片代替');
  const route=src('src/app/App.tsx');
  expect(route).toContain('path="/" element={<HomePage/>}');
  expect(route).toContain('path="/world-map"');
  expect(route).toContain('<ChapterMapPage/>');
  expect(src('src/features/chapter/HomePage.tsx')).toContain('<ShelterHomePage/>');
  expect(src('src/components/Frame.tsx')).toContain("location.pathname==='/world-map'");
  expect(home).toContain('import.meta.env.DEV');
  expect(src('src/styles/main.scss').trimEnd()).toMatch(/@import "v0839-shelter-build";$/);
 });
 it('does not implement future purchase commands or alter the HUD/mission route',()=>{
  const game=src('src/game/engine/resolve.ts');
  expect(game).not.toContain("type:'SHELTER_PURCHASE'");
  expect(src('src/app/App.tsx')).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
  expect(src('src/components/Frame.tsx')).toContain('<GameFeedback/>');
  expect(JSON.parse(src('package.json')).version).toBe('0.8.39');
  expect(JSON.parse(src('package-lock.json')).packages[''].version).toBe('0.8.39');
 });
});
