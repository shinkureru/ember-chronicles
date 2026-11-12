import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';

const file=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

describe('v0.8.3 town and inn scroll containment',()=>{
 it('lets expanded condition information push town facilities into its own vertically draggable viewport',()=>{
  const tsx=file('src/features/town/TownPage.tsx');
  const css=file('src/styles/_v083-town-inn-scroll.scss');
  expect(tsx).toContain('ref={townScroll.scrollRef}');
  expect(tsx).toContain('onPointerMove={townScroll.onPointerMove}');
  expect(tsx).toContain('onClickCapture={townScroll.onClickCapture}');
  expect(tsx).toContain('tabIndex={0} role="region"');
  expect(css).toContain('.app-main > .page-stack.town-v15.viewport-page');
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('::-webkit-scrollbar{display:none!important');
  expect(css).toContain('.town-v15 > .town-v15__facilities');
  expect(css).toContain('flex:0 0 auto!important');
 });
 it('uses the existing mouse threshold to avoid triggering a facility when dragging',()=>{
  const hook=file('src/components/useVerticalDragScroll.ts');
  expect(hook).toContain('Math.abs(offset)>=7');
  expect(hook).toContain('suppressClick.current=true');
  expect(hook).toContain('event.preventDefault();');
  expect(hook).toContain('event.stopPropagation();');
 });
 it('leaves the three bed variants and actual inn reducer untouched',()=>{
  const dialog=file('src/features/town/InnRestDialog.tsx');
  for(const id of ['rest_cot','rest_private','rest_short'])expect(dialog).toContain(id);
  expect(dialog).toContain('previewInnRest(s,selected)');
  expect(dialog).toContain('onConfirm(selected)');
  expect(dialog).toContain('getTownServiceLock(s,selected)');
 });
 it('reserves stable rest title and confirmation footer and scrolls only the preview',()=>{
  const dialog=file('src/features/town/InnRestDialog.tsx');
  const css=file('src/styles/_v083-town-inn-scroll.scss');
  expect(dialog).toContain('className="inn-rest-dialog__scroll"');
  expect(dialog).toContain('ref={innerScroll.scrollRef}');
  expect(dialog.indexOf('className="inn-rest-dialog__scroll"')).toBeLessThan(dialog.indexOf('<footer>'));
  expect(css).toContain('.inn-rest-dialog > footer{');
  expect(css).toContain('flex:0 0 auto');
  expect(css).toContain('overflow:hidden!important');
  expect(css).toContain('min-height:0');
  expect(css).toContain('overflow-y:auto;overflow-x:hidden');
  expect(css).toContain('max-height:calc(100dvh - 14px)');
 });
});
