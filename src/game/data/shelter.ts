import layoutJson from './warehouse-shelter-layout.json';

/** IDs are stable, shared by save data, calibrated layers and future shop actions. */
export const WAREHOUSE_FURNITURE_IDS=[
 'bed','storage','workbench','radio','board','generator','cooking','computer',
] as const;
export type WarehouseFurnitureId=(typeof WAREHOUSE_FURNITURE_IDS)[number];

export const FURNITURE_NAMES:Record<WarehouseFurnitureId,string>={
 bed:'折疊床',storage:'儲物架',workbench:'工作台',radio:'無線電台',
 board:'證物調查板',generator:'發電機',cooking:'料理台',computer:'電腦',
};

/** Original pixel dimensions of the user-supplied transparent PNG canvases.
 * Do NOT pre-crop: x/y refer to the complete original asset canvas.
 */
export const FURNITURE_IMAGE_SIZES:Record<WarehouseFurnitureId,{width:number;height:number}>={
 bed:{width:1200,height:896},storage:{width:1200,height:896},
 workbench:{width:1200,height:896},radio:{width:896,height:1200},
 board:{width:896,height:1200},generator:{width:1200,height:896},
 cooking:{width:914,height:1225},computer:{width:768,height:1376},
};
export interface FurnitureLayer{
 x:number;y:number;scale:number;z:number;rotation:number;opacity:number;src:string;slot:string;
}
export const WAREHOUSE_LAYOUT=layoutJson as {
 schema:string;
 stage:{width:number;height:number};
 assets:Record<WarehouseFurnitureId,FurnitureLayer>;
};
export const WAREHOUSE_ASSET_ROOT='assets/shelter/warehouse/';
export const WAREHOUSE_BACKGROUNDS={empty:'background_empty.jpg',complete:'background_full.jpg'} as const;
const knownFurniture=new Set<string>(WAREHOUSE_FURNITURE_IDS);

/** Never trust save data from former versions or manually edited localStorage. */
export function sanitizeShelterFurniture(value:unknown):WarehouseFurnitureId[]{
 if(!Array.isArray(value))return [];
 const result:WarehouseFurnitureId[]=[];
 for(const id of value){
  if(typeof id==='string'&&knownFurniture.has(id)&&!result.includes(id as WarehouseFurnitureId)){
   result.push(id as WarehouseFurnitureId);
  }
 }
 return result;
}

export type WarehouseSceneMode='empty'|'layers'|'complete';
export const warehouseSceneMode=(owned:readonly string[]):WarehouseSceneMode=>{
 const count=sanitizeShelterFurniture(owned).length;
 return count===0?'empty':count===WAREHOUSE_FURNITURE_IDS.length?'complete':'layers';
};

export const visibleWarehouseLayers=(owned:readonly string[])=>{
 const active=new Set(sanitizeShelterFurniture(owned));
 return WAREHOUSE_FURNITURE_IDS.filter(id=>active.has(id))
  .map(id=>({id,...WAREHOUSE_LAYOUT.assets[id],...FURNITURE_IMAGE_SIZES[id]}))
  .sort((a,b)=>a.z-b.z);
};
