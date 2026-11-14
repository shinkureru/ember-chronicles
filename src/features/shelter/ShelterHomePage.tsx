import {Archive,Building2,ChevronRight,Fingerprint,Info,Map,Shield,Skull,Warehouse} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useGame} from '../../app/GameContext';
import {PROFESSIONS} from '../../game/data/professions';
import {SHELTER_OPTIONS} from '../../game/engine/onboarding';
import {normalizeShelterOwned,getWarehouseVisualMode,SHELTER_FURNITURE_IDS} from '../../game/engine/shelterVisuals';
import type {ProfessionId,ShelterId} from '../../game/types';
import GameUtilities from '../../components/GameUtilities';
import ShelterScene from './ShelterScene';
import ShelterBuildDemoPanel from './ShelterBuildDemoPanel';
import ShelterFacilityPanel from './ShelterFacilityPanel';
import ShelterAttentionPanel from './ShelterAttentionPanel';
import {SHELTER_FACILITIES,availableShelterAttention,enqueueShelterAttention,dismissShelterAttention,makeDemoShelterAttention,
 type ShelterAttention,type ShelterAttentionKind} from '../../game/engine/shelterInteractions';
import type {ShelterFurnitureId} from '../../game/types';
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
 const [previewWarehouse,setPreviewWarehouse]=useState(false);
 const [selectedId,setSelectedId]=useState<ShelterFurnitureId|null>(null);
 const detailRef=useRef<HTMLDivElement>(null);
 const [queue,setQueue]=useState<ShelterAttention[]>([]);
 const selectFurniture=useCallback((id:ShelterFurnitureId)=>setSelectedId(id),[]);
 const shelterId=state.onboarding.shelter;
 const showWarehouse=shelterId==='warehouse'||previewWarehouse;
 const option=SHELTER_OPTIONS.find(s=>s.id===shelterId);
 const owned=normalizeShelterOwned(state.shelterOwned);
 const mode=getWarehouseVisualMode(owned);
 const ownedKey=owned.join('|');
 const activeSelected=selectedId&&owned.includes(selectedId)?selectedId:null;
 // The portrait image can be taller than a mobile viewport. Without this, tapping
 // a marker appears to do nothing because the new information is below the fold.
 useEffect(()=>{
  if(!activeSelected||!showWarehouse)return;
  const detail=detailRef.current;
  if(!detail)return;
  detail.focus({preventScroll:true});
  detail.scrollIntoView({block:'nearest',behavior:'auto'});
 },[activeSelected,showWarehouse]);
 const pending=availableShelterAttention(queue,owned);
 const attention=pending[0]??null;
 useEffect(()=>{
  const installed=new Set(ownedKey.split('|'));
  // Removing a facility must invalidate both its active panel and temporary notifications.
  // Otherwise re-buying that furniture could unexpectedly reopen an old panel.
  setSelectedId(previous=>previous&&!installed.has(previous)?null:previous);
  setQueue(previous=>{
   const next=previous.filter(alert=>installed.has(alert.targetId));
   return next.length===previous.length?previous:next;
  });
 },[ownedKey]);
 const onTrigger=(kind:ShelterAttentionKind)=>{
  const alert=makeDemoShelterAttention(kind);
  if(!owned.includes(alert.targetId))return;
  setQueue(previous=>enqueueShelterAttention(previous,alert));
 };
 const onInspect=(id:ShelterFurnitureId)=>{
  setSelectedId(id);
  setQueue(previous=>previous.filter(alert=>alert.targetId!==id));
 };
 return <div className="page-stack shelter-home-page viewport-page">
  <header className="shelter-home-heading">
   <div><span className="eyebrow">EMBER CHRONICLES / SAFEHOUSE</span><h1>{option?.name??'尚未指定據點'}</h1><p>{option?.short??'選擇避難所後即可在此建立家園'} · 你的生存據點</p></div>
   <GameUtilities className="game-utilities--shelter"/>
  </header>
  {shelterId!=='warehouse'&&<div className="shelter-build-demo-preview" data-prototype-only="true">
   <span>家具美術測試：已選據點不會更改。可以暫時預覽倉庫建設系統。</span>
   <button type="button" aria-pressed={previewWarehouse} onClick={()=>{setPreviewWarehouse(v=>!v);setSelectedId(null)}}>
    {previewWarehouse?'返回我的避難所':'預覽倉庫家具建設'}
   </button>
  </div>}
  <section className="shelter-home-scene-panel" aria-label="避難所場景">
   {showWarehouse
    ? <ShelterScene owned={owned} selectedId={activeSelected} attentionId={attention?.targetId??null} onSelect={selectFurniture}/>
    :shelterId==='apartment'||shelterId==='bunker'
     ?<ShelterPlaceholder shelterId={shelterId}/>
     :<div className="shelter-placeholder" role="status"><Skull size={38}/><p>尚未選擇避難所</p></div>}
   <div className="shelter-home-scene-caption">
    <span>{showWarehouse
     ?mode==='full'?'FULLY EQUIPPED / 高品質滿配原圖':mode==='empty'?'EMPTY SHELTER / 空屋':`FURNITURE LAYERS / ${owned.length} 件`
     :'SCENE PLACEHOLDER / 圖片預留'}</span>
    {showWarehouse&&<strong>{owned.length} / {SHELTER_FURNITURE_IDS.length}</strong>}
   </div>
  </section>
  {showWarehouse&&<p className="shelter-scene-access-tip">點擊家具或圓形標記即可查看資訊。手機也可使用下方的設施清單。</p>}
  {showWarehouse&&owned.length>0&&<section className="shelter-facility-index surface-card" aria-label="已建設家具操作清單">
   <header className="shelter-facility-index__header">
    <span>已建設設施 · 點選開啟</span>
    <small>滑鼠 / 觸控 / Tab + Enter</small>
   </header>
   <div className="shelter-facility-index__list">
    {SHELTER_FURNITURE_IDS.filter(id=>owned.includes(id)).map(id=>
     <button type="button" key={id} data-facility-access={id}
      aria-pressed={activeSelected===id}
      className={activeSelected===id?'is-selected':''}
      onClick={()=>onInspect(id)}>
      {SHELTER_FACILITIES[id].name}
      {attention?.targetId===id&&<span className="shelter-facility-index__unread" aria-label="有待處理提示" />}
     </button>
    )}
   </div>
  </section>}
  {showWarehouse&&activeSelected&&<div ref={detailRef} className="shelter-facility-detail-anchor" tabIndex={-1}
   id="shelter-facility-detail" aria-live="polite" aria-label="目前選取的家具設施">
   <ShelterFacilityPanel id={activeSelected} onClose={()=>setSelectedId(null)}/>
  </div>}
  {showWarehouse&&<ShelterAttentionPanel owned={owned} queue={queue} onTrigger={onTrigger}
   onInspect={onInspect} onDismiss={id=>setQueue(previous=>dismissShelterAttention(previous,id))}/>}
  {showWarehouse&&<ShelterBuildDemoPanel/>}
  <section className="shelter-home-intro surface-card">
   <span className="eyebrow">SHELTER CONSTRUCTION</span>
   <h2>這裡會慢慢成為你的家。</h2>
   <p>{showWarehouse
    ?'家具建設測試已啟用：你可以逐件購入、隨機產生配置或自動建設。完成全部八件家具時，場景自動使用高品質滿配置原圖。'
    :'這座避難所的室內主畫面仍在美術製作階段。已保留未來的空屋、家具與互動系統位置。'}</p>
   <div className="shelter-home-footnote"><Info size={15} aria-hidden="true"/><span>可直接點擊場景家具或小型標記查看功能預留；提示特效目前僅供演示，真正事件觸發時機尚未定案。</span></div>
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
