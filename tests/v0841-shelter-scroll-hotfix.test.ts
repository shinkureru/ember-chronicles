import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ShelterScene from '../src/features/shelter/ShelterScene';
import {SHELTER_FURNITURE_IDS} from '../src/game/engine/shelterVisuals';
const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

describe('v0.8.41 regression contract, updated for v0.8.42 fixed single-screen safehouse',()=>{
 const home=read('src/features/shelter/ShelterHomePage.tsx');
 const oldRepair=read('src/styles/_v0841-shelter-scroll-hotfix.scss');
 const current=read('src/styles/_v0842-city-shelter.scss');
 const main=read('src/styles/main.scss');
 it('documents the old collapse bug and keeps the legacy repair for truly long pages',()=>{
  expect(read('src/styles/_viewport.scss')).toContain('.app-main>.viewport-page{overflow:hidden!important;');
  expect(oldRepair).toContain('flex-shrink:0');
  expect(oldRepair).toContain('overflow-y:auto!important');
  expect(main.indexOf('@import "v0841-shelter-scroll-hotfix"')).toBeLessThan(main.indexOf('@import "v0842-city-shelter"'));
  expect(main.trimEnd()).toMatch(/@import "v0851-brushed-metal-final";$/);
 });
 it('user-requested one-screen home replaces vertical dragging with its own high-priority CSS',()=>{
  expect(home).toContain('className="shelter-home-page shelter-home-page--compact viewport-page"');
  expect(home).not.toContain('useVerticalDragScroll');
  expect(home).not.toContain('onPointerMove={shelterScroll.onPointerMove}');
  expect(current).toContain('.app-main > .shelter-home-page.shelter-home-page--compact.viewport-page{');
  expect(current).toContain('overflow:hidden!important');
  expect(current).toContain('touch-action:manipulation');
  expect(current).toContain('height:100%');
  expect(current).toContain('max-height:100%');
 });
 it('the 768×1376 scene is resized to fit its visible frame, never flex-shrunk to zero',()=>{
  expect(home).toContain('function ShelterStageFit(');
  expect(home).toContain('new ResizeObserver(measure)');
  expect(home).toContain('fitPortraitStage(node.clientWidth,node.clientHeight)');
  expect(read('src/components/ui/portraitStageFit.ts')).toContain('const scale=Math.min(containerWidth/artWidth,containerHeight/artHeight)');
  expect(current).toContain('.shelter-home-scene-panel--compact');
  expect(current).toContain('flex:1 1 auto');
  expect(current).toContain('.shelter-stage-fit__content .shelter-scene{');
  expect(current).toContain('height:100%');
  const html=renderToStaticMarkup(createElement(ShelterScene,{owned:[...SHELTER_FURNITURE_IDS],onSelect:()=>{}}));
  expect(html).toContain('background_full.jpg');
  expect((html.match(/data-furniture-marker=/g)??[])).toHaveLength(8);
  expect(html).not.toContain('class="shelter-scene__furniture"');
 });
 it('all optional tools are in a genuinely scrollable overlay and closed by default',()=>{
  expect(home).toContain('{toolsOpen&&<div className="shelter-drawer-backdrop"');
  expect(home).toContain('role="dialog" aria-modal="true"');
  expect(home).toContain('aria-expanded={toolsOpen}');
  expect(home).toContain("event.key==='Escape'");
  expect(home).toContain('onClick={()=>setToolsOpen(false)}');
  expect(home).toContain('<ShelterBuildDemoPanel/>');
  expect(home).toContain('<ShelterAttentionPanel owned={owned}');
  expect(home).toContain('className="shelter-facility-index surface-card"');
  expect(current).toContain('.shelter-drawer__content{');
  expect(current).toContain('overflow-y:auto');
  expect(current).toContain('overscroll-behavior:contain');
  expect(current).toContain('touch-action:pan-y');
  expect(read('src/components/useVerticalDragScroll.ts')).toContain('suppressClick.current=true');
 });
 it('keeps the former art-layout and save version unchanged except for deliberate v0.8.42 bump',()=>{
  expect(JSON.parse(read('package.json')).version).toBe('0.8.51');
  expect(read('src/game/data/shelter/warehouse-layout.json')).toContain('"width": 768');
  expect(read('src/game/data/shelter/warehouse-layout.json')).toContain('"height": 1376');
  expect(current).toContain('@media(prefers-reduced-motion:reduce)');
 });
});
