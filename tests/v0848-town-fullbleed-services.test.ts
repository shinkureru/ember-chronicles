import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {GameProvider} from '../src/app/GameContext';
import {PORTRAIT_ART_SIZE,fitPortraitStage} from '../src/components/ui/portraitStageFit';
import {coverTownStage} from '../src/features/town/townStageCover';
import {TOWN_DISTRICTS} from '../src/features/town/townDistricts';
import {TOWN_DISTRICT_HOTSPOTS} from '../src/features/town/townDistrictHotspots';
import {TOWN_DISTRICT_LIGHTS} from '../src/features/town/townDistrictLights';
import TownDistrictPage from '../src/features/town/TownDistrictPage';
import {TOWN_FACILITIES,TOWN_QUESTS,isTownOpen} from '../src/game/data/town';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getTownServiceLock} from '../src/game/engine/townActions';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const renderDistrict=(id:string)=>renderToStaticMarkup(createElement(GameProvider,null,
 createElement(MemoryRouter,{initialEntries:['/town/'+id]},
  createElement(Routes,null,createElement(Route,{path:'/town/:districtId',element:createElement(TownDistrictPage)})))));

describe('v0.8.48 — three full-bleed scenes, seven calibrated venues, nested noticeboard',()=>{
 it('uses accurate cover math for every aspect ratio without stretching image or hotspot space',()=>{
  expect(PORTRAIT_ART_SIZE).toEqual({width:768,height:1376});
  for(const [w,h] of [[320,568],[360,740],[390,844],[430,932],[468,680],[768,1376],[1200,700]]){
   const fit=fitPortraitStage(w,h)!;
   const cover=coverTownStage(fit,w,h)!;
   expect(cover).not.toBeNull();
   expect(cover.width).toBeGreaterThanOrEqual(w-1e-7);
   expect(cover.height).toBeGreaterThanOrEqual(h-1e-7);
   expect(cover.width/cover.height).toBeCloseTo(768/1376,10);
   expect(cover.width/fit.width).toBeCloseTo(cover.height/fit.height,10);
  }
  for(const bad of [0,-12,NaN,Infinity])expect(coverTownStage({width:768,height:1376},bad,640)).toBeNull();
  expect(coverTownStage({width:0,height:0},390,844)).toBeNull();
 });
 it('precisely projects the seven centers normalized from user yellow-dot references, never embedding marker screenshots',()=>{
  expect(TOWN_DISTRICTS.map(d=>d.id)).toEqual(['outer-ring','steam-street','old-core']);
  const expected={
   'outer-ring':[{facility:'inn',x:14.99,y:48.81}],
   'steam-street':[{facility:'laundry',x:20.8,y:44.21},{facility:'canteen',x:84.33,y:40.21}],
   'old-core':[
    {facility:'workshop',x:30.6,y:38.22},{facility:'clinic',x:17.8,y:55.1},
    {facility:'tavern',x:88.73,y:44.67},{facility:'training',x:76.77,y:59.4},
   ],
  };
  for(const district of TOWN_DISTRICTS){
   const points=TOWN_DISTRICT_HOTSPOTS[district.id];
   expect(points.map(p=>({facility:p.facility,x:p.x,y:p.y}))).toEqual(expected[district.id]);
   expect(points.map(p=>p.facility).sort()).toEqual([...district.facilities].sort());
   expect(TOWN_DISTRICT_LIGHTS[district.id].length).toBeGreaterThanOrEqual(7);
  }
  const all=TOWN_DISTRICTS.flatMap(d=>d.facilities);
  expect(all).toHaveLength(7);expect(new Set(all).size).toBe(7);
  expect(all).not.toContain('noticeboard');
  expect(TOWN_FACILITIES).toHaveLength(8);
  expect(TOWN_FACILITIES.some(f=>f.id==='noticeboard')).toBe(true);
  expect(read('src/features/town/townDistrictHotspots.ts')).toContain('NEVER bundled');
 });
 it('shows each original picture full bleed with 7 actual site buttons and a collapsed accessible backup list',()=>{
  for(const district of TOWN_DISTRICTS){
   const html=renderDistrict(district.id);
   expect(html).toContain('data-fullbleed-district="true"');
   expect(html).toContain(district.image);
   expect(html).toContain('city-district-scene__lights');
   expect((html.match(/data-town-facility="/g)??[])).toHaveLength(district.facilities.length);
   expect((html.match(/data-town-list-facility="/g)??[])).toHaveLength(district.facilities.length);
   expect(html).toContain('id="town-v0848-facility-list"');
   expect(html).toMatch(/id="town-v0848-facility-list"[^>]*hidden=""/);
   expect(html).toContain('aria-expanded="false"');
   expect(html).toContain('返回城鎮總覽');
   expect(html).toContain('返回避難所');
   expect(html).not.toContain('data-town-facility="noticeboard"');
  }
 });
 it('reuses real tavern rumor and noticeboard quests without new service/quest writes',()=>{
  const src=read('src/features/town/TownFacilityDialog.tsx');
  for(const part of [
   "facility==='tavern'&&tavernTab==='noticeboard'",
   'role="tablist"','role="tab"','aria-selected=',
   "showingQuests?<div className=\"town-v15__quests\"",
   'TOWN_QUESTS.map(quest=>',
   "'TOWN_ACCEPT_QUEST'","'TOWN_COMPLETE_QUEST'",
   'getTownServiceLock(s,serviceId,attribute)',
  ])expect(src).toContain(part);
  expect(TOWN_QUESTS.length).toBeGreaterThan(0);
  const old=makeInitialState('courier');
  old.mode='home';
  old.world.minute=18*60;
  old.economy.coins=300;
  expect(isTownOpen('noticeboard',old.world.minute)).toBe(true);
  expect(getTownServiceLock(old,'tavern_rumor')).toBeNull();
  const afterRumor=gameReducer(old,{type:'TOWN_SERVICE',serviceId:'tavern_rumor'});
  expect(afterRumor.economy.coins).toBe(290);
  expect(afterRumor.clues).toHaveLength(1);
  const afterAccept=gameReducer(old,{type:'TOWN_ACCEPT_QUEST',questId:TOWN_QUESTS[0]!.id});
  expect(afterAccept.town?.quests[TOWN_QUESTS[0]!.id]).toBe('accepted');
  expect(old.town?.quests[TOWN_QUESTS[0]!.id]).not.toBe('accepted');
  expect(read('src/features/town/TownPage.tsx')).toContain('noticeboard');
 });
 it('adds localized, varied lights with no replacement images, with low-motion, short-screen and focus guarantees',()=>{
  const css=read('src/styles/_v0848-town-fullbleed-services.scss');
  const scene=read('src/features/town/TownDistrictPage.tsx');
  for(const t of ['.city-district-page--v0848','.city-district-scene__stage','.city-district-scene__lights',
    '@keyframes v0848-district-glow','opacity:.54','transform:translate(-50%,-50%)',
    'prefers-reduced-motion:reduce','update:slow','forced-colors:active',
    'min-height:44px','overflow-y:auto','[hidden]{display:none!important',
    '.town-v0848-tavern-tabs'])expect(css).toContain(t);
  expect(scene).toContain('coverTownStage(fit,element.clientWidth,element.clientHeight)');
  expect(scene).toContain("getTownDistrictHotspots(district.id)");
  expect(scene).not.toContain('backgroundSize:');
  expect(css).not.toContain('url(');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0849-hud-liquid";$/);
 });
 it('keeps game save schema and original 14 asset checksums locked by previous regression',()=>{
  const previous=read('tests/v0846-urban-final-integration.test.ts');
  for(const asset of ['city-overview.webp','outer-ring.webp','steam-street.webp','old-core.webp',
   'background_empty.jpg','background_full.jpg','bed.png','computer.png'])expect(previous).toContain(asset);
  expect(read('src/game/state/storage.ts')).toContain('ember-chronicles-prototype-v1');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.49');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.49');
 });
});
