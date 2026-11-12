import { useState } from 'react';
import {BedDouble,ChevronRight,ClipboardList,Clock3,Coins,Droplets,HeartPulse,Target,UtensilsCrossed,Wine,Wrench} from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { playCue } from '../../audio/sound';
import { worldPhase,worldClock,worldPhaseToken } from '../../game/engine/rules';
import {TOWN_FACILITIES,isTownOpen} from '../../game/data/town';
import {getTownServiceLock} from '../../game/engine/townActions';
import type {TownFacilityId} from '../../game/types';
import InnRestDialog from './InnRestDialog';
import RestCinematic from './RestCinematic';
import TownVitalStatus from './TownVitalStatus';
import ClinicDialog from './ClinicDialog';
import WorkshopDialog from './WorkshopDialog';
import {useVerticalDragScroll} from '../../components/useVerticalDragScroll';
import type {RestServiceId} from '../../game/engine/innRest';
import TownFacilityDialog,{type SecondaryTownFacility} from './TownFacilityDialog';

const facilityIcons:Record<TownFacilityId,typeof BedDouble>={
 inn:BedDouble,clinic:HeartPulse,workshop:Wrench,tavern:Wine,training:Target,noticeboard:ClipboardList,laundry:Droplets,canteen:UtensilsCrossed,
};
export default function TownPage(){
 const {state:s,dispatch}=useGame();
 const [facilityDialog,setFacilityDialog]=useState<SecondaryTownFacility|null>(null);
 const townScroll=useVerticalDragScroll();
 const [restDialog,setRestDialog]=useState<RestServiceId|null>(null);
 const [restCinematic,setRestCinematic]=useState<RestServiceId|null>(null);
 const [clinicOpen,setClinicOpen]=useState(false);
 const [workshopOpen,setWorkshopOpen]=useState(false);
 const town=s.town;
 const phase=worldPhase(s.world.minute);
 const enact=(serviceId:string)=>{
  if(getTownServiceLock(s,serviceId))return;
  dispatch({type:'TOWN_SERVICE',serviceId});
  playCue('confirm');
 };
 return <div className={`page-stack town-page town-v15 viewport-page phase--${worldPhaseToken(s.world.minute)}`}
    ref={townScroll.scrollRef} tabIndex={0} role="region" aria-label="舊街避難所設施，可上下拖曳瀏覽"
    onPointerDown={townScroll.onPointerDown} onPointerMove={townScroll.onPointerMove}
    onPointerUp={townScroll.onPointerUp} onPointerCancel={townScroll.onPointerCancel}
    onClickCapture={townScroll.onClickCapture}>
  <header className="town-v15__intro">
   <span className="eyebrow">CITY SAFEHOUSE / EIGHT FACILITIES</span>
   <h1>舊街避難所</h1>
   <p>「城裡的人還在勉強生活。每扇門後面，都有另一種交易或代價。」</p>
   <div className="town-v15__status"><span><Clock3 size={13}/> 第 {s.world.day} 日 · {phase} {worldClock(s.world.minute)}</span><strong><Coins size={15}/> {s.economy.coins} 舊幣</strong></div>
  </header>
  <TownVitalStatus state={s}/>
  <section className="town-v15__facilities" aria-label="選擇城鎮設施">
   {TOWN_FACILITIES.map(f=>{
    const TileIcon=facilityIcons[f.id],available=isTownOpen(f.id,s.world.minute);
    return <button type="button" key={f.id} className="town-v15__tile" aria-haspopup="dialog"
     onClick={()=>{
      if(f.id==='inn')setRestDialog('rest_cot');
      else if(f.id==='clinic')setClinicOpen(true);
      else if(f.id==='workshop')setWorkshopOpen(true);
      else setFacilityDialog(f.id);
      playCue('select');
     }}>
     <span className="town-v15__tile-icon"><TileIcon size={21}/></span>
     <span className="town-v15__tile-text"><strong>{f.name}</strong><small>{available?'營業中':'已打烊'} · 到訪 {town?.visits[f.id]??0} 次</small></span>
     <ChevronRight size={14}/>
    </button>;
   })}
  </section>
  {facilityDialog&&<TownFacilityDialog facility={facilityDialog} onClose={()=>setFacilityDialog(null)}/>}
  {clinicOpen&&<ClinicDialog onClose={()=>setClinicOpen(false)}/>}
  {workshopOpen&&<WorkshopDialog onClose={()=>setWorkshopOpen(false)}/>}
  {restDialog&&<InnRestDialog serviceId={restDialog} onClose={()=>setRestDialog(null)}
   onConfirm={selectedBed=>{enact(selectedBed);setRestDialog(null);setRestCinematic(selectedBed)}}/>}
  {restCinematic&&<RestCinematic kind={restCinematic} onFinish={()=>setRestCinematic(null)}/>}
 </div>;
}
