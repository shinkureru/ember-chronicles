import type {ShelterFurnitureId} from '../../game/types';
import type {WarehouseFurnitureLayer} from '../../game/engine/shelterVisuals';
import type {StagePoint} from '../../game/engine/shelterInteractions';

/** Client-only, same-origin PNG sampler; never edits source images or user-calibrated positions. */
export interface FurnitureAlphaMask{
 width:number;height:number;sampleWidth:number;sampleHeight:number;
 alpha:Uint8Array;centroid:StagePoint;
}
export const SHELTER_ALPHA_THRESHOLD=96;
const MAX_MASK_WIDTH=384;

/** A reduced-resolution alpha mask (~< 2 MB for all eight) avoids full-size getImageData per click. */
export const readFurnitureAlphaMask=(img:HTMLImageElement):FurnitureAlphaMask=>{
 const width=img.naturalWidth,height=img.naturalHeight;
 if(width<=0||height<=0)throw new Error('Invalid furniture image dimensions');
 const canvas=document.createElement('canvas');
 canvas.width=Math.min(width,MAX_MASK_WIDTH);
 canvas.height=Math.max(1,Math.round(height*canvas.width/width));
 const context=canvas.getContext('2d',{willReadFrequently:true});
 if(!context)throw new Error('Canvas 2D unavailable');
 context.clearRect(0,0,canvas.width,canvas.height);
 context.drawImage(img,0,0,canvas.width,canvas.height);
 const rgba=context.getImageData(0,0,canvas.width,canvas.height).data;
 const alpha=new Uint8Array(canvas.width*canvas.height);
 let total=0,centroidX=0,centroidY=0;
 for(let i=0;i<alpha.length;i++){
  const a=rgba[4*i+3]!;
  alpha[i]=a;
  if(a<SHELTER_ALPHA_THRESHOLD)continue;
  // Give solid furniture more weight than faint cast shadows.
  const weight=a*a;
  total+=weight;
  centroidX+=(i%canvas.width+.5)*weight;
  centroidY+=(Math.floor(i/canvas.width)+.5)*weight;
 }
 if(total===0)throw new Error('Furniture alpha is empty');
 return {width,height,sampleWidth:canvas.width,sampleHeight:canvas.height,alpha,
  centroid:{x:centroidX/total/canvas.width*width,y:centroidY/total/canvas.height*height}};
};
export const sampleFurnitureAlpha=(mask:FurnitureAlphaMask,x:number,y:number):boolean=>{
 if(x<0||y<0||x>=mask.width||y>=mask.height||!Number.isFinite(x)||!Number.isFinite(y))return false;
 const col=Math.min(mask.sampleWidth-1,Math.floor(x/mask.width*mask.sampleWidth));
 const row=Math.min(mask.sampleHeight-1,Math.floor(y/mask.height*mask.sampleHeight));
 return (mask.alpha[row*mask.sampleWidth+col]??0)>=SHELTER_ALPHA_THRESHOLD;
};

/** The clickable marker is computed from visible alpha pixels, not transparent PNG padding. */
export const furnitureMarkerOnStage=(layer:WarehouseFurnitureLayer,mask?:FurnitureAlphaMask):StagePoint=>{
 const centroid=mask?.centroid??{x:layer.width*.5,y:layer.height*.5};
 const theta=layer.rotation*Math.PI/180;
 return {x:layer.x+layer.scale*(centroid.x*Math.cos(theta)-centroid.y*Math.sin(theta)),
  y:layer.y+layer.scale*(centroid.x*Math.sin(theta)+centroid.y*Math.cos(theta))};
};
export const loadFurnitureAlphaMask=(url:string):Promise<FurnitureAlphaMask>=>new Promise((resolve,reject)=>{
 const image=new Image();
 image.decoding='async';
 image.onload=()=>{
  try{resolve(readFurnitureAlphaMask(image));}catch(err){reject(err);}
 };
 image.onerror=()=>reject(new Error('Unable to read furniture PNG mask'));
 image.src=url;
});

/** Cache is scoped to a mounted scene. An unmounted preview cannot keep updating state. */
export const loadShelterAlphaMasks=async (
 ids:readonly ShelterFurnitureId[],getUrl:(id:ShelterFurnitureId)=>string
):Promise<Partial<Record<ShelterFurnitureId,FurnitureAlphaMask>>>=>{
 const entries=await Promise.all(ids.map(async id=>{
  try{return [id,await loadFurnitureAlphaMask(getUrl(id))] as const;}
  catch{return [id,null] as const;}
 }));
 return Object.fromEntries(entries.filter((entry):entry is readonly [ShelterFurnitureId,FurnitureAlphaMask]=>entry[1]!==null));
};
