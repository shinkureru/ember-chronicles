import {CheckCircle2,Info,MonitorCog,Search,ShieldAlert,X} from 'lucide-react';
import type {ShelterFurnitureId} from '../../game/types';
import {SHELTER_FACILITIES} from '../../game/engine/shelterInteractions';

interface Props{id:ShelterFurnitureId;onClose:()=>void}
export default function ShelterFacilityPanel({id,onClose}:Props){
 const facility=SHELTER_FACILITIES[id];
 return <section className="shelter-facility-panel surface-card" aria-label={facility.name+'設施資訊'}>
  <header className="shelter-facility-panel__header">
   <span className="shelter-facility-panel__eyebrow"><Search size={14}/> FACILITY / {facility.category}</span>
   <button type="button" aria-label="關閉設施資訊" onClick={onClose}><X size={18}/></button>
  </header>
  <div className="shelter-facility-panel__title"><MonitorCog size={19} aria-hidden="true"/><h2>{facility.name}</h2></div>
  <p><CheckCircle2 size={15} aria-hidden="true"/> {facility.purpose}</p>
  <div className="shelter-facility-panel__future">
   <span><Info size={15} aria-hidden="true"/> 功能預留</span>
   <p>{facility.future}</p>
  </div>
  <p className="shelter-facility-panel__note"><ShieldAlert size={15} aria-hidden="true"/> {facility.notice}</p>
 </section>;
}
