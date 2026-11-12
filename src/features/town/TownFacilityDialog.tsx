import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {Check,ChevronRight,Clock3,Coins,Info,LockKeyhole,MessageCircle,Sparkles,Target,ClipboardList,Droplets,UtensilsCrossed,Wine,X} from 'lucide-react';
import {useGame} from '../../app/GameContext';
import {playCue} from '../../audio/sound';
import {ATTRIBUTE_LABELS} from '../../game/data/attributes';
import {TOWN_FACILITIES,TOWN_SERVICES,TOWN_QUESTS,isTownOpen,townKeeper,townQuestReady} from '../../game/data/town';
import {getTownServiceLock,getTownServiceFee} from '../../game/engine/townActions';
import type {AttributeId,TownFacilityId} from '../../game/types';
import {useVerticalDragScroll} from '../../components/useVerticalDragScroll';

export type SecondaryTownFacility=Exclude<TownFacilityId,'inn'|'clinic'|'workshop'>;
const icons:Record<SecondaryTownFacility,typeof Wine>={
 tavern:Wine,training:Target,noticeboard:ClipboardList,laundry:Droplets,canteen:UtensilsCrossed,
};
const skillGroups:{name:string;attributes:AttributeId[]}[]=[
 {name:'身體與生存',attributes:['maxHealth','maxStamina','mobility','melee','endurance','climate']},
 {name:'觀察與思維',attributes:['observation','reasoning','memory','focus','adaptability','planning']},
 {name:'社交與心理',attributes:['persuasion','deception','negotiation','empathy','intimidation','resilience']},
];

/** The five original town services remain available, without a permanent
 * detail panel below the eight facility buttons on the town overview. */
export default function TownFacilityDialog({facility,onClose}:{facility:SecondaryTownFacility;onClose:()=>void}){
 const {state:s,dispatch,pauseClock}=useGame();
 const [attribute,setAttribute]=useState<AttributeId>('observation');
 const [hasAction,setHasAction]=useState(false);
 const scroll=useVerticalDragScroll();
 const active=TOWN_FACILITIES.find(x=>x.id===facility)!;
 const Icon=icons[facility];
 const isOpen=isTownOpen(facility,s.world.minute);
 const services=TOWN_SERVICES.filter(x=>x.facility===facility);
 const town=s.town;
 useEffect(()=>{
  pauseClock('dialog',true);
  const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};
  document.addEventListener('keydown',onEscape);
  return()=>{pauseClock('dialog',false);document.removeEventListener('keydown',onEscape)};
 },[onClose,pauseClock]);
 const enact=(serviceId:string)=>{
  if(getTownServiceLock(s,serviceId,attribute))return;
  dispatch({type:'TOWN_SERVICE',serviceId,attribute});
  setHasAction(true);
  playCue(serviceId==='train'?'reward':'confirm');
 };
 return createPortal(<div className="town-facility-overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
  <section className="town-facility-dialog" role="dialog" aria-modal="true" aria-label={active.name}>
   <header className="town-facility-dialog__head">
    <span className="town-v15__scene-icon"><Icon size={27}/></span>
    <div className="town-facility-dialog__heading">
     <span className="eyebrow">{active.subtitle}</span><h2>{active.name}</h2>
     <p>{active.description}</p>
    </div>
    <button type="button" onClick={onClose} aria-label={`離開${active.name}`}><X size={20}/></button>
   </header>
   <div className="town-facility-dialog__meta"><span><Coins size={14}/> {s.economy.coins} 舊幣</span><span>到訪 {town?.visits[facility]??0} 次</span></div>
   <div className="town-facility-dialog__body" ref={scroll.scrollRef} role="region" tabIndex={0}
    aria-label={`${active.name}服務與委託，可上下拖曳`}
    onPointerDown={scroll.onPointerDown} onPointerMove={scroll.onPointerMove}
    onPointerUp={scroll.onPointerUp} onPointerCancel={scroll.onPointerCancel}
    onClickCapture={scroll.onClickCapture}>
    <div className="town-v15__keeper"><span><MessageCircle size={14}/>{townKeeper(facility,s.world.minute)}</span><p>{active.greeting}</p></div>
    {!isOpen&&<p className="town-v15__closed"><LockKeyhole size={14}/>目前不營業；開放時間 {String(active.hours[0]).padStart(2,'0')}:00–{active.hours[1]===24?'24':String(active.hours[1]).padStart(2,'0')}:00</p>}
    {facility==='training'&&<div className="town-v15__selector">
     <label htmlFor="town-attribute-dialog">今天要訓練的永久屬性</label>
     <select id="town-attribute-dialog" value={attribute} onChange={event=>setAttribute(event.target.value as AttributeId)}>
      {skillGroups.map(group=><optgroup key={group.name} label={group.name}>{group.attributes.map(id=><option value={id} key={id}>{ATTRIBUTE_LABELS[id]} · Lv.{s.player.attributes[id]}</option>)}</optgroup>)}
     </select>
     <small>每個遊戲日只能練習一項；單項上限 20。今日{town?.lastTrainingDay===s.world.day?'已使用訓練機會':'尚未訓練'}。</small>
    </div>}
    {facility==='noticeboard'?<div className="town-v15__quests">
     {TOWN_QUESTS.map(quest=>{
      const status=town?.quests[quest.id],ready=townQuestReady(s,quest);
      return <article className={`town-v15__quest ${status==='completed'?'is-done':''}`} key={quest.id}>
       <div><strong>{quest.title}</strong><small>{status==='completed'?'已完成':status==='accepted'?'追蹤中':'可承接'}</small></div>
       <p>{quest.detail}</p>
       <p className="town-v15__reward"><Coins size={13}/>舊幣 +{quest.rewardCoins} <Sparkles size={13}/>{ATTRIBUTE_LABELS[quest.rewardAttribute]} +1</p>
       <button type="button" disabled={s.mode!=='home'||status==='completed'||(status==='accepted'&&!ready)}
        onClick={()=>{dispatch(status==='accepted'?{type:'TOWN_COMPLETE_QUEST',questId:quest.id}:{type:'TOWN_ACCEPT_QUEST',questId:quest.id});setHasAction(true);playCue('confirm')}}>
        {status==='completed'?<><Check size={15}/>已結案</>:status==='accepted'?(ready?'交付委託並領取獎勵':'尚未達成條件'):'承接委託'}
       </button>
      </article>;
     })}
    </div>:<div className="town-v15__services">
     {services.map(service=>{
      const reason=getTownServiceLock(s,service.id,attribute);
      const fee=getTownServiceFee(s,service.id,attribute);
      return <article className="town-v15__service" key={service.id}>
       <div><strong>{service.name}</strong><p>{service.summary}</p>
        <small><Coins size={12}/>{fee} 舊幣 <Clock3 size={12}/>{service.minutes} 分鐘</small>
       </div>
       <button type="button" disabled={!!reason} onClick={()=>enact(service.id)}>
        {reason?<LockKeyhole size={15}/>:<ChevronRight size={17}/>}<span>{reason?'不可用':'執行'}</span>
       </button>
       {reason&&<p className="town-v15__reason"><Info size={12}/>{reason}</p>}
      </article>;
     })}
    </div>}
    {hasAction&&s.lastEvent&&<p className="town-facility-dialog__result" role="status">{s.lastEvent}</p>}
   </div>
   <footer><button type="button" onClick={onClose}>返回避難所</button></footer>
  </section>
 </div>,document.body);
}
