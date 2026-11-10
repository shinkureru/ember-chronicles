import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowDownRight, ArrowLeft, Footprints, Layers3 } from 'lucide-react';
import { calculateActionPreview } from '../../game/engine/rules';
import { getChoicePositions } from './choiceLayout';
import { groupChoices } from './choiceGroups';
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
 const [activeGroup,setActiveGroup]=useState<string|null>(null);
 const [origin,setOrigin]=useState({x:50,y:50});
 const grouped=actions.length>4;
 const groups=useMemo(()=>groupChoices(actions),[actions.map(action=>action.id).join('|')]);
 const group=groups.find(g=>g.id===activeGroup);
 const options=grouped?(group?group.actions:groups.map(g=>({...g.actions[0]!,id:g.id,title:g.title,guaranteed:true}))):actions;
 const optionIds=options.map(item=>item.id).join('|');
 const positions=useMemo(()=>getChoicePositions(options.slice(0,6),`${state.attempt}:${state.sceneId}:${activeGroup??'root'}:${optionIds}`),
  [state.attempt,state.sceneId,activeGroup,optionIds]);
 const preview=selected?calculateActionPreview(state,selected,skillId):null;
 useEffect(()=>{setActiveGroup(null);setOrigin({x:50,y:50})},[state.attempt,state.sceneId]);
 useEffect(()=>{
  if(!selected)return;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!busy)onBack();};
  window.addEventListener('keydown',key);
  return()=>window.removeEventListener('keydown',key);
 },[selected,onBack,busy]);
 return <section className={`choice-stage ${selected?'choice-stage--detail':'choice-stage--pick'}`} aria-label="當前行動">
  <header className="choice-stage__heading"><strong>我接下來要怎麼做？</strong><small>{selected?'ACTION / DECISION':group?'選擇 '+group.title:'CHOOSE YOUR WAY'}</small></header>
  {!selected?<div className={`choice-cloud choice-cloud--v11 ${grouped?'choice-cloud--grouped':''} ${group?'choice-cloud--expanded':''}`} role="group"
   aria-label={group?'選擇'+group.title:grouped?'選擇行動取向':'選擇行動'}
   style={{'--bloom-x':`${origin.x}%`,'--bloom-y':`${origin.y}%`,'--choice-count':options.length} as CSSProperties}>
   {group&&<button type="button" className="choice-cloud__back" onClick={()=>{setActiveGroup(null)}}>← 返回行動取向</button>}
   <div className={`choice-cloud__field ${options.length===5?'is-five':''} ${options.length===6?'is-six':''} ${options.length>6?'is-many':''}`} key={activeGroup??'root'}>
   {options.map((action,i)=>{
    const isCategory=grouped&&!group;
    const p=isCategory?null:calculateActionPreview(state,action,null);
    const weapon=action.attackCardId?ATTACK_CARDS[action.attackCardId]:undefined;
    const unavailable=!isCategory&&!!weapon&&!attackStatus(state,weapon.id).inBag;
    const pos=positions[i]??{x:24+(i%3)*26,y:27+Math.floor(i/3)*43,angle:0,delay:0};
    const style={'--choice-x':`${pos.x}%`,'--choice-y':`${pos.y}%`,'--choice-angle':`${pos.angle}deg`,'--choice-delay':`${pos.delay}s`} as CSSProperties;
    const searched=action.lootSource?hasSearchedBefore(state,action.lootSource):false;
    const remaining=action.lootSource?remainingSearches(state,action.lootSource):0;
    const category=isCategory?groups.find(g=>g.id===action.id):null;
    return <button type="button" key={action.id} style={style} disabled={unavailable||busy}
      className={`choice-word ${unavailable?'choice-word--unavailable':''}`}
      onClick={e=>{
       if(isCategory){const rect=e.currentTarget.getBoundingClientRect();const parent=e.currentTarget.closest('.choice-cloud')?.getBoundingClientRect();
        if(parent)setOrigin({x:(rect.left+rect.width/2-parent.left)/parent.width*100,y:(rect.top+rect.height/2-parent.top)/parent.height*100});
        setActiveGroup(action.id);
       }else onSelect(action);
      }}
      aria-label={isCategory?`${action.title}，包含 ${category?.actions.length??0} 個行動`:
       `${action.title}，${unavailable?'缺少武器':`成功率 ${p?.chance}%`}${searched?`，剩餘搜刮 ${remaining} 次`:''}。${action.thought}`}>
      <span>{action.title}</span>
      {isCategory?<small className="choice-word__note">{category?.actions.length??0} 個可選行動</small>:
       <>{!unavailable&&!action.guaranteed&&<em className="choice-word__chance">{p?.chance}%</em>}
       {unavailable&&<small className="choice-word__note">缺少武器</small>}
       {searched&&<small className="choice-word__note">剩餘搜刮次數：{remaining}</small>}</>}
    </button>;
   })}
   </div>
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
