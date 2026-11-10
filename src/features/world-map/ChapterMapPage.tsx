import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Archive, Landmark, Layers3, LockKeyhole, Skull, Store, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../../app/GameContext';
import { CHAPTER_ONE } from '../../game/data/maps/ch01';
import { worldClock, worldPhase, worldPhaseToken } from '../../game/engine/rules';
import { playCue } from '../../audio/sound';

const HUB_ACTIONS=[
 {label:'城鎮',Icon:Landmark,to:'/town'},
 {label:'黑市',Icon:Store,to:'/black-market'},
 {label:'倉庫',Icon:Archive,to:'/warehouse'},
 {label:'人物',Icon:UserRound,to:'/character'},
 {label:'牌組',Icon:Layers3,to:'/cards'},
];
const connections=CHAPTER_ONE.stages.map(point=>`${point.x},${point.y}`).join(' ');
/** World navigation stays panoramic even though the app itself uses a fixed portrait viewport. */
export default function ChapterMapPage(){
 const {state:s}=useGame(),navigate=useNavigate();
 const viewport=useRef<HTMLDivElement|null>(null);
 const drag=useRef({active:false,start:0,initial:0});
 const [mapScale,setMapScale]=useState(.75);
 const [stageNotice,setStageNotice]=useState('');
 const [selected,setSelected]=useState(s.chapterProgress.unlocked);
 const stageCount=CHAPTER_ONE.stages.length;
 const nextStage=Math.min(stageCount,s.chapterProgress.unlocked);
 const focusStage=(sequence:number,smooth=true)=>{
  const target=CHAPTER_ONE.stages.find(n=>n.sequence===sequence);
  if(!target||!viewport.current)return;
  const next=Math.max(0,target.x*mapScale-viewport.current.clientWidth*.5);
  viewport.current.scrollTo({left:next,behavior:smooth?'smooth':'auto'});
  setSelected(sequence);
 };
 useEffect(()=>{
  if(!viewport.current||typeof ResizeObserver==='undefined')return;
  const observer=new ResizeObserver(()=>{
   const h=viewport.current?.clientHeight??370;
   setMapScale(Math.max(.58,Math.min(1,(h-8)/430)));
  });
  observer.observe(viewport.current);
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const id=window.requestAnimationFrame(()=>focusStage(nextStage,false));
  return()=>window.cancelAnimationFrame(id);
 },[mapScale,nextStage]);
 const enter=(sequence:number,implementation:string)=>{
  setSelected(sequence);
  if(sequence>s.chapterProgress.unlocked){playCue('locked');return;}
  if(implementation==='playable'&&s.mode==='home'){playCue('confirm');navigate('/preparation');return;}
  playCue('locked');
  setStageNotice(implementation==='planned'
    ?`第 ${sequence} 關還在製作中，路線與章節順序已先公開。`
    :'請先結束目前任務，才能重新整理事前準備。');
 };
 return <div className={`world-map-page world-map-page--city phase--${worldPhaseToken(s.world.minute)}`}>
  <header className="city-overview">
   <div className="city-overview__kicker"><span>CHAPTER 01 / WORLD MAP</span><span>第 {s.world.day} 日 · {worldPhase(s.world.minute)} {worldClock(s.world.minute)}</span></div>
   <div className="city-overview__title"><div><h1>灰燼封鎖區</h1><span>THE ASHEN QUARTER</span></div><strong>01</strong></div>
   <div className="city-overview__progress"><span>章節進度</span><div className="city-overview__track"><i style={{width:`${s.chapterProgress.completed.length/stageCount*100}%`}}/></div><strong>{s.chapterProgress.completed.length} / {stageCount}</strong></div>
  </header>
  <section className="chapter-map-section chapter-map-section--city" aria-label="覆蓋在城市中的第一章十二關卡">
   <div className="city-map-controls"><span>廢棄城區 <small>· 點擊節點進入任務</small></span><div>
    <button type="button" aria-label="查看左邊關卡" onClick={()=>viewport.current?.scrollBy({left:-300,behavior:'smooth'})}><ArrowLeft size={17}/></button>
    <button type="button" aria-label="查看右邊關卡" onClick={()=>viewport.current?.scrollBy({left:300,behavior:'smooth'})}><ArrowRight size={17}/></button></div></div>
   <div className="map-viewport city-map-viewport" ref={viewport}
    onPointerDown={e=>{if(e.pointerType==='mouse'&&!(e.target as Element).closest('button,a')){drag.current={active:true,start:e.clientX,initial:e.currentTarget.scrollLeft};e.currentTarget.setPointerCapture(e.pointerId);}}}
    onPointerMove={e=>{if(drag.current.active)e.currentTarget.scrollLeft=drag.current.initial-(e.clientX-drag.current.start);}}
    onPointerUp={()=>{drag.current.active=false;}}
    onPointerCancel={()=>{drag.current.active=false;}}
    tabIndex={0} aria-label="可左右拖曳查看十二個關卡的城市地圖">
    <div className="map-canvas city-map-canvas" style={{zoom:mapScale}}>
     <div className="city-map-backdrop" style={{backgroundImage:`linear-gradient(180deg,#02070d0c,#030a19aa),url(${import.meta.env.BASE_URL}chapter01-city.svg)`}} aria-hidden="true"/>
     <svg className="map-landscape city-map-route" viewBox="0 0 1540 430" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={connections} stroke="#09131e" strokeOpacity=".9" strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={connections} stroke="#c4d4df" strokeOpacity=".74" strokeWidth="2.7" strokeDasharray="5 8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
     </svg>
     {CHAPTER_ONE.stages.map(node=>{
      const locked=node.sequence>s.chapterProgress.unlocked;
      const cleared=s.chapterProgress.completed.includes(node.sequence);
      const next=node.sequence===nextStage&&!cleared;
      const planned=node.implementation==='planned';
      return <button type="button" key={node.id} disabled={locked}
       onClick={()=>enter(node.sequence,node.implementation)}
       className={`map-point ${locked?'map-point--locked':''} ${selected===node.sequence?'map-point--selected':''} ${cleared?'map-point--cleared':''} ${next?'map-point--next':''} ${next&&planned?'map-point--planned':''} ${node.kind==='boss'?'map-point--boss':''}`}
       style={{left:node.x,top:node.y}}
       aria-label={`第 ${node.sequence} 關，${node.name}，${locked?'未解鎖':cleared?'已通關':planned?'製作中':'可挑戰'}`}
       title={node.subtitle}>
       {next&&<span className="map-point__next-indicator" aria-hidden="true"><ArrowDown size={23}/><span>{planned?'下一關 · 製作中':'下一關'}</span></span>}
       <span className="map-point__marker">{locked?<LockKeyhole size={17}/>:node.kind==='boss'?<Skull size={17}/>:String(node.sequence).padStart(2,'0')}</span>
       <span className="map-point__label">{node.name}</span>
      </button>;
     })}
    </div>
   </div>
   <nav className="city-chapter-strip" aria-label="第一章關卡總覽">
    {CHAPTER_ONE.stages.map(n=><button type="button" key={n.id}
      className={`${n.sequence===selected?'is-selected':''} ${n.sequence<=s.chapterProgress.unlocked?'is-unlocked':'is-locked'}`}
      onClick={()=>focusStage(n.sequence)} aria-label={`在地圖定位第 ${n.sequence} 關，${n.name}`}
      aria-current={n.sequence===selected?'location':undefined}>{String(n.sequence).padStart(2,'0')}</button>)}
   </nav>
  </section>
  <nav className="city-hub-dock" aria-label="城區功能">
   {HUB_ACTIONS.map(({label,Icon,to})=><Link key={to} to={to} onClick={()=>playCue('open')}><Icon size={21}/><span>{label}</span></Link>)}
  </nav>
  {stageNotice&&<div className="map-stage-hint" role="status">{stageNotice}<button type="button" onClick={()=>setStageNotice('')} aria-label="關閉提示">×</button></div>}
 </div>;
}
