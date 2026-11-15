import type {CSSProperties} from 'react';
import {meterPercent} from './ui/urbanUiTokens';
import {HUD_HEALTH_SPARKS,HUD_STAMINA_SPARKS} from './ui/hudParticles';

/** Keep original StatBar contract for all non-HUD usages. Liquid only runs
 * when the actual HUD explicitly opts in; game data stays untouched. */
export default function StatBar({value,max,color,label,showValue=true,urban=false,liquid=false}:{
 value:number;max:number;color:'red'|'mint'|'gold'|'violet';
 label:string;showValue?:boolean;urban?:boolean;liquid?:boolean;
}){
 const pct=meterPercent(value,max);
 const fluid=liquid&&urban&&(color==='red'||color==='mint');
 const field=color==='red'?HUD_HEALTH_SPARKS:HUD_STAMINA_SPARKS;
 const frameStyle=fluid?{'--v0849-frame-image':`url("${import.meta.env.BASE_URL}assets/ui/hud-frames-v0849.png")`} as CSSProperties:undefined;
 return <div className={`statbar ${urban?'statbar--urban':''} ${fluid?'statbar--v0849-liquid statbar--v0849-'+color+' statbar--v0853-live':''}`.trim()}
  data-hud-meter={fluid?color:undefined} data-hud-percent={fluid?pct:undefined}>
  <div className="statbar__label"><span>{label}</span>{showValue&&<strong>{value} <span className="statbar__divider">/ {max}</span></strong>}</div>
  <div className="statbar__track" style={frameStyle} role={fluid?'progressbar':undefined}
   aria-label={fluid?label:undefined} aria-valuemin={fluid?0:undefined}
   aria-valuemax={fluid?Math.max(1,max):undefined} aria-valuenow={fluid?Math.min(Math.max(0,value),Math.max(1,max)):undefined}>
   {fluid&&<span className="statbar__finial statbar__finial--start" aria-hidden="true"/>}
   <div className={`statbar__fill statbar__fill--${color}`} style={{width:`${pct}%`}}/>
   {fluid&&<span className="statbar__front" aria-hidden="true" style={{left:`${pct}%`,opacity:pct>0?1:0}}/>}
   {fluid&&<span className="statbar__particle-field" aria-hidden="true"
     style={{left:`clamp(3px, ${pct}%, calc(100% - 3px))`,opacity:pct>0?1:0}}>
    {field.map((spark,i)=><i className="statbar__particle" key={i} style={{
      '--v0849-dx':spark.dx+'px',
      '--v0849-dy':spark.dy+'px',
      '--v0849-turn':spark.turn+'deg',
      '--v0849-size':spark.size+'px',
      '--v0849-duration':spark.duration+'s',
      '--v0849-delay':spark.delay+'s',
    } as CSSProperties}/>)}
   </span>}
   {fluid&&<span className="statbar__finial statbar__finial--end" aria-hidden="true"/>}
  </div>
 </div>;
}
