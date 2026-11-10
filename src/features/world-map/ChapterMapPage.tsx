import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Archive, Landmark, Layers3, LockKeyhole, MapPinned, Skull, Store, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../../app/GameContext';
import { CHAPTER_ONE } from '../../game/data/maps/ch01';
import { worldClock, worldPhase, worldPhaseToken } from '../../game/engine/rules';
import { playCue } from '../../audio/sound';

const connections = CHAPTER_ONE.stages.map(s=>`${s.x},${s.y}`).join(' ');
const HUB_ACTIONS=[
  {label:'城鎮',Icon:Landmark,to:'/town'},
  {label:'黑市',Icon:Store,to:'/black-market'},
  {label:'倉庫',Icon:Archive,to:'/warehouse'},
  {label:'人物',Icon:UserRound,to:'/character'},
  {label:'牌組',Icon:Layers3,to:'/cards'},
];

export default function ChapterMapPage(){
  const {state:s}=useGame();const navigate=useNavigate();
  const map=useRef<HTMLDivElement|null>(null);
  const drag=useRef({active:false,startX:0,scrollStart:0});
  const [selected,setSelected]=useState(1);
  const [stageNotice,setStageNotice]=useState('');
  const [position,setPosition]=useState(0);
  const [mapScale,setMapScale]=useState(.7);
  useEffect(()=>{
    if(!map.current||typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(()=>{
      const height=map.current?.clientHeight??300;
      setMapScale(Math.max(.38,Math.min(1,(height-6)/430)));
    });
    observer.observe(map.current);
    return()=>observer.disconnect();
  },[]);
  const nextStage=Math.min(12,s.chapterProgress.unlocked);
  const visitNode=(sequence:number,implementation:string)=>{
    setSelected(sequence);
    if(sequence>s.chapterProgress.unlocked)return;
    if(implementation==='playable'){
      if(s.mode!=='home'){
        playCue('locked');
        setStageNotice('目前還在任務或結算流程中。先完成任務並返回地圖，才能重新進行事前準備。');
        return;
      }
      setStageNotice('');
      playCue('confirm');
      navigate('/preparation');
      return;
    }
    playCue('locked');
    setStageNotice(`第 ${sequence} 關尚在製作中。請先從已完成的關卡繼續挑戰。`);
  };
  const pan=(delta:number)=>map.current?.scrollBy({left:delta,behavior:'smooth'});
  return <div className={`world-map-page page-stack phase--${worldPhaseToken(s.world.minute)}`}>
    <section className="map-intro">
      <div className="map-intro__meta"><span>WORLD MAP / CHAPTER 01</span><span>第 {s.world.day} 日 · {worldPhase(s.world.minute)} {worldClock(s.world.minute)}</span></div>
      <div className="map-intro__heading"><div><h1>灰燼封鎖區</h1><p>THE ASHEN QUARTER</p></div><span className="map-intro__number">01</span></div>
      <p className="map-intro__thought">「這座城市的路，每天都和昨天不太一樣。那些消失的人……究竟去了哪裡？」</p>
      <div className="map-intro__progress"><span>章節進度</span><div><i style={{width:`${s.chapterProgress.completed.length/12*100}%`}}/></div><b>{s.chapterProgress.completed.length} / 12</b></div>
    </section>

    <nav className="map-hub" aria-label="城區功能入口">
      {HUB_ACTIONS.map(({label,Icon,to})=><Link key={to} to={to} className="map-hub__link" onClick={()=>playCue('open')}><Icon size={19}/><span>{label}</span></Link>)}
    </nav>

    <section className="chapter-map-section" aria-label="第一章十二個關卡地圖">
      <div className="map-toolbar"><div><MapPinned size={15}/> <strong>第一章 · 廢棄城區</strong></div><div><button type="button" onClick={()=>pan(-370)} aria-label="地圖向左"><ArrowLeft size={17}/></button><button type="button" onClick={()=>pan(370)} aria-label="地圖向右"><ArrowRight size={17}/></button></div></div>
      <div className="map-viewport" ref={map}
        onPointerDown={e=>{if(e.pointerType==='mouse'&&!(e.target as Element).closest('button,a')){drag.current={active:true,startX:e.clientX,scrollStart:e.currentTarget.scrollLeft};e.currentTarget.setPointerCapture(e.pointerId)}}}
        onPointerMove={e=>{if(drag.current.active)e.currentTarget.scrollLeft=drag.current.scrollStart-(e.clientX-drag.current.startX)}}
        onPointerUp={()=>{drag.current.active=false}}
        onPointerCancel={()=>{drag.current.active=false}}
        onScroll={e=>setPosition((e.currentTarget as HTMLDivElement).scrollLeft)} tabIndex={0} aria-label="可左右捲動的章節地圖">
        <div className="map-canvas" style={{zoom:mapScale}}>
          <div className="map-fog map-fog--one"/><div className="map-fog map-fog--two"/>
          <div className="map-sun" aria-hidden="true"/>
          <svg className="map-landscape" viewBox="0 0 1540 430" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="skyFall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141618"/><stop offset=".48" stopColor="#302827"/><stop offset="1" stopColor="#111518"/></linearGradient><linearGradient id="groundFade" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2a2a29"/><stop offset="1" stopColor="#0a0d0e"/></linearGradient><filter id="softHaze"><feGaussianBlur stdDeviation="12"/></filter></defs>
            <rect width="1540" height="430" fill="url(#skyFall)"/>
            <g fill="#161a1b" opacity=".8"><path d="M0 250L0 180 60 180 60 140 105 140 105 185 150 185 150 115 210 115 210 196 270 196 270 157 333 157 333 194 390 194 390 136 440 136 440 202 510 202 510 163 550 163 550 128 607 128 607 210 670 210 670 168 730 168 730 191 795 191 795 142 866 142 866 197 925 197 925 156 990 156 990 211 1050 211 1050 108 1125 108 1125 205 1185 205 1185 165 1250 165 1250 220 1310 220 1310 122 1390 122 1390 197 1450 197 1450 167 1540 167 1540 300Z"/></g>
            <g fill="#0e1214"><path d="M0 278L0 244 43 244 43 204 103 204 103 260 162 260 162 176 238 176 238 252 292 252 292 207 356 207 356 251 426 251 426 182 491 182 491 263 553 263 553 211 620 211 620 261 696 261 696 222 762 222 762 257 813 257 813 184 876 184 876 266 941 266 941 208 1035 208 1035 269 1100 269 1100 178 1169 178 1169 268 1234 268 1234 215 1305 215 1305 264 1385 264 1385 184 1436 184 1436 264 1540 264 1540 350Z"/></g>
            <path d="M0 340 C180 296 300 348 440 315 S780 290 920 344 S1300 294 1540 317 L1540 430 0 430Z" fill="url(#groundFade)"/>
            <g stroke="#483d35" strokeWidth="1" opacity=".45"><path d="M0 356L1540 356M0 383L1540 383M0 409L1540 409"/><path d="M100 350L40 430M300 340L275 430M500 345L535 430M770 341L800 430M1040 344L1015 430M1280 344L1320 430"/></g>
            <g fill="#9e806e" opacity=".26">{[72,184,226,402,465,580,632,729,855,970,1109,1214,1354,1490].map((x,i)=><rect key={x} x={x} y={195+i%3*13} width="8" height="13"/>)}</g>
            <path d="M0 309C260 338 500 278 780 332S1255 300 1540 345" stroke="#988270" strokeWidth="45" opacity=".08" fill="none" filter="url(#softHaze)"/>
            <polyline points={connections} stroke="#c6b39c" strokeOpacity=".13" strokeWidth="15" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points={connections} stroke="#9b7067" strokeOpacity=".74" strokeWidth="2" strokeDasharray="5 8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="map-district map-district--one">THE SOUTHERN WARDS</span>
          <span className="map-district map-district--two">NO SIGNAL / ZONE 02</span>
          <span className="map-district map-district--three">MILITARY CONTROL</span>
          {CHAPTER_ONE.stages.map(node=>{
            const isLocked=node.sequence>s.chapterProgress.unlocked;const isSelected=selected===node.sequence;const isCleared=s.chapterProgress.completed.includes(node.sequence);const isNext=node.sequence===nextStage&&!isCleared;const nextPlanned=isNext&&node.implementation!=='playable';
            return <button key={node.id} disabled={isLocked} title={isLocked?'完成前一關後解鎖':node.subtitle} className={`map-point ${isLocked?'map-point--locked':''} ${isSelected?'map-point--selected':''} ${isCleared?'map-point--cleared':''} ${isNext?'map-point--next':''} ${nextPlanned?'map-point--planned':''} ${node.kind==='boss'?'map-point--boss':''}`} style={{left:node.x,top:node.y}} type="button" onClick={()=>visitNode(node.sequence,node.implementation)} aria-label={`第${node.sequence}關 ${node.name}，${isLocked?'未解鎖':isCleared?'已通關':'已解鎖'}`}>
              {isNext&&<span className="map-point__next-indicator" aria-hidden="true"><ArrowDown size={21}/><span>{nextPlanned?'下一關 · 製作中':'下一關'}</span></span>}
              <span className="map-point__marker">{isLocked?<LockKeyhole size={16}/>:node.kind==='boss'?<Skull size={18}/>:<span>{String(node.sequence).padStart(2,'0')}</span>}</span>
              <span className="map-point__label">{node.name}</span>
            </button>;
          })}
        </div>
      </div>
      <div className="map-scroll-hint"><span>← 拖曳或左右捲動地圖 →</span><span>{position>750?'東區 / 城門':position>250?'中央工業區':'舊城南區'}</span></div>
    </section>

    {stageNotice&&<div className="map-stage-hint" role="status">{stageNotice}<button onClick={()=>setStageNotice('')} aria-label="關閉關卡提示">×</button></div>}
  </div>;
}
