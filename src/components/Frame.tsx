import { useEffect, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { playCue, setAudioScene, unlockAudio } from '../audio/sound';
import { useGame } from '../app/GameContext';
import GameFeedback from './GameFeedback';
import ReturnMainLink from './ReturnMainLink';
import GameUtilities from './GameUtilities';
import type { SoundscapeId } from '../audio/soundscapes';
export default function Frame({children}:{children:ReactNode}){
  const location=useLocation(),{state,pauseClock}=useGame();
  const inMission=state.mode!=='home';
  const onMap=location.pathname==='/';
  const returnInsidePage=['/black-market','/cards','/preparation'].includes(location.pathname);
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
  return <div className={`desktop-world ${inMission?'desktop-world--mission':''}`}
     onCopy={event=>{
      const target=event.target;
      if(target instanceof Element&&target.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]'))return;
      event.preventDefault();
     }}><div className="desktop-world__accent desktop-world__accent--left"/><div className="desktop-world__accent desktop-world__accent--right"/>
    <div className={`game-frame ${inMission?'game-frame--mission':''} ${state.enemyCounter?.phase==='hit'&&state.enemyCounter.hit?'game-frame--damaged':''}`}>
      <main key={location.pathname} className={`app-main ${inMission?'app-main--mission':''}`} id="main">{children}</main>
      {!inMission&&!onMap&&!returnInsidePage&&<nav className="return-main-dock" aria-label="主畫面及系統操作">
       <GameUtilities className="game-utilities--dock"/>
       <ReturnMainLink/>
      </nav>}
      {!inMission&&import.meta.env.DEV&&<div className="dev-shortcut"><NavLink to="/dev">DEV · 測試工具</NavLink></div>}
      <GameFeedback/>
    </div>
  </div>;
}
