import {useEffect,useState} from 'react';
import type {MarketVendor} from '../../game/data/marketVendors';

/** All public illustrations share the configured Vite BASE_URL (GitHub Pages).
 * Only filenames from the static vendor metadata enter this function.
 */
export const BLACK_MARKET_SCENE_URL=`${import.meta.env.BASE_URL}black-market-merchant.webp`;
export const MARKET_SCENE_ROTATION_MS=12_000;
export const getMarketSceneUrls=(sceneAssets:readonly string[]):string[]=>
 sceneAssets.map(filename=>`${import.meta.env.BASE_URL}${filename}`);

/** A separate slideshow for each on-duty merchant. No cross-vendor frames.
 * All frames are decoded by useMarketSceneLoad before this component mounts.
 * Pause when the document is hidden or reduced-motion is requested.
 */
export default function BlackMarketSceneArt({vendor}:{vendor:MarketVendor}){
 const sceneAssets=vendor.visual.sceneAssets;
 const imageUrls=getMarketSceneUrls(sceneAssets);
 const [active,setActive]=useState(0);
 useEffect(()=>{
  if(imageUrls.length<2)return;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let timer:number|undefined;
  const stop=()=>{if(timer!==undefined){window.clearInterval(timer);timer=undefined;}};
  const sync=()=>{
   stop();
   if(reduced?.matches){setActive(0);return;}
   if(document.visibilityState!=='visible')return;
   timer=window.setInterval(()=>setActive(old=>(old+1)%imageUrls.length),MARKET_SCENE_ROTATION_MS);
  };
  sync();
  document.addEventListener('visibilitychange',sync);
  reduced?.addEventListener?.('change',sync);
  return ()=>{
   stop();
   document.removeEventListener('visibilitychange',sync);
   reduced?.removeEventListener?.('change',sync);
  };
 },[vendor.id,imageUrls.length]);
 if(imageUrls.length===0){
  return <div className="market-v0829__empty-scene" aria-hidden="true">
   <div className="market-v0829__empty-glow"/>
  </div>;
 }
 return <svg className="market-v0823__art market-v0829__art" viewBox="0 0 960 536"
  preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
  <defs>
   <radialGradient id="market-v0823-warm"><stop offset="0" stopColor="#ffeab4" stopOpacity=".49"/><stop offset=".42" stopColor="#ffbe66" stopOpacity=".18"/><stop offset="1" stopColor="#ffbe66" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0823-cold"><stop offset="0" stopColor="#b7eaf7" stopOpacity=".28"/><stop offset=".53" stopColor="#6bb5d5" stopOpacity=".12"/><stop offset="1" stopColor="#6bb5d5" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0827-fluorescent"><stop offset="0" stopColor="#efffff" stopOpacity=".48"/><stop offset=".27" stopColor="#bdeefa" stopOpacity=".29"/><stop offset=".68" stopColor="#91c9de" stopOpacity=".12"/><stop offset="1" stopColor="#84bcd6" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0823-violet"><stop offset="0" stopColor="#eac6ff" stopOpacity=".91"/><stop offset=".32" stopColor="#b66df9" stopOpacity=".55"/><stop offset="1" stopColor="#7633c8" stopOpacity="0"/></radialGradient>
  </defs>
  {imageUrls.map((imageUrl,index)=><image key={imageUrl} href={imageUrl}
    className={`market-v0829__frame ${index===active?'market-v0829__frame--active':''}`}
    width="960" height="536" x="0" y="0" preserveAspectRatio="none"/>)}
  <ellipse className="market-v0823__warm-light" cx="529" cy="51" rx="130" ry="97" fill="url(#market-v0823-warm)"/>
  <ellipse className="market-v0823__cold-light" cx="202" cy="67" rx="204" ry="99" fill="url(#market-v0823-cold)"/>
  <ellipse className="market-v0827__fluorescent-bloom" cx="189" cy="88" rx="160" ry="50" transform="rotate(13 189 88)" fill="url(#market-v0827-fluorescent)"/>
  {vendor.id==='scavenger'&&<g className="market-v0823__eyes">
   <ellipse cx="335" cy="121" rx="34" ry="26" fill="url(#market-v0823-violet)"/>
   <ellipse cx="384" cy="128" rx="25" ry="25" fill="url(#market-v0823-violet)"/>
   <path d="M322 110Q337 113 349 123L344 130Q332 126 322 120Z" fill="#b689f9" opacity=".31"/>
   <path d="M379 124L391 119L387 135L379 137Z" fill="#db83f4" opacity=".34"/>
  </g>}
 </svg>;
}
