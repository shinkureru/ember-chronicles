import { LockKeyhole, Layers3, Sparkles } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { CARDS } from '../../game/data/cards';
import { PROFESSIONS } from '../../game/data/professions';
import { isSkillCompatible } from '../../game/engine/rules';
import type { ActionChoice } from '../../game/types';
export default function SkillHand({choice,skillId,onChange}:{choice:ActionChoice|null;skillId:string|null;onChange:(v:string|null)=>void}){
 const {state}=useGame();
 return <section className="hand-section">
  <div className="section-heading"><div><span className="eyebrow">DECK / SKILL</span><h3><Layers3 size={17}/> 附加技能卡</h3></div><span className="subtle-small">手牌 {state.hand.length} 張 · {state.profession?PROFESSIONS[state.profession].resourceName:'能量'} {state.player.resource}</span></div>
  <div className="hand-scroll"><button type="button" className={`skill-tile skill-tile--none ${!skillId?'is-selected':''}`} onClick={()=>onChange(null)}><div className="skill-tile__illustration"><span>∅</span></div><strong>不附加</strong><small>0 資源</small></button>
  {state.hand.map((id,i)=>{
    const card=CARDS[id];if(!card)return null;
    const allowed=!!choice && isSkillCompatible(choice,card)&&state.player.resource>=card.resourceCost;
    const disabled=!allowed;
    return <button type="button" key={`${id}-${i}`} disabled={disabled} className={`skill-tile ${skillId===id?'is-selected':''}`} onClick={()=>onChange(id)} title={card.description}>
      <div className="skill-tile__illustration"><span>{card.emoji}</span>{disabled&&<LockKeyhole size={12} className="skill-tile__lock"/>}</div><strong>{card.name} <span className="skill-level">{['','I','II','III','IV','V'][state.ownedCards[id]?.level??1]}</span></strong><small><Sparkles size={10}/> {card.resourceCost} 資源</small>
    </button>;
  })}</div>
  {skillId&&CARDS[skillId]&&<p className="skill-note"><Sparkles size={14}/>{CARDS[skillId].description}</p>}
  {!choice&&<p className="skill-note">先選擇一張行動卡，才能看到哪些技能可用。</p>}
 </section>;
}
