import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { GameProvider, useGame } from './GameContext';
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

function SettingsPage(){
 const {dispatch}=useGame();const [tab,setTab]=useState('audio');
 return <div className="page-stack settings-page viewport-page"><section className="page-heading"><span className="eyebrow">OPTIONS / SYSTEM</span><h1>遊戲設定</h1><p>調整音效、查看存檔方式。所有變更只會保存在目前裝置。</p></section>
 <ViewTabs value={tab} onChange={setTab} tabs={[{id:'audio',label:'音量與聲音'},{id:'data',label:'存檔與重設'}]}/>
 {tab==='audio'&&<section className="surface-card audio-settings viewport-list"><h3>音效控制</h3><AudioSettingsControls/><p>本版聲音由 Web Audio 原創合成，瀏覽器需先有點擊操作才可播放。</p></section>}
 {tab==='data'&&<div className="settings-data viewport-list"><section className="surface-card"><h3>存檔與設備</h3><p>遊戲會自動儲存到目前瀏覽器。GitHub Pages 尚未提供跨裝置同步功能。</p></section><section className="surface-card"><h3><ShieldAlert size={17}/>重設遊戲</h3><p>此操作會清除 NPC 記憶、牌組、裝備與倉庫等全部原型進度。</p><button type="button" className="danger-button" onClick={()=>{if(window.confirm('確定刪除全部原型存檔？這個動作無法還原。'))dispatch({type:'RESET'})}}><RotateCcw size={15}/>清除本機存檔</button></section></div>}
 </div>;
}
function NotFound(){return <section className="surface-card"><h2>找不到這個頁面</h2><a href="#/">返回章節地圖</a></section>}
/** Prevent players from bypassing the in-mission navigation lock by editing the URL. */
function GameRoutes(){
 const {state}=useGame(),location=useLocation();
 if(state.mode!=='home'&&location.pathname!=='/chapter')return <Navigate to="/chapter" replace/>;
 return <Routes>
  <Route path="/" element={<HomePage/>}/>
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
export default function App(){return <GameProvider><HashRouter><Frame><GameRoutes/></Frame></HashRouter></GameProvider>}
