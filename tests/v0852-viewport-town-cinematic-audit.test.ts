import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {GameProvider} from '../src/app/GameContext';
import TownOverviewPage from '../src/features/town/TownOverviewPage';
import TownDistrictPage from '../src/features/town/TownDistrictPage';
import UiShowcasePage from '../src/features/ui-showcase/UiShowcasePage';
import RarityArtwork from '../src/components/ui/RarityArtwork';
import {TOWN_OVERVIEW_TRANSITION_MS,getTownOverviewShiftRows} from '../src/features/town/townOverviewTransition';
import {TOWN_DISTRICTS} from '../src/features/town/townDistricts';
import {TOWN_DISTRICT_HOTSPOTS} from '../src/features/town/townDistrictHotspots';
import {coverTownStage} from '../src/features/town/townStageCover';
import {fitPortraitStage} from '../src/components/ui/portraitStageFit';
import {TOWN_FACILITIES,TOWN_QUESTS} from '../src/game/data/town';
import {HUD_HEALTH_SPARKS,HUD_STAMINA_SPARKS} from '../src/components/ui/hudParticles';
import {MARKET_TO_URBAN_RARITY,CARD_TO_URBAN_RARITY} from '../src/components/ui/urbanUiAdapters';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const render=(e:ReturnType<typeof createElement>)=>renderToStaticMarkup(e);
const overview=(initialEntries:({pathname:string;state?:{fromDistrict:string}})[])=>
 render(createElement(GameProvider,null,createElement(MemoryRouter,{initialEntries},
  createElement(TownOverviewPage))));
const district=(id:string)=>render(createElement(GameProvider,null,
 createElement(MemoryRouter,{initialEntries:['/town/'+id]},
  createElement(Routes,null,createElement(Route,{path:'/town/:districtId',element:createElement(TownDistrictPage)})))));

describe('v0.8.52 visual regression — fixed desktop phone geometry and reliable town transitions',()=>{
 it('forces a real desktop 390×844 mobile frame while preserving phone viewport',()=>{
  const css=read('src/styles/_v0852-viewport-town-cinematic-audit.scss');
  expect(css).toContain('@media (min-width:700px)');
  expect(css).toContain('width:390px;min-width:390px;max-width:390px;');
  expect(css).toContain('height:min(844px,calc(100dvh - 24px))');
  expect(css).toContain('display:flex;align-items:center;justify-content:center');
  expect(css).toContain('@media (min-width:700px) and (max-height:460px)');
  expect(read('src/components/Frame.tsx')).toContain('className="desktop-world');
 });
 it('builds all three seamless atlas thirds as background positions, never negative top on an oversized img',()=>{
  const html=overview([{pathname:'/town'}]);
  expect((html.match(/class="city-overview-zone__composite"/g)??[])).toHaveLength(3);
  expect(html).toContain('background-position:center 0%');
  expect(html).toContain('background-position:center 50%');
  expect(html).toContain('background-position:center 100%');
  expect(html).toContain('assets/town/city-overview.webp');
  expect(html).not.toContain('top:-100%');
  const src=read('src/features/town/TownOverviewPage.tsx');
  expect(src).toContain("backgroundPosition:'center '+(index*50)+'%'");
  expect(src).not.toContain('style={{top:(-index*100)');
  const css=read('src/styles/_v0852-viewport-town-cinematic-audit.scss');
  expect(css).toContain('background-size:100% 300%');
  expect(css).toContain('width:100%;height:100%');
 });
 it('matches reveal image crop to the actual single coordinate-space cover-fit stage, with no second jump',()=>{
  const css=read('src/styles/_v0852-viewport-town-cinematic-audit.scss');
  const src=read('src/features/town/TownDistrictPage.tsx');
  expect(src).toContain('useLayoutEffect(()=>');
  expect(src).toContain("style={dimensions?{width:dimensions.width,height:dimensions.height}:{visibility:'hidden'}}");
  expect(src).toContain('coverTownStage(fit,element.clientWidth,element.clientHeight)');
  expect(css).toContain('.city-overview-page--v0852 .city-overview-reveal img');
  expect(css).toContain('object-fit:cover;object-position:center');
  expect(css).toContain('.city-district-page--v0852 .city-district-scene__image');
  for(const [w,h] of [[320,568],[390,844],[430,932],[768,1376],[1920,1080]]){
   const fit=fitPortraitStage(w,h)!;
   const cover=coverTownStage(fit,w,h)!;
   const scale=Math.max(w/768,h/1376);
   expect(cover.width).toBeCloseTo(768*scale,8);
   expect(cover.height).toBeCloseTo(1376*scale,8);
  }
 });
 it('uses smooth ease-out curves, softly staged keyframes and a direction-preserving atlas exit',()=>{
  expect(TOWN_OVERVIEW_TRANSITION_MS).toBe(1050);
  expect([0,1,2].map(n=>getTownOverviewShiftRows(0,n))).toEqual([1,2.1,2.1]);
  expect([0,1,2].map(n=>getTownOverviewShiftRows(1,n))).toEqual([-2.1,0,2.1]);
  expect([0,1,2].map(n=>getTownOverviewShiftRows(2,n))).toEqual([-2.1,-2.1,-1]);
  const src=read('src/features/town/TownOverviewPage.tsx');
  const css=read('src/styles/_v0852-viewport-town-cinematic-audit.scss');
  expect(src).toContain('data-transition-destination={chosen.id}');
  expect(src).toContain('city-overview-reveal__light');
  expect(css).toContain('1050ms cubic-bezier(.22,1,.36,1)');
  for(const token of ['v0852-detail-reveal','v0852-detail-image','v0852-soft-light',
   '0%,12%','36%','67%','100%'])expect(css).toContain(token);
  expect(css).toContain('transform:scale(1)');
 });
 it('animates *both* home-to-overview entry and district-to-overview return with split shutters',()=>{
  const first=overview([{pathname:'/town'}]);
  const back=overview([{pathname:'/town',state:{fromDistrict:'old-core'}}]);
  expect(first).toContain('is-opening-town');
  expect(back).toContain('is-return-arrival');
  expect(back).toContain('city-overview-return-curtain__half--left');
  expect(back).toContain('city-overview-return-curtain__half--right');
  const src=read('src/features/town/TownDistrictPage.tsx');
  expect(src).toContain("navigate('/town',{state:{fromDistrict:district.id}})");
  expect(src).toContain('setIsReturning(true)');
  expect(src).toContain('setTimeout(navigateBack,640)');
  expect(src).toContain('onClick={returnToOverview}');
  const css=read('src/styles/_v0852-viewport-town-cinematic-audit.scss');
  for(const token of ['v0852-open-panel-left','v0852-open-panel-right','v0852-open-panel',
   'v0852-return-left','v0852-return-right','city-district-return-curtain',
   'pointer-events:none','prefers-reduced-motion:reduce','update:slow'])
    expect(css).toContain(token);
 });
 it('preserves exactly seven scene hits and eight real services, with old-core noticeboard nested',()=>{
  expect(TOWN_DISTRICTS.flatMap(d=>d.facilities)).toHaveLength(7);
  expect(TOWN_FACILITIES).toHaveLength(8);
  expect(TOWN_QUESTS.length).toBeGreaterThan(0);
  expect(TOWN_DISTRICT_HOTSPOTS['outer-ring'].map(h=>h.facility)).toEqual(['inn']);
  expect(TOWN_DISTRICT_HOTSPOTS['steam-street'].map(h=>h.facility)).toEqual(['laundry','canteen']);
  expect(TOWN_DISTRICT_HOTSPOTS['old-core'].map(h=>h.facility)).toEqual(['workshop','clinic','tavern','training']);
  for(const d of TOWN_DISTRICTS){
   const html=district(d.id);
   expect(html).toContain('data-fullbleed-district="true"');
   expect(html).toContain('city-district-page--v0852');
   expect(html).toContain('city-district-return-curtain');
   expect((html.match(/data-town-facility="/g)??[])).toHaveLength(d.facilities.length);
   expect(html).not.toContain('data-town-facility="noticeboard"');
  }
  expect(read('src/features/town/TownFacilityDialog.tsx')).toContain('tavernTab');
 });
 it('restores distinct unselected gray/green/blue/purple/gold faces while leaving rim invisible',()=>{
  const css=read('src/styles/_v0852-viewport-town-cinematic-audit.scss');
  for(const token of ['.urban-showcase__rarities .urban-slot:not(.is-selected)',
   '.urban-v0845-market-product:not(.is-selected)',
   '.urban-v0845-codex-card:not(.is-selected)',
   '.urban-v0845-skill-tile:not(.is-selected)',
   'var(--urban-slot-face)',
   'border-color:transparent!important',
   '.urban-slot--gold:not(.is-selected)'])
   expect(css).toContain(token);
  for(const rarity of ['gray','green','blue','purple','gold'] as const){
   const h=render(createElement(RarityArtwork,{rarity,icon:'◇'}));
   expect(h).toContain('data-urban-artwork="'+rarity+'"');
   expect(h).toContain('urban-slot--'+rarity);
  }
  expect(read('src/styles/_v0850-rarity-selection-gold.scss')).toContain('v0850-gold-star');
  expect(MARKET_TO_URBAN_RARITY).toEqual({scrap:'gray',field:'green',special:'blue',forbidden:'purple'});
  expect(CARD_TO_URBAN_RARITY).toEqual({normal:'gray',rare:'blue',chaos:'purple'});
 });
 it('reduces all three silver ring thickness levels to EXACTLY 70% of 6/4/3px',()=>{
  const css=read('src/styles/_v0852-viewport-town-cinematic-audit.scss');
  for(const [level,width] of [['primary',4.2],['secondary',2.8],['light',2.1]]){
   expect(css).toContain('.urban-frame--'+level);
   expect(css).toContain('--v0851-metal-rim:'+width+'px');
  }
  expect(4.2/6).toBeCloseTo(.7,8);
  expect(2.8/4).toBeCloseTo(.7,8);
  expect(2.1/3).toBeCloseTo(.7,8);
  expect(read('src/styles/_v0851-brushed-metal-final.scss')).toContain('brushed-silver-v0851.svg');
  expect(css).toContain('@media(max-width:390px),(max-height:560px)');
 });
 it('audits all five v0.8.47–51 surfaces and protects original asset, HUD and save regression',()=>{
  for(const [file,expected] of [
   ['src/styles/_v0847-town-overview-transition.scss','city-overview-zone__blur'],
   ['src/styles/_v0848-town-fullbleed-services.scss','city-district-scene__lights'],
   ['src/styles/_v0849-hud-liquid.scss','v0849-st-smoke'],
   ['src/styles/_v0850-rarity-selection-gold.scss','v0850-gold-ripple'],
   ['src/styles/_v0851-brushed-metal-final.scss','brushed-silver-v0851.svg'],
  ])expect(read(file)).toContain(expected);
  expect(HUD_HEALTH_SPARKS).toHaveLength(9);
  expect(HUD_STAMINA_SPARKS).toHaveLength(9);
  expect(HUD_HEALTH_SPARKS).not.toEqual(HUD_STAMINA_SPARKS);
  expect(read('tests/v0846-urban-final-integration.test.ts')).toContain('city-overview.webp');
  expect(read('tests/v0849-hud-liquid-particles.test.ts')).toContain('108eb1e5f1c3f45f');
  expect(read('src/game/state/storage.ts')).toContain('ember-chronicles-prototype-v1');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0852-viewport-town-cinematic-audit";$/);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.52');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.52');
 });
 it('renders a truthful current UI Lab release identifier and reports the smaller metal dimensions',()=>{
  const ui=render(createElement(MemoryRouter,null,createElement(UiShowcasePage)));
  expect(ui).toContain('data-ui-showcase="v0.8.52"');
  expect(ui).toContain('4.2px');
  expect(ui).toContain('2.8px');
  expect(ui).toContain('2.1px');
  expect(ui).toContain('未選取時保留分級底色');
 });
});
