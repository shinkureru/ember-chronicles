import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {GameProvider} from '../src/app/GameContext';
import {fitPortraitStage,PORTRAIT_ART_SIZE} from '../src/components/ui/portraitStageFit';
import RarityArtwork from '../src/components/ui/RarityArtwork';
import SquareRaritySlot from '../src/components/ui/SquareRaritySlot';
import {MARKET_TO_URBAN_RARITY,CARD_TO_URBAN_RARITY,marketTierToUrbanRarity,cardRarityToUrbanRarity} from '../src/components/ui/urbanUiAdapters';
import StatBar from '../src/components/StatBar';
import {TOWN_DISTRICTS} from '../src/features/town/townDistricts';
import {TOWN_FACILITIES} from '../src/game/data/town';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {CARDS} from '../src/game/data/cards';
import {ATTACK_CARDS} from '../src/game/data/attacks';
import {getMarketProductPresentation} from '../src/features/market/marketProductPresentation';
import {SHELTER_FURNITURE_IDS,getWarehouseFurnitureLayers,getWarehouseVisualMode,WAREHOUSE_LAYOUT} from '../src/game/engine/shelterVisuals';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {loadGame,saveGame,resetPrototypeAndReload} from '../src/game/state/storage';
import {getTownServiceLock} from '../src/game/engine/townActions';
import {getTaipeiClock} from '../src/game/engine/taipeiClock';
import ShelterScene from '../src/features/shelter/ShelterScene';
import TownDistrictPage from '../src/features/town/TownDistrictPage';
import TownOverviewPage from '../src/features/town/TownOverviewPage';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sha=(p:string)=>createHash('sha256').update(readFileSync(new URL('../'+p,import.meta.url))).digest('hex');
const render=(el:ReturnType<typeof createElement>)=>renderToStaticMarkup(el);
afterEach(()=>vi.unstubAllGlobals());

describe('v0.8.46 — last-batch full integration and visual performance',()=>{
 it('shares one safe uncropped 768x1376 fit calculation between shelter and city',()=>{
  expect(PORTRAIT_ART_SIZE).toEqual({width:768,height:1376});
  expect(WAREHOUSE_LAYOUT.stage).toEqual(PORTRAIT_ART_SIZE);
  for(const [w,h] of [[320,568],[360,740],[390,844],[430,932],[468,680],[1920,1080],[768,1376]]){
   const fit=fitPortraitStage(w,h);
   expect(fit).not.toBeNull();
   expect(fit!.width).toBeLessThanOrEqual(w+1e-8);
   expect(fit!.height).toBeLessThanOrEqual(h+1e-8);
   expect(fit!.width/fit!.height).toBeCloseTo(768/1376,10);
  }
  expect(fitPortraitStage(320,900)?.width).toBe(320);
  expect(fitPortraitStage(1000,1376)).toEqual({width:768,height:1376});
  expect(fitPortraitStage(320,480,16,9)).toEqual({width:320,height:180});
  for(const [w,h] of [[0,300],[-4,300],[300,0],[300,-4],[NaN,500],[Infinity,500],[300,NaN]]){
   expect(fitPortraitStage(w,h)).toBeNull();
  }
  expect(fitPortraitStage(400,500,0,1376)).toBeNull();
  for(const path of ['src/features/shelter/ShelterHomePage.tsx','src/features/town/TownDistrictPage.tsx']){
   expect(read(path)).toContain('fitPortraitStage(');
   expect(read(path)).toContain('new ResizeObserver(measure)');
  }
 });
 it('pins all four original town WebP and all 10 warehouse JPG/PNG checksums',()=>{
  const town={
   'city-overview.webp':'31f33e52a83cafc57da8dbceafef7481bc95d647aada102ebb65d8a1c78fcebf',
   'outer-ring.webp':'c11ea263d83d5f933b76b937b178ecee0e01db325db26a6390c380b222ac9271',
   'steam-street.webp':'17b3a7748add06f4bae74de29ffcb2880799ff6cdfa1169da2db2248f2226705',
   'old-core.webp':'f9b90839c705847d31de4dbc9d679c672aaef90f6cfff66eb03be446f5fee1b1',
  };
  const warehouse={
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
  expect(Object.keys(town)).toHaveLength(4);
  expect(Object.keys(warehouse)).toHaveLength(10);
  for(const [name,hash] of Object.entries(town))expect(sha('public/assets/town/'+name)).toBe(hash);
  for(const [name,hash] of Object.entries(warehouse))expect(sha('public/assets/shelter/warehouse/'+name)).toBe(hash);
  const layers=getWarehouseFurnitureLayers(SHELTER_FURNITURE_IDS);
  expect(layers).toHaveLength(8);
  expect(new Set(layers.map(l=>l.id)).size).toBe(8);
  expect(layers.every((l,i)=>i===0||l.z>=layers[i-1]!.z)).toBe(true);
  expect(getWarehouseFurnitureLayers(['cooking'])[0]?.width).toBe(914);
  expect(getWarehouseFurnitureLayers(['cooking'])[0]?.height).toBe(1225);
 });
 it('preserves staged 0/partial/8 furniture and switches to clean full JPEG',()=>{
  expect(getWarehouseVisualMode([])).toBe('empty');
  expect(getWarehouseVisualMode(['bed','computer'])).toBe('layers');
  expect(getWarehouseVisualMode(SHELTER_FURNITURE_IDS)).toBe('full');
  const empty=render(createElement(ShelterScene,{owned:[]}));
  const middle=render(createElement(ShelterScene,{owned:['bed','computer']}));
  const full=render(createElement(ShelterScene,{owned:[...SHELTER_FURNITURE_IDS]}));
  expect(empty).toContain('background_empty.jpg');
  expect(empty).not.toContain('class="shelter-scene__furniture"');
  expect((middle.match(/class="shelter-scene__furniture"/g)??[])).toHaveLength(2);
  expect(full).toContain('background_full.jpg');
  expect(full).not.toContain('class="shelter-scene__furniture"');
  expect(full).toContain('data-scene-mode="full"');
 });
 it('keeps three towns, all eight accessible true services and opening protection',()=>{
  const app=read('src/app/App.tsx');
  for(const x of [
   '<Route path="/town" element={<TownOverviewPage/>}/>',
   '<Route path="/town/:districtId" element={<TownDistrictPage/>}/>',
   '<Route path="/town/classic" element={<TownPage/>}/>',
   "if(state.onboarding.phase!=='complete')",
  ])expect(app).toContain(x);
  const overview=render(createElement(GameProvider,null,
   createElement(MemoryRouter,null,createElement(TownOverviewPage))));
  const ids=TOWN_DISTRICTS.flatMap(d=>d.facilities);
  expect(ids).toHaveLength(7);
  expect([...ids].sort()).toEqual(TOWN_FACILITIES.filter(f=>f.id!=='noticeboard').map(f=>f.id).sort());
  expect(TOWN_FACILITIES).toHaveLength(8);
  for(const district of TOWN_DISTRICTS){
   expect(overview).toContain('data-town-district="'+district.id+'"');
   const html=render(createElement(GameProvider,null,
    createElement(MemoryRouter,{initialEntries:['/town/'+district.id]},
     createElement(Routes,null,createElement(Route,{path:'/town/:districtId',element:createElement(TownDistrictPage)})))));
   expect(html).toContain('city-district-scene__atmosphere--'+district.id);
   expect(html).toContain(district.image);
   expect((html.match(/data-town-facility="/g)??[])).toHaveLength(district.facilities.length);
   expect((html.match(/data-town-list-facility="/g)??[])).toHaveLength(district.facilities.length);
  }
  const source=read('src/features/town/TownDistrictPage.tsx');
  expect(source).toContain('getTownServiceLock(s,serviceId)');
  expect(source).toContain("dispatch({type:'TOWN_SERVICE',serviceId})");
  expect(source).toContain('onClick={event=>openFacility(h.facility,event)}');
  expect(source).toContain('data-town-list-facility={id}');
 });
 it('keeps gold preview-only, existing market levels and single interactive buttons',()=>{
  expect(MARKET_TO_URBAN_RARITY).toEqual({scrap:'gray',field:'green',special:'blue',forbidden:'purple'});
  expect(CARD_TO_URBAN_RARITY).toEqual({normal:'gray',rare:'blue',chaos:'purple'});
  for(const vendor of MARKET_VENDORS){
   for(const offer of vendor.sellItems)expect(marketTierToUrbanRarity(getMarketProductPresentation('item',offer.id).tier)).not.toBe('gold');
   for(const id of vendor.cardIds)expect(marketTierToUrbanRarity(getMarketProductPresentation('card',id).tier)).not.toBe('gold');
  }
  for(const card of [...Object.values(CARDS),...Object.values(ATTACK_CARDS)])
   expect(cardRarityToUrbanRarity(card.rarity)).not.toBe('gold');
  expect(render(createElement(RarityArtwork,{rarity:'purple',icon:'✧'}))).not.toContain('<button');
  const lab=render(createElement(SquareRaritySlot,{rarity:'gold',name:'展示預留',icon:'◇'}));
  expect((lab.match(/<button/g)??[])).toHaveLength(1);
  for(const p of ['src/features/market/BlackMarketPage.tsx','src/features/cards/CardsPage.tsx','src/features/chapter/SkillHand.tsx']){
   expect(read(p)).toContain('<RarityArtwork');
   expect(read(p)).not.toContain('<SquareRaritySlot');
  }
 });
 it('clamps HUD visual values without changing original numbers or renderer shape',()=>{
  const over=render(createElement(StatBar,{value:15,max:10,color:'red',label:'生命',urban:true}));
  expect(over).toContain('statbar--urban');
  expect(over).toContain('width:100%');
  for(const [value,max] of [[NaN,10],[Infinity,10],[-5,10],[5,0]]){
   const html=render(createElement(StatBar,{value,max,color:'mint',label:'體力'}));
   expect(html).toContain('width:0%');
   expect(html).not.toContain('width:NaN');
  }
  expect(render(createElement(StatBar,{value:5,max:10,color:'gold',label:'道具'}))).toContain('width:50%');
  const hud=read('src/components/Hud.tsx');
  for(const x of ['生命 HP','體力','飢餓 {p.hunger}','膽量 {p.courage}','疲勞 {p.fatigue}'])expect(hud).toContain(x);
 });
 it('throttles rare sheen to interaction with small-screen, low-motion and contrast fallback',()=>{
  const css=read('src/styles/_v0846-urban-final-polish.scss');
  for(const x of [
   '.urban-v0845-market-art','.urban-v0845-codex-art','.urban-v0845-skill-tile',
   '@media(hover:hover) and (pointer:fine)','@media(prefers-reduced-motion:reduce)',
   '@media(update:slow)','@media(max-width:390px)','@media(max-height:600px)',
   '@media(forced-colors:active)','touch-action:manipulation','pointer-events:none',
   'filter:none','animation:none!important','min-height:44px',
  ])expect(css).toContain(x);
  expect(css).not.toContain('position:fixed');
  const root=read('src/styles/main.scss');
  expect(root.trimEnd()).toMatch(/@import "v0849-hud-liquid";$/);
  expect(root.indexOf('@import "v0845-urban-selective-adoption";'))
   .toBeLessThan(root.indexOf('@import "v0846-urban-final-polish";'));
 });
 it('retains the original playable town economy and market purchase balances',()=>{
  const town=makeInitialState('courier');
  town.world.minute=18*60;town.economy.coins=500;town.player.hunger=65;
  expect(getTownServiceLock(town,'hot_meal')).toBeNull();
  const snapshot=structuredClone(town);
  const after=gameReducer(town,{type:'TOWN_SERVICE',serviceId:'hot_meal'});
  expect(after.economy.coins).toBe(486);
  expect(after.player.hunger).toBe(27);
  expect(after.world).toEqual(town.world);
  expect(town).toEqual(snapshot);
  const market=makeInitialState('journalist');
  market.world.minute=12*60;market.economy.coins=1000;
  const purchase=gameReducer(market,{type:'MARKET_BUY_ITEM',vendorId:'medic',itemId:'bandage'});
  expect(purchase.economy.coins).toBe(910);
  expect(purchase.bag.bandage).toBe((market.bag.bandage??0)+1);
 });
 it('retains selected shelter, all bought furniture, currency, hunger and card copies on reload',()=>{
  const memory=new Map<string,string>([['other-key','keep']]);
  vi.stubGlobal('localStorage',{
   getItem:(key:string)=>memory.get(key)??null,
   setItem:(key:string,value:string)=>{memory.set(key,value)},
   removeItem:(key:string)=>{memory.delete(key)},
  });
  const state=makeInitialState('courier');
  state.onboarding.phase='complete';state.onboarding.shelter='warehouse';
  state.shelterOwned=[...SHELTER_FURNITURE_IDS];
  state.economy.coins=678;state.player.hunger=73;
  state.ownedCards.question={level:2,copies:7};
  state.world={...state.world,...getTaipeiClock(),clockBasis:'taipei-realtime'};
  expect(saveGame(state)).toBe(true);
  const again=loadGame();
  expect(again.onboarding).toEqual(state.onboarding);
  expect(again.shelterOwned).toEqual(state.shelterOwned);
  expect(getWarehouseVisualMode(again.shelterOwned)).toBe('full');
  expect(again.economy.coins).toBe(678);
  expect(again.player.hunger).toBe(73);
  expect(again.ownedCards.question).toEqual({level:2,copies:7});
  expect(again.world.clockBasis).toBe('taipei-realtime');
  const reload=vi.fn();
  expect(resetPrototypeAndReload(reload)).toBe(true);
  expect(reload).toHaveBeenCalledOnce();
  expect(memory.get('other-key')).toBe('keep');
  expect(memory.has('ember-chronicles-prototype-v1')).toBe(false);
 });
 it('finishes with synchronized version and unchanged v1 save schema / story lock',()=>{
  expect(JSON.parse(read('package.json')).version).toBe('0.8.49');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.49');
  const storage=read('src/game/state/storage.ts');
  expect(storage).toContain("const KEY='ember-chronicles-prototype-v1'");
  expect(storage).toContain('state.version!==1');
  expect(storage).toContain('normalizeShelterOwned(old.shelterOwned)');
  expect(storage).toContain('normalizeHunger(old.player.hunger)');
  expect(read('src/app/App.tsx')).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
 });
});
