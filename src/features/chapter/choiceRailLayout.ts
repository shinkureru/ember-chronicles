import type { ActionChoice } from '../../game/types';

export interface RailChoicePosition {
  cluster:number;
  x:number;
  y:number;
  angle:number;
  delay:number;
}
const hash=(text:string)=>{
 let n=2166136261;
 for(let i=0;i<text.length;i++)n=Math.imul(n^text.charCodeAt(i),16777619);
 return n>>>0;
};
/** Two large options per panoramic slice; next slice peeks in from the right.
 * X/y/rotation vary by mission attempt and scene, but remain stable across re-renders.
 * Vertical bands deliberately cannot overlap, even for long titles on short phones.
 */
export const getChoiceRailLayout=(actions:ActionChoice[],seed:string):RailChoicePosition[]=>
 actions.map((choice,index)=>{
  const h=hash(`${seed}:${choice.id}:${index}`);
  const upper=index%2===0;
  return {
   cluster:Math.floor(index/2),
   x:(upper?38:54)+(h%25)-12,
   y:(upper?24:77)+((h>>>8)%9)-4,
   angle:((h>>>15)%19)-9,
   delay:-((h>>>21)%19)/10,
  };
 });
export const getChoiceClusterCount=(count:number)=>Math.max(1,Math.ceil(count/2));
