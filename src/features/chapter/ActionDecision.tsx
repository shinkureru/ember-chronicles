import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowDownRight, ArrowLeft, ChevronLeft, ChevronRight, Footprints, Layers3 } from 'lucide-react';
import { calculateActionPreview } from '../../game/engine/rules';
import { getChoicePositions } from './choiceLayout';
import { hasSearchedBefore, remainingSearches } from '../../game/engine/lootLimits';
import type { ActionChoice, GameState } from '../../game/types';
import { ATTACK_CARDS, attackStatus } from '../../game/data/attacks';
import { CARDS } from '../../game/data/cards';
import ActionObjectArt, { getActionObject } from './ActionObjectArt';

type Origin={x:number;y:number};
type Props={
 actions:ActionChoice[];
 state:GameState;
 selected:ActionChoice|null;
 skillId:string|null;
 skillCount:number;
 busy?:boolean;
 onSelect:(choice:ActionChoice)=>void;
 onBack:()=>void;
 onShowSkills:()=>void;
 onExecute:(origin:Origin)=>void;
 onRetreat:()=>void;
};
export default function ActionDecision({actions,state,selected,skillId,skillCount,busy=false,onSelect,onBack,onShowSkills,onExecute,onRetreat}:Props){
 const [page,setPage]=useState(0);
 const pageSize=6,pages=Math.max(1,Math.ceil(actions.length/pageSize));
 const shownPage=Math.min(page,pages-1);
 const visible=actions.slice(shownPage*pageSize,(shownPage+1)*pageSize);
 const ids=visible.map(a=>a.id).join(',');
 const layout=useMemo(()=>getChoicePositions(visible,`${state.attempt}:${state.sceneId}:${shownPage}:${ids}`),
  [state.attempt,state.sceneId,shownPage,ids]);
 const previews=visible.map(a=>calculateActionPreview(state,a,null));
 const preview=selected?calculateActionPreview(state,selected,skillId):null;
 useEffect(()=>setPage(0),[state.attempt,state.sceneId]);
 useEffect(()=>{
  if(!selected)return;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!busy)onBack();};
  window.addEventListener('keydown',key);
  return()=>window.removeEventListener('keydown',key);
 },[selected,onBack,busy]);
 return <section className={`choice-stage ${selected?'choice-stage--detail':'choice-stage--pick'}`} aria-label="當前行動">
  <header className="choice-stage__heading"><strong>我接下來要怎麼做？</strong>
   {!selected&&pages>1?<span className="choice-stage__pages">
    <button type="button" disabled={shownPage===0||busy} onClick={()=>setPage(v=>Math.max(0,v-1))} aria-label="上一組行動"><ChevronLeft size={14}/></button>
    <small>{shownPage+1} / {pages}</small>
    <button type="button" disabled={shownPage===pages-1||busy} onClick={()=>setPage(v=>Math.min(pages-1,v+1))} aria-label="下一組行動"><ChevronRight size={14}/></button>
   </span>:<small>{selected?'ACTION / DECISION':'CHOOSE YOUR WAY'}</small>}
  </header>
  {!selected?<div key={`choice-${state.attempt}-${state.sceneId}-${shownPage}`} className="choice-cloud" role="group" aria-label="選擇行動">
   {visible.map((action,i)=>{
    const p=previews[i]??calculateActionPreview(state,action,null);
    const weapon=action.attackCardId?ATTACK_CARDS[action.attackCardId]:undefined;
    const unavailable=!!weapon&&!attackStatus(state,weapon.id).inBag;
    const pos=layout[i]??{x:50,y:50,angle:0,delay:0};
    const style={'--choice-x':`${pos.x}%`,'--choice-y':`${pos.y}%`,
      '--choice-angle':`${pos.angle}deg`,'--choice-delay':`${pos.delay}s`} as CSSProperties;
    const searched=action.lootSource?hasSearchedBefore(state,action.lootSource):false;
    const remaining=action.lootSource?remainingSearches(state,action.lootSource):0;
    return <button type="button" key={action.id} style={style} disabled={unavailable||busy}
      className={`choice-word ${unavailable?'choice-word--unavailable':''}`}
      onClick={()=>onSelect(action)}
      aria-label={`${action.title}，${unavailable?'缺少武器、不可使用':`成功率 ${p.chance}%`}${searched?`，剩餘搜刮 ${remaining} 次`:''}。${action.thought}`}
      title={unavailable?'缺少對應武器':action.thought}>
      <span>{action.title}</span>
      {!unavailable&&!action.guaranteed&&<em className="choice-word__chance">{p.chance}%</em>}
      {unavailable&&<small className="choice-word__note">缺少武器</small>}
      {searched&&<small className="choice-word__note">剩餘搜刮次數：{remaining}</small>}
    </button>;
   })}
  </div>:<div key={`inspect-${selected.id}`} className="choice-inspect">
   <div className="choice-inspect__left">
    <div className="action-object-panel" aria-label={selected.title}>
     <ActionObjectArt kind={getActionObject(selected)} className="action-object-panel__art"/>
     <div className="action-object-panel__foreground">
      <span className="action-object-panel__index">ACTION / {selected.tags[0]?.toUpperCase()}</span>
      <h3>{selected.title}</h3>
      <div className="action-object-panel__text-scroll" tabIndex={0}>
       <p>{selected.thought}</p><p className="action-object-panel__detail">{selected.detail}</p>
      </div>
      <div className="action-object-panel__stats">
       <strong>{preview?.chance}% <small>成功率</small></strong>
       <span>體力 -{preview?.staminaCost} · 膽量 {preview&&preview.courageDelta>0?'+':''}{preview?.courageDelta}</span>
       <span>時間 +{preview?.minutes} 分 · 資源 {preview&&preview.resourceCost<=0?'+':''}{preview&&-preview.resourceCost}</span>
       {selected.attackCardId&&<span>攻擊傷害 {preview?.damage??0} · 對方生命 {state.enemy.health}/{state.enemy.maxHealth}</span>}
       {selected.lootSource&&hasSearchedBefore(state,selected.lootSource)&&<span>剩餘搜刮次數：{remainingSearches(state,selected.lootSource)}</span>}
      </div>
     </div>
    </div>
   </div>
   <div className="choice-inspect__right">
    <button type="button" disabled={busy} className="choice-inspect__text-button" onClick={onBack}><ArrowLeft size={16}/>回到選擇...</button>
    <button type="button" disabled={busy} className={`choice-inspect__skill choice-inspect__skill--prominent ${skillCount>0&&!skillId?'skill-attach--glow':''}`}
      onClick={onShowSkills}><Layers3 size={16}/>
      <span>{skillId&&CARDS[skillId]?CARDS[skillId].name:'附加技能卡'}{skillCount>0&&!skillId?<small>可附加 {skillCount} 張</small>:null}</span>
    </button>
    <button type="button" disabled={busy} className="choice-inspect__text-button choice-inspect__text-button--execute"
      onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();onExecute({x:rect.left+rect.width*.5,y:rect.top+rect.height*.5});}}>
      確定使用 <ArrowDownRight size={22}/>
    </button>
    <div className="choice-ecg" aria-hidden="true"><svg viewBox="0 0 240 78" preserveAspectRatio="none"><path className="choice-ecg__trace" d="M0 40 L40 40 L50 34 L60 48 L76 10 L91 69 L107 38 L128 40 L142 31 L154 47 L174 39 L240 40"/></svg></div>
   </div>
  </div>}
  {!selected&&<button className="choice-stage__retreat" type="button" disabled={busy} onClick={onRetreat}><Footprints size={13}/>撤退</button>}
 </section>;
}
