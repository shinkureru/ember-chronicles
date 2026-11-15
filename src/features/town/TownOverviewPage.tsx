import {useEffect,useRef,useState,type MouseEvent} from 'react';
import {useLocation} from 'react-router-dom';
import {ChevronRight,Home,MapPinned,Route} from 'lucide-react';
import {Link,useNavigate} from 'react-router-dom';
import {useGame} from '../../app/GameContext';
import {worldClock} from '../../game/engine/rules';
import {taipeiDate} from '../../game/engine/taipeiClock';
import {CITY_OVERVIEW_IMAGE,TOWN_DISTRICTS,townAsset,type TownDistrict,type TownDistrictId} from './townDistricts';
import {getTownOverviewShiftRows,TOWN_OVERVIEW_TRANSITION_MS} from './townOverviewTransition';

/** Three slices of one original atlas; selected slice moves to the middle,
 * unselected slices move away and one full district image is revealed. */
export default function TownOverviewPage(){
 const {state}=useGame();
 const navigate=useNavigate();
 const location=useLocation();
 const fromDistrict=(location.state as {fromDistrict?:TownDistrictId}|null)?.fromDistrict;
 const arrivingFromDistrict=!!fromDistrict&&TOWN_DISTRICTS.some(d=>d.id===fromDistrict);
 const [selected,setSelected]=useState<TownDistrictId|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const selectedIndex=TOWN_DISTRICTS.findIndex(item=>item.id===selected);
 useEffect(()=>()=>{if(timer.current!==null)clearTimeout(timer.current)},[]);
 const preload=(image:string)=>{
  if(typeof Image==='undefined')return;
  const next=new Image();next.src=townAsset(image);
 };
 const openDistrict=(event:MouseEvent<HTMLAnchorElement>,district:TownDistrict)=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  if(selected){event.preventDefault();return}
  if(typeof window==='undefined'||(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||window.matchMedia?.('(update: slow)').matches))return;
  event.preventDefault();
  preload(district.image);
  setSelected(district.id);
  timer.current=setTimeout(()=>navigate('/town/'+district.id),TOWN_OVERVIEW_TRANSITION_MS);
 };
 const chosen=selected?TOWN_DISTRICTS.find(item=>item.id===selected):undefined;
 return <div className={'city-overview-page city-overview-page--v0847 city-overview-page--v0852 viewport-page'+(selected?' is-transitioning':'')+(arrivingFromDistrict?' is-return-arrival':' is-opening-town')}
  aria-label="城鎮設施總覽" data-town-overview-version="0.8.47">
  <header className="city-overview-heading">
   <div><span className="eyebrow">EMBER CHRONICLES / CITY DISTRICTS</span><h1>城鎮設施</h1></div>
   <Link to="/" className="city-overview-home" aria-label="返回我的避難所"><Home size={16}/><span>避難所</span></Link>
  </header>
  <div className="city-overview-subhead">
   <span><MapPinned size={13}/> 選擇街區</span>
   <span>台北 {taipeiDate(state.world.day)} · {worldClock(state.world.minute)}</span>
  </div>
  <section className="city-overview-art" aria-label="城鎮三個區域入口"
   aria-busy={selected!==null} data-selected-district={selected??undefined}>
   {TOWN_DISTRICTS.map((d,index)=>
    <Link key={d.id} to={'/town/'+d.id}
      className={'city-overview-zone city-overview-zone--'+d.lighting+(selected===d.id?' is-selected':selected?' is-leaving':'')}
      aria-label={'前往'+d.title+'：'+d.facilityNames.join('、')} data-town-district={d.id}
      onClick={event=>openDistrict(event,d)} onPointerEnter={()=>preload(d.image)} onFocus={()=>preload(d.image)}
      style={{top:(index*100/3)+'%',...(selected?{
       transform:'translateY('+(getTownOverviewShiftRows(selectedIndex,index)*100)+'%)',
       opacity:selected===d.id?1:0,
      }: {})}}>
     <span className="city-overview-zone__composite" aria-hidden="true"
      style={{backgroundImage:'url("'+townAsset(CITY_OVERVIEW_IMAGE)+'")',
       backgroundPosition:'center '+(index*50)+'%'}}/>
     <span className={'city-overview-zone__lights city-overview-zone__lights--'+d.lighting} aria-hidden="true"/>
     <span className="city-overview-zone__blur" aria-hidden="true"/>
     <div className="city-overview-glass">
      <span className="city-overview-glass__number">{d.number} / {d.english}</span>
      <strong>{d.title}</strong>
      <span className="city-overview-glass__action">進入街區 <ChevronRight size={14} aria-hidden="true"/></span>
     </div>
    </Link>
   )}
   {chosen&&<div className="city-overview-reveal" aria-hidden="true" data-transition-destination={chosen.id}>
    <img src={townAsset(chosen.image)} alt="" draggable={false}/>
    <span className="city-overview-reveal__light"/>
   </div>}
   {arrivingFromDistrict&&<div className="city-overview-return-curtain" aria-hidden="true">
    <span className="city-overview-return-curtain__half city-overview-return-curtain__half--left"
     style={{backgroundImage:'url("'+townAsset(CITY_OVERVIEW_IMAGE)+'")'}}/>
    <span className="city-overview-return-curtain__half city-overview-return-curtain__half--right"
     style={{backgroundImage:'url("'+townAsset(CITY_OVERVIEW_IMAGE)+'")'}}/>
   </div>}
  </section>
  <footer className="city-overview-footer">
   <span><Route size={13} aria-hidden="true"/> 三個街區 · 八處既有設施</span>
   <Link to="/town/classic">暫用舊版設施功能 <ChevronRight size={13}/></Link>
  </footer>
 </div>;
}
