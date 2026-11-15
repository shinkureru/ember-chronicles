import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {GameProvider} from '../src/app/GameContext';
import Hud from '../src/components/Hud';
import StatBar from '../src/components/StatBar';
import GoldRaritySparks from '../src/components/ui/GoldRaritySparks';
import {HUD_HEALTH_SPARKS,HUD_STAMINA_SPARKS} from '../src/components/ui/hudParticles';
import {MARKET_VISUAL_TEST_OFFERS,marketVisualTestPresentation} from '../src/features/market/marketVisualTestOffers';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {getScheduledVendor} from '../src/game/data/marketSchedule';
import {ITEMS} from '../src/game/data/items';
import {makeInitialState} from '../src/game/state/initial';
import {saveGame,loadGame,resetPrototypeAndReload} from '../src/game/state/storage';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const render=(e:ReturnType<typeof createElement>)=>renderToStaticMarkup(e);

describe('v0.8.53 — actual HUD, precious gold preview and iPhone 13 Pro production UI',()=>{
 afterEach(()=>vi.unstubAllGlobals());
 it('puts glowing liquid, original copper/silver PNG, ornate finials, front flare and independent 9-spark fields on real Hud',()=>{
  const h=render(createElement(GameProvider,null,createElement(MemoryRouter,null,createElement(Hud))));
  expect(h).toContain('hud--v0853-real-meter');
  expect((h.match(/statbar--v0853-live/g)??[])).toHaveLength(2);
  expect((h.match(/class="statbar__front"/g)??[])).toHaveLength(2);
  expect((h.match(/class="statbar__finial /g)??[])).toHaveLength(4);
  expect((h.match(/class="statbar__particle"/g)??[])).toHaveLength(18);
  expect(h).toContain('assets/ui/hud-frames-v0849.png');
  expect(h).toContain('role="progressbar"');
  expect(h).toContain('aria-valuemax="10"');
  expect(HUD_HEALTH_SPARKS).toHaveLength(9);
  expect(HUD_STAMINA_SPARKS).toHaveLength(9);
  expect(HUD_HEALTH_SPARKS).not.toEqual(HUD_STAMINA_SPARKS);
  const empty=render(createElement(StatBar,{value:0,max:10,label:'生命',color:'red',urban:true,liquid:true}));
  expect(empty).toContain('width:0%');
  expect(empty).toContain('opacity:0');
  expect(read('src/styles/_v0853-live-hud-gold-market.scss')).toContain('v0853-front-hp');
  expect(read('src/styles/_v0853-live-hud-gold-market.scss')).toContain('v0853-front-st');
  expect(read('src/styles/_v0849-hud-liquid.scss')).toContain('v0849-hp-smoke');
  expect(read('src/styles/_v0849-hud-liquid.scss')).toContain('v0849-st-smoke');
 });
 it('creates exactly two permanent read-only purple/gold product previews across all merchant shifts',()=>{
  expect(MARKET_VISUAL_TEST_OFFERS.map(p=>p.previewRarity)).toEqual(['purple','gold']);
  expect(MARKET_VISUAL_TEST_OFFERS.map(p=>p.id)).toEqual(['dev_visual_purple','dev_visual_gold']);
  expect(MARKET_VISUAL_TEST_OFFERS.every(p=>!p.canTrade&&p.available===1)).toBe(true);
  expect(marketVisualTestPresentation('purple').tier).toBe('forbidden');
  expect(marketVisualTestPresentation('gold')).toMatchObject({tier:'gold',name:'傳說',level:99});
  expect(MARKET_VENDORS).toHaveLength(5);
  for(const minute of [480,720,960,1200,60]){
   const vendor=getScheduledVendor(minute);
   expect(vendor).toBeTruthy();
   for(const p of MARKET_VISUAL_TEST_OFFERS){
    expect(ITEMS[p.id]).toBeUndefined();
    expect(vendor.sellItems.every(s=>s.id!==p.id)).toBe(true);
    expect(vendor.cardIds).not.toContain(p.id);
   }
  }
  const page=read('src/features/market/BlackMarketPage.tsx');
  expect(page).toContain("mode==='buy'?MARKET_VISUAL_TEST_OFFERS");
  expect(page).toContain("previewRarity==='gold'");
  expect(page).toContain('market-v0853-gold');
  expect(page).toContain('market-v0853-purple');
  expect(page).toContain('<GoldRaritySparks/>');
  expect(page).toContain('disabled={!selected.canTrade}');
  expect(page).toContain('marketVisualTestPresentation(selected.previewRarity)');
 });
 it('actually uses both uploaded star silhouettes traced into gold icons, with radial random-like staggered glow',()=>{
  const svgA=read('src/assets/v0853-gold-sparkle-a.svg');
  const svgB=read('src/assets/v0853-gold-sparkle-b.svg');
  for(const svg of [svgA,svgB]){
   expect(svg).toContain('viewBox="0 0 512 512"');
   expect(svg).toContain('Gold radial sparkles traced from supplied reference icon');
   expect((svg.match(/<path fill=/g)??[])).toHaveLength(2);
   expect(svg).not.toContain('<script');
  }
  const h=render(createElement(GoldRaritySparks));
  expect((h.match(/class="market-gold-spark market-gold-spark--/g)??[])).toHaveLength(8);
  expect(h).toContain('market-gold-ripple--one');
  expect(h).toContain('market-gold-ripple--two');
  expect(h).toContain('--spark-dx:');
  expect(h).toContain('--spark-dy:');
  const css=read('src/styles/_v0853-live-hud-gold-market.scss');
  for(const t of ['v0853-gold-sparkle-a.svg','v0853-gold-sparkle-b.svg',
   'v0853-gold-water','v0853-gold-spark',
   'repeating-radial-gradient','--spark-duration','--spark-delay',
   'animation:none!important','prefers-reduced-motion:reduce','update:slow'])
   expect(css).toContain(t);
  expect(css).not.toContain('requestAnimationFrame(');
  expect(css).not.toContain('setInterval(');
 });
 it('retains grade-colored plate WHILE the item is selected and ripples only in gold state',()=>{
  const css=read('src/styles/_v0853-live-hud-gold-market.scss');
  expect(css).toContain('.urban-v0845-market-product.is-selected .urban-rarity-artwork');
  expect(css).toContain('var(--urban-slot-face)');
  expect(css).toContain('.market-v0853-gold.is-selected');
  expect(css).toContain('background:');
  expect(css).toContain('opacity:1!important');
  const old=read('src/styles/_v0852-viewport-town-cinematic-audit.scss');
  expect(old).toContain('border-color:transparent!important');
  expect(old).toContain('var(--urban-slot-face)');
 });
 it('starts EVERY freshly cleared save at 9999 without changing an existing saved balance',()=>{
  expect(makeInitialState('courier').economy.coins).toBe(9999);
  expect(makeInitialState().economy.coins).toBe(9999);
  const memory=new Map<string,string>([['another-app','keep']]);
  vi.stubGlobal('localStorage',{
   getItem:(key:string)=>memory.get(key)??null,
   setItem:(key:string,value:string)=>{memory.set(key,value)},
   removeItem:(key:string)=>{memory.delete(key)}
  });
  const previous=makeInitialState('journalist');
  previous.economy.coins=234;
  expect(saveGame(previous)).toBe(true);
  expect(loadGame().economy.coins).toBe(234);
  let reloaded=false;
  expect(resetPrototypeAndReload(()=>{reloaded=true})).toBe(true);
  expect(reloaded).toBe(true);
  expect(loadGame().economy.coins).toBe(9999);
  expect(memory.get('another-app')).toBe('keep');
  expect(read('src/game/state/storage.ts')).toContain('ember-chronicles-prototype-v1');
 });
 it('removes the laboratory from actual navigation while retaining private legacy component tests',()=>{
  const app=read('src/app/App.tsx');
  expect(app).not.toContain('import UiShowcasePage');
  expect(app).not.toContain('path="/ui-lab"');
  expect(app).not.toContain('UI 實驗室');
  expect(app).not.toContain('tab===\\'visual\\'');
  expect(app).toContain('存檔與重設');
  expect(app).toContain('resetPrototypeAndReload()');
  expect(app).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
 });
 it('locks desktop CSS frame to iPhone 13 Pro 390×844 layout but keeps real iPhone flexible',()=>{
  const css=read('src/styles/_v0853-live-hud-gold-market.scss');
  expect(css).toContain('@media(min-width:700px)');
  expect(css).toContain('width:390px;min-width:390px;max-width:390px');
  expect(css).toContain('height:min(844px,100dvh)');
  expect(css).toContain('container-name:iphone-viewport');
  expect(css).toContain('@container iphone-viewport (max-width:420px)');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0853-live-hud-gold-market";$/);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.53');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.53');
 });
});
