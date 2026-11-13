import {HUNGER_FIELD_GEAR_COST,hungerRisk,projectedHunger} from '../../game/engine/hungerCosts';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {Backpack,HeartPulse,Shield,Package,LockKeyhole,X} from 'lucide-react';
import {useGame} from '../../app/GameContext';
import {playCue} from '../../audio/sound';
import {ITEMS} from '../../game/data/items';
import {EQUIPMENT_SLOTS,type EquipmentSlot} from '../../game/data/equipment';
import {bagWeight} from '../../game/engine/rules';
import {CONSUMABLE_IDS,previewConsumable} from '../../game/engine/consumables';
import ItemArt from '../../components/ItemArt';
import {armorHits,armorStage,ARMOR_DAMAGE_STAGES,armorSlotForItem} from '../../game/engine/armor';

export default function FieldBagDialog({onClose}:{onClose:()=>void}){
 const {state:s,dispatch,pauseClock}=useGame();
 const [tab,setTab]=useState<'supplies'|'gear'>('supplies');
 const [slot,setSlot]=useState<EquipmentSlot>('body');
 useEffect(()=>{
  pauseClock('dialog',true);
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};
  document.addEventListener('keydown',escape);
  return()=>{pauseClock('dialog',false);document.removeEventListener('keydown',escape)};
 },[pauseClock,onClose]);
 const locked=!!s.enemyCounter;
 const supplies=CONSUMABLE_IDS.filter(id=>(s.bag[id]??0)>0);
 const selected=EQUIPMENT_SLOTS.find(x=>x.id===slot)!;
 const available=selected.allowed.filter(id=>(s.bag[id]??0)>0);
 const doAction=(a:{type:'USE_ITEM';itemId:string}|{type:'EQUIP_ITEM';slot:string;itemId:string}|{type:'UNEQUIP_ITEM';slot:string})=>{
  dispatch(a);playCue(a.type==='USE_ITEM'?'searchCloth':'confirm');
 };
 return createPortal(<div className="field-bag-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
   <section className="field-bag-dialog" role="dialog" aria-modal="true" aria-label="任務背包">
    <header><Backpack size={21}/><div><small>MISSION / FIELD INVENTORY</small><h2>隨身背包</h2></div>
      <button type="button" onClick={onClose} aria-label="關閉隨身背包"><X size={19}/></button></header>
    <div className="field-bag__status"><span><HeartPulse size={14}/> HP {s.player.health}/{s.player.maxHealth}</span>
     <span>體力 {s.player.stamina}/{s.player.maxStamina}</span><span>負重 {bagWeight(s.bag).toFixed(2)} / 15 kg</span></div>
    {locked&&<p className="field-bag__locked"><LockKeyhole size={15}/> 敵人正在反擊，這一刻無法使用物品或更換裝備。</p>}
    <nav className="field-bag__tabs"><button type="button" aria-pressed={tab==='supplies'} onClick={()=>setTab('supplies')}><Package size={15}/> 使用補給</button>
     <button type="button" aria-pressed={tab==='gear'} onClick={()=>setTab('gear')}><Shield size={15}/> 更換裝備</button></nav>
    <div className="field-bag__content">
     {tab==='supplies'&&<div className="field-bag__items">
      {supplies.length===0&&<p>背包裡目前沒有可以直接使用的補給用品。任務中無法從城鎮倉庫拿物品。</p>}
      {supplies.map(id=>{
       const effect=previewConsumable(s,id);
       return <article className="field-bag__item" key={id}>
        <span className="field-bag__art"><ItemArt id={id}/></span>
        <div><strong>{ITEMS[id]?.name} ×{s.bag[id]}</strong><p>{effect?.changes.map(x=>x.label+(x.amount>0?'+':'')+x.amount).join(' · ')||'目前不需要使用'}</p></div>
        <button type="button" disabled={locked||!effect?.canUse} onClick={()=>doAction({type:'USE_ITEM',itemId:id})}>使用</button>
       </article>;
      })}
     </div>}
     {tab==='gear'&&<div className="field-bag__gear">
      <div className="field-bag__slots">{EQUIPMENT_SLOTS.map(item=><button type="button" key={item.id}
       aria-pressed={slot===item.id} onClick={()=>setSlot(item.id)}><small>{item.name}</small><strong>{s.equipment[item.id]?ITEMS[s.equipment[item.id]!]!.name:'未裝備'}</strong>{s.equipment[item.id]&&armorSlotForItem(s,s.equipment[item.id]!)&&<em>{ARMOR_DAMAGE_STAGES[armorStage(armorHits(s,s.equipment[item.id]!))]} · {armorHits(s,s.equipment[item.id]!)} 次受擊</em>}</button>)}</div>
      <p>目前部位：{selected.name}。只可裝備當前背包中持有的物品。任務中實際裝備或卸下將使飢餓 +{projectedHunger(s.player.hunger,HUNGER_FIELD_GEAR_COST)-s.player.hunger}（原成本 +{HUNGER_FIELD_GEAR_COST}）（{s.player.hunger}→{projectedHunger(s.player.hunger,HUNGER_FIELD_GEAR_COST)}）；查看或切換背包分頁不會消耗。</p>
       {hungerRisk(s.player.hunger,projectedHunger(s.player.hunger,HUNGER_FIELD_GEAR_COST))&&<p className="v0834-hunger-risk" role="status">{hungerRisk(s.player.hunger,projectedHunger(s.player.hunger,HUNGER_FIELD_GEAR_COST))?.detail}</p>}
      {available.map(id=><article key={id} className="field-bag__item"><span className="field-bag__art"><ItemArt id={id}/></span>
       <div><strong>{ITEMS[id]?.name}</strong><p>{s.equipment[slot]===id?'目前已裝備':'可在任務中更換'}</p></div>
       <button type="button" disabled={locked||s.equipment[slot]===id} onClick={()=>doAction({type:'EQUIP_ITEM',slot,itemId:id})}>{s.equipment[slot]===id?'已裝備':'裝備'}</button>
      </article>)}
      {available.length===0&&<p>此部位沒有攜帶可用的裝備。請下次任務前先從倉庫準備。</p>}
      {s.equipment[slot]&&<button type="button" className="field-bag__unequip" disabled={locked} onClick={()=>doAction({type:'UNEQUIP_ITEM',slot})}>卸下目前裝備</button>}
      <small>更換主手工具會立即更新對應裝備效果，但攻擊牌仍必須事先準備，且所需物品必須在背包中。</small>
     </div>}
    </div>
    {s.lastEvent&&<p className="field-bag__last" role="status">{s.lastEvent}</p>}
    <footer><button type="button" onClick={onClose}>返回關卡</button></footer>
   </section>
  </div>,document.body);
}
