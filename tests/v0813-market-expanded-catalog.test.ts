import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('src/styles/_v0813-market-expanded-catalog.scss');
const market=read('src/features/market/BlackMarketPage.tsx');

describe('v0.8.13 expanded black market catalog',()=>{
 it('gives merchandise the extra room released from the former 53% meeting',()=>{
  const historical=read('src/styles/_v12.scss');
  expect(historical).toContain('flex:1 1 53%');
  expect(historical).toContain('flex:1 1 47%');
  expect(css).toContain('flex:0 0 clamp(162px,29%,295px)');
  expect(css).toContain('.market-v13 .market-v12__table');
  expect(css).toContain('flex:1 1 0');
  expect(css).toContain('min-height:0');
  expect(css).toContain('overflow:hidden');
  expect(css).toContain('bottom:34px');
  expect(css).toContain('.market-v13 .market-v13__favor');
  expect(css).toContain('bottom:4px');
 });
 it('reflows a smaller three-column catalog with a two-column narrow fallback',()=>{
  expect(css).toContain('.market-v13 .market-v12__table .market-v081__catalog');
  expect(css).toContain('grid-template-columns:repeat(3,minmax(0,1fr))!important');
  expect(css).toContain('grid-auto-rows:clamp(88px,8.6dvh,100px)');
  expect(css).toContain('column-gap:7px!important');
  expect(css).toContain('row-gap:7px!important');
  expect(css).toContain('@media(max-width:375px)');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))!important');
  expect(css).toContain('grid-auto-rows:clamp(93px,10dvh,106px)');
  expect(css).toContain('@media(max-height:700px)');
  expect(css).toContain('@media(max-height:520px)');
 });
 it('keeps name and prices legible and prevents the indicator from intercepting clicks',()=>{
  expect(css).toContain('-webkit-line-clamp:2');
  expect(css).toContain('min-height:2.55em');
  expect(css).toContain('max-height:2.55em');
  expect(css).toContain('overflow-wrap:anywhere');
  expect(css).toContain('min-height:13px');
  expect(css).toContain('font-variant-numeric:tabular-nums');
  expect(css).toContain('max-width:35px');
  expect(css).toContain('pointer-events:none');
  expect(css).toContain('padding:4px 5px 22px!important');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('scrollbar-width:none!important');
 });
 it('preserves vendor story, selection modal, buy/sell and filtering actions',()=>{
  for(const token of [
   'market-v12__meeting','market-v12__dialogue','market-v13__favor',
   'market-v13__filter-wrap','market-v13__filters','market-v13__extra-filters',
   'market-v12__offers market-v081__catalog','market-v12__modes',
   'market-v10__footer','market-v10__overlay',
   'selected&&mode&&','setSelectedId(offer.id)',
   'onClickCapture={offersScroll.onClickCapture}',
   "type:'MARKET_BUY_ITEM'","type:'MARKET_SELL_ITEM'",
   "type:'MARKET_BUY'","type:'MARKET_SELL'",
   'ReturnMainLink','GameUtilities',
  ])expect(market).toContain(token);
  expect(read('src/styles/main.scss')).toContain('@import "v0813-market-expanded-catalog"');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.13');
 });
 it('does not reintroduce random product card rotations or blocking scroll overlays',()=>{
  expect(market).not.toContain('--offer-y');
  expect(market).not.toContain('--offer-angle');
  expect(css).not.toContain('position:fixed');
  expect(css).not.toContain('pointer-events:auto');
  expect(css).toContain('overflow-y:auto!important');
 });
});
