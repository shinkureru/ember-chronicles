import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {Activity,ArrowRight,ClipboardList,Coins,HeartPulse,Package,ShieldPlus,X} from 'lucide-react';
import {useGame} from '../../app/GameContext';
import {playCue} from '../../audio/sound';
import {TOWN_SERVICES} from '../../game/data/town';
import {ITEMS} from '../../game/data/items';
import {CLINIC_SUPPLIES,CLINIC_TREATMENTS,clinicBuyBlock,clinicQuestBlock,clinicTreatmentPreview,clinicUnitPrice,getClinicProgress,getClinicQuest} from '../../game/engine/clinic';
import {getTownServiceLock} from '../../game/engine/townActions';
import ItemArt from '../../components/ItemArt';
import {useVerticalDragScroll} from '../../components/useVerticalDragScroll';
type ClinicTab='treatment'|'daily'|'shop';

/** Original vector illustration: an underground triage room with two examination beds. */
function ClinicScene(){
 return <svg viewBox="0 0 640 220" role="img" aria-label="地下診所：昏暗醫療室、病床、藥櫃及監測器" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="clinicRoom" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#121d22"/><stop offset=".62" stopColor="#253239"/><stop offset="1" stopColor="#0b1015"/></linearGradient>
   <linearGradient id="clinicLight" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#e2e4d6" stopOpacity=".34"/><stop offset="1" stopColor="#80b4ab" stopOpacity="0"/></linearGradient></defs>
  <rect width="640" height="220" fill="url(#clinicRoom)"/><path d="M0 150L320 112 640 149V220H0" fill="#151c23"/>
  <path d="M120 0V149M320 0V119M530 0V149" stroke="#5d6b6c" strokeOpacity=".35" strokeWidth="3"/>
  <path d="M230 0H412L453 169H189Z" fill="url(#clinicLight)"/>
  <rect x="251" y="0" width="120" height="8" fill="#8a9d9a"/><path d="M272 8h80" stroke="#bfcac5" strokeWidth="5"/>
  <rect x="26" y="30" width="125" height="107" rx="3" fill="#18242a" stroke="#607279" strokeWidth="3"/>
  <path d="M35 67h106M35 106h106M68 30v107M111 30v107" stroke="#64767b"/><rect x="47" y="79" width="18" height="24" fill="#718a8d"/>
  <rect x="77" y="73" width="23" height="30" fill="#819398"/><rect x="114" y="79" width="14" height="22" fill="#b6c7c2"/>
  <g transform="translate(445 42)"><rect x="0" y="0" width="151" height="123" rx="7" fill="#111f25" stroke="#74898e" strokeWidth="3"/>
   <rect x="11" y="12" width="128" height="74" fill="#0a1818"/><polyline points="14,54 40,54 48,44 58,66 70,28 79,54 137,54" fill="none" stroke="#8bc7b4" strokeWidth="2.5"/>
   <rect x="21" y="96" width="33" height="11" fill="#496269"/><rect x="68" y="96" width="46" height="11" fill="#496269"/></g>
  <path d="M150 184h342" stroke="#829599" strokeWidth="12"/><path d="M172 176l30-47h250l30 47" fill="#56656b" stroke="#a8b3ad" strokeWidth="4"/>
  <path d="M196 131h236l23 36H174Z" fill="#9daba5"/><rect x="205" y="120" width="73" height="15" rx="6" fill="#c3c8bb"/>
  <path d="M213 187l-7 28M444 187l7 28" stroke="#859398" strokeWidth="9"/>
  <path d="M375 64q17-20 36 0l-3 31-31 0z" fill="#869090"/><path d="M365 97l14-7 14 16 14-16 15 7 12 57h-80z" fill="#a2a8a1" stroke="#c5d0c6" strokeWidth="2"/>
  <path d="M381 98h26m-13-12v25" stroke="#6e424a" strokeWidth="4"/><circle cx="393" cy="75" r="13" fill="#9d9e98"/>
  <path d="M6 214h628" stroke="#78918d" strokeOpacity=".4" strokeWidth="3"/>
  <text x="15" y="206" fill="#c5d3c9" opacity=".55" fontSize="11" letterSpacing="3">UNDERGROUND CLINIC / TRIAGE</text>
 </svg>;
}
export default function ClinicDialog({onClose}:{onClose:()=>void}){
 const {state:s,dispatch,pauseClock}=useGame();
 const [tab,setTab]=useState<ClinicTab>('treatment');
 const dragScroll=useVerticalDragScroll();
 const clinic=getClinicProgress(s),quest=getClinicQuest(s);
 useEffect(()=>{
  pauseClock('dialog',true);
  const onEscape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};
  document.addEventListener('keydown',onEscape);
  return()=>{pauseClock('dialog',false);document.removeEventListener('keydown',onEscape)};
 },[pauseClock,onClose]);
 const click=(action:Parameters<typeof dispatch>[0])=>{dispatch(action);playCue('confirm')};
 const stock=(id:string)=>(s.bag[id]??0)+(s.warehouse[id]??0);
 const treatmentList=CLINIC_TREATMENTS.map(id=>TOWN_SERVICES.find(x=>x.id===id)!);
 return createPortal(<div className="clinic-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="clinic-dialog" role="dialog" aria-modal="true" aria-label="地下診所">
   <header className="clinic-dialog__head">
    <div><small>CITY SAFEHOUSE / UNDERGROUND MEDICAL</small><h2><HeartPulse size={21}/>地下診所</h2></div>
    <button type="button" onClick={onClose} aria-label="離開地下診所"><X size={19}/></button>
   </header>
   <div className="clinic-dialog__scene"><ClinicScene/><span>「外面的世界很亂。進了這裡，先讓我看看你的傷。」</span></div>
   <div className="clinic-dialog__meta"><strong><HeartPulse size={14}/>生命 {s.player.health}/{s.player.maxHealth}</strong><span>舊幣 {s.economy.coins}</span><span>診所好感 {clinic.favor}/30 · 藥品折扣 {Math.min(15,clinic.favor)}%</span></div>
   <nav className="clinic-dialog__tabs" aria-label="診所功能">
    <button type="button" aria-pressed={tab==='treatment'} onClick={()=>setTab('treatment')}><Activity size={15}/>診療</button>
    <button type="button" aria-pressed={tab==='daily'} onClick={()=>setTab('daily')}><ClipboardList size={15}/>每日委託</button>
    <button type="button" aria-pressed={tab==='shop'} onClick={()=>setTab('shop')}><Package size={15}/>專屬藥房</button>
   </nav>
   <div className="clinic-dialog__content" ref={dragScroll.scrollRef} tabIndex={0}
    role="region" aria-label="診所診療、委託和藥房內容，可上下拖曳"
    onPointerDown={dragScroll.onPointerDown} onPointerMove={dragScroll.onPointerMove}
    onPointerUp={dragScroll.onPointerUp} onPointerCancel={dragScroll.onPointerCancel}
    onClickCapture={dragScroll.onClickCapture}>
    {tab==='treatment'&&<div className="clinic-dialog__cards">
     {treatmentList.map(service=>{
      const preview=clinicTreatmentPreview(s,service.id);
      const blocked=getTownServiceLock(s,service.id);
      const changes=[
       preview.health>0?`HP +${preview.health}（${s.player.health} → ${preview.resultingHealth}）`:null,
       preview.stamina>0?`體力 +${preview.stamina}`:null,
       preview.wounds<0?`外傷 ${preview.wounds}`:null,
       preview.infection<0?`感染 ${preview.infection}`:null,
       preview.poisoning<0?`中毒 ${preview.poisoning}`:null,
       preview.illness<0?`疾病 ${preview.illness}`:null,
       preview.fatigue<0?`疲勞 ${preview.fatigue}`:null,
      ].filter(Boolean);
      return <article className="clinic-dialog__card" key={service.id}>
       <div><strong>{service.name}</strong><small>{changes.join(' · ')||'目前沒有需要恢復的項目'}</small>
        <span><Coins size={13}/>{preview.fee} 舊幣 · {service.minutes} 分鐘</span>
       </div>
       <button type="button" disabled={!!blocked} onClick={()=>click({type:'TOWN_SERVICE',serviceId:service.id})}>接受治療 <ArrowRight size={14}/></button>
       {blocked&&<small className="clinic-dialog__hint">{blocked}</small>}
      </article>;
     })}
    </div>}
    {tab==='daily'&&<article className="clinic-dialog__daily">
     <span className="clinic-dialog__kicker">DAILY REQUEST / DAY {s.world.day}</span>
     <h3>{quest.title}</h3><p>{quest.detail}</p>
     <p>目前擁有：{ITEMS[quest.id]?.name} {stock(quest.id)}/{quest.quantity}</p>
     <p className="clinic-dialog__reward"><Coins size={14}/> 報酬 {quest.coins} 舊幣 · <ShieldPlus size={14}/> 診所好感 +{quest.favor}</p>
     {clinic.completedDay===s.world.day?<strong>今天的委託已完成，明天有新的任務。</strong>:
      clinic.acceptedDay===s.world.day?
       <><button type="button" disabled={!!clinicQuestBlock(s,true)} onClick={()=>click({type:'CLINIC_COMPLETE_DAILY'})}>交付物資並領取報酬</button>{clinicQuestBlock(s,true)&&<small>{clinicQuestBlock(s,true)}</small>}</>:
       <button type="button" disabled={!!clinicQuestBlock(s,false)} onClick={()=>click({type:'CLINIC_ACCEPT_DAILY'})}>承接今日委託</button>}
     <small>每個遊戲日只可完成一次。好感會提高藥房優惠，最高折扣 15%。</small>
    </article>}
    {tab==='shop'&&<div className="clinic-dialog__cards">
     {CLINIC_SUPPLIES.map(item=>{
      const blocked=clinicBuyBlock(s,item.id);
      const count=clinic.purchases[`${s.world.day}:${item.id}`]??0;
      return <article className="clinic-dialog__card clinic-dialog__card--supply" key={item.id}>
       <span className="clinic-dialog__item-art"><ItemArt id={item.id}/></span>
       <div><strong>{ITEMS[item.id]?.name}</strong><small>{item.summary}</small>
        <span><Coins size={13}/>{clinicUnitPrice(s,item.id)} 舊幣 · 今日剩餘 {item.limit-count}/{item.limit}</span></div>
       <button type="button" disabled={!!blocked} onClick={()=>click({type:'CLINIC_BUY_ITEM',itemId:item.id})}>購買</button>
       {blocked&&<small className="clinic-dialog__hint">{blocked}</small>}
      </article>;
     })}
    </div>}
   </div>
   {s.lastEvent&&<p className="clinic-dialog__last" role="status">{s.lastEvent}</p>}
   <footer><button type="button" onClick={onClose}>離開診所</button></footer>
  </section>
 </div>,document.body);
}
