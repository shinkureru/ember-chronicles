/** Stable per attempt/scene, randomized without arbitrary overlap. */
import type { ActionChoice, ActionPreview } from '../../game/types';

const SAFE_SLOTS:Record<number,readonly [number,number][]>={
  1:[[50,48]],
  2:[[27,34],[73,66]],
  3:[[25,31],[75,30],[50,74]],
  4:[[24,27],[76,27],[25,73],[76,73]],
  5:[[24,24],[76,24],[50,49],[24,77],[76,77]],
  6:[[24,18],[76,18],[50,45],[24,74],[76,74],[50,91]],
};
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
export interface ChoicePosition {x:number;y:number;angle:number;delay:number;}
export const getChoicePositions=(actions:ActionChoice[],seed:string):ChoicePosition[]=>{
  // More than six actions are paginated into blocks; the prototype currently uses ≤ 6.
  const slots=SAFE_SLOTS[Math.min(6,Math.max(1,actions.length))];
  const order=actions.map((_,j)=>({j,k:hash(`${seed}:${j}`)})).sort((a,b)=>a.k-b.k);
  return actions.map((action,i)=>{
    const slot=slots[order.findIndex(o=>o.j===i)%slots.length];
    const jitter=hash(`${seed}:${action.id}`);
    return {x:slot[0],y:slot[1],angle:((jitter>>>3)%19)-9,delay:-((jitter>>>9)%30)/10};
  });
};
export const knownChoiceRisk=(preview:ActionPreview):number=>
  100-preview.chance+preview.warnings.length*8+preview.staminaCost*.45+
  (preview.courageDelta<0?-preview.courageDelta*.7:0);
/** Only show a warning based on visible numerical risks, never hidden NPC outcomes. */
export const getRiskHintIndex=(previews:ActionPreview[]):number=>{
  if(previews.length<2)return -1;
  return previews.reduce((worst,p,i)=>knownChoiceRisk(p)>knownChoiceRisk(previews[worst])?i:worst,0);
};
