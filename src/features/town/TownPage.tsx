import { useState } from 'react';
import { Archive, BedDouble, BookText, Check, ChevronRight, ClipboardList, Clock3, Coins, Droplets, HeartPulse, Info, LockKeyhole, MessageCircle, ShieldCheck, Sparkles, Target, UtensilsCrossed, Wine, Wrench } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { playCue } from '../../audio/sound';
import { worldPhase,worldClock,worldPhaseToken } from '../../game/engine/rules';
import { ATTRIBUTE_LABELS } from '../../game/data/attributes';
import { ITEMS } from '../../game/data/items';
import { TOWN_FACILITIES,TOWN_SERVICES,TOWN_QUESTS,isTownOpen,townKeeper,townQuestReady,townAbsoluteMinute } from '../../game/data/town';
import { getTownServiceLock,getTownServiceFee } from '../../game/engine/townActions';
import {armorSlotForItem,armorHits} from '../../game/engine/armor';
import type { AttributeId,TownFacilityId } from '../../game/types';
import InnRestDialog from './InnRestDialog';
import ClinicDialog from './ClinicDialog';
import WorkshopDialog from './WorkshopDialog';
import {isRestService,remainingDailyRest,type RestServiceId} from '../../game/engine/innRest';

const facilityIcons:Record<TownFacilityId,typeof BedDouble>={
 inn:BedDouble,clinic:HeartPulse,workshop:Wrench,tavern:Wine,training:Target,noticeboard:ClipboardList,laundry:Droplets,canteen:UtensilsCrossed,
};
const skillGroups:{name:string;attributes:AttributeId[]}[]=[
 {name:'身體與生存',attributes:['maxHealth','maxStamina','mobility','melee','endurance','climate']},
 {name:'觀察與思維',attributes:['observation','reasoning','memory','focus','adaptability','planning']},
 {name:'社交與心理',attributes:['persuasion','deception','negotiation','empathy','intimidation','resilience']},
];
export default function TownPage(){
 const {state:s,dispatch}=useGame();
 const [facility,setFacility]=useState<TownFacilityId>('inn');
 const [restDialog,setRestDialog]=useState<RestServiceId|null>(null);
 const [clinicOpen,setClinicOpen]=useState(false);
 const [workshopOpen,setWorkshopOpen]=useState(false);
 const [attribute,setAttribute]=useState<AttributeId>('observation');
 const [selectedGear,setSelectedGear]=useState('');
 const active=TOWN_FACILITIES.find(x=>x.id===facility)!;
 const Icon=facilityIcons[facility],open=isTownOpen(facility,s.world.minute);
 const services=TOWN_SERVICES.filter(x=>x.facility===facility);
 const equipped=[...new Set(Object.values(s.equipment).filter((id):id is string=>!!id))];
 const gear=equipped.includes(selectedGear)?selectedGear:(equipped.find(id=>!!armorSlotForItem(s,id))??equipped[0]??'');
 const town=s.town;
 const conditions=s.conditions??{wounds:0,infection:0,poisoning:0,illness:0};
 const phase=worldPhase(s.world.minute);
 const enact=(serviceId:string)=>{
  if(getTownServiceLock(s,serviceId,attribute,gear||undefined))return;
  dispatch({type:'TOWN_SERVICE',serviceId,attribute,itemId:gear||undefined});
  playCue(serviceId==='train'?'reward':serviceId.startsWith('clinic')?'searchCloth':'confirm');
 };
 return <div className={`page-stack town-page town-v15 viewport-page phase--${worldPhaseToken(s.world.minute)}`}>
  <header className="town-v15__intro">
   <span className="eyebrow">CITY SAFEHOUSE / EIGHT FACILITIES</span>
   <h1>舊街避難所</h1>
   <p>「城裡的人還在勉強生活。每扇門後面，都有另一種交易或代價。」</p>
   <div className="town-v15__status"><span><Clock3 size={13}/> 第 {s.world.day} 日 · {phase} {worldClock(s.world.minute)}</span><strong><Coins size={15}/> {s.economy.coins} 舊幣</strong></div>
  </header>
  <section className="town-v15__stats" aria-label="角色即時狀態">
   <span><HeartPulse size={14}/>生命 {s.player.health}/{s.player.maxHealth}</span>
   <span>體力 {s.player.stamina}/{s.player.maxStamina}</span>
   <span>飢餓 {s.player.hunger}</span>
   <span>疲勞 {s.player.fatigue}</span>
   {(conditions.wounds+conditions.infection+conditions.poisoning+conditions.illness)>0&&<small className="town-v15__ailments">外傷 {conditions.wounds} · 感染 {conditions.infection} · 中毒 {conditions.poisoning} · 疾病 {conditions.illness}</small>}
  </section>
  <section className="town-v15__facilities" aria-label="選擇城鎮設施">
   {TOWN_FACILITIES.map(f=>{
    const TileIcon=facilityIcons[f.id],selected=facility===f.id,available=isTownOpen(f.id,s.world.minute);
    return <button type="button" key={f.id} className={`town-v15__tile ${selected?'is-active':''}`} aria-pressed={selected}
     onClick={()=>{setFacility(f.id);if(f.id==='inn')setRestDialog('rest_cot');if(f.id==='clinic')setClinicOpen(true);if(f.id==='workshop')setWorkshopOpen(true);playCue('select')}}>
     <span className="town-v15__tile-icon"><TileIcon size={21}/></span>
     <span className="town-v15__tile-text"><strong>{f.name}</strong><small>{available?'營業中':'已打烊'} · 到訪 {town?.visits[f.id]??0} 次</small></span>
     <ChevronRight size={14}/>
    </button>;
   })}
  </section>
  <section className="town-v15__detail" aria-label={active.name}>
   <header className="town-v15__detail-head"><div className="town-v15__scene-icon"><Icon size={29}/></div>
    <div><span className="eyebrow">{active.subtitle}</span><h2>{active.name}</h2><p>{active.description}</p></div>
   </header>
   <div className="town-v15__keeper"><span><MessageCircle size={14}/> {townKeeper(facility,s.world.minute)}</span><p>{active.greeting}</p></div>
   {!open&&<p className="town-v15__closed"><LockKeyhole size={14}/>目前不營業；開放時間 {String(active.hours[0]).padStart(2,'0')}:00–{active.hours[1]===24?'24':String(active.hours[1]).padStart(2,'0')}:00</p>}
   {facility==='inn'&&<p className="inn-rest-remaining">本日剩餘出租床位休息：{remainingDailyRest(s)}/2 次。不同床位共用每日上限；入睡前可預覽實際恢復數值。</p>}
   {facility==='training'&&<div className="town-v15__selector"><label htmlFor="town-attribute">今天要訓練的永久屬性</label>
    <select id="town-attribute" value={attribute} onChange={e=>setAttribute(e.target.value as AttributeId)}>
     {skillGroups.map(group=><optgroup key={group.name} label={group.name}>{group.attributes.map(id=><option value={id} key={id}>{ATTRIBUTE_LABELS[id]} · Lv.{s.player.attributes[id]}</option>)}</optgroup>)}
    </select>
    <small>每個遊戲日只能練習一項；單項上限 20。今日{town?.lastTrainingDay===s.world.day?'已使用訓練機會':'尚未訓練'}。</small>
   </div>}
   {facility==='workshop'&&<div className="town-v15__selector"><label htmlFor="town-equipment">改良裝備或檢查耐久</label>
    <button type="button" className="town-workshop-entrance" onClick={()=>setWorkshopOpen(true)}><Wrench size={17}/>開啟修理工坊 · 四部位耐久與修復預覽 <ChevronRight size={15}/></button>
    <select id="town-equipment" value={gear} onChange={e=>setSelectedGear(e.target.value)}>
     {equipped.length===0?<option value="">請先前往人物檔案裝備物品</option>:equipped.map(id=><option value={id} key={id}>{ITEMS[id]?.name??id} · 耐久 {town?.wear[id]??100}% · 受擊 {armorHits(s,id)} 次 · 改良 {town?.upgrades[id]??0}/3</option>)}
    </select>
    <small>改良需要一份工業膠帶或沾水電線。升級防具增加防禦，升級對應主手工具增加攻擊傷害。</small>
   </div>}
   {facility==='clinic'?<div className="town-v15__services"><button type="button" className="town-clinic-entrance" onClick={()=>setClinicOpen(true)}><HeartPulse size={18}/>進入地下診所 · 診療／每日委託／專屬藥房 <ChevronRight size={16}/></button></div>:facility==='noticeboard'?<div className="town-v15__quests">
     {TOWN_QUESTS.map(quest=>{
      const status=town?.quests[quest.id],ready=townQuestReady(s,quest);
      return <article className={`town-v15__quest ${status==='completed'?'is-done':''}`} key={quest.id}>
       <div><strong>{quest.title}</strong><small>{status==='completed'?'已完成':status==='accepted'?'追蹤中':'可承接'}</small></div>
       <p>{quest.detail}</p>
       <p className="town-v15__reward"><Coins size={13}/>舊幣 +{quest.rewardCoins} <Sparkles size={13}/>{ATTRIBUTE_LABELS[quest.rewardAttribute]} +1</p>
       <button type="button" disabled={s.mode!=='home'||status==='completed'||(status==='accepted'&&!ready)}
        onClick={()=>{dispatch(status==='accepted'?{type:'TOWN_COMPLETE_QUEST',questId:quest.id}:{type:'TOWN_ACCEPT_QUEST',questId:quest.id});playCue('confirm')}}>
        {status==='completed'?<><Check size={15}/>已結案</>:status==='accepted'?(ready?'交付委託並領取獎勵':'尚未達成條件'):'承接委託'}
       </button>
      </article>;
     })}
    </div>:<div className="town-v15__services">
      {services.map(service=>{
       const reason=getTownServiceLock(s,service.id,attribute,gear||undefined);
       const fee=getTownServiceFee(s,service.id,attribute,gear||undefined);
       return <article className="town-v15__service" key={service.id}>
        <div><strong>{service.name}</strong><p>{service.summary}</p>
         <small><Coins size={12}/> {fee} 舊幣 <Clock3 size={12}/> {service.minutes} 分鐘</small>
        </div>
        <button type="button" disabled={!!reason&&!isRestService(service.id)} onClick={()=>isRestService(service.id)?setRestDialog(service.id):enact(service.id)}>{reason&&!isRestService(service.id)?<LockKeyhole size={15}/>:<ChevronRight size={17}/>}<span>{isRestService(service.id)?'預覽休息':reason?'不可用':'執行'}</span></button>
        {reason&&<p className="town-v15__reason"><Info size={12}/>{reason}</p>}
       </article>;
      })}
    </div>}
  </section>
  <footer className="town-v15__footer">
    <p><ShieldCheck size={14}/> 已完成的委託：{Object.values(town?.quests??{}).filter(x=>x==='completed').length}/{TOWN_QUESTS.length}</p>
    <p><Archive size={14}/> 城鎮所有服務會更新存檔；人物檔案的永久屬性與裝備數值將同步變更。</p>
    {(town?.socialPoiseUntil??0)>townAbsoluteMinute(s)&&<p><Sparkles size={14}/>整潔儀容效果中：交涉成功率 +5%，剩餘 {town!.socialPoiseUntil-townAbsoluteMinute(s)} 遊戲分鐘。</p>}
    {s.lastEvent&&<p className="town-v15__latest"><BookText size={14}/>{s.lastEvent}</p>}
  </footer>
  {clinicOpen&&<ClinicDialog onClose={()=>setClinicOpen(false)}/>}
  {workshopOpen&&<WorkshopDialog onClose={()=>setWorkshopOpen(false)}/>}
  {restDialog&&<InnRestDialog serviceId={restDialog} onClose={()=>setRestDialog(null)}
   onConfirm={selectedBed=>{enact(selectedBed);setRestDialog(null)}}/>}
 </div>;
}
