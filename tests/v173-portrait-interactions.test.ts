import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ProfessionResourceIcon from '../src/components/ProfessionResourceIcon';
const read=(file:string)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

describe('v1.7.3 portrait UI readability and interaction contract',()=>{
 it('reserves inn recovery-advice and bed-label room without clipping longer values',()=>{
  const css=read('src/styles/_v174-interface.scss');
  expect(css).toContain('.inn-rest-advice{min-height:112px');
  expect(css).toContain('.inn-rest-options strong{display:-webkit-box');
  expect(css).toContain('.inn-rest-dialog footer button{min-height:46px');
 });
 it('shows a visibly labeled backpack button inside the mission artwork instead of an icon-only toolbar entry',()=>{
  const src=read('src/features/chapter/ChapterPage.tsx');
  expect(src).toContain('className="chapter-bag-access"');
  expect(src).toContain('<span>查看背包</span>');
  expect(src).toContain("onClick={()=>{setShowBag(true);playCue('open')}}");
  expect(src).not.toContain('aria-label="打開任務背包"');
 });
 it('uses a three-column, two-row-preview vertical skill grid with hidden scrollbars',()=>{
  const skill=read('src/features/chapter/SkillHand.tsx');
  const css=read('src/styles/_v174-interface.scss');
  expect(skill).toContain('track.scrollTop=d.scrollTop-dy');
  expect(skill).toContain('aria-label="可上下拖曳與滑動的附加技能卡，每列三張"');
  expect(css).toContain('grid-template-columns:repeat(3,minmax(0,1fr))!important');
  expect(css).toContain('grid-auto-rows:clamp(96px,13.8dvh,124px)');
  expect(css).toContain('overflow-y:auto!important;overflow-x:hidden!important');
  expect(css).toContain('skill-scatter__track::-webkit-scrollbar{display:none}');
  expect(skill).toContain('skill-tile__resource');
  expect(skill).not.toContain('資源消耗');
 });
 it('has unique profession-specific resource icons for Journalists, Couriers and Infiltrators',()=>{
  const symbols=['journalist','courier','infiltrator'].map(profession=>renderToStaticMarkup(createElement(ProfessionResourceIcon,{profession:profession as 'journalist'|'courier'|'infiltrator',size:14})));
  expect(new Set(symbols).size).toBe(3);
  expect(symbols.every(s=>s.includes('<svg'))).toBe(true);
  const hud=read('src/components/Hud.tsx');
  expect(hud).toContain('<ProfessionResourceIcon profession={s.profession}');
  const skill=read('src/features/chapter/SkillComparison.tsx');
  expect(skill).toContain('<ProfessionResourceIcon profession={state.profession}');
 });
 it('starts the black market on Buy and allows vertical mouse-drag without triggering a product click',()=>{
  const src=read('src/features/market/BlackMarketPage.tsx');
  const css=read('src/styles/_v174-interface.scss');
  expect(src).toContain("const [mode,setMode]=useState<Mode|null>('buy')");
  expect(src).toContain('box.scrollTop=state.scrollTop-delta');
  expect(src).toContain('if(suppressOfferClick.current)return;');
  expect(src).toContain('onPointerDown={startDrag} onPointerMove={dragMove}');
  expect(css).toContain('.market-v13 .market-v12__offers::-webkit-scrollbar{display:none}');
  expect(css).toContain('touch-action:pan-y');
 });
 it('renders missed enemy attacks as a large central readable noninteractive flash',()=>{
  const css=read('src/styles/_v174-interface.scss');
  expect(css).toContain('.enemy-counter--miss .enemy-counter__text');
  expect(css).toContain('position:fixed!important;top:43%');
  expect(css).toContain('pointer-events:none;');
 });
 it('disables selection and copying of ordinary game content but preserves editable controls',()=>{
  const css=read('src/styles/_v174-interface.scss');
  const frame=read('src/components/Frame.tsx');
  expect(css).toContain('user-select:none;-webkit-user-select:none');
  expect(css).toContain('[contenteditable="true"],[role="textbox"]{user-select:text!important');
  expect(frame).toContain('onCopy={event=>');
  expect(frame).toContain('event.preventDefault()');
  expect(frame).toContain('textarea,select,[contenteditable="true"]');
 });
});
