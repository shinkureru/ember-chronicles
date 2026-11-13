import { ArrowDown, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS } from '../../game/data/cards';
import ProfessionResourceIcon from '../../components/ProfessionResourceIcon';
import { PROFESSIONS } from '../../game/data/professions';
import { getSkillComparison } from '../../game/engine/skillComparison';
import type { ActionChoice, SkillCard } from '../../game/types';

const signed = (n:number) => n>0?`+${n}`:`${n}`;
const describe = (card:SkillCard|null) => card?`附加 · ${card.name}`:'不附加技能';
export default function SkillComparison({choice,skillId}:{choice:ActionChoice;skillId:string|null}){
  const {state}=useGame();
  const data=getSkillComparison(state,choice,skillId);
  const skill=skillId?CARDS[skillId]??null:null;
  const resourceName=state.profession?PROFESSIONS[state.profession].resourceName:'技能資源';
  return <section className="skill-comparison" aria-label="技能附加前後數值比較">
    <div className="skill-comparison__resource"><ProfessionResourceIcon profession={state.profession} size={14}/><strong>{resourceName}</strong><span className={data.resourceAfter>data.resourceBefore?'change--better':data.resourceAfter<data.resourceBefore?'change--worse':'change--same'}>{data.resourceBefore} / {state.player.maxResource} → {data.resourceAfter} / {state.player.maxResource}</span></div>
    <div className="skill-comparison__card"><span>原始行動卡</span><strong>{choice.title}</strong><div className="skill-comparison__numbers"><span>成功 {data.original.chance}%</span><span>體力 -{data.original.staminaCost}</span><span>膽量 {signed(data.original.courageDelta)}</span><span>飢餓 +{data.original.hungerCost}（→{data.original.projectedHunger}）</span><span>資源 {data.resourceBefore}</span></div></div>
    <div className="skill-comparison__arrow"><ArrowDown size={18}/><span>{describe(skill)}</span></div>
    <div className="skill-comparison__card skill-comparison__card--enhanced"><span>技能附加後 · 預計結果</span><strong>{choice.title}</strong><div className="skill-comparison__metrics">
      {data.metrics.map(metric=><div key={metric.key} className="skill-comparison__metric"><small>{metric.label}</small><strong className={`change--${metric.result}`}>
        {metric.after}{metric.suffix}{metric.result==='better'?<ArrowUpRight size={13} aria-label="正向改善"/>:metric.result==='worse'?<ArrowDownRight size={13} aria-label="負向變化"/>:<Minus size={12} aria-label="沒有變化"/>}
      </strong></div>)}
    </div></div>
    {data.enhanced.warnings.length>0&&<div className="skill-comparison__warning" role="status">{data.enhanced.warnings.map(w=><p key={w.title}><strong>{w.title}</strong> — {w.remedy}</p>)}</div>}
  </section>;
}
