import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SHELTER_FURNITURE_IDS} from '../src/game/engine/shelterVisuals';
import ShelterScene from '../src/features/shelter/ShelterScene';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

describe('v0.8.41 scroll hotfix — safehouse must remain a scrollable portrait main screen',()=>{
 const viewport=read('src/styles/_viewport.scss');
 const fix=read('src/styles/_v0841-shelter-scroll-hotfix.scss');
 const home=read('src/features/shelter/ShelterHomePage.tsx');
 const main=read('src/styles/main.scss');
 it('identifies the original CSS conflict that locked scrolling and shrank the scene',()=>{
  expect(viewport).toContain('html,body,#root{width:100%;height:100%;margin:0;overflow:hidden;');
  expect(viewport).toContain('.app-main>.viewport-page{overflow:hidden!important;');
  expect(read('src/styles/_v0838-shelter-hub.scss')).toContain('.shelter-home-page{gap:13px;padding-bottom:32px;max-width:100%;overflow:hidden}');
  expect(home).toContain('className="page-stack shelter-home-page viewport-page"');
  expect(home).toContain('className="shelter-home-scene-panel"');
 });
 it('restores a scoped inner vertical scroll with sufficient priority over !important viewport rule',()=>{
  expect(fix).toMatch(/\.app-main\s*>\s*\.shelter-home-page\.viewport-page\s*\{/);
  expect(fix).toContain('overflow-y:auto!important');
  expect(fix).toContain('overflow-x:hidden!important');
  expect(fix).toContain('overscroll-behavior-y:contain');
  expect(fix).toContain('touch-action:pan-y');
  expect(fix).toContain('-webkit-overflow-scrolling:touch');
  expect(fix).toContain('height:100%');
  expect(fix).toContain('min-height:0');
  expect(fix).not.toMatch(/html\s*,\s*body\s*[,\{]/);
  expect(fix).not.toContain('.app-main--mission');
  expect(fix).not.toContain('.world-map-page{');
  expect(main.indexOf('@import "viewport"')).toBeLessThan(main.indexOf('@import "v0841-shelter-scroll-hotfix"'));
  expect(main.trimEnd()).toMatch(/@import "v0841-shelter-scroll-hotfix";$/);
 });
 it('keeps the 768×1376 scene from flex-shrinking to a line while retaining all clickable items',()=>{
  expect(fix).toContain('.app-main > .shelter-home-page.viewport-page > *{');
  expect(fix).toContain('flex-shrink:0');
  expect(fix).toContain('flex:0 0 auto');
  expect(fix).toContain('aspect-ratio:768 / 1376');
  expect(fix).toContain('.shelter-scene__background');
  const html=renderToStaticMarkup(createElement(ShelterScene,{owned:[...SHELTER_FURNITURE_IDS],onSelect:()=>{}}));
  expect(html).toContain('background_full.jpg');
  expect(html).toContain('data-scene-mode="full"');
  expect(html).toContain('style="aspect-ratio:768 / 1376"');
  expect((html.match(/data-furniture-marker=/g)||[])).toHaveLength(8);
  expect(html).not.toContain('class="shelter-scene__furniture"');
 });
 it('reuses the proven document-level mouse drag hook, without stealing touch or single clicks',()=>{
  expect(home).toContain("import {useVerticalDragScroll} from '../../components/useVerticalDragScroll'");
  expect(home).toContain('const shelterScroll=useVerticalDragScroll()');
  expect(home).toContain('ref={shelterScroll.scrollRef}');
  expect(home).toContain('onPointerDown={shelterScroll.onPointerDown}');
  expect(home).toContain('onPointerMove={shelterScroll.onPointerMove}');
  expect(home).toContain('onPointerUp={shelterScroll.onPointerUp}');
  expect(home).toContain('onPointerCancel={shelterScroll.onPointerCancel}');
  expect(home).toContain('onClickCapture={shelterScroll.onClickCapture}');
  const hook=read('src/components/useVerticalDragScroll.ts');
  expect(hook).toContain("event.pointerType!=='mouse'||event.button!==0");
  expect(hook).toContain('Math.abs(offset)>=7');
  expect(hook).toContain('suppressClick.current=true');
  expect(hook).toContain("document.addEventListener('pointermove',onMove,{capture:true,passive:false})");
 });
 it('preserves both scene modes and the complete player home controls',()=>{
  expect(home).toContain('<ShelterScene owned={owned}');
  expect(home).toContain('<ShelterBuildDemoPanel/>');
  expect(home).toContain('<ShelterAttentionPanel owned={owned}');
  expect(home).toContain('className="shelter-facility-index surface-card"');
  expect(home).toContain('className="shelter-home-footer-links"');
  expect(fix).toContain('@media(max-height:520px)');
  expect(fix).toContain('overflow-y:auto!important');
  expect(read('src/styles/_v0841-shelter-integration.scss')).toContain('min-height:44px');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.41');
 });
});
