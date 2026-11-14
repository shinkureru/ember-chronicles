import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { GameProvider, useGame } from './GameContext';
import BootSplash from './BootSplash';
import {resetPrototypeAndReload} from '../game/state/storage';
import ViewTabs from '../components/ViewTabs';
import AudioSettingsControls from '../features/settings/AudioSettingsControls';
import Frame from '../components/Frame';
import HomePage from '../features/chapter/HomePage';
import ChapterPage from '../features/chapter/ChapterPage';
import CardsPage from '../features/cards/CardsPage';
import PreparationPage from '../features/preparation/PreparationPage';
import WarehousePage from '../features/inventory/WarehousePage';
import CharacterPage from '../features/player/CharacterPage';
import DevPage from '../features/dev/DevPage';
import TownPage from '../features/town/TownPage';
import BlackMarketPage from '../features/market/BlackMarketPage';
import OnboardingPage from '../features/onboarding/OnboardingPage';
import ChapterMapPage from '../features/world-map/ChapterMapPage';

function SettingsPage(){
 const [tab,setTab]=useState('audio');const [resetError,setResetError]=useState(false);
 return <div className="page-stack settings-page viewport-page"><section className="page-heading"><span className="eyebrow">OPTIONS / SYSTEM</span><h1>遊戲設定</h1><p>調整音效、查看存檔方式。所有變更只會保存在目前裝置。</p></section>
 <ViewTabs value={tab} onChange={setTab} tabs={[{id:'audio',label:'音量與聲音'},{id:'data',label:'存檔與重設'}]}/>
 {tab==='audio'&&<section className="surface-card audio-settings viewport-list"><h3>音效控制</h3><AudioSettingsControls/><p>本版聲音由 Web Audio 原創合成，瀏覽器需先有點擊操作才可播放。</p></section>}
 {tab==='data'&&<div className="settings-data viewport-list"><section className="surface-card"><h3>存檔與設備</h3><p>遊戲會自動儲存到目前瀏覽器。GitHub Pages 尚未提供跨裝置同步功能。</p></section><section className="surface-card"><h3><ShieldAlert size={17}/>重設遊戲（開發測試）</h3><p>此功能僅供原型測試。將清除本遊戲的本機存檔、重新整理整個頁面，重新演示全螢幕開場畫面；正式版預計移除。</p><button type="button" className="danger-button" data-prototype-only="true" onClick={()=>{if(window.confirm('確定刪除全部原型存檔並重新開啟遊戲？NPC 記憶、牌組、裝備與倉庫都會清除且無法還原。')){if(!resetPrototypeAndReload())setResetError(true)}}}><RotateCcw size={15}/>刪除本機存檔並重啟</button>{resetError&&<p role="alert">無法刪除本機存檔。請檢查瀏覽器的儲存權限。</p>}</section></div>}
 </div>;
}
function NotFound(){return <section className="surface-card"><h2>找不到這個頁面</h2><a href="#/">返回避難所</a></section>}
/** Prevent players from bypassing the in-mission navigation lock by editing the URL. */
function GameRoutes(){
 const {state}=useGame(),location=useLocation();
 // All first-run screens are controlled by persisted onboarding progress, never URL navigation.
 if(state.onboarding.phase!=='complete')return <OnboardingPage/>;
 if(state.mode!=='home'&&location.pathname!=='/chapter')return <Navigate to="/chapter" replace/>;
 return <Routes>
  <Route path="/" element={<HomePage/>}/>
  <Route path="/world-map" element={state.profession?<ChapterMapPage/>:<Navigate to="/" replace/>}/>
  <Route path="/town" element={<TownPage/>}/>
  <Route path="/black-market" element={<BlackMarketPage/>}/>
  <Route path="/chapter" element={<ChapterPage/>}/>
  <Route path="/cards" element={<CardsPage/>}/>
  <Route path="/preparation" element={<PreparationPage/>}/>
  <Route path="/warehouse" element={<WarehousePage/>}/>
  <Route path="/character" element={<CharacterPage/>}/>
  <Route path="/settings" element={<SettingsPage/>}/>
  <Route path="/dev" element={<DevPage/>}/>
  <Route path="*" element={<NotFound/>}/>
 </Routes>;
}
/** Keep the cover outside Frame so no HUD, route or game UI appears beneath it. */
function GameBootGate({children}:{children:ReactNode}){
 const [booting,setBooting]=useState(true);
 return booting?<BootSplash onComplete={()=>setBooting(false)}/>:<>{children}</>;
}
export default function App(){return <GameProvider><HashRouter><GameBootGate><Frame><GameRoutes/></Frame></GameBootGate></HashRouter></GameProvider>}
