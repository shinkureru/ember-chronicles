import { LockKeyhole, Layers3, Sparkles } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS } from '../../game/data/cards';
import { PROFESSIONS } from '../../game/data/professions';
import { isSkillCompatible } from '../../game/engine/rules';
import { getSkillComparison } from '../../game/engine/skillComparison';
import type { ActionChoice } from '../../game/types';
import type { CSSProperties } from 'react';

const phase=(seed:number,index:number)=>{
  const value=(Math.imul(seed+79,1664525)+Math.imul(index+3,1013904223))>>>0;
  return {
    '--skill-tilt':`${(value%17)-8}deg`,
    '--skill-shift':`${((value>>>6)%19)-9}px`,
    '--skill-delay':`${-((value>>>12)%25)/10}s`,
  } as CSSProperties;
};
export default function SkillHand({choice,skillId,onChange,layoutSeed=0}:{
  choice:ActionChoice|null;skillId:string|null;onChange:(v:string|null)=>void;layoutSeed?:number;
}){
 const {state}=useGame();
 const selectedPreview=choice?getSkillComparison(state,choice,skillId):null;
 const projected=selectedPreview?.resourceAfter??state.player.resource;
 const resourceName=state.profession?PROFESSIONS[state.profession].resourceName:'技能資源';
 return <section className="hand-section hand-section--scatter">
  <div className="section-heading"><div><span className="eyebrow">DECK / SKILL</span><h3><Layers3 size={17}/> 附加技能卡</h3></div><span className="subtle-small">手牌 {state.hand.length} 張</span></div>
  <div className="skill-resource-status" role="status">
    <span>{resourceName}</span><strong>{state.player.resource} / {state.player.maxResource}</strong>
    <span aria-hidden="true">→</span>
    <strong className={projected>state.player.resource?'change--better':projected<state.player.resource?'change--worse':'change--same'}>{projected} / {state.player.maxResource}</strong>
  </div>
  <div className="skill-scatter__wrap">
    <div className="skill-scatter__track" role="group" aria-label="可左右滑動的附加技能卡">
      <button type="button" style={phase(layoutSeed,0)} className={`skill-tile skill-tile--scatter skill-tile--none ${!skillId?'is-selected':''}`} onClick={()=>onChange(null)}>
        <div className="skill-tile__illustration"><span>∅</span></div><strong>不附加</strong><small>0 資源</small>
      </button>
      {state.hand.map((id,i)=>{
        const card=CARDS[id];if(!card)return null;
        const allowed=!!choice&&isSkillCompatible(choice,card)&&state.player.resource>=card.resourceCost;
        return <button type="button" key={`${id}-${i}`} style={phase(layoutSeed,i+1)}
          disabled={!allowed} className={`skill-tile skill-tile--scatter ${skillId===id?'is-selected':''}`}
          onClick={()=>onChange(id)} aria-pressed={skillId===id} title={card.description}>
          <div className="skill-tile__illustration"><span>{card.emoji}</span>{!allowed&&<LockKeyhole size={12} className="skill-tile__lock"/>}</div>
          <strong>{card.name} <span className="skill-level">{['','I','II','III','IV','V'][state.ownedCards[id]?.level??1]}</span></strong>
          <small><Sparkles size={10}/>{card.resourceCost<0?`+${-card.resourceCost}`:card.resourceCost} 資源{card.resourceCost>=0?'消耗':'回復'}</small>
        </button>;
      })}
    </div>
    {state.hand.length>2&&<div className="skill-scatter__peek" aria-hidden="true">← 左右滑動查看更多 →</div>}
  </div>
  {skillId&&CARDS[skillId]&&<p className="skill-note"><Sparkles size={14}/>{CARDS[skillId].description}</p>}
  {!choice&&<p className="skill-note">先選擇行動，才能看到哪些技能可用。</p>}
 </section>;
}
