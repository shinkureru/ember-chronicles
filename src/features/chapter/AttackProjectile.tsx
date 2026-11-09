import type { CSSProperties } from 'react';
import ActionObjectArt from './ActionObjectArt';
export interface AttackFlight {kind:string;x:number;y:number;targetX:number;targetY:number;id:number;}
export default function AttackProjectile({flight}:{flight:AttackFlight}){
 const style={
  left:`${flight.x}px`,top:`${flight.y}px`,
  '--attack-dx':`${flight.targetX-flight.x}px`,'--attack-dy':`${flight.targetY-flight.y}px`,
 } as CSSProperties;
 return <div className="combat-projectile" key={flight.id} style={style} aria-hidden="true">
  <ActionObjectArt kind={flight.kind} className="combat-projectile__object"/>
 </div>;
}
