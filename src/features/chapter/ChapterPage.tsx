import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, AlertTriangle, BookOpenText, ChevronLeft, ChevronRight, Footprints, Layers3, Search, Settings2, ShieldAlert, Sparkles, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../../app/GameContext';
import Hud from '../../components/Hud';
import { getSceneContent, getVisibleActions, calculateActionPreview, worldPhase, bagWeight, isSkillCompatible } from '../../game/engine/rules';
import type { ActionChoice } from '../../game/types';
import ActionCard from './ActionCard';
import SkillHand from './SkillHand';
import RetreatDialog from './RetreatDialog';
import { playCue } from '../../audio/sound';
import { CARDS } from '../../game/data/cards';
import { getAmbientThoughts } from '../../game/data/ambientThoughts';
import GameSettingsDialog from '../settings/GameSettingsDialog';
import { CHAPTER_ACTION_PAGE_SIZE } from '../../game/data/uiConfig';

const PAGE_SIZE=CHAPTER_ACTION_PAGE_SIZE;
export default function ChapterPage(){
 const {state:s,dispatch}=useGame();
 const [chosenId,setChosenId]=useState<string|null>(null);
 const [skillId,setSkillId]=useState<string|null>(null);
 const [showRetreat,setShowRetreat]=useState(false);
 const [showStory,setShowStory]=useState(false);
 const [showHand,setShowHand]=useState(false);
 const [actionPage,setActionPage]=useState(0);
 const [thoughtPage,setThoughtPage]=useState(0);
 const [showSettings,setShowSettings]=useState(false);
 const scene=getSceneContent(s), actions=getVisibleActions(s);
 const ambientLines=useMemo(()=>getAmbientThoughts(s.sceneId,s.attempt,s.world.minute,6),[s.sceneId,s.attempt,Math.floor(s.world.minute/60)]);
 const current:ActionChoice|null=actions.find(a=>a.id===chosenId)??null;
 const preview=useMemo(()=>current?calculateActionPreview(s,current,skillId):null,[s,current,skillId]);
 const usableSkillCount=current?s.hand.filter(id=>{const card=CARDS[id];return !!card&&isSkillCompatible(current,card)&&s.player.resource>=card.resourceCost}).length:0;
 const shouldGlow=!!current&&!skillId&&usableSkillCount>0;
 const pages=Math.max(1,Math.ceil(actions.length/PAGE_SIZE));
 const visibleActions=actions.slice(actionPage*PAGE_SIZE,(actionPage+1)*PAGE_SIZE);
 useEffect(()=>{setChosenId(null);setSkillId(null);setActionPage(0);setThoughtPage(0);setShowHand(false);},[s.sceneId,s.attempt]);
 if(!s.profession)return <div className="page-stack"><section className="surface-card"><h2>先選擇你的職業</h2><p>到第一章地圖完成角色建立後，即可開始調查。</p><NavLink to="/" className="primary-button">前往地圖 <ArrowRight size={16}/></NavLink></section></div>;
 if(s.mode==='result'){
   const success=s.outcome==='victory';
   return <div className="chapter-conclusion">
     <div className="chapter-kicker chapter-kicker--settings"><span>CHAPTER 01 · 任務結算</span><button type="button" onClick={()=>setShowSettings(true)} aria-label="關卡設定"><Settings2 size={17}/>設定</button></div>
     <div className={`chapter-hero chapter-hero--${s.outcome}`}><span className="eyebrow">CHAPTER 01 / RESULT</span><h1>{success?'這一次，我做到了。':s.outcome==='retreat'?'我選擇暫時離開。':'這次，事情沒有照我的計畫發展。'}</h1><p>{s.lastEvent}</p></div>
     <Hud/>
     <section className="surface-card chapter-conclusion__record"><h3><BookOpenText size={18}/>本次紀錄</h3><div className="log-list">{s.log.slice(-3).reverse().map((line,i)=><p key={i}>{line}</p>)}</div>
     {s.outcome==='defeat'&&<div className="insight-note"><Sparkles size={17}/><div><strong>失敗學習已記錄</strong><p>下次關鍵判定額外 +6 個百分點，並保留取得的線索。</p></div></div>}
     <div className="inventory-preview"><strong>背包物資</strong><span>{Object.entries(s.bag).length} 類 · {bagWeight(s.bag).toFixed(1)} kg</span></div></section>
     <button className="primary-button primary-button--full" onClick={()=>{dispatch({type:'RETURN_HUB'});playCue('open')}}>返回地圖，自動整理戰利品 <ArrowRight size={17}/></button>
     {showSettings&&<GameSettingsDialog onClose={()=>setShowSettings(false)}/>}
   </div>;
 }
 if(s.mode==='home')return <div className="chapter-conclusion"><section className="chapter-hero"><span className="eyebrow">STORY / CHAPTER 01</span><h1>失蹤的倉庫員工</h1><p>那座舊物流站的燈還亮著。上一次的記憶，也許能幫我找到新的突破口。</p></section><button className="primary-button primary-button--full" onClick={()=>dispatch({type:'START_ATTEMPT'})}>{s.attempt>0?'再次進入倉庫':'開始第一次調查'}<ArrowRight size={17}/></button></div>;
 return <div className="chapter-live">
  <div className="chapter-kicker"><span>CHAPTER 01 · {scene.label} · {worldPhase(s.world.minute)}</span><div className="chapter-kicker__controls"><button type="button" onClick={()=>setShowStory(true)}><BookOpenText size={15}/>全文</button><button type="button" onClick={()=>setShowSettings(true)} aria-label="遊戲設定"><Settings2 size={16}/>設定</button></div></div>
  <Hud/>
  <section className={`scene-art scene-art--${s.sceneId}`} aria-label={`${scene.location}的環境場景`}><div className="scene-art__halo"/><div className="scene-art__atmosphere"/><div className="scene-art__warehouse"><div className="scene-art__building"><span>舊物流站</span><div className="scene-art__windows"><i/><i/><i/></div></div><div className="scene-art__door"/></div><div className="scene-art__person scene-art__person--shadow"><span/></div><div className="scene-art__floor"/><div className="scene-art__caption"><span className="scene-art__pin"/> {scene.location}<span> · 第 {s.attempt} 次來訪</span></div></section>
  <section className="story-panel story-panel--compact"><div className="story-panel__top"><span className="eyebrow">SCENE / {scene.label}</span><span>{s.npc.met>1?'對方記得我':'初次接觸'}</span></div>
   <p className="story-panel__thought">{scene.narration}</p>
   {scene.npcText&&<p className="story-panel__compact-npc"><strong>阿忠：</strong>{scene.npcText}</p>}
   <div className="ambient-carousel" aria-label="場景內心獨白"><div className="ambient-carousel__heading"><span>我的心聲 · {thoughtPage+1} / {ambientLines.length}</span><div><button type="button" aria-label="上一段內心話" onClick={()=>{setThoughtPage(p=>(p+ambientLines.length-1)%ambientLines.length);playCue('select')}}><ChevronLeft size={14}/></button><button type="button" aria-label="下一段內心話" onClick={()=>{setThoughtPage(p=>(p+1)%ambientLines.length);playCue('select')}}><ChevronRight size={14}/></button></div></div><p aria-live="polite">「{ambientLines[thoughtPage]??ambientLines[0]}」</p></div>
   {s.sceneId==='loot'&&<div className="story-panel__hint"><Search size={12}/>搜刮會推進世界時間</div>}
  </section>
  <section className="actions-section actions-section--viewport">
    <div className="section-heading"><div><span className="eyebrow">WHAT WILL I DO?</span><h3>我接下來要怎麼做？</h3></div>{pages>1&&<div className="action-pagination"><button type="button" disabled={actionPage===0} onClick={()=>{setActionPage(p=>p-1);setChosenId(null);setSkillId(null)}} aria-label="上一組選項"><ArrowLeft size={15}/></button><span>{actionPage+1}/{pages}</span><button type="button" disabled={actionPage>=pages-1} onClick={()=>{setActionPage(p=>p+1);setChosenId(null);setSkillId(null)}} aria-label="下一組選項"><ArrowRight size={15}/></button></div>}</div>
    <div className="action-stack action-stack--viewport">{visibleActions.map((a,index)=><ActionCard key={a.id} choice={a} index={actionPage*PAGE_SIZE+index} selected={chosenId===a.id} preview={calculateActionPreview(s,a,chosenId===a.id?skillId:null)} onClick={()=>{setChosenId(a.id);setSkillId(null);playCue('select')}}/>)}</div>
  </section>
  <div className="live-controls">
    <div className="live-controls__summary"><span>{current?`已選：${current.title}`:'請先選擇一項行動'}</span><strong>{preview?`${preview.chance}%`:'—'}</strong></div>
    <div className="live-controls__cost">{preview?<><span>體力 -{preview.staminaCost}</span><span>膽量 {preview.courageDelta>0?'+':''}{preview.courageDelta}</span><span>資源 -{preview.resourceCost}</span>{preview.warnings.length>0&&<button type="button" onClick={()=>setShowStory(true)}><AlertTriangle size={12}/>警告 {preview.warnings.length}</button>}</>:<span className="live-controls__placeholder">選擇行動後預覽實際代價</span>}</div>
    <div className="live-controls__buttons"><button className="secondary-button" onClick={()=>setShowRetreat(true)}><Footprints size={15}/>撤退</button><button className={`secondary-button ${shouldGlow?'skill-attach--glow':''}`} disabled={!current} onClick={()=>setShowHand(true)}><Layers3 size={15}/>{skillId&&CARDS[skillId]?CARDS[skillId]!.name:shouldGlow?`附加技能 (${usableSkillCount})`:'附加技能'}</button><button className="primary-button" disabled={!current} onClick={()=>{if(!current)return;dispatch({type:'CHOOSE',choiceId:current.id,skillId});playCue('confirm');setChosenId(null);setSkillId(null)}}>執行 <ArrowRight size={16}/></button></div>
  </div>
  {showHand&&<div className="game-sheet-backdrop" role="presentation" onClick={()=>setShowHand(false)}><div className="game-sheet" role="dialog" aria-label="附加技能卡" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="game-sheet__top"><h3>附加技能卡</h3><button type="button" aria-label="關閉技能面板" onClick={()=>setShowHand(false)}><X size={20}/></button></div><SkillHand choice={current} skillId={skillId} onChange={(id)=>{setSkillId(id);playCue('card')}}/>{current&&<button className="primary-button primary-button--full" onClick={()=>setShowHand(false)}>確認附加 · 返回行動卡</button>}</div></div>}
  {showStory&&<div className="game-sheet-backdrop" role="presentation" onClick={()=>setShowStory(false)}><div className="game-story-modal" role="dialog" aria-label="劇情與警告詳情" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="game-sheet__top"><h3><BookOpenText size={17}/>劇情紀錄</h3><button onClick={()=>setShowStory(false)} aria-label="關閉劇情詳情"><X size={19}/></button></div><p>{scene.narration}</p>{scene.npcText&&<blockquote>阿忠：{scene.npcText}</blockquote>}{s.lastEvent&&<p>{s.lastEvent}</p>}{current&&<section className="story-action-details"><h4>目前選擇：{current.title}</h4><p>{current.thought}</p><p>{current.detail}</p></section>}<h4>場景心聲</h4>{ambientLines.map((line,i)=><p key={i}>「{line}」</p>)}{preview?.warnings.map(w=><div className="warning-panel" key={w.title}><ShieldAlert size={17}/><div><strong>{w.title}</strong><p>{w.detail}</p><small>恢復：{w.remedy}</small></div></div>)}{s.clues.length>0&&<p className="story-clues"><Sparkles size={14}/>已掌握 {s.clues.length} 條線索</p>}</div></div>}
  {showRetreat&&<RetreatDialog onClose={()=>setShowRetreat(false)}/>}
  {showSettings&&<GameSettingsDialog onClose={()=>setShowSettings(false)}/>}
 </div>;
}
