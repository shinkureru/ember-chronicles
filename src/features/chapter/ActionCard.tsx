import { AlertTriangle, Check, Eye, Footprints, Heart, MessageCircle, Search, Shield, Swords, Utensils, Zap } from 'lucide-react';
import type { ActionChoice, ActionPreview } from '../../game/types';

const ActionIcon=({choice}:{choice:ActionChoice})=>{
  if(choice.tags.includes('fight'))return <Swords size={26}/>;
  if(choice.tags.includes('run'))return <Footprints size={26}/>;
  if(choice.tags.includes('talk'))return <MessageCircle size={26}/>;
  if(choice.tags.includes('search'))return <Search size={26}/>;
  if(choice.tags.includes('observe'))return <Eye size={26}/>;
  return <Shield size={26}/>;
};
export default function ActionCard({choice,index,preview,selected,onClick}:{choice:ActionChoice;index:number;preview:ActionPreview;selected:boolean;onClick:()=>void}){
  return <button type="button" onClick={onClick} title={choice.detail} className={`action-card action-card--floating ${selected?'action-card--active':''}`} aria-pressed={selected} aria-label={`${choice.title}，成功率 ${preview.chance}%：${choice.thought}`}>
    <div className="action-card__crest"><span className="action-card__index">{String.fromCharCode(65+index)}</span><ActionIcon choice={choice}/>{selected&&<Check className="action-card__check" size={14}/>}</div>
    <div className="action-card__top"><div className="action-card__title"><strong>{choice.title}</strong><p>{choice.thought}</p></div><span className={`action-card__rate ${preview.chance>=75?'is-good':preview.chance<40?'is-low':''}`}>{preview.chance}%</span></div>
    <div className="action-card__bottom"><span><Zap size={11}/>-{preview.staminaCost}</span><span><Heart size={11}/>{preview.courageDelta>0?'+':''}{preview.courageDelta}</span><span><Utensils size={11}/>飢餓 +{preview.hungerCost}</span>{preview.warnings.length>0&&<AlertTriangle size={12} className="text-warning"/>}</div>
  </button>;
}
