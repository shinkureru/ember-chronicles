import {useCallback,useEffect,useMemo,useRef,useState,type MouseEvent as ReactMouseEvent,type PointerEvent as ReactPointerEvent} from 'react';
import type {ShelterFurnitureId} from '../../game/types';
import {SHELTER_FURNITURE_IDS,getWarehouseFurnitureLayers,getWarehouseVisualMode,WAREHOUSE_ASSET_ROOT,WAREHOUSE_STAGE} from '../../game/engine/shelterVisuals';
import {clientToStagePoint,pickWarehouseFurniture,SHELTER_FACILITIES} from '../../game/engine/shelterInteractions';
import {loadShelterAlphaMasks,sampleFurnitureAlpha,furnitureMarkerOnStage,type FurnitureAlphaMask} from './shelterAlphaHit';

const url=(name:string)=>`${import.meta.env.BASE_URL}${WAREHOUSE_ASSET_ROOT}${name}`;
type AlphaMap=Partial<Record<ShelterFurnitureId,FurnitureAlphaMask>>;
interface ShelterSceneProps{
 owned:readonly ShelterFurnitureId[];
 selectedId?:ShelterFurnitureId|null;
 attentionId?:ShelterFurnitureId|null;
 onSelect?:(id:ShelterFurnitureId)=>void;
}

/** Exact user-calibrated PNG layers + alpha-accurate clicks and accessible focus markers.
 * When 8/8 items are owned, the full-quality JPEG stays the sole background;
 * the original PNGs are used only as INVISIBLE alpha masks and subtle hint silhouettes.
 */
export default function ShelterScene({owned,selectedId=null,attentionId=null,onSelect}:ShelterSceneProps){
 const sceneRef=useRef<HTMLDivElement>(null);
 const [masks,setMasks]=useState<AlphaMap>({});
 const [hovered,setHovered]=useState<ShelterFurnitureId|null>(null);
 const mode=getWarehouseVisualMode(owned);
 const allLayers=getWarehouseFurnitureLayers(owned);
 const layers=mode==='layers'?allLayers:[];
 const interactive=Boolean(onSelect);
 const ownedKey=allLayers.map(l=>l.id).join('|');

 useEffect(()=>{
  if(!interactive||ownedKey.length===0){setMasks({});return;}
  let active=true;
  // For mixed build states, only load currently present furniture. Full JPEG still
  // gets each of the 8 masks so clicking the clean composite works as before.
  const ids=SHELTER_FURNITURE_IDS.filter(id=>owned.includes(id));
  void loadShelterAlphaMasks(ids,id=>url(id+'.png')).then(data=>{if(active)setMasks(data)});
  return()=>{active=false};
 },[interactive,ownedKey]);

 const sample=useCallback((id:ShelterFurnitureId,x:number,y:number)=>{
  const mask=masks[id];
  return mask?sampleFurnitureAlpha(mask,x,y):false;
 },[masks]);
 const pick=useCallback((clientX:number,clientY:number)=>{
  const el=sceneRef.current;
  if(!el)return null;
  const point=clientToStagePoint({x:clientX,y:clientY},el.getBoundingClientRect(),WAREHOUSE_STAGE);
  return point?pickWarehouseFurniture(point,allLayers,sample):null;
 },[allLayers,sample]);

 const onStageClick=(event:ReactMouseEvent<HTMLDivElement>)=>{
  if(!onSelect)return;
  const id=pick(event.clientX,event.clientY);
  if(id)onSelect(id);
 };
 const onMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
  if(!interactive||event.pointerType!=='mouse')return;
  const id=pick(event.clientX,event.clientY);
  setHovered(prev=>prev===id?prev:id);
 };

 const emphasized=useMemo(()=>new Set([hovered,selectedId,attentionId].filter((id):id is ShelterFurnitureId=>id!==null)),[hovered,selectedId,attentionId]);
 return <div ref={sceneRef} className={interactive?'shelter-scene shelter-scene--interactive':'shelter-scene'}
  data-shelter-scene="warehouse" data-scene-mode={mode}
  style={{aspectRatio:`${WAREHOUSE_STAGE.width} / ${WAREHOUSE_STAGE.height}`}}
  onClick={interactive?onStageClick:undefined}
  onPointerMove={interactive?onMove:undefined}
  onPointerLeave={interactive?()=>setHovered(null):undefined}
  aria-label={mode==='full'?'已完整建設的廢棄倉庫':mode==='empty'?'空蕩的廢棄倉庫':`已擺放 ${layers.length} 件家具的廢棄倉庫`}>
   <img key={mode==='full'?'completed':'unfinished'} className="shelter-scene__background" src={url(mode==='full'?'background_full.jpg':'background_empty.jpg')}
    alt={mode==='full'?'倉庫完整家具配置場景':'廢棄倉庫空屋場景'} draggable={false}/>
   {layers.map(layer=><img key={layer.id} src={url(layer.file)} className="shelter-scene__furniture"
    data-furniture-id={layer.id} alt="" aria-hidden="true" draggable={false}
    style={{
     left:`${layer.leftPct}%`,top:`${layer.topPct}%`,width:`${layer.widthPct}%`,height:`${layer.heightPct}%`,
     zIndex:layer.z,opacity:layer.opacity,
     transform:`rotate(${layer.rotation}deg)`,transformOrigin:'top left'
    }}/>)}
   {interactive&&allLayers.filter(layer=>emphasized.has(layer.id)).map(layer=><span key={'aura-'+layer.id}
    className={'shelter-scene__aura'+(attentionId===layer.id?' shelter-scene__aura--attention':'')}
    aria-hidden="true" style={{
     left:`${layer.leftPct}%`,top:`${layer.topPct}%`,width:`${layer.widthPct}%`,height:`${layer.heightPct}%`,
     zIndex:layer.z+1,transform:`rotate(${layer.rotation}deg)`,transformOrigin:'top left',
     maskImage:`url("${url(layer.file)}")`,WebkitMaskImage:`url("${url(layer.file)}")`,
     maskSize:'100% 100%',WebkitMaskSize:'100% 100%',maskRepeat:'no-repeat',WebkitMaskRepeat:'no-repeat'
    }}/>)}
   {interactive&&allLayers.map(layer=>{
    const anchor=furnitureMarkerOnStage(layer,masks[layer.id]);
    const left=Math.max(5,Math.min(95,anchor.x/WAREHOUSE_STAGE.width*100));
    const top=Math.max(3,Math.min(97,anchor.y/WAREHOUSE_STAGE.height*100));
    return <button key={'marker-'+layer.id} type="button" className={
      'shelter-scene__marker'+(attentionId===layer.id?' shelter-scene__marker--attention':'')+
      (selectedId===layer.id?' shelter-scene__marker--selected':'')}
      aria-label={`查看已建設的${SHELTER_FACILITIES[layer.id].name}`}
      aria-pressed={selectedId===layer.id} title={`查看${SHELTER_FACILITIES[layer.id].name}`}
      data-furniture-marker={layer.id}
      style={{left:`${left}%`,top:`${top}%`,zIndex:100+layer.z}}
      onPointerEnter={()=>setHovered(layer.id)}
      onPointerLeave={()=>setHovered(null)}
      onClick={event=>{event.stopPropagation();onSelect?.(layer.id)}}>
       <span className="shelter-scene__marker-center" aria-hidden="true"/>
      </button>;
   })}
  </div>;
}
