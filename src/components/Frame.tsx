import { useEffect, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings2, Skull } from 'lucide-react';
import { playCue, setAudioScene, unlockAudio } from '../audio/sound';
import { useGame } from '../app/GameContext';
import GameFeedback from './GameFeedback';
import type { SoundscapeId } from '../audio/soundscapes';
declare const __APP_VERSION__:string;
declare const __BUILD_REVISION__:string;
export default function Frame({children}:{children:ReactNode}){
  const location=useLocation(),{state,pauseClock}=useGame();
  const inMission=state.mode!=='home';
  const onMap=location.pathname==='/';
  useEffect(()=>{
   pauseClock('route',location.pathname==='/settings');
   return()=>pauseClock('route',false);
  },[location.pathname,pauseClock]);
  useEffect(()=>{
    const scene:SoundscapeId=inMission?(state.mode==='result'?'result':state.stageId===2?`alley_${state.sceneId}` as SoundscapeId:state.sceneId):
      location.pathname==='/town'?'town':location.pathname==='/black-market'?'market':
      location.pathname==='/warehouse'?'warehouse':'map';
    setAudioScene(scene);
  },[location.pathname,inMission,state.mode,state.sceneId,state.stageId]);
  useEffect(()=>{
    const onPress=(event:PointerEvent)=>{
      const target=event.target;
      if(!(target instanceof Element))return;
      if(target.closest('button,a,[role="button"],input[type="range"]')){
        unlockAudio();playCue('tap');
      }
    };
    document.addEventListener('pointerdown',onPress,{passive:true});
    return()=>document.removeEventListener('pointerdown',onPress);
  },[]);
  return <div className={`desktop-world ${inMission?'desktop-world--mission':''}`}><div className="desktop-world__accent desktop-world__accent--left"/><div className="desktop-world__accent desktop-world__accent--right"/>
    <div className={`game-frame ${inMission?'game-frame--mission':''} ${state.enemyCounter?.phase==='hit'&&state.enemyCounter.hit?'game-frame--damaged':''}`}>
      {!inMission&&<header className="app-header">
        <NavLink to="/" className="app-header__brand"><span className="brand-mark"><Skull size={17}/></span><span><strong>餘燼紀事</strong><small>EMBER CHRONICLES</small></span></NavLink>
        {!onMap&&<NavLink to="/" className="app-header__back" aria-label="返回主地圖"><ArrowLeft size={16}/>地圖</NavLink>}
        <span className="app-header__version" title={`已部署版本 v${__APP_VERSION__} · Git ${__BUILD_REVISION__}`} aria-label={`目前遊戲版本 v${__APP_VERSION__}，程式版本 ${__BUILD_REVISION__}`}>v{__APP_VERSION__} <small>· {__BUILD_REVISION__}</small></span>
        <NavLink to="/settings" className="app-header__settings" aria-label="設定"><Settings2 size={19}/></NavLink>
      </header>}
      <main key={location.pathname} className={`app-main ${inMission?'app-main--mission':''}`} id="main">{children}</main>
      {!inMission&&import.meta.env.DEV&&<div className="dev-shortcut"><NavLink to="/dev">DEV · 測試工具</NavLink></div>}
      <GameFeedback/>
    </div>
  </div>;
}
