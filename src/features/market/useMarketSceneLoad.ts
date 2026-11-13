import {useEffect,useState} from 'react';
import {BLACK_MARKET_SCENE_URL} from './BlackMarketSceneArt';

export type MarketSceneLoadState='loading'|'ready'|'error';
/** Waits for the actual local WebP to load and decode. All vendor and
 * inventory data already exist synchronously in GameContext; no fake delay.
 * A missing file surfaces a retryable error rather than a perpetual overlay.
 */
export function useMarketSceneLoad(){
 const [status,setStatus]=useState<MarketSceneLoadState>('loading');
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  let active=true;
  const img=new Image();
  const done=()=>{
   if(!active)return;
   window.clearTimeout(timeout);
   setStatus('ready');
  };
  const fail=()=>{
   if(!active)return;
   window.clearTimeout(timeout);
   setStatus('error');
  };
  const timeout=window.setTimeout(fail,15_000);
  img.onerror=fail;
  img.onload=()=>{
   if(typeof img.decode==='function'){
    void img.decode().then(done).catch(()=>img.naturalWidth>0?done():fail());
   }else done();
  };
  img.src=BLACK_MARKET_SCENE_URL;
  // Modern browsers also return true for an image already cached by a
  // previous market visit, including the immediate-complete path.
  if(img.complete&&img.naturalWidth>0)img.onload();
  return ()=>{
   active=false;
   img.onload=null;
   img.onerror=null;
   window.clearTimeout(timeout);
  };
 },[attempt]);
 return {
  status,
  retry:()=>{setStatus('loading');setAttempt(i=>i+1);},
 };
}
