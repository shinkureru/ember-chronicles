import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import LuminousProgressBar from '../src/components/ui/LuminousProgressBar';
import SquareRaritySlot from '../src/components/ui/SquareRaritySlot';
import MetalFrame from '../src/components/ui/MetalFrame';
import {meterPercent,safeMeterValue,URBAN_RARITIES,URBAN_FRAME_LEVELS} from '../src/components/ui/urbanUiTokens';
import UiShowcasePage from '../src/features/ui-showcase/UiShowcasePage';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=(view:ReturnType<typeof createElement>)=>renderToStaticMarkup(view);
const testMeter=(value:number,max:number,animated=true,particles=true)=>
 html(createElement(LuminousProgressBar,{value,max,label:'生命 HP',animated,particles}));
const testSlot=(rarity:typeof URBAN_RARITIES[number]['id'],selected=false,disabled=false)=>
 html(createElement(SquareRaritySlot,{rarity,name:'測試物資',detail:'展示用途',
  icon:createElement('span',null,'測試'),selected,disabled}));

describe('v0.8.44 — reusable cinematic urban UI, isolated visual laboratory',()=>{
 it('computes visual fill percentage safely without erasing real above-cap text',()=>{
  expect(meterPercent(1250,1000)).toBe(100);
  expect(meterPercent(550,900)).toBe(61.11);
  expect(meterPercent(0,1000)).toBe(0);
  expect(meterPercent(-40,100)).toBe(0);
  expect(meterPercent(40,0)).toBe(0);
  expect(meterPercent(NaN,100)).toBe(0);
  expect(meterPercent(Infinity,100)).toBe(0);
  expect(meterPercent(90,-100)).toBe(0);
  expect(safeMeterValue(-12)).toBe(0);
  expect(safeMeterValue(Infinity)).toBe(0);
  expect(safeMeterValue(1.6)).toBe(2);
 });
 it('renders ARIA-correct progressbars, the genuine 1250/1000 overcap, colored styles and animated sparks',()=>{
  const h=testMeter(1250,1000);
  expect(h).toContain('data-urban-meter="health"');
  expect(h).toContain('data-percent="100"');
  expect(h).toContain('aria-valuemax="1000"');
  expect(h).toContain('aria-valuenow="1000"');
  expect(h).toContain('aria-valuetext="1250 / 1000"');
  expect(h).toContain('突破上限 +250');
  expect(h).toContain('urban-meter__spark--three');
  expect(h).toContain('is-animated');
  const other=html(createElement(LuminousProgressBar,{value:550,max:900,tone:'stamina',label:'體力 ST'}));
  expect(other).toContain('urban-meter--stamina');
  expect(other).toContain('aria-valuenow="550"');
  expect(other).toContain('data-percent="61.11"');
  expect(other).not.toContain('突破上限');
 });
 it('can disable decorative motion/particles while the stat remains legible',()=>{
  const markup=testMeter(500,1000,false,false);
  expect(markup).not.toContain('is-animated');
  expect(markup).not.toContain('has-particles');
  expect(markup).toContain('aria-valuetext="500 / 1000"');
  expect(markup).toContain('data-percent="50"');
 });
 it('declares five distinct display-only rarity options, including clearly reserved gold',()=>{
  expect(URBAN_RARITIES.map(x=>x.id)).toEqual(['gray','green','blue','purple','gold']);
  expect(new Set(URBAN_RARITIES.map(x=>x.id)).size).toBe(5);
  expect(URBAN_RARITIES.find(x=>x.id==='gold')?.description).toContain('未有實際掉落規則');
  for(const rarity of URBAN_RARITIES){
   const slot=testSlot(rarity.id);
   expect(slot).toContain('data-urban-rarity="'+rarity.id+'"');
   expect(slot).toContain('urban-slot__square');
   expect(slot).toContain('urban-slot__info');
   expect(slot).toContain(rarity.label);
   expect(slot).toContain('aria-pressed="false"');
  }
 });
 it('keeps slot interaction semantic and visually selected / disabled without prices or RNG',()=>{
  expect(testSlot('purple',true)).toContain('aria-pressed="true"');
  expect(testSlot('blue',false,true)).toContain('disabled=""');
  const src=read('src/components/ui/SquareRaritySlot.tsx');
  expect(src).toContain('onClick={onSelect}');
  expect(src).not.toContain('dispatch');
  expect(src).not.toContain('getMarketProductPresentation');
 });
 it('defines and renders three restrained metal levels without globally replacing every button',()=>{
  expect(URBAN_FRAME_LEVELS.map(x=>x.id)).toEqual(['primary','secondary','light']);
  for(const level of URBAN_FRAME_LEVELS){
   const output=html(createElement(MetalFrame,{level:level.id,title:level.label,children:'內容'}));
   expect(output).toContain('data-urban-frame="'+level.id+'"');
   expect(output).toContain(level.label);
   expect(output).toContain('內容');
  }
 });
 it('is reachable from settings while obeying the original onboarding and chapter guards',()=>{
  const app=read('src/app/App.tsx');
  expect(app).toContain('import UiShowcasePage');
  expect(app).toContain('<Route path="/ui-lab" element={<UiShowcasePage/>}/>');
  expect(app).toContain("label:'UI 實驗室'");
  expect(app).toContain('<Link to="/ui-lab"');
  expect(app).toContain("if(state.onboarding.phase!=='complete')");
  expect(app).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
  const src=read('src/features/ui-showcase/UiShowcasePage.tsx');
  expect(src).not.toMatch(/\buseGame\s*\(/);
  expect(src).not.toMatch(/import[^;]*useGame/);
  expect(src).not.toContain('dispatch(');
  expect(src).not.toContain('saveGame');
  const markup=html(createElement(MemoryRouter,{children:createElement(UiShowcasePage)}));
  expect(markup).toContain('data-ui-showcase="v0.8.44"');
  expect(markup).toContain('金屬・微光設計實驗室');
  expect(markup).toContain('UI 元件展示區');
  expect(markup).toContain('生命 HP');
  expect(markup).toContain('體力 ST');
  expect(markup).toContain('1250 / 1000');
  expect(markup).toContain('550 / 900');
  expect(markup).toContain('aria-pressed="true"');
  expect(markup).toContain('gold');
  expect(markup).toContain('返回遊戲設定');
 });
 it('keeps the animated effects fully CSS-only and disables them for OS reduced motion',()=>{
  const css=read('src/styles/_v0844-urban-ui-showcase.scss');
  expect(css).toContain('--urban-steel-edge');
  expect(css).toContain('--urban-glass-bg');
  expect(css).toContain('--urban-rarity-gray');
  expect(css).toContain('--urban-rarity-purple');
  expect(css).toContain('--urban-rarity-gold');
  expect(css).toContain('@keyframes urban-flare-pulse');
  expect(css).toContain('@keyframes urban-spark-one');
  expect(css).toContain('@keyframes urban-rarity-flow');
  expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  expect(css).toContain('animation:none!important');
  expect(css).toContain('.urban-showcase__rarities');
  expect(css).toContain('aspect-ratio:1 / 1');
  expect(css).toContain('min-height:44px');
  expect(css).toContain('overflow-y:auto');
  expect(css).toContain('@media(max-width:375px)');
  expect(css).toContain('@media(max-height:560px)');
  expect(css).not.toContain('canvas');
  const root=read('src/styles/main.scss');
  expect(root.trimEnd()).toMatch(/@import "v0845-urban-selective-adoption";$/);
  expect(root.indexOf('@import "v0843-town-district-live";'))
   .toBeLessThan(root.indexOf('@import "v0844-urban-ui-showcase";'));
 });
 it('preserves original town, warehouse and market/card logic while changing version only',()=>{
  const app=read('src/app/App.tsx');
  expect(app).toContain('<Route path="/town/:districtId" element={<TownDistrictPage/>}/>');
  expect(app).toContain('<Route path="/town/classic" element={<TownPage/>}/>');
  expect(app).toContain('<Route path="/black-market" element={<BlackMarketPage/>}/>');
  expect(app).toContain('<Route path="/cards" element={<CardsPage/>}/>');
  expect(read('src/features/market/marketProductPresentation.ts')).toContain('UI-only display grades');
  expect(read('src/features/shelter/ShelterScene.tsx')).toContain('background_empty.jpg');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.45');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.45');
  expect(read('src/game/state/storage.ts')).toContain('localStorage');
 });
});
