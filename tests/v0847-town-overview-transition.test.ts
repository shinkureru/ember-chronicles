import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {GameProvider} from '../src/app/GameContext';
import TownOverviewPage from '../src/features/town/TownOverviewPage';
import {TOWN_DISTRICTS,CITY_OVERVIEW_IMAGE} from '../src/features/town/townDistricts';
import {TOWN_OVERVIEW_ORDER,TOWN_OVERVIEW_TRANSITION_MS,getTownOverviewShiftRows} from '../src/features/town/townOverviewTransition';
const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
describe('v0.8.47 — town glass atlas and directional reveal',()=>{
 it('shifts the selected part into the center and others out',()=>{
  expect(TOWN_OVERVIEW_ORDER).toEqual(['outer-ring','steam-street','old-core']);
  expect(TOWN_OVERVIEW_TRANSITION_MS).toBe(900);
  expect([0,1,2].map(i=>getTownOverviewShiftRows(0,i))).toEqual([1,2.1,2.1]);
  expect([0,1,2].map(i=>getTownOverviewShiftRows(1,i))).toEqual([-2.1,0,2.1]);
  expect([0,1,2].map(i=>getTownOverviewShiftRows(2,i))).toEqual([-2.1,-2.1,-1]);
  expect(getTownOverviewShiftRows(-1,0)).toBe(0);
  expect(getTownOverviewShiftRows(1,3)).toBe(0);
 });
 it('renders three clickable original-image sections, accessible labels and legacy navigation',()=>{
  const html=renderToStaticMarkup(createElement(GameProvider,null,
   createElement(MemoryRouter,null,createElement(TownOverviewPage))));
  expect(TOWN_DISTRICTS).toHaveLength(3);
  expect((html.match(/class="city-overview-zone__composite"/g)??[])).toHaveLength(3);
  expect((html.match(/class="city-overview-zone__blur"/g)??[])).toHaveLength(3);
  expect((html.match(/class="city-overview-zone__lights/g)??[])).toHaveLength(3);
  expect((html.match(/data-town-district=/g)??[])).toHaveLength(3);
  expect(html).toContain(CITY_OVERVIEW_IMAGE);
  for(const d of TOWN_DISTRICTS){
   expect(html).toContain('data-town-district="'+d.id+'"');
   expect(html).toContain(d.title);
   expect(html).toContain('/town/'+d.id);
  }
  expect(html).toContain('/town/classic');
  expect(html).toContain('返回我的避難所');
  expect(html).toContain('aria-busy="false"');
 });
 it('preloads full original detail, waits for reveal and supports reduced motion',()=>{
  const src=read('src/features/town/TownOverviewPage.tsx');
  for(const part of ['getTownOverviewShiftRows(selectedIndex,index)','data-transition-destination={chosen.id}',
    'townAsset(chosen.image)','onPointerEnter={()=>preload(d.image)}',
    "window.matchMedia?.('(prefers-reduced-motion: reduce)').matches",
    "navigate('/town/'+district.id)",'clearTimeout(timer.current)','event.preventDefault()'])
   expect(src).toContain(part);
  expect(src).not.toContain('dispatch(');
  expect(src).not.toContain('localStorage');
 });
 it('is completely scoped, blurred, responsive and motion-safe',()=>{
  const css=read('src/styles/_v0847-town-overview-transition.scss');
  for(const part of ['.city-overview-page--v0847','.city-overview-zone__composite',
   '.city-overview-zone__blur','backdrop-filter:blur(9px)','height:33.3333333%',
   'town-overview-expand','clip-path:inset(0 0 0 0)',
   'prefers-reduced-motion:reduce','update:slow','forced-colors:active',
   ':focus-visible','pointer-events:none','@supports not'])expect(css).toContain(part);
  expect(css).not.toContain('.city-district-page--live');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0849-hud-liquid";$/);
 });
 it('does not change old routes, playable eight services or content version',()=>{
  expect(TOWN_DISTRICTS.flatMap(d=>d.facilities)).toHaveLength(7);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.49');
  expect(JSON.parse(read('package-lock.json')).version).toBe('0.8.49');
  expect(read('src/app/App.tsx')).toContain('<Route path="/town/:districtId" element={<TownDistrictPage/>}/>');
 });
});
