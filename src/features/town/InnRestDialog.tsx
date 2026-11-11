import {BedDouble,HeartPulse,Clock3,Coins,X} from 'lucide-react';
import {createPortal} from 'react-dom';
import {useEffect,useState} from 'react';
import { useGame } from '../../app/GameContext';
import { TOWN_SERVICES } from '../../game/data/town';
import { previewInnRest,remainingDailyRest,type RestServiceId } from '../../game/engine/innRest';
import { getTownServiceLock } from '../../game/engine/townActions';

const BED_OPTIONS:RestServiceId[]=['rest_cot','rest_private','rest_short'];
export default function InnRestDialog({serviceId,onClose,onConfirm}:{serviceId:RestServiceId;onClose:()=>void;onConfirm:(selected:RestServiceId)=>void}){
 const {state:s,pauseClock}=useGame();
 const [selected,setSelected]=useState<RestServiceId>(serviceId);
 const preview=previewInnRest(s,selected);
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
   <p>選擇休息方式，先查看真正會回復多少生命、體力與需要支付的舊幣。</p>
   <div className="inn-rest-options" role="group" aria-label="選擇床位與休息方式">
    {BED_OPTIONS.map(id=>{
     const bed=TOWN_SERVICES.find(item=>item.id===id)!;
     return <button key={id} type="button" aria-pressed={id===selected} onClick={()=>setSelected(id)}>
      <strong>{bed.name}</strong><small>{bed.coins} 舊幣 · {bed.minutes} 分鐘</small>
     </button>;
    })}
   </div>
   <div className="inn-rest-values">
    <div><strong><HeartPulse size={16}/>生命 HP</strong><span>{s.player.health}/{s.player.maxHealth} → <b>{preview.predictedHealth}/{s.player.maxHealth}</b></span>
      <div className="inn-rest-meter"><i style={{width:`${percent(preview.predictedHealth,s.player.maxHealth)}%`}}/></div>
      <small>本次恢復 +{preview.healthGain} HP</small></div>
    <div><strong>體力 ST</strong><span>{s.player.stamina}/{s.player.maxStamina} → <b>{preview.predictedStamina}/{s.player.maxStamina}</b></span>
      <div className="inn-rest-meter inn-rest-meter--stamina"><i style={{width:`${percent(preview.predictedStamina,s.player.maxStamina)}%`}}/></div>
      <small>本次恢復 +{preview.staminaGain} 體力</small></div>
   </div>
   <div className="inn-rest-advice">{preview.recommendation}
    <small>請不要刻意用無效行動刷低體力；真正的冒險、工作或移動才值得消耗資源。</small>
   </div>
   <div className="inn-rest-cost"><span><Coins size={14}/>{service.coins} 舊幣</span><span><Clock3 size={14}/>{service.minutes} 分鐘</span><span>今日剩餘 {remainingDailyRest(s)}/2 次</span></div>
   {blocked&&<p className="inn-rest-blocked">{blocked}</p>}
   <footer><button type="button" onClick={onClose}>暫時不休息</button><button type="button" disabled={!!blocked} onClick={()=>onConfirm(selected)}>確認休息</button></footer>
  </section>
 </div>,document.body);
}
