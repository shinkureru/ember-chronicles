import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {GameProvider} from '../src/app/GameContext';
import MetalFrame from '../src/components/ui/MetalFrame';
import {URBAN_FRAME_LEVELS,meterPercent} from '../src/components/ui/urbanUiTokens';
import {MARKET_TO_URBAN_RARITY,CARD_TO_URBAN_RARITY} from '../src/components/ui/urbanUiAdapters';
import {HUD_HEALTH_SPARKS,HUD_STAMINA_SPARKS} from '../src/components/ui/hudParticles';
import StatBar from '../src/components/StatBar';
import {PORTRAIT_ART_SIZE,fitPortraitStage} from '../src/components/ui/portraitStageFit';
import {TOWN_OVERVIEW_TRANSITION_MS,getTownOverviewShiftRows} from '../src/features/town/townOverviewTransition';
import TownOverviewPage from '../src/features/town/TownOverviewPage';
import TownDistrictPage from '../src/features/town/TownDistrictPage';
import {TOWN_DISTRICTS} from '../src/features/town/townDistricts';
import {TOWN_DISTRICT_HOTSPOTS} from '../src/features/town/townDistrictHotspots';
import {coverTownStage} from '../src/features/town/townStageCover';
import {TOWN_FACILITIES,TOWN_QUESTS} from '../src/game/data/town';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {saveGame,loadGame} from '../src/game/state/storage';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sha=(p:string)=>createHash('sha256').update(readFileSync(new URL('../'+p,import.meta.url))).digest('hex');
const render=(e:ReturnType<typeof createElement>)=>renderToStaticMarkup(e);
const renderDistrict=(id:string)=>render(createElement(GameProvider,null,
 createElement(MemoryRouter,{initialEntries:['/town/'+id]},
  createElement(Routes,null,createElement(Route,{path:'/town/:districtId',element:createElement(TownDistrictPage)})))));
afterEach(()=>vi.unstubAllGlobals());

describe('v0.8.51 — final metal texture and entire seventh-round regression',()=>{
 it('keeps three semantic metal levels and original nested content intact',()=>{
  expect(URBAN_FRAME_LEVELS.map(x=>x.id)).toEqual(['primary','secondary','light']);
  for(const level of URBAN_FRAME_LEVELS){
   const html=render(createElement(MetalFrame,{level:level.id,title:level.label,eyebrow:'FRAME',
    children:createElement('button',{type:'button'},'不遮擋按鈕')}));
   expect(html).toContain('urban-frame--'+level.id);
   expect(html).toContain('data-urban-frame="'+level.id+'"');
   expect(html).toContain('不遮擋按鈕');
   expect((html.match(/<button/g)??[])).toHaveLength(1);
  }
 });
 it('ships a real static original tile with etched scratches and rough pores, no expensive noise filter',()=>{
  const svg=read('src/assets/brushed-silver-v0851.svg');
  expect(svg).toContain('viewBox="0 0 128 128"');
  expect(svg).toContain('width="128" height="128"');
  expect((svg.match(/<path d="/g)??[]).length).toBe(112);
  expect((svg.match(/<ellipse cx="/g)??[]).length).toBe(105);
  for(const bad of ['<script','<image','feTurbulence','<filter','<animate','<foreignObject'])expect(svg).not.toContain(bad);
  expect(svg).toContain('stroke-opacity=');
  expect(svg).toContain('fill-opacity=');
 });
 it('makes visible primary 6px, secondary 4px and light 3px steel rings with static WebKit-compatible mask',()=>{
  const css=read('src/styles/_v0851-brushed-metal-final.scss');
  for(const part of [
   '.urban-frame--primary','.urban-frame--secondary','.urban-frame--light',
   '--v0851-metal-rim:6px','--v0851-metal-rim:4px','--v0851-metal-rim:3px',
   'brushed-silver-v0851.svg',
   "url('../assets/brushed-silver-v0851.svg')",
   'background-blend-mode:normal,overlay,screen',
   '-webkit-mask-composite:xor','mask-composite:exclude',
   'pointer-events:none',
   '@media(max-width:390px),(max-height:560px)',
   '@media(prefers-reduced-motion:reduce),(update:slow)',
   '@media(forced-colors:active)','CanvasText',
  ])expect(css).toContain(part);
  expect(css).not.toContain('backdrop-filter');
  expect(css).not.toContain('requestAnimationFrame(');
  expect(css).not.toContain('feTurbulence');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0851-brushed-metal-final";$/);
 });
 it('opts into only three real dialogs, preserving original dialog roles, actions and scroll containers',()=>{
  const town=read('src/features/town/TownFacilityDialog.tsx');
  const market=read('src/features/market/BlackMarketPage.tsx');
  const cards=read('src/features/cards/CardsPage.tsx');
  expect(town).toContain('town-facility-dialog urban-metal-surface--v0851 urban-metal-surface--secondary');
  expect(market).toContain('market-v10__detail urban-metal-surface--v0851 urban-metal-surface--primary');
  expect(cards).toContain('card-detail-dialog urban-metal-surface--v0851 urban-metal-surface--secondary');
  for(const src of [town,market,cards])expect(src).toContain('role="dialog"');
  expect(town).toContain('role="tablist"');
  expect(town).toContain("dispatch({type:'TOWN_ACCEPT_QUEST'");
  expect(town).toContain("dispatch({type:'TOWN_COMPLETE_QUEST'");
  expect(market).toContain('disabled={!selected.canTrade}');
  expect(cards).toContain("dispatch({type:'UPGRADE_CARD',cardId:selected.id})");
  expect(cards).toContain('card-detail-dialog__content');
  expect(market).toContain('market-v10__close');
 });
 it('preserves three blurred districts, directional transition and full-bleed seven target geometry',()=>{
  expect(TOWN_OVERVIEW_TRANSITION_MS).toBe(900);
  expect([0,1,2].map(n=>getTownOverviewShiftRows(1,n))).toEqual([-2.1,0,2.1]);
  const index=render(createElement(GameProvider,null,createElement(MemoryRouter,null,createElement(TownOverviewPage))));
  expect((index.match(/data-town-district="/g)??[])).toHaveLength(3);
  expect((index.match(/class="city-overview-zone__blur"/g)??[])).toHaveLength(3);
  expect(TOWN_DISTRICTS.flatMap(x=>x.facilities)).toHaveLength(7);
  expect(TOWN_FACILITIES).toHaveLength(8);
  expect(TOWN_DISTRICT_HOTSPOTS['outer-ring'].map(x=>x.facility)).toEqual(['inn']);
  expect(TOWN_DISTRICT_HOTSPOTS['steam-street'].map(x=>x.facility)).toEqual(['laundry','canteen']);
  expect(TOWN_DISTRICT_HOTSPOTS['old-core'].map(x=>x.facility)).toEqual(['workshop','clinic','tavern','training']);
  for(const d of TOWN_DISTRICTS){
   const html=renderDistrict(d.id);
   expect(html).toContain('data-fullbleed-district="true"');
   expect((html.match(/data-town-facility="/g)??[])).toHaveLength(d.facilities.length);
   expect(html).toContain(d.image);
   expect(html).not.toContain('data-town-facility="noticeboard"');
  }
 });
 it('retains one 768×1376 cover-fit coordinate system across small and wide screens',()=>{
  expect(PORTRAIT_ART_SIZE).toEqual({width:768,height:1376});
  for(const [w,h] of [[320,568],[360,740],[390,844],[430,932],[468,680],[768,1376],[1200,700],[1920,1080]]){
   const fit=fitPortraitStage(w,h)!;
   const cover=coverTownStage(fit,w,h)!;
   expect(cover.width).toBeGreaterThanOrEqual(w-1e-8);
   expect(cover.height).toBeGreaterThanOrEqual(h-1e-8);
   expect(cover.width/cover.height).toBeCloseTo(768/1376,10);
  }
  expect(coverTownStage({width:0,height:0},320,568)).toBeNull();
 });
 it('retains original HP/STA PNG, separate nine-spark fields and bounded visual percentages',()=>{
  expect(sha('public/assets/ui/hud-frames-v0849.png')).toBe('108eb1e5f1c3f45f6c3670b390e576b5aff5a73588ce652843a041bdb260b196');
  expect(HUD_HEALTH_SPARKS).toHaveLength(9);
  expect(HUD_STAMINA_SPARKS).toHaveLength(9);
  expect(HUD_HEALTH_SPARKS).not.toEqual(HUD_STAMINA_SPARKS);
  const hp=render(createElement(StatBar,{value:25,max:50,color:'red',label:'生命',liquid:true,urban:true}));
  const st=render(createElement(StatBar,{value:3,max:10,color:'mint',label:'體力',liquid:true,urban:true}));
  expect(hp).toContain('width:50%');
  expect(st).toContain('width:30%');
  expect((hp.match(/class="statbar__particle"/g)??[])).toHaveLength(9);
  expect((st.match(/class="statbar__particle"/g)??[])).toHaveLength(9);
  expect(meterPercent(120,100)).toBe(100);
  expect(meterPercent(NaN,10)).toBe(0);
  expect(read('src/styles/_v0849-hud-liquid.scss')).toContain('v0849-hp-smoke');
  expect(read('src/styles/_v0849-hud-liquid.scss')).toContain('v0849-st-smoke');
 });
 it('preserves selected-only rarity and reserved gold showroom without gameplay gold',()=>{
  expect(MARKET_TO_URBAN_RARITY).toEqual({scrap:'gray',field:'green',special:'blue',forbidden:'purple'});
  expect(CARD_TO_URBAN_RARITY).toEqual({normal:'gray',rare:'blue',chaos:'purple'});
  const css=read('src/styles/_v0850-rarity-selection-gold.scss');
  expect(css).toContain('.urban-slot:not(.is-selected)');
  expect(css).toContain('.urban-slot--gold.is-selected');
  expect(css).toContain('v0850-gold-star');
  expect(css).toContain('v0850-gold-ripple');
  expect(read('src/features/market/BlackMarketPage.tsx')).toContain('aria-pressed={selectedId===offer.id}');
  expect(read('src/features/cards/CardsPage.tsx')).toContain('aria-pressed={selectedId===variant.id&&selectedLevel===variant.level}');
 });
 it('runs real market, food and tavern-quest engine transitions without mutating inputs',()=>{
  const market=makeInitialState('journalist');
  market.world.minute=12*60;market.economy.coins=1000;
  const snapshot=structuredClone(market);
  const purchased=gameReducer(market,{type:'MARKET_BUY_ITEM',vendorId:'medic',itemId:'bandage'});
  expect(purchased.economy.coins).toBe(910);
  expect(purchased.bag.bandage).toBe((market.bag.bandage??0)+1);
  expect(market).toEqual(snapshot);
  const town=makeInitialState('courier');
  town.world.minute=18*60;town.economy.coins=500;town.player.hunger=65;
  const dinner=gameReducer(town,{type:'TOWN_SERVICE',serviceId:'hot_meal'});
  expect(dinner.economy.coins).toBe(486);
  expect(dinner.player.hunger).toBe(27);
  expect(town.economy.coins).toBe(500);
  const quest=TOWN_QUESTS[0]!;
  const accepted=gameReducer(town,{type:'TOWN_ACCEPT_QUEST',questId:quest.id});
  expect(accepted.town?.quests[quest.id]).toBe('accepted');
  expect(town.town?.quests[quest.id]).not.toBe('accepted');
 });
 it('retains v1 storage round-trip and all original imagery regression checks',()=>{
  const memory=new Map<string,string>([['unrelated-key','keep']]);
  vi.stubGlobal('localStorage',{
   getItem:(key:string)=>memory.get(key)??null,
   setItem:(key:string,value:string)=>{memory.set(key,value)},
   removeItem:(key:string)=>{memory.delete(key)}
  });
  const s=makeInitialState('courier');
  s.onboarding.phase='complete';s.onboarding.shelter='warehouse';
  s.economy.coins=678;s.player.hunger=73;
  s.ownedCards.question={level:2,copies:7};
  expect(saveGame(s)).toBe(true);
  const loaded=loadGame();
  expect(loaded.economy.coins).toBe(678);
  expect(loaded.player.hunger).toBe(73);
  expect(loaded.ownedCards.question).toEqual({level:2,copies:7});
  expect(memory.get('unrelated-key')).toBe('keep');
  expect(read('src/game/state/storage.ts')).toContain("const KEY='ember-chronicles-prototype-v1'");
  const old=read('tests/v0846-urban-final-integration.test.ts');
  for(const file of ['city-overview.webp','outer-ring.webp','steam-street.webp','old-core.webp',
   'background_empty.jpg','background_full.jpg','bed.png','computer.png'])expect(old).toContain(file);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.51');
  expect(JSON.parse(read('package-lock.json')).version).toBe('0.8.51');
 });
});
