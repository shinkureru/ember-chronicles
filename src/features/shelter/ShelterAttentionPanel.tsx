import {Bell,BookOpen,CheckCircle2,Eye,MessageCircle,Plus,X} from 'lucide-react';
import type {ShelterFurnitureId} from '../../game/types';
import {availableShelterAttention,makeDemoShelterAttention,SHELTER_ATTENTION_LABELS,type ShelterAttention,type ShelterAttentionKind} from '../../game/engine/shelterInteractions';
import {SHELTER_FACILITIES} from '../../game/engine/shelterInteractions';

interface Props{
 owned:readonly ShelterFurnitureId[];
 queue:readonly ShelterAttention[];
 onTrigger:(kind:ShelterAttentionKind)=>void;
 onInspect:(id:ShelterFurnitureId)=>void;
 onDismiss:(id:string)=>void;
}
const DEMO_OPTIONS=[
 {kind:'tutorial',name:'教學引導',icon:BookOpen},
 {kind:'quest',name:'重要隱藏支線',icon:MessageCircle},
 {kind:'ready',name:'製作完成',icon:CheckCircle2}
] as const;

export default function ShelterAttentionPanel({owned,queue,onTrigger,onInspect,onDismiss}:Props){
 const visible=availableShelterAttention(queue,owned);
 const current=visible[0]??null;
 return <section className="shelter-attention-demo surface-card" data-prototype-only="true" aria-label="家具提示特效測試">
  <header className="shelter-attention-demo__header"><span><Bell size={15} aria-hidden="true"/> 設施提示測試</span><small>PROTOTYPE ONLY</small></header>
  <p>模擬新手指引、重要支線與設施完成通知。沒有真正新增任務或獎勵，觸發規則之後再討論。</p>
  <div className="shelter-attention-demo__actions">
   {DEMO_OPTIONS.map(option=>{
    const Icon=option.icon;
    const alert=makeDemoShelterAttention(option.kind);
    const installed=owned.includes(alert.targetId);
    return <button type="button" key={option.kind}
      disabled={!installed} title={installed?'示範 '+option.name:'請先購入 '+SHELTER_FACILITIES[alert.targetId].name}
      onClick={()=>onTrigger(option.kind)}><Icon size={14}/><Plus size={12}/>{option.name}</button>;
   })}
  </div>
  {current?<div className="shelter-attention-demo__current" role="status" aria-live="polite">
   <div><strong>{SHELTER_ATTENTION_LABELS[current.kind]} · {current.title}</strong>
    <p>{current.detail}</p><small>指向：{SHELTER_FACILITIES[current.targetId].name} · 等待 {visible.length} 則提示</small>
   </div>
   <div className="shelter-attention-demo__current-actions">
    <button type="button" onClick={()=>onInspect(current.targetId)}><Eye size={14}/> 檢視設施</button>
    <button type="button" aria-label="忽略這則設施提示" onClick={()=>onDismiss(current.id)}><X size={15}/> 忽略</button>
   </div>
  </div>:<p className="shelter-attention-demo__empty">目前沒有待處理提示。點上方按鈕可預覽柔和光邊及提示訊息。</p>}
 </section>;
}
