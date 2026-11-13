import {useEffect,useState} from 'react';
import type {MarketVendor} from '../../game/data/marketVendors';
import {getMarketSceneLighting,WELD_LIGHT} from './marketSceneLighting';

/** Public art URLs respect Vite BASE_URL (GitHub Pages project subpath). */
export const BLACK_MARKET_SCENE_URL=`${import.meta.env.BASE_URL}black-market-merchant.webp`;
export const MARKET_SCENE_ROTATION_MS=12_000;
export const getMarketSceneUrls=(sceneAssets:readonly string[]):string[]=>
 sceneAssets.map(filename=>`${import.meta.env.BASE_URL}${filename}`);

/** One scene group = one original image + ITS anchored light overlays.
 * By crossfading the group rather than just the image, portrait eyes and
 * the welding sparks can never illuminate a different incoming picture.
 * CSS controls the scene transition; reduced motion selects the first
 * picture and disables glints. No external canvas/timers are needed.
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
 return <svg className="market-v0823__art market-v0829__art market-v0830__art" viewBox="0 0 960 536"
  preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
  <defs>
   <radialGradient id="market-v0823-warm"><stop offset="0" stopColor="#ffeab4" stopOpacity=".49"/><stop offset=".42" stopColor="#ffbe66" stopOpacity=".18"/><stop offset="1" stopColor="#ffbe66" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0823-cold"><stop offset="0" stopColor="#b7eaf7" stopOpacity=".28"/><stop offset=".53" stopColor="#6bb5d5" stopOpacity=".12"/><stop offset="1" stopColor="#6bb5d5" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0827-fluorescent"><stop offset="0" stopColor="#efffff" stopOpacity=".48"/><stop offset=".27" stopColor="#bdeefa" stopOpacity=".29"/><stop offset=".68" stopColor="#91c9de" stopOpacity=".12"/><stop offset="1" stopColor="#84bcd6" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0823-violet"><stop offset="0" stopColor="#eac6ff" stopOpacity=".91"/><stop offset=".32" stopColor="#b66df9" stopOpacity=".55"/><stop offset="1" stopColor="#7633c8" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0830-weld-halo"><stop offset="0" stopColor="#f4ffff" stopOpacity=".75"/><stop offset=".22" stopColor="#a4eafa" stopOpacity=".48"/><stop offset=".65" stopColor="#53aad7" stopOpacity=".13"/><stop offset="1" stopColor="#47a9c5" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0830-weld-core"><stop offset="0" stopColor="#fffefa" stopOpacity=".96"/><stop offset=".42" stopColor="#bceeff" stopOpacity=".65"/><stop offset="1" stopColor="#87d5ef" stopOpacity="0"/></radialGradient>
  </defs>
  {imageUrls.map((imageUrl,index)=>{
   const lighting=getMarketSceneLighting(sceneAssets[index]??'');
   return <g key={imageUrl}
    className={`market-v0829__frame market-v0830__scene-layer ${index===active?'market-v0829__frame--active':''}`}>
    <image href={imageUrl} width="960" height="536" x="0" y="0" preserveAspectRatio="none"/>
    {lighting!=='ambient'&&<>
     <ellipse className="market-v0823__warm-light market-v0830__pendant-glow"
      cx="529" cy="51" rx="130" ry="97" fill="url(#market-v0823-warm)"/>
     <ellipse className="market-v0823__cold-light market-v0830__tube-glow"
      cx="202" cy="67" rx="204" ry="99" fill="url(#market-v0823-cold)"/>
     <ellipse className="market-v0827__fluorescent-bloom market-v0830__tube-bloom"
      cx="189" cy="88" rx="160" ry="50" transform="rotate(13 189 88)"
      fill="url(#market-v0827-fluorescent)"/>
    </>}
    {vendor.id==='scavenger'&&lighting==='portrait'&&<g className="market-v0823__eyes">
     <ellipse cx="335" cy="121" rx="34" ry="26" fill="url(#market-v0823-violet)"/>
     <ellipse cx="384" cy="128" rx="25" ry="25" fill="url(#market-v0823-violet)"/>
     <path d="M322 110Q337 113 349 123L344 130Q332 126 322 120Z" fill="#b689f9" opacity=".31"/>
     <path d="M379 124L391 119L387 135L379 137Z" fill="#db83f4" opacity=".34"/>
    </g>}
    {vendor.id==='scavenger'&&lighting==='welding'&&<g className="market-v0830__welding" pointerEvents="none">
     <ellipse className="market-v0830__weld-flare" cx={WELD_LIGHT.x} cy={WELD_LIGHT.y}
      rx="119" ry="94" fill="url(#market-v0830-weld-halo)"/>
     <ellipse className="market-v0830__weld-center" cx={WELD_LIGHT.x} cy={WELD_LIGHT.y}
      rx="24" ry="19" fill="url(#market-v0830-weld-core)"/>
     <g className="market-v0830__weld-sparks" fill="none" stroke="#f8f6df"
       strokeWidth="2" strokeLinecap="round">
      <path d="M291 271l-12 -29M307 272l24 -23M285 280l-34 -9M309 287l28 12"/>
      <path d="M295 275l-4 -36M301 278l35 -5M286 286l-19 24" stroke="#96e7ff" strokeWidth="1.8"/>
      <circle cx="320" cy="257" r="2" fill="#fff5ca" stroke="none"/>
      <circle cx="275" cy="254" r="1.8" fill="#e4faff" stroke="none"/>
     </g>
    </g>}
   </g>;
  })}
 </svg>;
}
