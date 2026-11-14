import type {ShelterFurnitureId} from '../types';
import type {WarehouseFurnitureLayer} from './shelterVisuals';
import {isShelterFurnitureId} from './shelterVisuals';

/** Stage coordinates always use the artist's unchanged 768 x 1376 source space. */
export interface StagePoint { x:number;y:number }
export interface SceneRect {left:number;top:number;width:number;height:number}
export type FurnitureAlphaSampler=(id:ShelterFurnitureId,pixelX:number,pixelY:number)=>boolean;

/** CSS scales the whole portrait stage uniformly; do not remap artwork positions. */
export const clientToStagePoint=(client:StagePoint,rect:SceneRect,stage:{width:number;height:number}):StagePoint|null=>{
 if(!Number.isFinite(client.x)||!Number.isFinite(client.y)||rect.width<=0||rect.height<=0)return null;
 const x=(client.x-rect.left)/rect.width;
 const y=(client.y-rect.top)/rect.height;
 return x>=0&&x<=1&&y>=0&&y<=1?{x:x*stage.width,y:y*stage.height}:null;
};

/** Convert a stage click into the PNG's ORIGINAL pixel grid (transparent margins intact). */
export const stagePointToFurniturePixel=(point:StagePoint,layer:WarehouseFurnitureLayer):StagePoint|null=>{
 if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||layer.scale<=0)return null;
 const theta=layer.rotation*Math.PI/180;
 const dx=point.x-layer.x,dy=point.y-layer.y;
 // Invert CSS rotate(theta) about top-left, then the calibrated image scale.
 const pixelX=(Math.cos(theta)*dx+Math.sin(theta)*dy)/layer.scale;
 const pixelY=(-Math.sin(theta)*dx+Math.cos(theta)*dy)/layer.scale;
 return pixelX>=0&&pixelY>=0&&pixelX<layer.width&&pixelY<layer.height
  ?{x:pixelX,y:pixelY}:null;
};

/** A rectangular image hit is NOT a furniture hit: check real alpha and topmost z first. */
export const pickWarehouseFurniture=(
 point:StagePoint,layers:readonly WarehouseFurnitureLayer[],sample:FurnitureAlphaSampler
):ShelterFurnitureId|null=>{
 const topmost=[...layers].sort((a,b)=>b.z-a.z||b.id.localeCompare(a.id));
 for(const layer of topmost){
  const pixel=stagePointToFurniturePixel(point,layer);
  if(pixel&&sample(layer.id,pixel.x,pixel.y))return layer.id;
 }
 return null;
};

export interface ShelterFacilityDescription{
 name:string;category:string;purpose:string;future:string;notice:string;
}
export const SHELTER_FACILITIES:Record<ShelterFurnitureId,ShelterFacilityDescription>={
 bed:{name:'折疊床',category:'生活',purpose:'安全的休息位置',future:'未來預留休息、傷勢恢復與睡眠事件。',notice:'休息時的時間與飢餓平衡尚待討論。'},
 storage:{name:'儲物架',category:'生存',purpose:'整理與保管物資',future:'未來可擴充倉儲容量、物資分類和儲存上限。',notice:'本批不改現有倉庫容量或掉落機制。'},
 workbench:{name:'工作台',category:'製作',purpose:'裝備、維修與製作系統入口',future:'預留零件加工、工具修理與進階配方的功能頁。',notice:'尚未與世界關卡地圖解鎖條件綁定。'},
 radio:{name:'無線電台',category:'通訊',purpose:'搜尋訊號及通訊紀錄',future:'預留廣播訊號、倖存者聯絡與傳聞調查。',notice:'尚未加入 NPC、交易或特定任務觸發。'},
 board:{name:'證物調查板',category:'情報',purpose:'整理人物與線索的關聯',future:'預留已知線索、人物圖譜與事件推理介面。',notice:'不會在本批產生實際線索獎勵。'},
 generator:{name:'發電機',category:'供電',purpose:'避難所能源管理入口',future:'預留電力供應、設備啟用條件與燃料消耗。',notice:'目前尚未實作斷電或耗油限制。'},
 cooking:{name:'料理台',category:'生活',purpose:'烹飪與食物準備入口',future:'預留食譜、材料轉化與補給製作。',notice:'不更動現有飢餓數值或食物恢復效果。'},
 computer:{name:'電腦桌',category:'情報終端',purpose:'解鎖電子資料調查的系統入口',future:'預留敵情資料庫、隱藏通訊、特殊支線與弱點分析等功能。',notice:'敵人弱點機率與隱藏支線實際解鎖條件尚未決定。'}
};

export type ShelterAttentionKind='tutorial'|'quest'|'ready';
export interface ShelterAttention {
 id:string;targetId:ShelterFurnitureId;kind:ShelterAttentionKind;title:string;detail:string;
}
export const SHELTER_ATTENTION_LABELS:Record<ShelterAttentionKind,string>={
 tutorial:'新手教學',quest:'重要情報',ready:'設施可用'
};
/** A sample event, never a real quest flag or reward. Future narrative triggers will call enqueue. */
export const makeDemoShelterAttention=(kind:ShelterAttentionKind):ShelterAttention=>{
 const values={
  tutorial:{targetId:'board' as const,title:'調查板操作指引',detail:'這裡將提示你整理第一條重要線索。'},
  quest:{targetId:'computer' as const,title:'偵測到未讀加密訊息',detail:'這裡將接入重要隱藏支線。當前只演示提示外觀。'},
  ready:{targetId:'workbench' as const,title:'工作台已有待處理項目',detail:'這裡將接入製作或修理完成的通知。'}
 };
 return {id:'demo:'+kind,targetId:values[kind].targetId,kind,title:values[kind].title,detail:values[kind].detail};
};
export const enqueueShelterAttention=(queue:readonly ShelterAttention[],value:ShelterAttention):ShelterAttention[]=>{
 if(!isShelterFurnitureId(value.targetId)||queue.some(x=>x.id===value.id))return [...queue];
 return [...queue,value];
};
export const dismissShelterAttention=(queue:readonly ShelterAttention[],id:string):ShelterAttention[]=>queue.filter(x=>x.id!==id);
export const availableShelterAttention=(queue:readonly ShelterAttention[],owned:readonly ShelterFurnitureId[]):ShelterAttention[]=>{
 const set=new Set(owned);
 return queue.filter(x=>set.has(x.targetId));
};
