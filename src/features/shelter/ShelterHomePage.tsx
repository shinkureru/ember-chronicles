import {Archive,Building2,ChevronDown,ChevronRight,Fingerprint,Home,Map,Shield,Skull,Warehouse,X,SlidersHorizontal} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
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
/** The artwork must fit completely inside ONE available viewport. Never crop,
 * overflow or stretch the original 768 x 1376 coordinate system.
 */
function ShelterStageFit({children}:{children:ReactNode}){
 const host=useRef<HTMLDivElement>(null);
 const [dimensions,setDimensions]=useState<{width:number;height:number}|null>(null);
 useEffect(()=>{
  const node=host.current;
  if(!node)return;
  const measure=()=>{
   const availableWidth=node.clientWidth,availableHeight=node.clientHeight;
   if(availableWidth<=0||availableHeight<=0)return;
   const width=Math.min(availableWidth,availableHeight*768/1376);
   const height=width*1376/768;
   setDimensions(previous=>previous&&Math.abs(previous.width-width)<.1&&Math.abs(previous.height-height)<.1?previous:{width,height});
  };
  measure();
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;
  observer?.observe(node);
  window.addEventListener('resize',measure);
  return()=>{observer?.disconnect();window.removeEventListener('resize',measure)};
 },[]);
 return <div ref={host} className="shelter-stage-fit" aria-label="自適應避難所場景">
  <div className="shelter-stage-fit__content"
   style={dimensions?{width:dimensions.width,height:dimensions.height}:undefined}>
   {children}
  </div>
 </div>;
}

export default function ShelterHomePage(){
 const {state}=useGame();
 const [previewWarehouse,setPreviewWarehouse]=useState(false);
 const [toolsOpen,setToolsOpen]=useState(false);
 const [selectedId,setSelectedId]=useState<ShelterFurnitureId|null>(null);
 const [queue,setQueue]=useState<ShelterAttention[]>([]);
 const detailRef=useRef<HTMLDivElement>(null);
 const openButtonRef=useRef<HTMLButtonElement>(null);
 const closeButtonRef=useRef<HTMLButtonElement>(null);
 const wasOpen=useRef(false);
 const shelterId=state.onboarding.shelter;
 const showWarehouse=shelterId==='warehouse'||previewWarehouse;
 const option=SHELTER_OPTIONS.find(item=>item.id===shelterId);
 const owned=normalizeShelterOwned(state.shelterOwned);
 const ownedKey=owned.join('|');
 const mode=getWarehouseVisualMode(owned);
 const activeSelected=selectedId&&owned.includes(selectedId)?selectedId:null;
 const pending=availableShelterAttention(queue,owned);
 const attention=pending[0]??null;
 const selectFurniture=useCallback((id:ShelterFurnitureId)=>{
  setSelectedId(id);
  setQueue(previous=>previous.filter(item=>item.targetId!==id));
  setToolsOpen(true);
 },[]);
 useEffect(()=>{
  const installed=new Set(ownedKey.split('|'));
  setSelectedId(previous=>previous&&!installed.has(previous)?null:previous);
  setQueue(previous=>{
   const next=previous.filter(item=>installed.has(item.targetId));
   return next.length===previous.length?previous:next;
  });
 },[ownedKey]);
 useEffect(()=>{
  if(toolsOpen){
   wasOpen.current=true;
   closeButtonRef.current?.focus({preventScroll:true});
   const handleEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')setToolsOpen(false)};
   window.addEventListener('keydown',handleEscape);
   return()=>window.removeEventListener('keydown',handleEscape);
  }
  if(wasOpen.current){
   wasOpen.current=false;
   openButtonRef.current?.focus({preventScroll:true});
  }
 },[toolsOpen]);
 useEffect(()=>{
  if(!toolsOpen||!activeSelected||!showWarehouse)return;
  const detail=detailRef.current;
  if(detail){
   detail.focus({preventScroll:true});
   detail.scrollIntoView({block:'nearest',behavior:'auto'});
  }
 },[toolsOpen,activeSelected,showWarehouse]);
 const onTrigger=(kind:ShelterAttentionKind)=>{
  const alert=makeDemoShelterAttention(kind);
  if(!owned.includes(alert.targetId))return;
  setQueue(previous=>enqueueShelterAttention(previous,alert));
 };
 return <div className="shelter-home-page shelter-home-page--compact viewport-page" aria-label="避難所主畫面">
  <header className="shelter-home-heading">
   <div><span className="eyebrow">EMBER CHRONICLES / SAFEHOUSE</span>
    <h1>{option?.name??'尚未指定據點'}</h1>
    <p>{option?.short??'你的生存據點'} · {showWarehouse?`${owned.length} / 8 件家具`:'等待美術配置'}</p>
   </div>
   <GameUtilities className="game-utilities--shelter"/>
  </header>
  <section className="shelter-home-scene-panel shelter-home-scene-panel--compact" aria-label="避難所場景">
   <ShelterStageFit>
    {showWarehouse
     ?<ShelterScene owned={owned} selectedId={activeSelected} attentionId={attention?.targetId??null} onSelect={selectFurniture}/>
     :shelterId==='apartment'||shelterId==='bunker'
      ?<ShelterPlaceholder shelterId={shelterId}/>
      :<div className="shelter-placeholder" role="status"><Skull size={38}/><p>尚未選擇避難所</p></div>}
   </ShelterStageFit>
   <div className="shelter-home-scene-caption">
    <span>{showWarehouse
      ?mode==='full'?'FULLY EQUIPPED':mode==='empty'?'EMPTY SHELTER':'FURNITURE LAYERS'
      :'SCENE PLACEHOLDER'}</span>
    {showWarehouse&&<strong>{owned.length} / 8</strong>}
   </div>
  </section>
  {!state.profession&&<button type="button" className="shelter-profession-notice" onClick={()=>setToolsOpen(true)}>
   尚未選擇職業 · 點此設定 <ChevronRight size={14}/>
  </button>}
  <nav className="shelter-home-quicknav" aria-label="避難所快速功能">
   <Link to="/town"><Building2 size={16} aria-hidden="true"/><span>城鎮設施</span></Link>
   <Link to="/warehouse"><Archive size={16} aria-hidden="true"/><span>物資倉庫</span></Link>
   <Link to="/black-market"><Shield size={16} aria-hidden="true"/><span>黑市</span></Link>
   <button type="button" ref={openButtonRef} aria-expanded={toolsOpen} aria-controls="shelter-development-drawer"
    onClick={()=>setToolsOpen(true)} data-prototype-only="true">
    <SlidersHorizontal size={16} aria-hidden="true"/><span>建設測試</span>
   </button>
  </nav>
  {toolsOpen&&<div className="shelter-drawer-backdrop" role="presentation" onPointerDown={event=>{if(event.target===event.currentTarget)setToolsOpen(false)}}>
   <section id="shelter-development-drawer" className="shelter-drawer" role="dialog" aria-modal="true"
    aria-label="避難所建設與測試功能">
    <header className="shelter-drawer__header">
     <div><span className="eyebrow">DEVELOPMENT / SAFEHOUSE</span><strong>建設與設施管理</strong></div>
     <button type="button" ref={closeButtonRef} onClick={()=>setToolsOpen(false)} aria-label="關閉建設工具"><X size={20}/></button>
    </header>
    <div className="shelter-drawer__content">
     {shelterId!=='warehouse'&&<div className="shelter-build-demo-preview" data-prototype-only="true">
      <span>倉庫配置預覽不會變更你選擇的避難所。</span>
      <button type="button" aria-pressed={previewWarehouse} onClick={()=>{setPreviewWarehouse(v=>!v);setSelectedId(null)}}>
       {previewWarehouse?'返回我的避難所':'預覽倉庫家具建設'}
      </button>
     </div>}
     {showWarehouse&&<p className="shelter-scene-access-tip">點擊主場景家具、小型標記，或下方設施清單查看資訊。</p>}
     {showWarehouse&&owned.length>0&&<section className="shelter-facility-index surface-card" aria-label="已建設家具操作清單">
      <header className="shelter-facility-index__header"><span>已建設設施</span><small>點擊查看</small></header>
      <div className="shelter-facility-index__list">
       {SHELTER_FURNITURE_IDS.filter(id=>owned.includes(id)).map(id=>
        <button type="button" key={id} data-facility-access={id} aria-pressed={activeSelected===id}
         className={activeSelected===id?'is-selected':''} onClick={()=>selectFurniture(id)}>
         {SHELTER_FACILITIES[id].name}
         {attention?.targetId===id&&<span className="shelter-facility-index__unread" aria-label="有待處理提示"/>}
        </button>)}
      </div>
     </section>}
     {showWarehouse&&activeSelected&&<div ref={detailRef} className="shelter-facility-detail-anchor" tabIndex={-1}
       id="shelter-facility-detail" aria-live="polite" aria-label="目前選取的家具設施">
       <ShelterFacilityPanel id={activeSelected} onClose={()=>setSelectedId(null)}/>
      </div>}
     {showWarehouse&&<ShelterAttentionPanel owned={owned} queue={queue} onTrigger={onTrigger}
       onInspect={selectFurniture} onDismiss={id=>setQueue(previous=>dismissShelterAttention(previous,id))}/>}
     {showWarehouse&&<ShelterBuildDemoPanel/>}
     <section className="shelter-home-intro surface-card">
      <span className="eyebrow">SHELTER CONSTRUCTION</span><h2>這裡會慢慢成為你的家。</h2>
      <p>{showWarehouse?'測試版可以任意建造、重洗順序或清空家具；八件購入後顯示原始高品質滿配圖。':'這座避難所的專屬空屋和家具美術尚待製作。'}</p>
      <div className="shelter-home-footnote"><ChevronDown size={15}/><span>這裡是原型測試工具；正式遊戲將另行設計家具經濟。</span></div>
     </section>
     {!state.profession&&<ProfessionSetup/>}
     {import.meta.env.DEV&&state.profession&&<Link className="shelter-map-test-link" to="/world-map">
      <Map size={17}/> 開發測試：原關卡路線圖 <ChevronRight size={17}/>
     </Link>}
     <div className="shelter-home-footer-links">
      <Link to="/town"><Building2 size={15}/> 城鎮設施</Link>
      <Link to="/warehouse"><Archive size={15}/> 物資倉庫</Link>
      <Link to="/black-market"><Home size={15}/> 黑市</Link>
     </div>
    </div>
   </section>
  </div>}
 </div>;
}
