import {Archive,Building2,ChevronRight,Fingerprint,Info,Map,Shield,Skull,Warehouse} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useGame} from '../../app/GameContext';
import {PROFESSIONS} from '../../game/data/professions';
import {SHELTER_OPTIONS} from '../../game/engine/onboarding';
import {normalizeShelterOwned,getWarehouseVisualMode,SHELTER_FURNITURE_IDS} from '../../game/engine/shelterVisuals';
import type {ProfessionId,ShelterId} from '../../game/types';
import GameUtilities from '../../components/GameUtilities';
import ShelterScene from './ShelterScene';
import {playCue} from '../../audio/sound';

const icons={warehouse:Warehouse,apartment:Building2,bunker:Shield} as const;
function ShelterPlaceholder({shelterId}:{shelterId:ShelterId}){
 const Icon=icons[shelterId];
 const name=SHELTER_OPTIONS.find(s=>s.id===shelterId)?.name??'未知據點';
 return <div className="shelter-placeholder" role="img" aria-label={`${name}室內場景尚待製作`}>
  <div className="shelter-placeholder__frame">
   <Icon size={50} strokeWidth={1} aria-hidden="true"/>
   <span>IMAGE NOT READY</span>
   <strong>{name}</strong>
   <p>此避難所的空屋與家具圖片尚未製作</p>
   <small>不會以廢棄倉庫圖片代替</small>
  </div>
 </div>;
}
function ProfessionSetup(){
 const {dispatch}=useGame();
 return <section className="surface-card shelter-profession">
  <span className="eyebrow">CHARACTER SETUP / 原型職業</span>
  <h2>我曾經是誰？</h2>
  <p className="muted">選擇職業才能使用原有的章節、裝備與戰鬥功能。避難所選擇不會因此消失。</p>
  <div className="profession-cards">{(Object.entries(PROFESSIONS) as [ProfessionId,typeof PROFESSIONS[ProfessionId]][]).map(([id,p])=>
   <button type="button" key={id} className="profession-card" onClick={()=>{playCue('confirm');dispatch({type:'SELECT_PROFESSION',profession:id})}}>
    <span className="profession-card__icon"><Fingerprint size={24}/></span>
    <span><small>{p.en}</small><strong>{p.name}</strong><em>{p.tagline}</em></span>
    <ChevronRight size={18}/>
   </button>)}</div>
 </section>;
}
export default function ShelterHomePage(){
 const {state}=useGame();
 const shelterId=state.onboarding.shelter;
 const option=SHELTER_OPTIONS.find(s=>s.id===shelterId);
 const owned=normalizeShelterOwned(state.shelterOwned);
 const mode=getWarehouseVisualMode(owned);
 return <div className="page-stack shelter-home-page viewport-page">
  <header className="shelter-home-heading">
   <div><span className="eyebrow">EMBER CHRONICLES / SAFEHOUSE</span><h1>{option?.name??'尚未指定據點'}</h1><p>{option?.short??'選擇避難所後即可在此建立家園'} · 你的生存據點</p></div>
   <GameUtilities className="game-utilities--shelter"/>
  </header>
  <section className="shelter-home-scene-panel" aria-label="避難所場景">
   {shelterId==='warehouse'
    ? <ShelterScene owned={owned}/>
    :shelterId==='apartment'||shelterId==='bunker'
     ?<ShelterPlaceholder shelterId={shelterId}/>
     :<div className="shelter-placeholder" role="status"><Skull size={38}/><p>尚未選擇避難所</p></div>}
   <div className="shelter-home-scene-caption">
    <span>{shelterId==='warehouse'
     ?mode==='full'?'FULLY EQUIPPED / 高品質滿配原圖':mode==='empty'?'EMPTY SHELTER / 空屋':`FURNITURE LAYERS / ${owned.length} 件`
     :'SCENE PLACEHOLDER / 圖片預留'}</span>
    {shelterId==='warehouse'&&<strong>{owned.length} / {SHELTER_FURNITURE_IDS.length}</strong>}
   </div>
  </section>
  <section className="shelter-home-intro surface-card">
   <span className="eyebrow">SHELTER CONSTRUCTION</span>
   <h2>這裡會慢慢成為你的家。</h2>
   <p>{shelterId==='warehouse'
    ?'倉庫已接入空屋場景與八件原始透明家具圖層。日後每買進一件家具，就會出現在你校正好的位置。全部八件購入時會自動換成最完整的高品質場景圖。'
    :'這座避難所的室內主畫面仍在美術製作階段。已保留未來的空屋、家具與互動系統位置。'}</p>
   <div className="shelter-home-footnote"><Info size={15} aria-hidden="true"/><span>家具購買、逐件加入與隨機配置測試按鈕將在下一批 v0.8.39 開放。本批不會替玩家預先購買家具。</span></div>
  </section>
  {!state.profession&&<ProfessionSetup/>}
  {import.meta.env.DEV&&state.profession&&<Link className="shelter-map-test-link" to="/world-map">
   <Map size={17} aria-hidden="true"/> 開發測試：開啟原關卡路線圖 <ChevronRight size={17}/>
  </Link>}
  <div className="shelter-home-footer-links">
   <Link to="/warehouse"><Archive size={15}/> 物資倉庫</Link>
   <Link to="/town">城鎮設施</Link>
   <Link to="/black-market">黑市</Link>
  </div>
 </div>;
}
