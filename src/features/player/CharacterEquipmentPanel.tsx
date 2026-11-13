import {useEffect,useRef,useState} from 'react';
import {Backpack,Brain,Footprints,Heart,LockKeyhole,Package,Shield,Zap,Eye,X} from 'lucide-react';
import {useGame} from '../../app/GameContext';
import {EQUIPMENT_SLOTS,type EquipmentSlot} from '../../game/data/equipment';
import {EQUIPMENT_EFFECTS,getEquippedDefense} from '../../game/data/equipmentEffects';
import {ITEMS} from '../../game/data/items';
import {ARMOR_DAMAGE_STAGES,armorHits,armorSlotForItem,armorStage} from '../../game/engine/armor';
import {getProgression} from '../../game/engine/progression';
import {bagWeight} from '../../game/engine/rules';
import {playCue} from '../../audio/sound';
import ItemArt from '../../components/ItemArt';
import SurvivorFigure from '../../components/SurvivorFigure';
import {canEquipInSlot,characterInventoryEntries} from './equipmentInventory';

type InventoryFilter='all'|'gear'|'materials';
const FILTERS:readonly {id:InventoryFilter;label:string}[]=[
 {id:'all',label:'全部'},{id:'gear',label:'裝備'},{id:'materials',label:'物資'},
];

export default function CharacterEquipmentPanel(){
 const {state:s,dispatch}=useGame();
 const [slot,setSlot]=useState<EquipmentSlot>('body');
 const [filter,setFilter]=useState<InventoryFilter>('all');
 const [inspectId,setInspectId]=useState<string|null>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 const selectedSlot=EQUIPMENT_SLOTS.find(e=>e.id===slot)!;
 const equippedItemId=s.equipment[slot];
 const owned=characterInventoryEntries(s);
 const inventory=owned.filter(e=>filter==='all'||(filter==='gear'?e.equippable:!e.equippable))
  .sort((a,b)=>Number(selectedSlot.allowed.includes(b.id))-Number(selectedSlot.allowed.includes(a.id)));
 const currentItem=inspectId?ITEMS[inspectId]:undefined;
 const currentEntry=owned.find(e=>e.id===inspectId);
 const eligibility=currentItem?canEquipInSlot(s,slot,currentItem.id):null;
 const progression=getProgression(s);
 const totalCount=owned.reduce((sum,e)=>sum+e.quantity,0);
 const compatibleCount=owned.filter(e=>selectedSlot.allowed.includes(e.id)).length;
 const selectSlot=(id:EquipmentSlot)=>{setSlot(id);setInspectId(null);playCue('select')};
 const inspect=(id:string)=>{setInspectId(id);playCue('open')};
 const equip=(id:string)=>{
  if(!canEquipInSlot(s,slot,id).allowed)return;
  dispatch({type:'EQUIP_ITEM',slot,itemId:id});
  setInspectId(null);playCue('confirm');
 };
 const unequip=()=>{
  if(!equippedItemId||s.mode!=='home')return;
  dispatch({type:'UNEQUIP_ITEM',slot});
  setInspectId(null);playCue('select');
 };
 useEffect(()=>{
  if(!inspectId)return;
  closeRef.current?.focus();
  const onEscape=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.stopPropagation();setInspectId(null);}
  };
  window.addEventListener('keydown',onEscape);
  return()=>window.removeEventListener('keydown',onEscape);
 },[inspectId]);
 return <section id="character-panel-equipment" aria-label="全身裝備"
  className="equipment-panel viewport-list character-equipment--v09 equipment-v0817">
  <div className="equipment-stage equipment-v0817__stage">
   <div className="equipment-stage__fog" aria-hidden="true"/>
   <div className="equipment-v0817__figure"><SurvivorFigure equipment={s.equipment}/></div>
   <span className="equipment-v0817__figure-caption">SURVIVOR / LV.{progression.level}</span>
   {EQUIPMENT_SLOTS.map(e=>{
    const id=s.equipment[e.id],item=id?ITEMS[id]:null;
    const wear=item?(armorSlotForItem(s,item.id)
     ?`${ARMOR_DAMAGE_STAGES[armorStage(armorHits(s,item.id))]} · ${armorHits(s,item.id)}/10 次`
     :EQUIPMENT_EFFECTS[item.id]?.description??'已裝備'):'可指定裝備';
    return <button key={e.id} type="button"
     className={`equipment-slot equipment-slot--${e.id} ${slot===e.id?'is-selected':''} ${item?'has-item':'is-empty'}`}
     aria-pressed={slot===e.id} aria-controls="equipment-v0817-inventory"
     aria-label={`${e.name}：${item?.name??'未裝備'}；選取此部位`}
     title={`${e.name} · ${item?.name??'未裝備'} · ${wear}`}
     onClick={()=>selectSlot(e.id)}>
     <span className="equipment-v0817__slot-art" aria-hidden="true">{item?<ItemArt id={item.id}/>:e.icon}</span>
     <span className="equipment-slot__copy">
      <small>{e.name}</small><strong>{item?.name??'未裝備'}</strong>
     </span>
    </button>;
   })}
  </div>
  <section className="equipment-v0817__stats" aria-label="角色實際狀態與永久屬性">
   <header><strong>STATS / 角色狀態</strong><small>依照目前裝備與角色能力計算</small></header>
   <dl className="equipment-v0817__stat-grid">
    <div><dt><Heart size={12}/>生命 HP</dt><dd>{s.player.health}/{s.player.maxHealth}</dd></div>
    <div><dt><Zap size={12}/>體力 ST</dt><dd>{s.player.stamina}/{s.player.maxStamina}</dd></div>
    <div><dt><Shield size={12}/>防禦 DEF</dt><dd>{getEquippedDefense(s)}</dd></div>
    <div><dt><Footprints size={12}/>移動 MOB</dt><dd>{s.player.attributes.mobility}</dd></div>
    <div><dt><Eye size={12}/>觀察 OBS</dt><dd>{s.player.attributes.observation}</dd></div>
    <div><dt><Brain size={12}/>韌性 RES</dt><dd>{s.player.attributes.resilience}</dd></div>
   </dl>
  </section>
  <section className="equipment-v0817__inventory" id="equipment-v0817-inventory" aria-label="裝備與物資格子">
   <div className="equipment-v0817__inventory-head">
    <div className="equipment-v0817__inventory-title">
     <Backpack size={14}/><strong>INVENTORY</strong><small>{totalCount} 件 · {owned.length} 種</small>
    </div>
    <div className="equipment-v0817__filters" role="group" aria-label="背包物品類別">
     {FILTERS.map(t=><button type="button" key={t.id} className={filter===t.id?'is-active':''}
      aria-pressed={filter===t.id} onClick={()=>{setFilter(t.id);playCue('select')}}>{t.label}</button>)}
    </div>
   </div>
   <div className="equipment-v0817__slot-target">
    <span>目前部位：<strong>{selectedSlot.name}</strong> · 可用 {compatibleCount} 種</span>
    <button type="button" disabled={!equippedItemId||s.mode!=='home'} onClick={unequip}
     aria-label={`卸下${selectedSlot.name}的目前裝備`}>卸下裝備</button>
   </div>
   <div className="equipment-v0817__inventory-grid" role="group" tabIndex={0} aria-label="選擇物品查看詳情與裝備">
    {inventory.map(entry=>{
     const available=canEquipInSlot(s,slot,entry.id).allowed;
     return <button key={entry.id} type="button" title={`${entry.item.name}｜背包 ${entry.inBag}・倉庫 ${entry.inWarehouse}`}
      className={`equipment-v0817__item ${entry.equippable?'is-gear':'is-material'} ${entry.inUse?'is-equipped':''} ${available?'is-compatible':''}`}
      aria-label={`查看${entry.item.name}：${entry.quantity} 件；${available?'可裝備至目前部位':'查看詳細資料'}`}
      onClick={()=>inspect(entry.id)}>
      <ItemArt id={entry.id} className="equipment-v0817__item-art"/>
      {entry.quantity>1&&<small className="equipment-v0817__item-count">×{entry.quantity}</small>}
      {entry.inUse&&<span className="equipment-v0817__item-equipped" aria-hidden="true">E</span>}
     </button>;
    })}
    {Array.from({length:Math.max(0,12-inventory.length)},(_,i)=><div className="equipment-v0817__item is-placeholder" key={`empty-${i}`} aria-hidden="true"/>)}
   </div>
   <small className="equipment-v0817__inventory-hint">先選擇裝備部位，再點選物品查看裝備選項；背包 {bagWeight(s.bag).toFixed(1)}/15 kg</small>
  </section>
  {currentItem&&<div className="equipment-v0817__overlay" role="presentation"
    onMouseDown={event=>{if(event.target===event.currentTarget)setInspectId(null)}}>
   <section role="dialog" aria-modal="true" aria-labelledby="equipment-v0817-detail-title"
    className="equipment-v0817__detail">
    <button type="button" ref={closeRef} className="equipment-v0817__detail-close"
     aria-label="關閉物品資訊" onClick={()=>setInspectId(null)}><X size={18}/></button>
    <small className="equipment-v0817__detail-eyebrow">INVENTORY / {currentItem.type.toUpperCase()}</small>
    <div className="equipment-v0817__detail-title">
     <span className="equipment-v0817__detail-art"><ItemArt id={currentItem.id}/></span>
     <div><h2 id="equipment-v0817-detail-title">{currentItem.name}</h2>
      <small>背包 {currentEntry?.inBag??0} 件 · 倉庫 {currentEntry?.inWarehouse??0} 件 · {currentItem.weight} kg／件</small>
     </div>
    </div>
    <p>{currentItem.description}</p>
    <p className="equipment-v0817__detail-target">目前選擇：<strong>{selectedSlot.name}</strong>
     <span>{eligibility?.reason}</span>
    </p>
    <div className="equipment-v0817__detail-actions">
     <button type="button" onClick={()=>setInspectId(null)}>返回背包</button>
     <button type="button" disabled={!eligibility?.allowed}
      onClick={()=>equip(currentItem.id)}><Package size={14}/>裝備到{selectedSlot.name}</button>
    </div>
    {!eligibility?.allowed&&<p className="equipment-v0817__detail-note"><LockKeyhole size={13}/>需要選擇相容的部位，並符合倉庫領出與負重限制。</p>}
   </section>
  </div>}
 </section>;
}
