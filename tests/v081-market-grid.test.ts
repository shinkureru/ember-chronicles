import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
const src=(f:string)=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
describe('v0.8.1 black-market product catalog',()=>{
 it('uses ordered, deterministic product tiles without random rotation or vertical offsets',()=>{
  const ui=src('src/features/market/BlackMarketPage.tsx');
  const css=src('src/styles/_v081-market-grid.scss');
  expect(ui).toContain('market-v12__offers market-v081__catalog');
  expect(ui).not.toContain('--offer-angle');
  expect(ui).not.toContain('--offer-y');
  expect(css).toContain('grid-template-columns:repeat(3,minmax(0,1fr))!important');
  expect(css).toContain('transform:none!important');
  expect(css).toContain('grid-auto-rows:clamp(106px,14dvh,135px)');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))!important');
 });
 it('retains desktop drag, touch, keyboard and mouse wheel but hides the scrollbar',()=>{
  const ui=src('src/features/market/BlackMarketPage.tsx');
  const css=src('src/styles/_v081-market-grid.scss');
  for(const token of ['onPointerDown={startDrag}','onPointerMove={dragMove}','onPointerUp={stopDrag}','box.scrollTop=state.scrollTop-delta','tabIndex={0}'])
   expect(ui).toContain(token);
  expect(css).toContain('scrollbar-width:none!important');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('::-webkit-scrollbar{width:0!important;display:none!important}');
  expect(ui).toContain('向上拖曳或滾動，查看下方更多商品');
 });
 it('retains selection modal, actual trade dispatch and purchase-first default',()=>{
  const ui=src('src/features/market/BlackMarketPage.tsx');
  expect(ui).toContain("useState<Mode|null>('buy')");
  expect(ui).toContain('if(suppressOfferClick.current)return;');
  expect(ui).toContain("type:'MARKET_BUY_ITEM'");
  expect(ui).toContain("type:'MARKET_SELL_ITEM'");
  expect(ui).toContain('selected&&mode&&');
  expect(JSON.parse(src('package.json')).version).toMatch(/^0\.8\.[12]$/);
 });
});