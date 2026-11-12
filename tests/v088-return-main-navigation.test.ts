import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';

const read=(name:string)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const frame=read('src/components/Frame.tsx');
const link=read('src/components/ReturnMainLink.tsx');
const css=read('src/styles/_v088-return-navigation.scss');

describe('v0.8.8 safe return-to-main navigation',()=>{
 it('only links back to the existing home/map route when the player is not in a mission',()=>{
  expect(link).toContain("if(state.mode!=='home')return null");
  expect(link).toContain('<NavLink to="/" end');
  expect(link).toContain('返回主畫面');
  expect(link).not.toContain("dispatch(");
  const routing=read('src/app/App.tsx');
  expect(routing).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
  expect(routing).toContain('<Navigate to="/chapter" replace/>');
  expect(read('src/features/chapter/ChapterPage.tsx')).toContain("dispatch({type:'RETURN_HUB'})");
 });
 it('shows a bottom-right navigation dock on regular pages but not the map, mission, or inlined pages',()=>{
  expect(frame).toContain("const onMap=location.pathname==='/'");
  expect(frame).toContain("const returnInsidePage=['/black-market','/cards','/preparation'].includes(location.pathname)");
  expect(frame).toContain('!inMission&&!onMap&&!returnInsidePage&&<nav className="return-main-dock"');
  expect(frame).toContain('<ReturnMainLink/>');
  expect(frame).toContain("const inMission=state.mode!=='home'");
  const routes=read('src/app/App.tsx');
  const special=frame.split('const returnInsidePage=')[1]?.split(';')[0]??'';
  for(const path of ['/town','/warehouse','/character','/settings','/dev']){
   expect(routes).toContain(`path="${path}"`);
   expect(special).not.toContain(path);
  }
  expect(css).toContain('.return-main-dock{');
  expect(css).toContain('justify-content:flex-end');
  expect(css).toContain('flex:0 0 auto');
  expect(css).toContain('border-top:1px');
  expect(css).toContain('.return-main-link:focus-visible');
 });
 it('integrates the link into three existing controls, without duplicate route-level navigation',()=>{
  const market=read('src/features/market/BlackMarketPage.tsx');
  const cards=read('src/features/cards/CardsPage.tsx');
  const prep=read('src/features/preparation/PreparationPage.tsx');
  expect(market).toContain('<ReturnMainLink className="return-main-link--market"/>');
  expect(cards).toContain('<ReturnMainLink className="return-main-link--cards"/>');
  expect(prep).toContain('<ReturnMainLink className="return-main-link--preparation"/>');
  expect(prep).toContain('帶著這些準備進關');
  expect(prep).toContain('onClick={requestStart}');
  expect(css).toContain('.market-v13 .market-v10__footer>.return-main-link');
  expect(css).toContain('.cards-viewport .card-library-footer .return-main-link');
  expect(css).toContain('.preparation-footer__actions .return-main-link');
  expect(css).toContain('grid-template-columns:minmax(0,.85fr) minmax(0,1.4fr)');
 });
 it('v0.8.9 keeps return actions while moving version and settings off the old top navbar',()=>{
  expect(frame).not.toContain('<header className="app-header">');
  expect(frame).toContain('<GameUtilities className="game-utilities--dock"/>');
  expect(frame).toContain('<ReturnMainLink/>');
  expect(read('src/features/world-map/ChapterMapPage.tsx')).toContain('game-utilities--map');
  expect(read('src/components/GameUtilities.tsx')).toContain('__APP_VERSION__');
  expect(read('src/components/GameUtilities.tsx')).toContain('__BUILD_REVISION__');
  expect(JSON.parse(read('package.json')).version.startsWith('0.8.')).toBe(true);
  expect(css).toContain('@media(max-width:365px)');
  expect(css).toContain('@media(max-height:620px)');
 });
});
