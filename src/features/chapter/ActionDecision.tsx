import { useEffect, useMemo, type CSSProperties } from 'react';
import { ArrowDownRight, ArrowLeft, Footprints, Layers3 } from 'lucide-react';
import { calculateActionPreview } from '../../game/engine/rules';
import { getChoicePositions, getRiskHintIndex } from './choiceLayout';
import type { ActionChoice, GameState } from '../../game/types';
import { CARDS } from '../../game/data/cards';

type Props={
  actions:ActionChoice[];
  state:GameState;
  selected:ActionChoice|null;
  skillId:string|null;
  skillCount:number;
  onSelect:(action:ActionChoice)=>void;
  onBack:()=>void;
  onShowSkills:()=>void;
  onExecute:()=>void;
  onRetreat:()=>void;
};
export default function ActionDecision({actions,state,selected,skillId,skillCount,onSelect,onBack,onShowSkills,onExecute,onRetreat}:Props){
  const layout=useMemo(
    ()=>getChoicePositions(actions,`${state.attempt}:${state.sceneId}:${actions.map(a=>a.id).join(',')}`),
    [state.attempt,state.sceneId,actions.map(a=>a.id).join(',')],
  );
  const previews=actions.map(a=>calculateActionPreview(state,a,null));
  const riskyIndex=getRiskHintIndex(previews);
  const preview=selected?calculateActionPreview(state,selected,skillId):null;
  useEffect(()=>{
    if(!selected)return;
    const handleEscape=(e:KeyboardEvent)=>{if(e.key==='Escape')onBack();};
    window.addEventListener('keydown',handleEscape);
    return()=>window.removeEventListener('keydown',handleEscape);
  },[selected,onBack]);
  return <section className={`choice-stage ${selected?'choice-stage--detail':'choice-stage--pick'}`} aria-label="當前行動">
    <header className="choice-stage__heading"><strong>我接下來要怎麼做？</strong><small>{selected?'ACTION / DECISION':'CHOOSE YOUR WAY'}</small></header>
    {!selected?<div key={`pick-${state.attempt}-${state.sceneId}`} className="choice-cloud" role="group" aria-label="選擇行動">
      {actions.map((action,i)=>{
        const pos=layout[i]??{x:50,y:50,angle:0,delay:0};
        const style={'--choice-x':`${pos.x}%`,'--choice-y':`${pos.y}%`,'--choice-angle':`${pos.angle}deg`,'--choice-delay':`${pos.delay}s`} as CSSProperties;
        return <button type="button" key={action.id} style={style}
          className={`choice-word ${i===riskyIndex?'choice-word--static':''}`}
          onClick={()=>onSelect(action)} aria-label={`${action.title}。成功率 ${previews[i].chance}%。${action.thought}`}
          title={action.thought}>
          <span>{action.title}</span>
        </button>;
      })}
    </div>:<div key={`detail-${selected.id}`} className="choice-inspect">
      <div className="choice-inspect__left">
        <div className="torn-action-card" aria-label={selected.title}>
          <svg className="torn-action-card__edge" viewBox="0 0 260 350" preserveAspectRatio="none" aria-hidden="true">
            <path d="M18 13 L44 8 L71 12 L94 8 L140 12 L171 6 L224 9 L243 20 L249 51 L245 87 L252 108 L248 158 L251 202 L248 258 L252 305 L244 333 L216 341 L175 338 L139 343 L103 339 L65 343 L24 338 L15 318 L12 279 L14 242 L8 207 L13 172 L9 133 L14 90 L10 54 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
          </svg>
          <div className="torn-action-card__body">
            <span className="torn-action-card__index">ACTION / {selected.tags[0]?.toUpperCase()}</span>
            <strong>{selected.title}</strong>
            <p>{selected.thought}</p>
            <p className="torn-action-card__detail">{selected.detail}</p>
            <div className="torn-action-card__stats">
              <b>{preview?.chance}% <small>成功率</small></b>
              <span>體力 -{preview?.staminaCost}　膽量 {preview&&preview.courageDelta>0?'+':''}{preview?.courageDelta}</span>
              <span>時間 +{preview?.minutes} 分　資源 {preview&&preview.resourceCost<=0?'+':''}{preview&&-preview.resourceCost}</span>
            </div>
          </div>
        </div>
        <button type="button" className={`choice-inspect__skill ${skillCount>0&&!skillId?'skill-attach--glow':''}`} onClick={onShowSkills}>
          <Layers3 size={15}/>{skillId&&CARDS[skillId]?CARDS[skillId].name:'附加技能卡'}{skillCount>0&&!skillId?` · ${skillCount} 張可用`:''}
        </button>
      </div>
      <div className="choice-inspect__right">
        <button type="button" className="choice-inspect__text-button" onClick={onBack}><ArrowLeft size={18}/>回到選擇...</button>
        <button type="button" className="choice-inspect__text-button choice-inspect__text-button--execute" onClick={onExecute}>確定使用 <ArrowDownRight size={22}/></button>
        <div className="choice-ecg" aria-hidden="true">
          <svg viewBox="0 0 240 78" preserveAspectRatio="none">
            <path className="choice-ecg__trace" d="M0 40 L40 40 L50 34 L60 48 L76 10 L91 69 L107 38 L128 40 L142 31 L154 47 L174 39 L240 40"/>
          </svg>
        </div>
      </div>
    </div>}
    {!selected&&<button className="choice-stage__retreat" type="button" onClick={onRetreat}><Footprints size={13}/>撤退</button>}
  </section>;
}
