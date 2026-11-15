import type {CSSProperties} from 'react';
import {meterPercent,safeMeterValue,type UrbanMeterTone} from './urbanUiTokens';

interface LuminousProgressBarProps{
 value:number;
 max:number;
 label:string;
 tone?:UrbanMeterTone;
 animated?:boolean;
 particles?:boolean;
 className?:string;
}

/** Uses three stationary DOM sparks and CSS opacity/scale transforms only.
 * No RAF, timers, canvas or external transparent movie download.
 * Decorative particles disappear for prefers-reduced-motion.
 */
export default function LuminousProgressBar({
 value,max,label,tone='health',animated=true,particles=true,className=''
}:LuminousProgressBarProps){
 const current=safeMeterValue(value),limit=safeMeterValue(max);
 const percent=meterPercent(value,max);
 const overcap=limit>0&&current>limit;
 const trackStyle={'--urban-meter-fill':percent+'%'} as CSSProperties;
 return <div className={`urban-meter urban-meter--${tone} ${animated?'is-animated':''} ${particles?'has-particles':''} ${overcap?'is-overcap':''} ${className}`.trim()}
  data-urban-meter={tone} data-percent={percent}>
  <div className="urban-meter__heading"><span>{label}</span><strong>{current} <span>/ {limit}</span></strong></div>
  <div className="urban-meter__body">
   <span className="urban-meter__finial urban-meter__finial--start" aria-hidden="true"/>
   <div className="urban-meter__track" style={trackStyle}
    role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={Math.max(1,limit)}
    aria-valuenow={Math.min(current,Math.max(1,limit))} aria-valuetext={`${current} / ${limit}`}>
    <span className="urban-meter__fill" aria-hidden="true"/>
    <span className="urban-meter__front" aria-hidden="true">
     <span className="urban-meter__spark urban-meter__spark--one"/>
     <span className="urban-meter__spark urban-meter__spark--two"/>
     <span className="urban-meter__spark urban-meter__spark--three"/>
    </span>
   </div>
   <span className="urban-meter__finial urban-meter__finial--end" aria-hidden="true"/>
  </div>
  {overcap&&<small className="urban-meter__overcap" aria-label="數值超過一般上限">突破上限 +{current-limit}</small>}
 </div>;
}
