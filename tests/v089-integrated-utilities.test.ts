import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

const frame=read('src/components/Frame.tsx');
const utilities=read('src/components/GameUtilities.tsx');
const css=read('src/styles/_v089-integrated-utilities.scss');
const map=read('src/features/world-map/ChapterMapPage.tsx');

describe('v0.8.9 full removal of global navbar and safe integrated system access',()=>{
 it('removes the entire global navbar markup without deleting the main view, the existing return dock, or game feedback',()=>{
  expect(frame).not.toContain('<header className="app-header">');
  expect(frame).not.toContain('app-header__brand');
  expect(frame).not.toContain('app-header__back');
  expect(frame).not.toContain('app-header__version');
  expect(frame).not.toContain('app-header__settings');
  expect(frame).toContain('<main key={location.pathname}');
  expect(frame).toContain('!inMission&&!onMap&&!returnInsidePage');
  expect(frame).toContain('<GameUtilities className="game-utilities--dock"/>');
  expect(frame).toContain('<ReturnMainLink/>');
  expect(frame).toContain('<GameFeedback/>');
 });
 it('keeps build revision and settings available inside the existing map overview',()=>{
  expect(utilities).toContain('__APP_VERSION__');
  expect(utilities).toContain('__BUILD_REVISION__');
  expect(utilities).toContain('v{__APP_VERSION__}');
  expect(utilities).toContain('__BUILD_REVISION__}</small>');
  expect(utilities).toContain('location.pathname!==\'/settings\'');
  expect(utilities).toContain('state.mode===\'home\'');
  expect(utilities).toContain('<Link to="/settings"');
  expect(map).toContain('<GameUtilities className="game-utilities--map"/>');
  expect(map).not.toContain('<strong>01</strong>');
  expect(map).toContain('CHAPTER 01 / WORLD MAP');
  expect(map).toContain('city-overview__progress');
  expect(css).toContain('.city-overview__title>.game-utilities');
 });
 it('makes system settings available before first character creation and displays build inside mission settings',()=>{
  const home=read('src/features/chapter/HomePage.tsx');
  const missionSettings=read('src/features/settings/GameSettingsDialog.tsx');
  const chapter=read('src/features/chapter/ChapterPage.tsx');
  expect(home).toContain('home-hero__top');
  expect(home).toContain('<GameUtilities className="game-utilities--prologue"/>');
  expect(home).toContain('if(state.profession)return <ChapterMapPage/>');
  expect(missionSettings).toContain('<BuildVersion/>');
  expect(missionSettings).not.toContain('<GameUtilities');
  expect(chapter).toContain('<GameSettingsDialog');
  expect(css).toContain('.mission-settings__build');
 });
 it('does not reintroduce a route escape in the middle of an adventure or during results',()=>{
  const routing=read('src/app/App.tsx');
  const main=read('src/components/ReturnMainLink.tsx');
  expect(utilities).toContain("state.mode==='home'");
  expect(frame).toContain("const inMission=state.mode!=='home'");
  expect(routing).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
  expect(main).toContain("if(state.mode!=='home')return null");
  expect(main).not.toContain('dispatch(');
  expect(chapterOrResultHasOriginalExit()).toBe(true);
 });
 it('reuses the existing bottom area on all other screens, including three inlined pages',()=>{
  const market=read('src/features/market/BlackMarketPage.tsx');
  const cards=read('src/features/cards/CardsPage.tsx');
  const prep=read('src/features/preparation/PreparationPage.tsx');
  expect(frame).toContain("returnInsidePage=['/black-market','/cards','/preparation']");
  expect(market).toContain('<GameUtilities className="game-utilities--market"/>');
  expect(market).toContain('<ReturnMainLink className="return-main-link--market"/>');
  expect(cards).toContain('<GameUtilities className="game-utilities--cards"/>');
  expect(cards).toContain('<ReturnMainLink className="return-main-link--cards"/>');
  expect(prep).toContain('<GameUtilities className="game-utilities--preparation"/>');
  expect(prep).toContain('<ReturnMainLink className="return-main-link--preparation"/>');
  expect(prep).toContain('帶著這些準備進關');
  expect(css).toContain('.return-main-dock>.game-utilities');
  expect(css).toContain('.market-v13 .market-v10__footer>.game-utilities');
  expect(css).toContain('.cards-viewport .card-library-footer>.game-utilities');
  expect(css).toContain('.preparation-footer__utility-row');
  expect(css).not.toContain('position:fixed');
 });
 it('has compact viewport and accessible controls with no new sticky/floating topbar',()=>{
  expect(css).toContain('@media(max-width:480px)');
  expect(css).toContain('@media(max-width:370px)');
  expect(css).toContain('@media(max-height:620px)');
  expect(css).toContain('justify-content:space-between');
  expect(utilities).toContain('aria-label="開啟遊戲設定"');
  expect(utilities).toContain('aria-label={`目前遊戲版本');
  expect(JSON.parse(read('package.json')).version).toMatch(/^0\.8\.\d+$/);
 });
});
const chapterOrResultHasOriginalExit=()=>{
 const src=read('src/features/chapter/ChapterPage.tsx');
 return src.includes('RETURN_HUB')&&src.includes('RetreatDialog')&&src.includes('MissionTransition');
};
