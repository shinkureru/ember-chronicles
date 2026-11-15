import {ArrowLeft,ChevronRight,Home,Info,MapPinned} from 'lucide-react';
import {Link,useParams} from 'react-router-dom';
import {getTownDistrict,townAsset} from './townDistricts';

/** First batch route skeleton. Original town actions stay available at /town/classic.
 * Next batch will connect each facility hotspot to its existing functional dialog.
 */
export default function TownDistrictPage(){
 const {districtId}=useParams<{districtId:string}>();
 const district=getTownDistrict(districtId??'');
 if(!district)return <section className="city-district-unknown surface-card" role="alert">
  <h1>找不到這個街區</h1><Link to="/town">返回城鎮總覽</Link>
 </section>;
 return <div className={`city-district-page city-district-page--${district.lighting} viewport-page`} data-town-district-page={district.id}>
  <header className="city-district-heading">
   <Link to="/town" className="city-district-back" aria-label="返回城鎮總覽"><ArrowLeft size={18}/></Link>
   <div><span className="eyebrow">{district.number} / {district.english}</span><h1>{district.title}</h1></div>
   <Link to="/" className="city-district-home" aria-label="返回避難所"><Home size={17}/></Link>
  </header>
  <div className="city-district-scene" role="img" aria-label={district.title+'城市場景'}
   style={{backgroundImage:`linear-gradient(180deg,#07121a11 20%,#050b13a8 95%),url("${townAsset(district.image)}")`}}>
   <span className="city-district-scene__kicker"><MapPinned size={13}/> CITY SECTOR / {district.number}</span>
   <div className="city-district-scene__footer"><strong>{district.title}</strong><span>{district.tagline}</span></div>
  </div>
  <section className="city-district-services surface-card">
   <header><h2>區域設施</h2><small>第一批：導覽與畫面骨架</small></header>
   <p>{district.summary}</p>
   <div className="city-district-services__list">{district.facilityNames.map((name,i)=>
    <div className="city-district-service" key={name}>
     <span className="city-district-service__index">{String(i+1).padStart(2,'0')}</span>
     <strong>{name}</strong>
     <span className="city-district-service__pending">{i>=district.facilities.length?'尚未開放':'功能入口於下一批接入'}</span>
    </div>)}</div>
   <div className="city-district-services__notice"><Info size={15}/><span>原有服務未移除。此批先保留可操作的舊版設施頁，下一批再依街區接上各設施。</span></div>
   <Link to="/town/classic" className="city-district-services__legacy">前往原有城鎮功能 <ChevronRight size={16}/></Link>
  </section>
  <nav className="city-district-footer" aria-label="城鎮快速導覽">
   <Link to="/town"><MapPinned size={14}/> 三區總覽</Link>
   <Link to="/"><Home size={14}/> 返回避難所</Link>
  </nav>
 </div>;
}
