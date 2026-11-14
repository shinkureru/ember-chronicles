import type {ShelterFurnitureId} from '../../game/types';
import {getWarehouseFurnitureLayers,getWarehouseVisualMode,WAREHOUSE_ASSET_ROOT,WAREHOUSE_STAGE} from '../../game/engine/shelterVisuals';

const url=(name:string)=>`${import.meta.env.BASE_URL}${WAREHOUSE_ASSET_ROOT}${name}`;

/** Exact calibrated positioning on a responsive portrait scene.
 * Source JSON x/y/scale are in 768×1376 logical pixels, with ORIGINAL transparent padding.
 * Full ownership swaps to the artist's clean source JPEG instead of eight composited PNGs.
 */
export default function ShelterScene({owned}:{owned:readonly ShelterFurnitureId[]}){
 const mode=getWarehouseVisualMode(owned);
 const layers=mode==='layers'?getWarehouseFurnitureLayers(owned):[];
 return <div className="shelter-scene" data-shelter-scene="warehouse" data-scene-mode={mode}
  style={{aspectRatio:`${WAREHOUSE_STAGE.width} / ${WAREHOUSE_STAGE.height}`}}
  aria-label={mode==='full'?'已完整建設的廢棄倉庫':mode==='empty'?'空蕩的廢棄倉庫':`已擺放 ${layers.length} 件家具的廢棄倉庫`}>
   <img className="shelter-scene__background" src={url(mode==='full'?'background_full.jpg':'background_empty.jpg')}
    alt={mode==='full'?'倉庫完整家具配置場景':'廢棄倉庫空屋場景'} draggable={false}/>
   {layers.map(layer=><img key={layer.id} src={url(layer.file)} className="shelter-scene__furniture"
    data-furniture-id={layer.id} alt="" aria-hidden="true" draggable={false}
    style={{
     left:`${layer.leftPct}%`,top:`${layer.topPct}%`,width:`${layer.widthPct}%`,height:`${layer.heightPct}%`,
     zIndex:layer.z,opacity:layer.opacity,
     transform:`rotate(${layer.rotation}deg)`,transformOrigin:'top left'
    }}/>)}
 </div>;
}
