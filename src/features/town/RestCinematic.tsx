import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {BedDouble,Clock3,HeartPulse,Moon,Sunrise,X} from 'lucide-react';
import {playRestLullaby,type RestLullabyKind} from '../../audio/sound';
import {TOWN_SERVICES} from '../../game/data/town';

export const REST_CINEMATIC_MS=4850;
/** A visually distinct, non-looping scene for each paid rest. The actual
 * GameState settlement is dispatched by the confirmation handler once only. */
export default function RestCinematic({kind,onFinish}:{kind:RestLullabyKind;onFinish:()=>void}){
 const [complete,setComplete]=useState(false);
 const name=TOWN_SERVICES.find(service=>service.id===kind)?.name??'休息';
 useEffect(()=>{
  const stopMusic=playRestLullaby(kind);
  const ready=window.setTimeout(()=>setComplete(true),REST_CINEMATIC_MS-500);
  const done=window.setTimeout(onFinish,REST_CINEMATIC_MS);
  return()=>{stopMusic();window.clearTimeout(ready);window.clearTimeout(done)};
 },[kind,onFinish]);
 const scene=kind==='rest_short'?'短暫閉目':kind==='rest_private'?'安穩入眠':'短暫安歇';
 return createPortal(<div className={`rest-cinematic rest-cinematic--${kind}`} role="dialog" aria-modal="true" aria-label={`${name}休息動畫`}>
  <div className="rest-cinematic__sky" aria-hidden="true"><span className="rest-cinematic__moon"/><span className="rest-cinematic__glow"/></div>
  <div className="rest-cinematic__room" aria-hidden="true">
   <span className="rest-cinematic__window"/><span className="rest-cinematic__wall"/>
   <span className="rest-cinematic__bed"/><span className="rest-cinematic__pillow"/>
   <span className="rest-cinematic__figure"><i className="rest-cinematic__head"/><i className="rest-cinematic__body"/></span>
   <span className="rest-cinematic__cover"/>
   <span className="rest-cinematic__lamp"/>
  </div>
  <div className="rest-cinematic__copy">
   {complete?<Sunrise size={24}/>:kind==='rest_short'?<Moon size={24}/>:<BedDouble size={24}/>}
   <small>EMBER CHRONICLES / REST</small>
   <h2>{complete?'醒來之後，還要繼續前進。':scene}</h2>
   <p>{kind==='rest_private'?'屋內的燈光慢慢暗下，終於能暫時忘記門外的聲音。':
    kind==='rest_short'?'只閉上眼睛一會兒，讓呼吸與思緒稍微平靜。':
    '床墊隨著呼吸輕輕起伏，世界的喧鬧逐漸遠去。'}</p>
   <div className="rest-cinematic__progress" role="progressbar" aria-label="休息進行中" aria-valuemin={0} aria-valuemax={100} aria-valuenow={complete?100:50}><i/></div>
   <span><HeartPulse size={14}/> 生命與體力已按選擇的休息方案結算</span>
  </div>
  <button type="button" className="rest-cinematic__skip" onClick={onFinish}><X size={15}/>跳過動畫</button>
  <div className="rest-cinematic__time" aria-hidden="true"><Clock3 size={16}/>時間正在流逝</div>
 </div>,document.body);
}
