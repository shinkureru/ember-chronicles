import {useCallback,useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import type {MouseEvent as ReactMouseEvent} from 'react';
import {ArrowLeft,ChevronRight,Clock3,Coins,Home,Info,LockKeyhole,MapPinned} from 'lucide-react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {useGame} from '../../app/GameContext';
import {playCue} from '../../audio/sound';
import {getTownFacility,isTownOpen} from '../../game/data/town';
import {getTownServiceLock} from '../../game/engine/townActions';
import {taipeiDate} from '../../game/engine/taipeiClock';
import {worldClock,worldPhase} from '../../game/engine/rules';
import type {TownFacilityId} from '../../game/types';
import InnRestDialog from './InnRestDialog';
import RestCinematic from './RestCinematic';
import ClinicDialog from './ClinicDialog';
import WorkshopDialog from './WorkshopDialog';
import TownFacilityDialog,{type SecondaryTownFacility} from './TownFacilityDialog';
import type {RestServiceId} from '../../game/engine/innRest';
import {CITY_OVERVIEW_IMAGE,getTownDistrict,townAsset} from './townDistricts';
import {getTownDistrictHotspots} from './townDistrictHotspots';
import {fitPortraitStage} from '../../components/ui/portraitStageFit';
import {coverTownStage} from './townStageCover';
import {TOWN_DISTRICT_LIGHTS} from './townDistrictLights';

/** Scene art and its hit targets share a single cover-fit coordinate space.
 * The art fills the entire viewport, without stretching; only unavoidable
 * edge cropping occurs when the screen ratio differs from 768:1376.
 * The accessible facility drawer remains available when a point is cropped.
 */
function DistrictStage({children}:{children:ReactNode}){
 const host=useRef<HTMLDivElement>(null);
 const [dimensions,setDimensions]=useState<{width:number;height:number}|null>(null);
 useLayoutEffect(()=>{
  const element=host.current;
  if(!element)return;
  const measure=()=>{
   const fit=fitPortraitStage(element.clientWidth,element.clientHeight);
   if(!fit)return;
   const cover=coverTownStage(fit,element.clientWidth,element.clientHeight);
   if(!cover)return;
   setDimensions(old=>old&&Math.abs(old.width-cover.width)<.5&&Math.abs(old.height-cover.height)<.5?old:cover);
  };
  measure();
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;
  observer?.observe(element);
  window.addEventListener('resize',measure);
  return()=>{observer?.disconnect();window.removeEventListener('resize',measure)};
 },[]);
 return <div className="city-district-scene" ref={host} role="group" aria-label="街區滿版背景與互動設施">
  <div className="city-district-scene__stage"
   style={dimensions?{width:dimensions.width,height:dimensions.height}:{visibility:'hidden'}}>
   {children}
  </div>
 </div>;
}

/** Each district opens the *original* playable dialogs and dispatches the same
 * reducers as /town/classic. No duplicate town economy or mock service actions.
 */
export default function TownDistrictPage(){
 const {districtId}=useParams<{districtId:string}>();
 const navigate=useNavigate();
 const district=getTownDistrict(districtId??'');
 const {state:s,dispatch}=useGame();
 const [active,setActive]=useState<TownFacilityId|null>(null);
 const [listOpen,setListOpen]=useState(false);
 const [isReturning,setIsReturning]=useState(false);
 const returnTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [restCinematic,setRestCinematic]=useState<RestServiceId|null>(null);
 const trigger=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>()=>{if(returnTimer.current!==null)clearTimeout(returnTimer.current)},[]);
 const returnToOverview=(event:ReactMouseEvent<HTMLAnchorElement>)=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!district)return;
  event.preventDefault();
  if(isReturning)return;
  const navigateBack=()=>navigate('/town',{state:{fromDistrict:district.id}});
  if(typeof window==='undefined'||(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||window.matchMedia?.('(update: slow)').matches)){navigateBack();return}
  setIsReturning(true);
  returnTimer.current=setTimeout(navigateBack,640);
 };

 const restCommitting=useRef(false);
 const restoreFocus=useCallback(()=>{
  window.requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}));
 },[]);
 const closeDialog=useCallback(()=>{setActive(null);restoreFocus()},[restoreFocus]);
 const openFacility=(id:TownFacilityId,event:ReactMouseEvent<HTMLButtonElement>)=>{
  trigger.current=event.currentTarget;
  restCommitting.current=false;
  setActive(id);
  playCue('select');
 };
 // Navigating between /town/:districtId paths must never retain a different
 // district's previously opened modal / cinematic.
 useEffect(()=>{setActive(null);setListOpen(false);setRestCinematic(null);restCommitting.current=false},[districtId]);
 useEffect(()=>{
  if(!active)return;
  const frame=window.requestAnimationFrame(()=>{
   const dialogs=document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]');
   const dialog=dialogs[dialogs.length-1];
   dialog?.querySelector<HTMLElement>('button')?.focus({preventScroll:true});
  });
  // The legacy dialogs are portals. Keep keyboard focus inside their real
  // service forms until a close or successful rest releases the modal.
  const trapFocus=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return;
   const dialogs=document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]');
   const dialog=dialogs[dialogs.length-1];if(!dialog)return;
   const items=Array.from(dialog.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
   )).filter(el=>el.getClientRects().length>0);
   if(!items.length){event.preventDefault();dialog.focus();return}
   const first=items[0]!,last=items[items.length-1]!,current=document.activeElement;
   if(event.shiftKey&&(current===first||!dialog.contains(current))){
    event.preventDefault();last.focus();
   }else if(!event.shiftKey&&(current===last||!dialog.contains(current))){
    event.preventDefault();first.focus();
   }
  };
  document.addEventListener('keydown',trapFocus,true);
  return()=>{window.cancelAnimationFrame(frame);document.removeEventListener('keydown',trapFocus,true)};
 },[active]);
 const confirmRest=(serviceId:RestServiceId)=>{
  // The existing engine lock is authoritative: blocked/closed/full daily quota
  // must never charge a player or start the cinematic.
  if(restCommitting.current||getTownServiceLock(s,serviceId))return;
  restCommitting.current=true;
  dispatch({type:'TOWN_SERVICE',serviceId});
  playCue('confirm');
  setActive(null);
  setRestCinematic(serviceId);
 };
 if(!district)return <section className="city-district-unknown surface-card" role="alert">
  <h1>找不到這個街區</h1><Link to="/town">返回城鎮總覽</Link>
 </section>;
 const hotspots=getTownDistrictHotspots(district.id);
 return <div className={`city-district-page city-district-page--${district.lighting} city-district-page--live city-district-page--v0848 city-district-page--v0852 viewport-page${isReturning?' is-returning':''}`}
  data-town-district-page={district.id} data-fullbleed-district="true">
  <DistrictStage>
   <img className="city-district-scene__image" src={townAsset(district.image)}
    alt={district.title+'城市場景'} draggable={false}/>
   <span className={`city-district-scene__atmosphere city-district-scene__atmosphere--${district.id}`} aria-hidden="true"/>
   <div className="city-district-scene__lights" aria-hidden="true">
    {TOWN_DISTRICT_LIGHTS[district.id].map((light,index)=>
     <span key={index} className={`city-district-scene__light city-district-scene__light--${light.tone}`}
      style={{left:`${light.x}%`,top:`${light.y}%`,width:`${light.size}%`,
       animationDelay:`-${light.delay}s`,animationDuration:`${light.duration}s`}}/>
    )}
   </div>
   {hotspots.map(h=>{
    const open=isTownOpen(h.facility,s.world.minute);
    return <button type="button" key={h.facility}
     className={`city-district-hotspot city-district-hotspot--${h.side} ${open?'is-open':'is-closed'}`}
     style={{left:`${h.x}%`,top:`${h.y}%`}}
     aria-haspopup="dialog" aria-expanded={active===h.facility}
     aria-label={`前往${h.label}：${open?'營業中':'目前已打烊'}`}
     data-town-facility={h.facility} onClick={event=>openFacility(h.facility,event)}>
     <span className="city-district-hotspot__beacon" aria-hidden="true"/>
     <span className="city-district-hotspot__text">
      <strong>{h.label}</strong>
      <small>{open?'營業中':'已打烊'}</small>
     </span>
     {!open&&<LockKeyhole className="city-district-hotspot__lock" size={12} aria-hidden="true"/>}
    </button>;
   })}
  </DistrictStage>
  <header className="city-district-heading">
   <Link to="/town" onClick={returnToOverview} className="city-district-back" aria-label="返回城鎮總覽"><ArrowLeft size={18}/></Link>
   <div><span className="eyebrow">{district.number} / {district.english}</span><h1>{district.title}</h1></div>
   <Link to="/" className="city-district-home" aria-label="返回避難所"><Home size={17}/></Link>
  </header>
  <div className="city-district-live-status" aria-live="off">
   <span><Clock3 size={13}/> 台北 {taipeiDate(s.world.day)} · {worldPhase(s.world.minute)} {worldClock(s.world.minute)}</span>
   <strong><Coins size={13}/> {s.economy.coins} 舊幣</strong>
  </div>
  <div className="city-district-controls">
   <button type="button" className="city-district-controls__list"
    aria-controls="town-v0848-facility-list" aria-expanded={listOpen}
    onClick={()=>setListOpen(value=>!value)}>
    <MapPinned size={15}/> {listOpen?'收起設施':'設施清單'}
   </button>
   <span>直接點選場景中的設施</span>
  </div>
  <section id="town-v0848-facility-list"
   className="city-district-services city-district-services--live surface-card"
   aria-label="街區設施輔助清單" hidden={!listOpen}>
   <header><h2>街區設施</h2><small>鍵盤／窄螢幕的備用入口</small></header>
   <p>{district.summary}</p>
   <div className="city-district-services__list">
    {district.facilities.map((id,i)=>{
     const facility=getTownFacility(id),open=isTownOpen(id,s.world.minute);
     return <button type="button" className="city-district-service city-district-service--live" key={id}
      data-town-list-facility={id} aria-haspopup="dialog" aria-expanded={active===id}
      onClick={event=>openFacility(id,event)}>
      <span className="city-district-service__index">{String(i+1).padStart(2,'0')}</span>
      <span className="city-district-service__details">
       <strong>{facility.name}</strong>
       <small>{open?'營業中':'已打烊'} · 到訪 {s.town?.visits[id]??0} 次</small>
      </span>
      <ChevronRight size={14} aria-hidden="true"/>
     </button>;
    })}
    {district.facilityNames.slice(district.facilities.length).map(name=>
     <div className="city-district-service city-district-service--pending" key={name} aria-disabled="true">
      <span className="city-district-service__index"><LockKeyhole size={13}/></span>
      <strong>{name}</strong><span className="city-district-service__pending">尚未開放</span>
     </div>)}
   </div>
   {district.id==='old-core'&&<p className="city-district-services__integrated">公告欄委託已整合至「情報酒館」的公告欄頁籤。</p>}
   <div className="city-district-services__notice"><Info size={15}/><span>已直接連接原有城鎮服務。未營業時仍可查看，但無法繞過營業時間、舊幣、飢餓或每日次數限制。</span></div>
   <Link to="/town/classic" className="city-district-services__legacy">前往原有城鎮功能 <ChevronRight size={16}/></Link>
  </section>
  <nav className="city-district-footer" aria-label="城鎮快速導覽">
   <Link to="/town" onClick={returnToOverview}><MapPinned size={14}/> 三區總覽</Link>
   <Link to="/"><Home size={14}/> 返回避難所</Link>
  </nav>
  <div className="city-district-return-curtain" aria-hidden="true"
    style={{backgroundImage:'url("'+townAsset(CITY_OVERVIEW_IMAGE)+'")'}}>
    <span className="city-district-return-curtain__half city-district-return-curtain__half--left"/>
    <span className="city-district-return-curtain__half city-district-return-curtain__half--right"/>
   </div>
  {active==='inn'&&<InnRestDialog serviceId="rest_cot" onClose={closeDialog} onConfirm={confirmRest}/>}
  {active==='clinic'&&<ClinicDialog onClose={closeDialog}/>}
  {active==='workshop'&&<WorkshopDialog onClose={closeDialog} backLabel={`返回${district.title}`}/>}
  {active&&active!=='inn'&&active!=='clinic'&&active!=='workshop'&&
   <TownFacilityDialog facility={active as SecondaryTownFacility} onClose={closeDialog} backLabel={`返回${district.title}`}/>}
  {restCinematic&&<RestCinematic kind={restCinematic} onFinish={()=>{restCommitting.current=false;setRestCinematic(null);restoreFocus()}}/>}
 </div>;
}
