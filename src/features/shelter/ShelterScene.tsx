import {Building2,Shield,Warehouse,ImageOff} from 'lucide-react';
import {FURNITURE_NAMES,WAREHOUSE_LAYOUT,WAREHOUSE_ASSET_ROOT,WAREHOUSE_BACKGROUNDS,visibleWarehouseLayers,warehouseSceneMode} from '../../game/data/shelter';
import type {ShelterFurnitureId,ShelterId} from '../../game/types';

const shelterIcons={apartment:Building2,bunker:Shield,warehouse:Warehouse};
const nameByShelter={apartment:'廢棄公寓',bunker:'地下防空室',warehouse:'廢棄倉庫'};

/** User-calibrated fixed slots. All offsets include original transparent margins.
 * No drag, randomness, new position detection or image retouching at runtime.
 */
export default function ShelterScene({shelter,owned}:{shelter:ShelterId|null;owned:readonly ShelterFurnitureId[]}){
 if(shelter!=='warehouse'){
  const Icon=shelter?shelterIcons[shelter]:ImageOff;
  const name=shelter?nameByShelter[shelter]:'尚未指定避難所';
  return <div className={'shelter-scene shelter-scene--placeholder shelter-scene--'+(shelter??'unspecified')}
   role="img" aria-label={name+'場景圖片預留'}>
   <div className="shelter-scene__placeholder-content">
    <Icon size={48} strokeWidth={1.05} aria-hidden="true"/>
    <span>SHELTER / SCENE PLACEHOLDER</span>
    <strong>{name}</strong>
    <p>{shelter==='apartment'?'公寓的空屋及家具圖片尚未提供':shelter==='bunker'?'防空室的空屋及家具圖片尚未提供':'請透過首次流程選擇避難所'}</p>
    <small>場景美術待製作，暫不使用倉庫圖片替代</small>
   </div>
  </div>;
 }
 const safeOwned=owned??[];
 const mode=warehouseSceneMode(safeOwned);
 const root=import.meta.env.BASE_URL+WAREHOUSE_ASSET_ROOT;
 const bg=mode==='complete'?WAREHOUSE_BACKGROUNDS.complete:WAREHOUSE_BACKGROUNDS.empty;
 const layers=mode==='layers'?visibleWarehouseLayers(safeOwned):[];
 const stage=WAREHOUSE_LAYOUT.stage;
 return <div className={'shelter-scene shelter-scene--warehouse shelter-scene--'+mode}
   role="img" aria-label={'廢棄倉庫，已配置 '+(mode==='complete'?8:layers.length)+' 件家具'}>
  <img className="shelter-scene__background" src={root+bg} alt="" draggable={false} aria-hidden="true"/>
  {layers.map(layer=><img key={layer.id} className="shelter-scene__layer"
   src={root+layer.src.replace(/^assets\//,'')} alt="" draggable={false} aria-hidden="true"
   data-furniture-id={layer.id} data-z={layer.z}
   title={FURNITURE_NAMES[layer.id]}
   style={{
    left:(layer.x/stage.width*100)+'%',
    top:(layer.y/stage.height*100)+'%',
    width:(layer.width*layer.scale/stage.width*100)+'%',
    opacity:layer.opacity,
    zIndex:layer.z,
    transform:'rotate('+layer.rotation+'deg)',
   }}/>)}
 </div>;
}
