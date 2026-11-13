import {useEffect,useState} from 'react';
import {getMarketSceneUrls} from './BlackMarketSceneArt';

export type MarketSceneLoadState='loading'|'ready'|'error';
type SceneLoadSnapshot={key:string;status:MarketSceneLoadState};

/** Preload and decode EVERY frame for the current vendor before showing the
 * market. Missing artwork is a valid empty scene. A broken referenced image
 * is a recoverable error, not an infinite spinner or another vendor's face.
 */
export function useMarketSceneLoad(sceneAssets:readonly string[]){
 const key=sceneAssets.join('|');
 const [attempt,setAttempt]=useState(0);
 const [snapshot,setSnapshot]=useState<SceneLoadSnapshot>(()=>({
  key,status:sceneAssets.length===0?'ready':'loading',
 }));
 useEffect(()=>{
  if(sceneAssets.length===0){setSnapshot({key,status:'ready'});return;}
  let active=true,settled=false,remaining=sceneAssets.length;
  setSnapshot({key,status:'loading'});
  const images:HTMLImageElement[]=[];
  const fail=()=>{
   if(!active||settled)return;
   settled=true;
   window.clearTimeout(timeout);
   setSnapshot({key,status:'error'});
  };
  const completeOne=()=>{
   if(!active||settled)return;
   remaining-=1;
   if(remaining===0){
    settled=true;
    window.clearTimeout(timeout);
    setSnapshot({key,status:'ready'});
   }
  };
  const timeout=window.setTimeout(fail,15_000);
  for(const url of getMarketSceneUrls(sceneAssets)){
   const img=new Image();
   images.push(img);
   let handled=false;
   const onLoaded=()=>{
    if(handled)return;
    handled=true;
    if(typeof img.decode==='function'){
     void img.decode().then(completeOne).catch(()=>img.naturalWidth>0?completeOne():fail());
    }else completeOne();
   };
   img.onload=onLoaded;
   img.onerror=fail;
   img.src=url;
   if(img.complete&&img.naturalWidth>0)onLoaded();
  }
  return ()=>{
   active=false;
   for(const img of images){img.onload=null;img.onerror=null;}
   window.clearTimeout(timeout);
  };
 },[key,attempt]);
 return {
  status:sceneAssets.length===0?'ready':snapshot.key===key?snapshot.status:'loading',
  retry:()=>{setSnapshot({key,status:'loading'});setAttempt(i=>i+1);},
 };
}
