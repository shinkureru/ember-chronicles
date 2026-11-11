import { Backpack } from 'lucide-react';
import ItemArt from './ItemArt';

export interface PickupVisual {id:number;itemId:string;name:string;quantity:number;}
/** Lightweight non-blocking pickup feedback, independent of inventory storage. */
export default function PickupFly({pickup}:{pickup:PickupVisual}){
 return <div className="pickup-flight" aria-live="polite" aria-label={`取得${pickup.name} ${pickup.quantity} 件`}>
   <div className="pickup-flight__glow" aria-hidden="true"/>
   <div className="pickup-flight__object" aria-hidden="true"><span><ItemArt id={pickup.itemId}/></span><small>+{pickup.quantity}</small></div>
   <div className="pickup-flight__bag" aria-hidden="true">
    <div className="pickup-flight__bag-opening"/>
    <Backpack size={50} strokeWidth={1.35}/>
   </div>
   <div className="pickup-flight__title">獲得「{pickup.name}」</div>
 </div>;
}
