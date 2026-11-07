import { useEffect, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Backpack, UserRound, Layers3, MapPinned, Settings2, Skull } from 'lucide-react';
import { playCue, setAudioScene, unlockAudio } from '../audio/sound';
import { useGame } from '../app/GameContext';
import GameFeedback from './GameFeedback';
import type { SoundscapeId } from '../audio/soundscapes';
const MENU=[{to:'/',label:'地圖',Icon:MapPinned},{to:'/cards',label:'牌組',Icon:Layers3},{to:'/warehouse',label:'倉庫',Icon:Backpack},{to:'/character',label:'人物',Icon:UserRound},{to:'/settings',label:'設定',Icon:Settings2}];
export default function Frame({children}:{children:ReactNode}){
  const location=useLocation(),{state}=useGame();
  const inMission=state.mode!=='home';
  const onMap=location.pathname==='/';
  useEffect(()=>{
    const scene:SoundscapeId=inMission?(state.mode==='result'?'result':state.sceneId):
      location.pathname==='/town'?'town':location.pathname==='/black-market'?'market':
      location.pathname==='/warehouse'?'warehouse':'map';
    setAudioScene(scene);
  },[location.pathname,inMission,state.mode,state.sceneId]);
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
    <div className={`game-frame ${inMission?'game-frame--mission':''}`}>
      {!inMission&&<header className="app-header">
        <NavLink to="/" className="app-header__brand"><span className="brand-mark"><Skull size={17}/></span><span><strong>餘燼紀事</strong><small>EMBER CHRONICLES</small></span></NavLink>
        <span className="app-header__status"><i/> LOCAL SAVE</span>
        <NavLink to="/settings" className="app-header__settings" aria-label="設定"><Settings2 size={19}/></NavLink>
      </header>}
      <main key={location.pathname} className={`app-main ${inMission?'app-main--mission':''}`} id="main">{children}</main>
      {!inMission&&!onMap&&<nav className="bottom-nav" aria-label="主要導覽">
        {MENU.map(({to,label,Icon})=><NavLink key={to} to={to} onClick={()=>playCue('select')} className={({isActive}:{isActive:boolean})=>`bottom-nav__link ${isActive?'is-active':''}`}><Icon size={19} strokeWidth={1.8}/><span>{label}</span></NavLink>)}
      </nav>}
      {!inMission&&import.meta.env.DEV&&<div className="dev-shortcut"><NavLink to="/dev">DEV · 測試工具</NavLink></div>}
      <GameFeedback/>
    </div>
  </div>;
}
