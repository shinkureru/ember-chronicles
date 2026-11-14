import {useEffect} from 'react';

/** Ephemeral every-launch cover. No save flag: refreshing or cold-opening always shows it. */
export const BOOT_PRESENTATION_MS=1100;
export default function BootSplash({onComplete}:{onComplete:()=>void}){
 useEffect(()=>{
  const timer=window.setTimeout(onComplete,BOOT_PRESENTATION_MS);
  return()=>window.clearTimeout(timer);
 },[onComplete]);
 return <div className="shelter-boot" role="status" aria-live="polite" aria-label="餘燼紀事啟動中">
  <div className="shelter-boot__noise" aria-hidden="true"/>
  <div className="shelter-boot__center">
   <span className="shelter-boot__seal" aria-hidden="true">EC</span>
   <span className="shelter-boot__eyebrow">EMBER CHRONICLES</span>
   <h1>餘燼紀事</h1>
   <p>灰燼之下，仍有未完的故事。</p>
   <div className="shelter-boot__track" aria-hidden="true"><span/></div>
   <small>正在進入這座城市……</small>
  </div>
  <span className="shelter-boot__footer">SHELTER / PROLOGUE · 暫定開場畫面</span>
 </div>;
}
