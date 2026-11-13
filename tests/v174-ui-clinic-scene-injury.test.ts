import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {majorStateChanges} from '../src/components/GameFeedback';

const src=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
describe('v1.7.4 UI first batch — clinic and scene reading',()=>{
 it('uses shared mouse-drag scroll without disabling native mobile and keyboard interaction',()=>{
  const hook=src('src/components/useVerticalDragScroll.ts');
  expect(hook).toContain("event.pointerType!=='mouse'");
  expect(hook).toContain("el.scrollTop=mouseDragScrollTop(d.initialTop,offset)");
  expect(hook).toContain("event.preventDefault();");
  expect(hook).toContain("event.stopPropagation();");
  const clinic=src('src/features/town/ClinicDialog.tsx');
  expect(clinic).toContain('ref={dragScroll.scrollRef}');
  expect(clinic).toContain('onPointerMove={dragScroll.onPointerMove}');
  expect(clinic).toContain('onClickCapture={dragScroll.onClickCapture}');
  expect(clinic).toContain('tabIndex={0}');
  const css=src('src/styles/_v174a-scene-feedback.scss');
  expect(css).toContain('.clinic-dialog .clinic-dialog__content::-webkit-scrollbar');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('scrollbar-width:none!important');
 });
 it('pairs a smaller readable scene transcript with a right-side labeled bag button',()=>{
  const scene=src('src/features/chapter/ChapterPage.tsx');
  const style=src('src/styles/_v174a-scene-feedback.scss');
  expect(scene).toContain('<div className="chapter-story-row">');
  expect(scene).toContain('role="region"');
  expect(scene).toContain('ref={storyDrag.scrollRef}');
  expect(scene).toContain('className="story-panel__scroll"');
  expect(scene).toContain('className="chapter-bag-access"');
  expect(scene).toContain('<span>查看背包</span>');
  expect(scene.indexOf('className="chapter-bag-access"')).toBeGreaterThan(scene.indexOf('className="story-panel__scroll"'));
  expect(style).toContain('grid-template-columns:minmax(0,1fr) clamp(104px,19%,130px)');
  expect(style).toContain('.chapter-story-row .story-panel__thought');
  expect(style).toContain('-webkit-line-clamp:unset!important');
  expect(style).toContain('height:clamp(102px,15dvh,138px)');
  expect(style).toContain('.chapter-story-row .story-panel__scroll::-webkit-scrollbar');
 });
});
describe('v1.7.4 UI first batch — hit and critical injury feedback',()=>{
 it('uses the same resolved incoming damage for large central red attack text',()=>{
  const feedback=src('src/features/chapter/EnemyCounterProjectile.tsx');
  const css=src('src/styles/_v174a-scene-feedback.scss');
  expect(feedback).toContain('遭受攻擊 −${strike.damage}');
  expect(css).toContain('.enemy-counter--hit .enemy-counter__text');
  expect(css).toContain('top:43%!important;left:50%!important');
  expect(css).toContain('color:#ff8799!important');
  expect(css).toContain('clamp(32px,9vw,76px)');
  expect(css).toContain('2.75s');
 });
 it('keeps the existing injury trigger but presents actual old/new HP in a compact panel',()=>{
  const s=makeInitialState('journalist');s.player.health=6;
  const after=structuredClone(s);after.player.health=0;
  const notices=majorStateChanges(s,after);
  const serious=notices.find(x=>x.title==='嚴重受傷');
  expect(serious?.detail).toBe('生命 6 → 0');
  const feedback=src('src/components/GameFeedback.tsx');
  const css=src('src/styles/_v174a-scene-feedback.scss');
  expect(feedback).toContain('critical-notice__readout');
  expect(feedback).toContain('critical-notice__pulse');
  expect(feedback).toContain("notice.kind==='danger'?4600:2700");
  expect(css).toContain('aspect-ratio:auto!important');
  expect(css).toContain('width:min(92vw,392px)!important');
  expect(css).toContain('prefers-reduced-motion:reduce');
 });
});
