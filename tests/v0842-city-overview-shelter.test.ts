import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import TownDistrictPage from '../src/features/town/TownDistrictPage';
import {GameProvider} from '../src/app/GameContext';
import {CITY_OVERVIEW_IMAGE,TOWN_DISTRICTS,getTownDistrict,isTownDistrictId} from '../src/features/town/townDistricts';
import {TOWN_FACILITIES} from '../src/game/data/town';
import {getWarehouseVisualMode,SHELTER_FURNITURE_IDS} from '../src/game/engine/shelterVisuals';
import ShelterScene from '../src/features/shelter/ShelterScene';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const image=(name:string)=>readFileSync(new URL('../public/assets/town/'+name,import.meta.url));
const checkedImages:Record<string,string>={
 'city-overview.webp':'31f33e52a83cafc57da8dbceafef7481bc95d647aada102ebb65d8a1c78fcebf',
 'outer-ring.webp':'c11ea263d83d5f933b76b937b178ecee0e01db325db26a6390c380b222ac9271',
 'steam-street.webp':'17b3a7748add06f4bae74de29ffcb2880799ff6cdfa1169da2db2248f2226705',
 'old-core.webp':'f9b90839c705847d31de4dbc9d679c672aaef90f6cfff66eb03be446f5fee1b1'
};

describe('v0.8.42 batch 1 — town visual overview and one-viewport safehouse',()=>{
 it('defines three and only three explicitly ordered equal-area city zones',()=>{
  expect(TOWN_DISTRICTS).toHaveLength(3);
  expect(TOWN_DISTRICTS.map(x=>x.id)).toEqual(['outer-ring','steam-street','old-core']);
  expect(TOWN_DISTRICTS.map(x=>x.title)).toEqual(['外環高架區','蒸霧商街','舊城核心']);
  expect(TOWN_DISTRICTS.map(x=>x.number)).toEqual(['01','02','03']);
  for(const item of TOWN_DISTRICTS){
   expect(isTownDistrictId(item.id)).toBe(true);
   expect(getTownDistrict(item.id)).toEqual(item);
  }
  expect(isTownDistrictId('does-not-exist')).toBe(false);
  expect(getTownDistrict('does-not-exist')).toBeUndefined();
  expect(CITY_OVERVIEW_IMAGE).toBe('assets/town/city-overview.webp');
 });
 it('keeps ALL eight legacy facilities reachable during the staged town transition',()=>{
  const ids=TOWN_DISTRICTS.flatMap(x=>x.facilities);
  expect(ids).toHaveLength(8);
  expect(new Set(ids).size).toBe(8);
  expect([...ids].sort()).toEqual(TOWN_FACILITIES.map(x=>x.id).sort());
  expect(TOWN_DISTRICTS[0].facilities).toEqual(['inn','noticeboard']);
  expect(TOWN_DISTRICTS[1].facilities).toEqual(['laundry','canteen']);
  expect(TOWN_DISTRICTS[2].facilities).toEqual(['clinic','workshop','tavern','training']);
  expect(TOWN_DISTRICTS[0].facilityNames.at(-1)).toBe('尚未開放');
 });
 it('commits the four actual user image assets as verified nonempty WebP binary blobs',()=>{
  expect(Object.keys(checkedImages)).toHaveLength(4);
  for(const [name,sha] of Object.entries(checkedImages)){
   const binary=image(name);
   expect(binary.length).toBeGreaterThan(25000);
   expect(binary.toString('ascii',0,4)).toBe('RIFF');
   expect(binary.toString('ascii',8,12)).toBe('WEBP');
   expect(createHash('sha256').update(binary).digest('hex')).toBe(sha);
  }
  for(const district of TOWN_DISTRICTS){
   expect(checkedImages[district.image.replace('assets/town/','')]).toBeDefined();
  }
 });
 it('sets the overview as the /town entry while preserving all old real town dialogs at /town/classic',()=>{
  const app=read('src/app/App.tsx');
  expect(app).toContain('<Route path="/town" element={<TownOverviewPage/>}/>');
  expect(app).toContain('<Route path="/town/classic" element={<TownPage/>}/>');
  expect(app).toContain('<Route path="/town/:districtId" element={<TownDistrictPage/>}/>');
  expect(app).toContain('<Route path="/world-map"');
  expect(read('src/components/Frame.tsx')).toContain("location.pathname.startsWith('/town')?'town'");
  const overview=read('src/features/town/TownOverviewPage.tsx');
  expect(overview).toContain('data-town-district={d.id}');
  expect(overview).toContain('TOWN_DISTRICTS.map');
  expect(overview).toContain('/town/classic');
  expect(overview).toContain('city-overview-glass');
  expect(overview).not.toContain("type:'TOWN_SERVICE'");
 });
 it('renders all three accessible real-service district routes with stage art and return navigation',()=>{
  for(const x of TOWN_DISTRICTS){
   const html=renderToStaticMarkup(createElement(GameProvider,null,
    createElement(MemoryRouter,{initialEntries:['/town/'+x.id]},
     createElement(Routes,null,createElement(Route,{path:'/town/:districtId',element:createElement(TownDistrictPage)})))));
   expect(html).toContain(x.title);
   expect(html).toContain(x.image);
   expect(html).toContain('前往原有城鎮功能');
   expect(html).toContain('/town/classic');
   expect(html).toContain('返回城鎮總覽');
   expect(html).toContain('返回避難所');
  }
 });
 it('opens the real original eight-service dialogs instead of fake buttons',()=>{
  const district=read('src/features/town/TownDistrictPage.tsx');
  expect(district).toContain('onClick={event=>openFacility(id,event)}');
  expect(district).toContain('尚未開放');
  expect(district).toContain('已直接連接原有城鎮服務');
  expect(district).toContain("dispatch({type:'TOWN_SERVICE',serviceId})");
  expect(district).toContain('<TownFacilityDialog');
  expect(district).toContain('<ClinicDialog');
  expect(district).toContain('<WorkshopDialog');
  expect(district).toContain('<InnRestDialog');
  expect(district).toContain('<RestCinematic');
  const old=read('src/features/town/TownPage.tsx');
  expect(old).toContain("dispatch({type:'TOWN_SERVICE',serviceId})");
  expect(old).toContain('<ClinicDialog');
  expect(old).toContain('<WorkshopDialog');
  expect(old).toContain('<InnRestDialog');
 });
 it('fits the safehouse 768:1376 stage into available width AND height, without changing image coordinates',()=>{
  const home=read('src/features/shelter/ShelterHomePage.tsx');
  expect(home).toContain('function ShelterStageFit(');
  expect(home).toContain('const width=Math.min(availableWidth,availableHeight*768/1376)');
  expect(home).toContain('const height=width*1376/768');
  expect(home).toContain('new ResizeObserver(measure)');
  expect(home).not.toContain('useVerticalDragScroll');
  expect(home).toContain('shelter-home-page--compact viewport-page');
  expect(home).toContain('<ShelterStageFit>');
  expect(home).toContain('<ShelterScene owned={owned}');
  expect(home).toContain('id="shelter-development-drawer"');
  expect(home).toContain('role="dialog" aria-modal="true"');
  expect(home).toContain('aria-expanded={toolsOpen}');
  expect(home).toContain('aria-label="關閉建設工具"');
  expect(home).toContain('onClick={()=>setToolsOpen(false)}');
 });
 it('shows all eight furniture exactly once, and full JPG only at 8/8 after resizing',()=>{
  for(const n of [0,1,4,7,8]){
   const owned=SHELTER_FURNITURE_IDS.slice(0,n);
   const html=renderToStaticMarkup(createElement(ShelterScene,{owned,onSelect:()=>{}}));
   expect(getWarehouseVisualMode(owned)).toBe(n===8?'full':n===0?'empty':'layers');
   expect(html).toContain(n===8?'background_full.jpg':'background_empty.jpg');
   expect((html.match(/data-furniture-marker=/g)||[])).toHaveLength(n);
   expect((html.match(/class="shelter-scene__furniture"/g)||[])).toHaveLength(n===8?0:n);
  }
 });
 it('prioritizes a fixed safehouse scene and actual scrollable drawer, not the old whole-page scroll CSS',()=>{
  const css=read('src/styles/_v0842-city-shelter.scss');
  const root=read('src/styles/main.scss');
  expect(root.trimEnd()).toMatch(/@import "v0843-town-district-live";$/);
  expect(root.indexOf('@import "v0841-shelter-scroll-hotfix"')).toBeLessThan(root.indexOf('@import "v0842-city-shelter"'));
  expect(css).toContain('.shelter-home-page.shelter-home-page--compact.viewport-page');
  expect(css).toContain('overflow:hidden!important');
  expect(css).toContain('grid-template-columns:repeat(4,minmax(0,1fr))');
  expect(css).toContain('.shelter-stage-fit');
  expect(css).toContain('flex:1 1 auto');
  expect(css).toContain('.shelter-drawer__content');
  expect(css).toContain('overflow-y:auto');
  expect(css).toContain('max-height:92%');
  expect(css).toContain('grid-template-rows:repeat(3,minmax(0,1fr))');
  expect(css).toContain('backdrop-filter:blur(10px)');
  expect(css).toContain('@media(max-width:390px)');
  expect(css).toContain('@media(max-height:560px)');
  expect(css).toContain('@media(prefers-reduced-motion:reduce)');
 });
 it('keeps saved game schema and combat UI, increments only package version to 0.8.42',()=>{
  const state=read('src/game/state/storage.ts');
  const app=read('src/app/App.tsx');
  expect(app).toContain('if(state.mode!==\'home\'&&location.pathname!==\'/chapter\')');
  expect(state).toContain('localStorage');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.43');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.43');
  expect(read('src/styles/_viewport.scss')).toContain('.app-main--mission');
  expect(read('src/styles/_v0838-shelter-hub.scss')).toContain('768×1376');
 });
});
