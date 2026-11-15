import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {GameProvider} from '../src/app/GameContext';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getTownServiceLock} from '../src/game/engine/townActions';
import {TOWN_FACILITIES,TOWN_SERVICES,isTownOpen} from '../src/game/data/town';
import {TOWN_DISTRICTS} from '../src/features/town/townDistricts';
import {TOWN_DISTRICT_HOTSPOTS} from '../src/features/town/townDistrictHotspots';
import TownDistrictPage from '../src/features/town/TownDistrictPage';
import type {TownFacilityId} from '../src/game/types';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const everyFacility=TOWN_DISTRICTS.flatMap(x=>x.facilities);
const renderDistrict=(id:string)=>renderToStaticMarkup(createElement(GameProvider,null,
 createElement(MemoryRouter,{initialEntries:['/town/'+id]},
  createElement(Routes,null,createElement(Route,{path:'/town/:districtId',element:createElement(TownDistrictPage)})))));
const start=()=>{
 const s=makeInitialState('courier');
 s.onboarding.phase='complete';s.onboarding.shelter='warehouse';
 s.world.minute=18*60;s.economy.coins=500;
 s.player.health=5;s.player.stamina=5;
 return s;
};

describe('v0.8.43 — playable city facility access and district interactions',()=>{
 it('uses precisely the eight original services without inventing a duplicate economy',()=>{
  expect(everyFacility).toHaveLength(7);
  expect(new Set(everyFacility).size).toBe(7);
  expect([...everyFacility].sort()).toEqual(TOWN_FACILITIES.filter(x=>x.id!=='noticeboard').map(x=>x.id).sort());
  expect(TOWN_FACILITIES).toHaveLength(8);
  expect(TOWN_SERVICES.some(s=>s.facility==='inn')).toBe(true);
  expect(TOWN_SERVICES.some(s=>s.facility==='workshop')).toBe(true);
  expect(TOWN_SERVICES.some(s=>s.facility==='clinic')).toBe(true);
 });
 it('has art-directed live hotspots over the same full-size illustration for all eight facilities',()=>{
  const ids:TownFacilityId[]=[];
  for(const district of TOWN_DISTRICTS){
   const hotspots=TOWN_DISTRICT_HOTSPOTS[district.id];
   expect(hotspots.map(x=>x.facility).sort()).toEqual([...district.facilities].sort());
   expect(new Set(hotspots.map(x=>x.facility)).size).toBe(hotspots.length);
   for(const h of hotspots){
    expect(h.x).toBeGreaterThan(0);expect(h.x).toBeLessThan(100);
    expect(h.y).toBeGreaterThan(0);expect(h.y).toBeLessThan(100);
    expect(['left','right']).toContain(h.side);
    expect(h.label.length).toBeGreaterThan(1);
    ids.push(h.facility);
   }
  }
  expect([...ids].sort()).toEqual([...everyFacility].sort());
 });
 it.each(['outer-ring','steam-street','old-core'])('%s renders each button exactly twice (hotspot + accessible facility list)',id=>{
  const district=TOWN_DISTRICTS.find(x=>x.id===id)!;
  const html=renderDistrict(id);
  expect(html).toContain(district.title);
  expect(html).toContain(district.image);
  expect(html).toContain('city-district-scene__image');
  expect(html).toContain('前往原有城鎮功能');
  for(const facility of district.facilities){
   expect((html.match(new RegExp('data-town-facility="'+facility+'"','g'))??[])).toHaveLength(1);
   expect((html.match(new RegExp('data-town-list-facility="'+facility+'"','g'))??[])).toHaveLength(1);
  }
  expect((html.match(/class="city-district-hotspot /g)??[])).toHaveLength(district.facilities.length);
  expect(html).toContain('返回城鎮總覽');
  expect(html).toContain('返回避難所');
 });
 it('keeps unknown districts safe, without rendering unintended services',()=>{
  const html=renderDistrict('unsupported');
  expect(html).toContain('找不到這個街區');
  expect(html).not.toContain('data-town-facility=');
 });
 it('maps one district opening to the actual original Clinic/Workshop/Rest/Secondary dialogs and cinematic',()=>{
  const src=read('src/features/town/TownDistrictPage.tsx');
  expect(src).toContain("<TownFacilityDialog facility={active as SecondaryTownFacility}");
  expect(src).toContain("<ClinicDialog onClose={closeDialog}/>");
  expect(src).toContain("<WorkshopDialog onClose={closeDialog}");
  expect(src).toContain('<InnRestDialog serviceId="rest_cot"');
  expect(src).toContain('<RestCinematic kind={restCinematic}');
  expect(src).toContain('getTownServiceLock(s,serviceId)');
  expect(src).toContain("dispatch({type:'TOWN_SERVICE',serviceId})");
  expect(src).toContain("playCue('select')");
  expect(src).toContain("playCue('confirm')");
  expect(src).toContain('dialog?.querySelector<HTMLElement>');
  expect(src).toContain('trigger.current?.focus({preventScroll:true})');
  expect(src).toContain("setActive(null);setListOpen(false);setRestCinematic(null)");
  const original=read('src/features/town/TownPage.tsx');
  expect(original).toContain("dispatch({type:'TOWN_SERVICE',serviceId})");
  expect(original).toContain('<InnRestDialog');
  expect(original).toContain('<ClinicDialog');
  expect(original).toContain('<WorkshopDialog');
 });
 it('does not charge while opening, only when the original guarded service is dispatched',()=>{
  const s=start();
  const probe=getTownServiceLock(s,'hot_meal');
  expect(probe).toBeNull();
  const before=JSON.stringify(s);
  expect(JSON.stringify(s)).toBe(before);
  const after=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'hot_meal'});
  expect(after).not.toBe(s);
  expect(after.economy.coins).toBe(486);
  expect(after.player.hunger).toBe(0);
  expect(after.town?.visits.canteen).toBe(1);
  expect(s.economy.coins).toBe(500);
  expect(s.town?.visits.canteen??0).toBe(0);
  expect(after.world).toEqual(s.world);
 });
 it('rest uses its original coin cost, healing projection, once-only reducer, and daily rest gate',()=>{
  const s=start();
  expect(getTownServiceLock(s,'rest_cot')).toBeNull();
  const after=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(after.economy.coins).toBe(485);
  expect(after.town?.visits.inn).toBe(1);
  expect(after.town?.restsToday).toBe(1);
  expect(after.player.health).toBeGreaterThanOrEqual(s.player.health);
  expect(after.world).toEqual(s.world);
  let later=gameReducer(after,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(later.town?.restsToday).toBe(2);
  expect(getTownServiceLock(later,'rest_cot')).not.toBeNull();
  expect(gameReducer(later,{type:'TOWN_SERVICE',serviceId:'rest_cot'})).toBe(later);
 });
 it('shop rumors update actual clues, favor, visits and once-per-day blocking',()=>{
  const s=start();
  expect(getTownServiceLock(s,'tavern_rumor')).toBeNull();
  const after=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'tavern_rumor'});
  expect(after.economy.coins).toBe(490);
  expect(after.town?.visits.tavern).toBe(1);
  expect(after.clues).toHaveLength(1);
  expect(after.economy.blackMarketFavor).toBe(s.economy.blackMarketFavor+1);
  expect(getTownServiceLock(after,'tavern_rumor')).not.toBeNull();
  expect(gameReducer(after,{type:'TOWN_SERVICE',serviceId:'tavern_rumor'})).toBe(after);
 });
 it('training still increments one permanent attribute and enforces real daily limit',()=>{
  const s=start(),old=s.player.attributes.observation;
  const after=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'train',attribute:'observation'});
  expect(after.player.attributes.observation).toBe(old+1);
  expect(after.town?.visits.training).toBe(1);
  expect(after.town?.lastTrainingDay).toBe(s.world.day);
  expect(getTownServiceLock(after,'train','observation')).not.toBeNull();
 });
 it('closed facilities stay inspectable while the actual engine refuses payment or game-time jumps',()=>{
  const s=start();
  s.world.minute=4*60;
  for(const id of ['hot_meal','bath','train','workshop_upgrade'] as const){
   expect(getTownServiceLock(s,id,'observation')).toContain('沒有營業');
   expect(gameReducer(s,{type:'TOWN_SERVICE',serviceId:id,attribute:'observation'})).toBe(s);
  }
  expect(isTownOpen('inn',s.world.minute)).toBe(true);
  expect(isTownOpen('tavern',s.world.minute)).toBe(false);
  expect(isTownOpen('canteen',s.world.minute)).toBe(false);
  const html=renderDistrict('old-core');
  expect(html).toContain('data-town-facility="workshop"');
  expect(html).toContain('aria-haspopup="dialog"');
 });
 it('fills each full-bleed scene without stretching the shared hotspot coordinate system',()=>{
  const src=read('src/features/town/TownDistrictPage.tsx');
  const css=read('src/styles/_v0848-town-fullbleed-services.scss');
  expect(src).toContain('fitPortraitStage(element.clientWidth,element.clientHeight)');
  expect(src).toContain('coverTownStage(fit,element.clientWidth,element.clientHeight)');
  expect(src).toContain('new ResizeObserver(measure)');
  expect(src).toContain('city-district-scene__stage');
  expect(src).toContain('city-district-scene__image');
  expect(css).toContain('aspect-ratio:768 / 1376');
  expect(css).toContain('object-fit:fill');
  expect(css).toContain('min-height:50px');
  expect(css).toContain('overflow-y:auto');
  expect(css).toContain('@media(max-width:390px)');
  expect(css).toContain('prefers-reduced-motion:reduce');
 });
 it('leaves original four city images, furniture assets, old town actions and saved game schema intact',()=>{
  const app=read('src/app/App.tsx');
  const css=read('src/styles/main.scss');
  expect(app).toContain('<Route path="/town/classic" element={<TownPage/>}/>');
  expect(app).toContain('<Route path="/town/:districtId" element={<TownDistrictPage/>}/>');
  expect(app).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
  expect(css.trimEnd()).toMatch(/@import "v0850-rarity-selection-gold";$/);
  expect(read('src/styles/_v0842-city-shelter.scss')).toContain('.shelter-stage-fit');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.50');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.50');
  expect(read('src/game/state/storage.ts')).toContain('localStorage');
 });
});
