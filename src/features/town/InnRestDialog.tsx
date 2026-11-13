import {BedDouble,HeartPulse,Utensils,Coins,X} from 'lucide-react';
import {createPortal} from 'react-dom';
import {useEffect,useState} from 'react';
import { useGame } from '../../app/GameContext';
import { TOWN_SERVICES } from '../../game/data/town';
import { previewInnRest,remainingDailyRest,type RestServiceId } from '../../game/engine/innRest';
import { getTownServiceLock } from '../../game/engine/townActions';
import {townHungerProjection,hungerRisk} from '../../game/engine/hungerCosts';
import {useVerticalDragScroll} from '../../components/useVerticalDragScroll';

const BED_OPTIONS:RestServiceId[]=['rest_cot','rest_private','rest_short'];
export default function InnRestDialog({serviceId,onClose,onConfirm}:{serviceId:RestServiceId;onClose:()=>void;onConfirm:(selected:RestServiceId)=>void}){
 const {state:s,pauseClock}=useGame();
 const [selected,setSelected]=useState<RestServiceId>(serviceId);
 const innerScroll=useVerticalDragScroll();
 const preview=previewInnRest(s,selected);
  const hunger=townHungerProjection(s,selected);
  const hungerWarning=hungerRisk(s.player.hunger,hunger.projectedHunger);
 useEffect(()=>{
  pauseClock('dialog',true);
  const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};
  document.addEventListener('keydown',onEscape);
  return()=>{document.removeEventListener('keydown',onEscape);pauseClock('dialog',false)};
 },[onClose,pauseClock]);
 const service=TOWN_SERVICES.find(x=>x.id===selected)!;
 const blocked=getTownServiceLock(s,selected);
 const percent=(x:number,max:number)=>Math.round(x/Math.max(1,max)*100);
 return createPortal(<div className="inn-rest-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="inn-rest-dialog" role="dialog" aria-modal="true" aria-label="出租床位恢復預測">
   <header><BedDouble size={22}/><div><small>REST / PREVIEW</small><h3>{service.name}</h3></div>
    <button type="button" onClick={onClose} aria-label="關閉休息預覽"><X size={18}/></button></header>
   <div className="inn-rest-dialog__scroll" ref={innerScroll.scrollRef} tabIndex={0} role="region"
    aria-label="出租床位恢復預覽，可上下拖曳查看"
    onPointerDown={innerScroll.onPointerDown} onPointerMove={innerScroll.onPointerMove}
    onPointerUp={innerScroll.onPointerUp} onPointerCancel={innerScroll.onPointerCancel}
    onClickCapture={innerScroll.onClickCapture}>
    <p>選擇休息方式，先查看真正會回復多少生命、體力與需要支付的舊幣。</p>
   <div className="inn-rest-options" role="group" aria-label="選擇床位與休息方式">
    {BED_OPTIONS.map(id=>{
     const bed=TOWN_SERVICES.find(item=>item.id===id)!;
     return <button key={id} type="button" aria-pressed={id===selected} onClick={()=>setSelected(id)}>
      <strong>{bed.name}</strong><small>{bed.coins} 舊幣 · 飢餓 +{townHungerProjection(s,id).hungerDelta}</small>
     </button>;
    })}
   </div>
   <div className="inn-rest-values recovery-preview-values">
    {([
     {kind:'hp' as const,label:'生命 HP',now:s.player.health,max:s.player.maxHealth,after:preview.predictedHealth,gain:preview.healthGain},
     {kind:'stamina' as const,label:'體力 ST',now:s.player.stamina,max:s.player.maxStamina,after:preview.predictedStamina,gain:preview.staminaGain}
    ]).map(stat=><div className={`inn-rest-value inn-rest-value--${stat.kind} recovery-preview-card`} key={stat.kind}>
      <strong>{stat.kind==='hp'?<HeartPulse size={16}/>:null}{stat.label}</strong>
      <span className="inn-rest-value__numbers">{stat.now}/{stat.max}<b aria-hidden="true">→</b><em>{stat.after}/{stat.max}</em></span>
      <div className="inn-rest-meter recovery-preview-meter" role="progressbar" aria-label={`${stat.label}休息後預計`} aria-valuemin={0} aria-valuemax={stat.max} aria-valuenow={stat.after}>
       <i className="inn-rest-meter__current" style={{width:`${percent(stat.now,stat.max)}%`}}/>
       <i className="inn-rest-meter__gain" style={{left:`${percent(stat.now,stat.max)}%`,width:`${percent(stat.after-stat.now,stat.max)}%`}}/>
      </div>
      <small>本次恢復 +{stat.after-stat.now} {stat.kind==='hp'?'HP':'體力'}</small>
    </div>)}
   </div>
   <div className="inn-rest-advice">{preview.recommendation}
    <small>請不要刻意用無效行動刷低體力；真正的冒險、工作或移動才值得消耗資源。</small>
   </div>
   </div>
   <div className="inn-rest-dialog__checkout" role="status" aria-live="polite" aria-atomic="true">
    <div className="inn-rest-cost"><span><Coins size={14}/>{service.coins} 舊幣</span><span><Utensils size={14}/>飢餓 +{hunger.hungerDelta}（{s.player.hunger}→{hunger.projectedHunger}）</span><span>今日剩餘 {remainingDailyRest(s)}/2 次</span></div>
    {hungerWarning&&<p className="v0834-hunger-risk" role="status">{hungerWarning.title} · {hungerWarning.detail}</p>}
     <p className={`inn-rest-blocked ${blocked?'is-blocked':'is-clear'}`}>{blocked??' '}</p>
   </div>
   <footer><button type="button" onClick={onClose}>暫時不休息</button><button type="button" disabled={!!blocked} onClick={()=>onConfirm(selected)}>確認休息</button></footer>
  </section>
 </div>,document.body);
}
