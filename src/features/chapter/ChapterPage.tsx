import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpenText, Layers3, Search, Settings2, ShieldAlert, Sparkles, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../../app/GameContext';
import Hud from '../../components/Hud';
import { getSceneContent, getVisibleActions, calculateActionPreview, worldPhase, worldPhaseToken, bagWeight, isSkillCompatible } from '../../game/engine/rules';
import type { ActionChoice } from '../../game/types';
import ActionDecision from './ActionDecision';
import SkillHand from './SkillHand';
import SkillComparison from './SkillComparison';
import RetreatDialog from './RetreatDialog';
import { playCue } from '../../audio/sound';
import { CARDS } from '../../game/data/cards';
import { getAmbientThoughts } from '../../game/data/ambientThoughts';
import GameSettingsDialog from '../settings/GameSettingsDialog';
import EnemyPresence from './EnemyPresence';
import AttackProjectile, { type AttackFlight } from './AttackProjectile';
import { ATTACK_CARDS } from '../../game/data/attacks';
import SceneArtwork from './SceneArtwork';
import ThoughtWhisper from './ThoughtWhisper';
import MissionTransition, { type MissionTransitionKind } from './MissionTransition';
export default function ChapterPage(){
 const {state:s,dispatch}=useGame();
 const [chosenId,setChosenId]=useState<string|null>(null);
 const [skillId,setSkillId]=useState<string|null>(null);
 const [showRetreat,setShowRetreat]=useState(false);
 const [confirmLootExit,setConfirmLootExit]=useState(false);
 const [showStory,setShowStory]=useState(false);
 const [showHand,setShowHand]=useState(false);
 const [showSettings,setShowSettings]=useState(false);
 const [handOpenCount,setHandOpenCount]=useState(0);
 const [skillPrompt,setSkillPrompt]=useState(false);
 const [skipSkillPrompt,setSkipSkillPrompt]=useState(()=>{try{return localStorage.getItem('ember-skip-skill-warning-v08')==='yes'}catch{return false}});
 const [rememberSkip,setRememberSkip]=useState(false);
 const [pendingOrigin,setPendingOrigin]=useState<{x:number;y:number}|null>(null);
 const [flight,setFlight]=useState<AttackFlight|null>(null);
 const [executing,setExecuting]=useState(false);
 const [combatHold,setCombatHold]=useState(false);
 const [cinematic,setCinematic]=useState<MissionTransitionKind|null>(()=>s.mode==='adventure'&&s.sceneId==='gate'?'entry':null);
 const lastScene=useRef(s.sceneId);
 useEffect(()=>{
  if(lastScene.current!==s.sceneId){
   if(s.sceneId==='confrontation')setCinematic('enemy');
   lastScene.current=s.sceneId;
  }
 },[s.sceneId]);

 const flightTimer=useRef<number|null>(null);
 const afterTimer=useRef<number|null>(null);
 const scene=getSceneContent(s), actions=getVisibleActions(s);
 const ambientLines=useMemo(()=>getAmbientThoughts(s.sceneId,s.attempt,s.world.minute,6),[s.sceneId,s.attempt,Math.floor(s.world.minute/60)]);
 const current:ActionChoice|null=actions.find(a=>a.id===chosenId)??null;
 const preview=current?calculateActionPreview(s,current,skillId):null;
 const usableSkillCount=current?s.hand.filter(id=>{const card=CARDS[id];return !!card&&isSkillCompatible(current,card)&&s.player.resource>=card.resourceCost}).length:0;
 useEffect(()=>{setChosenId(null);setSkillId(null);setShowHand(false);setConfirmLootExit(false);},[s.sceneId,s.attempt]);

 useEffect(()=>()=>{if(flightTimer.current!==null)window.clearTimeout(flightTimer.current);if(afterTimer.current!==null)window.clearTimeout(afterTimer.current);},[]);
 const performUse=(origin:{x:number;y:number},choice:ActionChoice,chosenSkill:string|null)=>{
  if(executing)return;
  const dispatchChoice=()=>{
   dispatch({type:'CHOOSE',choiceId:choice.id,skillId:chosenSkill});
   setChosenId(null);setSkillId(null);
   playCue(choice.attackCardId?'impact':'confirm');
  };
  if(choice.attackCardId&&s.sceneId==='confrontation'){
   const enemyRect=document.querySelector('[data-combat-target="true"]')?.getBoundingClientRect();
   if(!enemyRect){dispatchChoice();return;}
   const kind=ATTACK_CARDS[choice.attackCardId]?.requiredItemId??'pen';
   setExecuting(true);
   setFlight({id:Date.now(),kind,x:origin.x,y:origin.y,targetX:enemyRect.left+enemyRect.width*.50,targetY:enemyRect.top+enemyRect.height*.52});
   flightTimer.current=window.setTimeout(()=>{
    setCombatHold(true);setFlight(null);
    dispatchChoice();
    afterTimer.current=window.setTimeout(()=>{setCombatHold(false);setExecuting(false)},900);
   },510);
   playCue('card');
  }else dispatchChoice();
 };
 const requestUse=(origin:{x:number;y:number})=>{
  if(!current||executing)return;
  if(usableSkillCount>0&&!skillId&&!skipSkillPrompt){
   setPendingOrigin(origin);setRememberSkip(false);setSkillPrompt(true);playCue('warning');return;
  }
  performUse(origin,current,skillId);
 };
 const confirmWithoutSkill=()=>{
  if(rememberSkip){try{localStorage.setItem('ember-skip-skill-warning-v08','yes')}catch{/* no storage */}setSkipSkillPrompt(true);}
  setSkillPrompt(false);
  if(pendingOrigin&&current)performUse(pendingOrigin,current,skillId);
  setPendingOrigin(null);
 };
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
 if(s.mode==='home')return <div className="chapter-conclusion"><section className="chapter-hero"><span className="eyebrow">STORY / CHAPTER 01</span><h1>失蹤的倉庫員工</h1><p>那座舊物流站的燈還亮著。進去之前，我還是先整理攻擊牌與隨身工具。</p></section><NavLink className="primary-button primary-button--full" to="/preparation">前往事前準備 <ArrowRight size={17}/></NavLink></div>;
 return <div className="chapter-live">
  <div className="chapter-kicker"><span>CHAPTER 01 · {scene.label} · {worldPhase(s.world.minute)}</span><div className="chapter-kicker__controls"><button type="button" onClick={()=>setShowStory(true)}><BookOpenText size={15}/>全文</button><button type="button" onClick={()=>setShowSettings(true)} aria-label="遊戲設定"><Settings2 size={16}/>設定</button></div></div>
  <Hud/>
  {(s.sceneId==='confrontation'||combatHold)&&<div className="enemy-hud" aria-label="敵人生命值">
    <div className="enemy-hud__top"><span>ENEMY / {s.enemy.name}</span><strong>{s.enemy.health} / {s.enemy.maxHealth} HP</strong></div>
    <div className="enemy-hud__track" role="progressbar" aria-label="敵人生命" aria-valuemin={0} aria-valuemax={s.enemy.maxHealth} aria-valuenow={s.enemy.health}><i style={{width:`${s.enemy.health/s.enemy.maxHealth*100}%`}}/></div>
  </div>}
  <section className={`scene-art scene-art--${s.sceneId} phase--${worldPhaseToken(s.world.minute)} ${s.sceneId==='confrontation'||combatHold?'scene-art--combat':''}`} aria-label={`${scene.location}的環境場景`}>
   <SceneArtwork scene={s.sceneId}/>
   {(s.sceneId==='confrontation'||combatHold)&&<EnemyPresence health={s.enemy.health} maxHealth={s.enemy.maxHealth} name={s.enemy.name}/>}
   <div className="scene-art__caption"><span className="scene-art__pin"/> {scene.location}<span> · 第 {s.attempt} 次來訪</span></div>
  </section>
  <section className="story-panel story-panel--compact"><div className="story-panel__top"><span className="eyebrow">SCENE / {scene.label}</span><span>{s.npc.met>1?'對方記得我':'初次接觸'}</span></div>
   <p className="story-panel__thought">{scene.narration}</p>
   {scene.npcText&&<p className="story-panel__compact-npc"><strong>阿忠：</strong>{scene.npcText}</p>}

   {s.sceneId==='loot'&&<div className="story-panel__hint"><Search size={12}/>搜刮會推進世界時間</div>}
  </section>
  <ActionDecision actions={actions} state={s} selected={current} skillId={skillId} skillCount={usableSkillCount} busy={executing}
    onSelect={action=>{if(action.id==='loot_exit'){setConfirmLootExit(true);playCue('open');return;}setChosenId(action.id);setSkillId(null);playCue('select')}}
    onBack={()=>{setChosenId(null);setSkillId(null);playCue('open')}}
    onShowSkills={()=>{setHandOpenCount(n=>n+1);setShowHand(true);playCue('open')}}
    onExecute={requestUse}
    onRetreat={()=>setShowRetreat(true)}/>
  {confirmLootExit&&<div className="mission-exit-overlay" role="presentation">
   <section className="mission-exit-dialog" role="alertdialog" aria-modal="true" aria-label="確認結束搜查">
    <h3>現在結束搜查？</h3>
    <p>「如果現在離開，就沒辦法繼續翻找這一輪的物資了。我確定都看完了嗎？」</p>
    <small>已獲得的物資不會因結束搜查而消失。</small>
    <div className="mission-exit-dialog__actions">
     <button type="button" onClick={()=>{setConfirmLootExit(false);playCue('open')}}>繼續搜查</button>
     <button type="button" onClick={()=>{setConfirmLootExit(false);dispatch({type:'CHOOSE',choiceId:'loot_exit',skillId:null});playCue('confirm')}}>確定結束</button>
    </div>
   </section>
  </div>}
  {showHand&&current&&<div className="game-sheet-backdrop game-sheet-backdrop--ritual" role="presentation" onClick={()=>setShowHand(false)}>
    <div className="game-sheet game-sheet--ritual" role="dialog" aria-label="附加技能卡" aria-modal="true" onClick={e=>e.stopPropagation()}>
      <div className="game-sheet__top"><h3>附加技能卡 <small>SKILL / ATTACHMENT</small></h3><button type="button" aria-label="關閉技能面板" onClick={()=>setShowHand(false)}><X size={20}/></button></div>
      <SkillComparison choice={current} skillId={skillId}/>
      <SkillHand choice={current} skillId={skillId} layoutSeed={handOpenCount} onChange={id=>{setSkillId(id);playCue('card')}}/>
      <button className="primary-button primary-button--full game-sheet__confirm" onClick={()=>{setShowHand(false);playCue('confirm')}}>確認附加 · 返回行動卡</button>
    </div>
  </div>}
  <ThoughtWhisper state={s} paused={!!cinematic||showStory||showHand||showSettings||showRetreat||skillPrompt||confirmLootExit}/>
  {cinematic&&<MissionTransition kind={cinematic} enemyName={s.enemy.name} onFinish={()=>setCinematic(null)}/>}
  {flight&&<AttackProjectile flight={flight}/>}
  {skillPrompt&&<div className="skill-confirm-overlay" role="presentation">
   <section className="skill-confirm-dialog" role="alertdialog" aria-modal="true" aria-label="提醒附加技能卡">
    <Layers3 size={27}/><h3>還有可用的附加技能</h3>
    <p>我現在有 {usableSkillCount} 張技能卡能強化這次行動。要先看看，還是直接執行？</p>
    <label className="skill-confirm-dialog__check"><input type="checkbox" checked={rememberSkip} onChange={e=>setRememberSkip(e.target.checked)}/>不再提醒</label>
    <div className="skill-confirm-dialog__actions"><button type="button" onClick={()=>{setSkillPrompt(false);setPendingOrigin(null);setHandOpenCount(n=>n+1);setShowHand(true);}}>前往附加技能</button>
     <button type="button" onClick={confirmWithoutSkill}>仍然直接使用</button></div>
   </section>
  </div>}
  {showStory&&<div className="game-sheet-backdrop" role="presentation" onClick={()=>setShowStory(false)}><div className="game-story-modal" role="dialog" aria-label="劇情與警告詳情" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="game-sheet__top"><h3><BookOpenText size={17}/>劇情紀錄</h3><button onClick={()=>setShowStory(false)} aria-label="關閉劇情詳情"><X size={19}/></button></div><p>{scene.narration}</p>{scene.npcText&&<blockquote>阿忠：{scene.npcText}</blockquote>}{s.lastEvent&&<p>{s.lastEvent}</p>}{current&&<section className="story-action-details"><h4>目前選擇：{current.title}</h4><p>{current.thought}</p><p>{current.detail}</p></section>}<h4>場景心聲</h4>{ambientLines.map((line,i)=><p key={i}>「{line}」</p>)}{preview?.warnings.map(w=><div className="warning-panel" key={w.title}><ShieldAlert size={17}/><div><strong>{w.title}</strong><p>{w.detail}</p><small>恢復：{w.remedy}</small></div></div>)}{s.clues.length>0&&<p className="story-clues"><Sparkles size={14}/>已掌握 {s.clues.length} 條線索</p>}</div></div>}
  {showRetreat&&<RetreatDialog onClose={()=>setShowRetreat(false)}/>}
  {showSettings&&<GameSettingsDialog onClose={()=>setShowSettings(false)}/>}
 </div>;
}
