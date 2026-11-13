import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {AlertTriangle,Coins,Hammer,Shield,ShieldCheck,Sparkles,Wrench,X} from 'lucide-react';
import {useGame} from '../../app/GameContext';
import {playCue} from '../../audio/sound';
import {ITEMS} from '../../game/data/items';
import {getEquippedDefense} from '../../game/data/equipmentEffects';
import {ARMOR_SLOTS,ARMOR_SLOT_NAMES,ARMOR_DAMAGE_STAGES,armorDurability,armorHits,armorRepairFee,
 armorStage,equippedArmorEntries,perfectRepairActive,PERFECT_REPAIR_CHANCE,type ArmorSlot} from '../../game/engine/armor';
import {getTownServiceFee,getTownServiceLock} from '../../game/engine/townActions';
import {useVerticalDragScroll} from '../../components/useVerticalDragScroll';
import ItemArt from '../../components/ItemArt';

export default function WorkshopDialog({onClose}:{onClose:()=>void}){
 const {state:s,dispatch,pauseClock}=useGame();
 const [selected,setSelected]=useState<ArmorSlot>(()=>equippedArmorEntries(s)[0]?.slot??'body');
 const [showNotice,setShowNotice]=useState(false);
 const list=useVerticalDragScroll();
 const selectSlot=(slot:ArmorSlot)=>{
  setSelected(slot);
  setShowNotice(false);
  // Keep the current inspection in view rather than preserving an old part's scroll offset.
  if(list.scrollRef.current)list.scrollRef.current.scrollTop=0;
 };
 useEffect(()=>{
  pauseClock('dialog',true);
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};
  document.addEventListener('keydown',escape);
  return()=>{pauseClock('dialog',false);document.removeEventListener('keydown',escape)};
 },[onClose,pauseClock]);
 const itemId=s.equipment[selected]??null;
 const item=itemId?ITEMS[itemId]:null;
 const hits=itemId?armorHits(s,itemId):0;
 const stage=armorStage(hits);
 const durability=itemId?armorDurability(s,itemId):100;
 const fee=itemId?armorRepairFee(s,itemId):0;
 const repairLock=getTownServiceLock(s,'workshop_repair',undefined,itemId??undefined);
 const upgradeLock=getTownServiceLock(s,'workshop_upgrade',undefined,itemId??undefined);
 const upgradeFee=itemId?getTownServiceFee(s,'workshop_upgrade',undefined,itemId):0;
 const currentDefense=getEquippedDefense(s);
 const repaired=structuredClone(s);
 if(itemId&&repaired.town){
  repaired.town.armorHits??={};repaired.town.armorHits[itemId]=0;
  repaired.town.wear[itemId]=100;
 }
 const restoredDefense=getEquippedDefense(repaired);
 const useService=(serviceId:'workshop_repair'|'workshop_upgrade')=>{
  if(!itemId||getTownServiceLock(s,serviceId,undefined,itemId))return;
  dispatch({type:'TOWN_SERVICE',serviceId,itemId});
  setShowNotice(true);
  playCue(serviceId==='workshop_repair'?'searchCloth':'confirm');
 };
 return createPortal(<div className="workshop-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="workshop-dialog" role="dialog" aria-label="修理工坊與防具保養" aria-modal="true">
   <header className="workshop-dialog__header"><span className="workshop-dialog__mark"><Wrench size={23}/></span>
    <div><small>WORKSHOP / ARMOR REPAIR</small><h2>修理工坊</h2></div>
    <button type="button" onClick={onClose} aria-label="關閉修理工坊"><X size={21}/></button>
   </header>
   <div className="workshop-dialog__scene" aria-hidden="true">
    <span className="workshop-dialog__lamp"/><span className="workshop-dialog__anvil"><Hammer size={61} strokeWidth={1.5}/></span>
    <div><strong>「破損的地方，會比傷口更早提醒你。」</strong><small>工匠・羅叔</small></div>
   </div>
   <div className="workshop-dialog__selection">
    <div className="workshop-dialog__intro">
     <span><Shield size={16}/>四個防護部位獨立磨損</span><small>僅敵人真正造成生命傷害時，才隨機命中一件防具</small>
    </div>
    <div className="workshop-dialog__slots" role="group" aria-label="選擇防護部位">
     {ARMOR_SLOTS.map(slot=>{
      const id=s.equipment[slot],count=id?armorHits(s,id):0;
      const condition=armorStage(count);
      return <button key={slot} type="button" aria-pressed={selected===slot} aria-controls="workshop-inspection"
       onClick={()=>selectSlot(slot)}
       className={`workshop-dialog__slot ${selected===slot?'is-selected':''} ${condition!=='intact'?'is-worn':''}`}>
       <span>{ARMOR_SLOT_NAMES[slot]}</span>
       <strong>{id?ITEMS[id]?.name??id:'未裝備'}</strong>
       <small>{id?`${ARMOR_DAMAGE_STAGES[condition]} · ${count}/10 次`:'空欄位'}</small>
      </button>;
     })}
    </div>
   </div>
   <div id="workshop-inspection" className="workshop-dialog__scroll" ref={list.scrollRef} tabIndex={0} role="region"
    aria-label="所選防具耐久、預計修理結果與修理選項，可使用滑鼠拖曳或上下滑動"
    onPointerDown={list.onPointerDown} onPointerMove={list.onPointerMove}
    onPointerUp={list.onPointerUp} onPointerCancel={list.onPointerCancel}
    onClickCapture={list.onClickCapture}>
    {item?<section className="workshop-dialog__inspection">
     <div className="workshop-dialog__gear">
      <span className="workshop-dialog__art"><ItemArt id={itemId!}/></span>
      <div><small>{ARMOR_SLOT_NAMES[selected]} / EQUIPMENT</small><h3>{item.name}</h3>
       <p>{ARMOR_DAMAGE_STAGES[stage]} · 真實受擊 {hits}/10 次</p></div>
     </div>
     <div className="workshop-dialog__durability">
      <div><span>目前耐久度</span><strong>{durability}%</strong></div>
      <div role="progressbar" aria-label="目前防具耐久" aria-valuemin={0} aria-valuemax={100} aria-valuenow={durability} className="workshop-dialog__track">
       <i style={{width:`${durability}%`}}/>
      </div>
      <small>累積 3／5／10 次受擊分別進入輕微／中度／嚴重損壞</small>
     </div>
     <div className="workshop-dialog__preview">
      <div><span>全身目前防禦</span><strong>{currentDefense}</strong></div>
      <div aria-hidden="true">→</div>
      <div><span>修復後防禦</span><strong>{restoredDefense}</strong></div>
     </div>
     {perfectRepairActive(s,itemId!)&&<p className="workshop-dialog__perfect"><Sparkles size={15}/>完美修理待命：下次任務此部位防禦額外 +1</p>}
     <div className="workshop-dialog__actions">
      <button type="button" className="workshop-dialog__repair" disabled={!!repairLock} onClick={()=>useService('workshop_repair')}>
       <Wrench size={18}/><span><strong>完全修復</strong><small><Coins size={13}/> {fee} 舊幣 · 50 分鐘</small></span>
      </button>
      <button type="button" className="workshop-dialog__upgrade" disabled={!!upgradeLock} onClick={()=>useService('workshop_upgrade')}>
       <ShieldCheck size={18}/><span><strong>精工改良 {s.town?.upgrades[itemId!]??0}/3</strong><small><Coins size={13}/> {upgradeFee} 舊幣 · 材料 1 份</small></span>
      </button>
     </div>
     {(repairLock||upgradeLock)&&<p className="workshop-dialog__lock"><AlertTriangle size={13}/>{repairLock??upgradeLock}</p>}
     <p className="workshop-dialog__chance"><Sparkles size={14}/>完全修復有 {PERFECT_REPAIR_CHANCE*100}% 機會觸發完美修理：下次任務這個部位額外 +1 防禦。防禦只影響生命損失，不增加行動成功率。</p>
    </section>:<div className="workshop-dialog__empty"><Shield size={29}/>
     <strong>{ARMOR_SLOT_NAMES[selected]}目前沒有防具</strong>
     <p>先到人物檔案穿戴防具。護臂、護膝可從現場搜刮或黑市修理師取得。</p>
    </div>}
    {showNotice&&s.lastEvent&&<p className="workshop-dialog__last" role="status">{s.lastEvent}</p>}
   </div>
   <footer><button type="button" onClick={onClose}>返回避難所</button></footer>
  </section>
 </div>,document.body);
}
