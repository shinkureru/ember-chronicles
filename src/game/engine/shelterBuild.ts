import type {ShelterFurnitureId} from '../types';
import {isShelterFurnitureId,normalizeShelterOwned,SHELTER_FURNITURE_IDS} from './shelterVisuals';

/** Pure prototype-only acquisition order, separate from furniture coordinates and game economy. */
export const DEFAULT_SHELTER_BUILD_ORDER:readonly ShelterFurnitureId[]=SHELTER_FURNITURE_IDS;
export const normalizeShelterBuildOrder=(raw:unknown):ShelterFurnitureId[]=>{
 const order: ShelterFurnitureId[]=[];
 if(Array.isArray(raw)){
  for(const id of raw){
   if(isShelterFurnitureId(id)&&!order.includes(id))order.push(id);
  }
 }
 for(const id of DEFAULT_SHELTER_BUILD_ORDER)if(!order.includes(id))order.push(id);
 return order;
};

/** Reproducible after save/reload because the generated queue is persisted. */
export const nextShelterBuildItem=(owned:unknown,rawOrder:unknown):ShelterFurnitureId|null=>{
 const existing=new Set(normalizeShelterOwned(owned));
 return normalizeShelterBuildOrder(rawOrder).find(id=>!existing.has(id))??null;
};

/** Fisher–Yates; injectable RNG makes all 8! sequences testable without changing game RNG. */
export const randomShelterBuildOrder=(random:()=>number=Math.random):ShelterFurnitureId[]=>{
 const order=[...DEFAULT_SHELTER_BUILD_ORDER];
 for(let i=order.length-1;i>0;i--){
  const value=random();
  const safe=Number.isFinite(value)?Math.min(1-Number.EPSILON,Math.max(0,value)):0;
  const j=Math.floor(safe*(i+1));
  [order[i],order[j]]=[order[j]!,order[i]!];
 }
 return order;
};
