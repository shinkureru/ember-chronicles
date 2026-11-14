import warehouseLayout from '../data/shelter/warehouse-layout.json';
import type {ShelterFurnitureId} from '../types';

/** The designer's original 768×1376 file is the only layout source.
 * Do NOT clamp negative coordinates or read its editor-only "owned" demo list.
 */
export const SHELTER_FURNITURE_IDS=['bed','storage','workbench','radio','board','generator','cooking','computer'] as const satisfies readonly ShelterFurnitureId[];
export const WAREHOUSE_LAYOUT=warehouseLayout;
export const WAREHOUSE_STAGE=warehouseLayout.stage;
export const WAREHOUSE_ASSET_ROOT='assets/shelter/warehouse/' as const;
export const WAREHOUSE_ASSET_DIMENSIONS:Record<ShelterFurnitureId,{width:number;height:number}>={
 bed:{width:1200,height:896},storage:{width:1200,height:896},
 workbench:{width:1200,height:896},radio:{width:896,height:1200},
 board:{width:896,height:1200},generator:{width:1200,height:896},
 cooking:{width:914,height:1225},computer:{width:768,height:1376},
};
export const isShelterFurnitureId=(value:unknown):value is ShelterFurnitureId=>
 typeof value==='string'&&(SHELTER_FURNITURE_IDS as readonly string[]).includes(value);
/** Old and damaged saves cannot inject unknown paths or duplicate furniture. */
export const normalizeShelterOwned=(owned:unknown):ShelterFurnitureId[]=>{
 if(!Array.isArray(owned))return [];
 return SHELTER_FURNITURE_IDS.filter(id=>owned.includes(id));
};
export type WarehouseVisualMode='empty'|'layers'|'full';
export const getWarehouseVisualMode=(owned:unknown):WarehouseVisualMode=>{
 const count=normalizeShelterOwned(owned).length;
 return count===0?'empty':count===SHELTER_FURNITURE_IDS.length?'full':'layers';
};
export interface WarehouseFurnitureLayer{
 id:ShelterFurnitureId;file:string;slot:string;z:number;opacity:number;rotation:number;
 x:number;y:number;scale:number;width:number;height:number;
 leftPct:number;topPct:number;widthPct:number;heightPct:number;
}
export const getWarehouseFurnitureLayers=(owned:unknown):WarehouseFurnitureLayer[]=>{
 const ids=normalizeShelterOwned(owned);
 return ids.map(id=>{
  const asset=warehouseLayout.assets[id],size=WAREHOUSE_ASSET_DIMENSIONS[id];
  return {
   id,file:`${id}.png`,slot:asset.slot,z:asset.z,opacity:asset.opacity,rotation:asset.rotation,
   x:asset.x,y:asset.y,scale:asset.scale,width:size.width,height:size.height,
   leftPct:asset.x/WAREHOUSE_STAGE.width*100,
   topPct:asset.y/WAREHOUSE_STAGE.height*100,
   widthPct:size.width*asset.scale/WAREHOUSE_STAGE.width*100,
   heightPct:size.height*asset.scale/WAREHOUSE_STAGE.height*100,
  };
 }).sort((a,b)=>a.z-b.z||SHELTER_FURNITURE_IDS.indexOf(a.id)-SHELTER_FURNITURE_IDS.indexOf(b.id));
};
