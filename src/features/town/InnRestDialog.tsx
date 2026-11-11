import {BedDouble,HeartPulse,Clock3,Coins,X} from 'lucide-react';
import {createPortal} from 'react-dom';
import {useEffect} from 'react';
import { useGame } from '../../app/GameContext';
import { TOWN_SERVICES } from '../../game/data/town';
import { previewInnRest,remainingDailyRest,type RestServiceId } from '../../game/engine/innRest';
import { getTownServiceLock } from '../../game/engine/townActions';

export default function InnRestDialog({serviceId,onClose,onConfirm}:{serviceId:RestServiceId;onClose:()=>void;onConfirm:()=>void}){
 const {state:s}=useGame();
 const preview=previewInnRest(s,serviceId);
 useEffect(()=>{const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};document.addEventListener('keydown',onEscape);return()=>document.removeEventListener('keydown',onEscape)},[onClose]);
 const service=TOWN_SERVICES.find(x=>x.id===serviceId)!;
 const blocked=getTownServiceLock(s,serviceId);
 const percent=(x:number,max:number)=>Math.round(x/Math.max(1,max)*100);
 return createPortal(<div className="inn-rest-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="inn-rest-dialog" role="dialog" aria-modal="true" aria-label="出租床位恢復預測">
   <header><BedDouble size={22}/><div><small>REST / PREVIEW</small><h3>{service.name}</h3></div>
    <button type="button" onClick={onClose} aria-label="關閉休息預覽"><X size={18}/></button></header>
   <p>疲憊程度會影響生命恢復效率。所有數字都以這次休息的真實結算公式預測。</p>
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
   <footer><button type="button" onClick={onClose}>暫時不休息</button><button type="button" disabled={!!blocked} onClick={onConfirm}>確認休息</button></footer>
  </section>
 </div>,document.body);
}
