import {ChevronRight,Home,MapPinned,Route} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useGame} from '../../app/GameContext';
import {worldClock} from '../../game/engine/rules';
import {taipeiDate} from '../../game/engine/taipeiClock';
import {CITY_OVERVIEW_IMAGE,TOWN_DISTRICTS,townAsset} from './townDistricts';

/** One portrait map, three exactly equal click zones, no hidden 4th section.
 * The user supplied image already contains three stacked city snapshots.
 */
export default function TownOverviewPage(){
 const {state}=useGame();
 return <div className="city-overview-page viewport-page" aria-label="城鎮設施總覽">
  <header className="city-overview-heading">
   <div><span className="eyebrow">EMBER CHRONICLES / CITY DISTRICTS</span><h1>城鎮設施</h1></div>
   <Link to="/" className="city-overview-home" aria-label="返回我的避難所"><Home size={16}/><span>避難所</span></Link>
  </header>
  <div className="city-overview-subhead">
   <span><MapPinned size={13}/> 選擇街區</span>
   <span>台北 {taipeiDate(state.world.day)} · {worldClock(state.world.minute)}</span>
  </div>
  <section className="city-overview-art" aria-label="城鎮三個區域入口"
   style={{backgroundImage:`linear-gradient(180deg,#0b151b22,#070d1466),url("${townAsset(CITY_OVERVIEW_IMAGE)}")`}}>
   {TOWN_DISTRICTS.map(d=>
    <Link key={d.id} to={`/town/${d.id}`} className={`city-overview-zone city-overview-zone--${d.lighting}`}
      aria-label={`前往${d.title}：${d.facilityNames.join('、')}`} data-town-district={d.id}>
     <div className="city-overview-glass">
      <span className="city-overview-glass__number">{d.number} / {d.english}</span>
      <strong>{d.title}</strong>
      <span className="city-overview-glass__facilities">{d.facilityNames.join(' · ')}</span>
      <span className="city-overview-glass__action">前往街區 <ChevronRight size={14} aria-hidden="true"/></span>
     </div>
    </Link>
   )}
  </section>
  <footer className="city-overview-footer">
   <span><Route size={13} aria-hidden="true"/> 三個街區 · 八處既有設施</span>
   <Link to="/town/classic">暫用舊版設施功能 <ChevronRight size={13}/></Link>
  </footer>
 </div>;
}
