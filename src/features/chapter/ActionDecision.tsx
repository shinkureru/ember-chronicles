import { useEffect, useMemo, type CSSProperties } from 'react';
import { ArrowDownRight, ArrowLeft, Footprints, Layers3 } from 'lucide-react';
import { calculateActionPreview } from '../../game/engine/rules';
import type { ActionChoice, GameState } from '../../game/types';
import { CARDS } from '../../game/data/cards';

/** Deliberately scattered but never overlapping: shuffle safe positions, not raw x/y coordinates. */
const SLOTS:Record<number,readonly [number,number][]>={
  1:[[50,48]],
  2:[[27,34],[73,66]],
  3:[[25,31],[75,30],[50,74]],
  4:[[24,27],[76,27],[25,73],[76,73]],
  5:[[19,24],[76,23],[50,49],[22,77],[78,77]],
  6:[[21,18],[77,18],[49,46],[20,75],[76,75],[49,92]],
};
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),16777619);}return h>>>0;};
const shuffleSlots=(choices:ActionChoice[],seed:string)=>{
  const slots=SLOTS[Math.min(6,Math.max(1,choices.length))]??SLOTS[3];
  return choices.map((choice,i)=>{
    // Shuffle the index ordering by hashing all available choices and the scene.
    const order=choices.map((_,j)=>({j,k:hash(`${seed}:${j}`)})).sort((a,b)=>a.k-b.k);
    const slot=slots[order.findIndex(o=>o.j===i)%slots.length];
    const jitter=hash(`${seed}:${choice.id}`);
    const angle=((jitter>>>3)%19)-9;
    return {x:slot[0],y:slot[1],angle,delay:-((jitter>>>9)%30)/10};
  });
};
const knownRisk=(preview:ReturnType<typeof calculateActionPreview>)=>
  (100-preview.chance)+preview.warnings.length*8+preview.staminaCost*.45+
  (preview.courageDelta<0?-preview.courageDelta*.7:0);

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
    ()=>shuffleSlots(actions,`${state.attempt}:${state.sceneId}:${actions.map(a=>a.id).join(',')}`),
    [state.attempt,state.sceneId,actions.map(a=>a.id).join(',')],
  );
  const previews=actions.map(a=>calculateActionPreview(state,a,null));
  const riskyIndex=actions.length>1
    ?previews.reduce((worst,p,i)=>knownRisk(p)>knownRisk(previews[worst])?i:worst,0)
    :-1;
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
