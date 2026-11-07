import { AlertTriangle, ArrowUpRight, Check, Clock3, Heart, Zap } from 'lucide-react';
import type { ActionChoice, ActionPreview } from '../../game/types';
export default function ActionCard({choice,index,preview,selected,onClick}:{choice:ActionChoice;index:number;preview:ActionPreview;selected:boolean;onClick:()=>void}){
  const isCostly=preview.warnings.length>0;
  return <button type="button" onClick={onClick} title={choice.detail} className={`action-card ${selected?'action-card--active':''}`} aria-pressed={selected}>
    <div className="action-card__top"><span className="action-card__index">{String.fromCharCode(65+index)}</span><div className="action-card__title"><strong>{choice.title}</strong><p>{choice.thought}</p></div><span className={`action-card__rate ${preview.chance>=75?'is-good':preview.chance<40?'is-low':''}`}>{preview.chance}%</span></div>
    <div className="action-card__bottom"><span><Zap size={12}/>體力 -{preview.staminaCost}</span><span><Heart size={12}/>膽量 {preview.courageDelta>0?'+':''}{preview.courageDelta}</span><span><Clock3 size={12}/>+{preview.minutes} 分</span>{selected&&<Check size={15} className="action-card__check"/>}{isCostly&&<AlertTriangle size={14} className="text-warning"/>}</div>
    <div className="action-card__detail"><ArrowUpRight size={13}/>{choice.detail}</div>
  </button>;
}
