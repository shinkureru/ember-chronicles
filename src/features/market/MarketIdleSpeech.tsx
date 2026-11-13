import {useEffect,useState} from 'react';
import type {MarketVendor} from '../../game/data/marketVendors';
import {getMarketIdleLine,MARKET_IDLE_INTERVAL_MS} from './marketIdleLines';

/** Key this component by vendor.id: changing shifts remounts its own timer.
 * Hidden tabs pause rotation, so stale background intervals don't accumulate.
 */
export default function MarketIdleSpeech({vendor}:{vendor:MarketVendor}){
 const [index,setIndex]=useState(0);
 useEffect(()=>{
  let timer:ReturnType<typeof setInterval>|undefined;
  const syncVisibility=()=>{
   if(timer!==undefined){clearInterval(timer);timer=undefined;}
   if(!document.hidden){
    timer=setInterval(()=>setIndex(previous=>(previous+1)%10),MARKET_IDLE_INTERVAL_MS);
   }
  };
  syncVisibility();
  document.addEventListener('visibilitychange',syncVisibility);
  return ()=>{
   if(timer!==undefined)clearInterval(timer);
   document.removeEventListener('visibilitychange',syncVisibility);
  };
 },[vendor.id]);
 return <span className="market-v0825__speech-text" key={index}>{getMarketIdleLine(vendor,index)}</span>;
}
