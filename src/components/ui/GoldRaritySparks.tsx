import type {CSSProperties} from 'react';
/** Both supplied image silhouettes are vector traced in SVG, then tinted to
 * gold. A deterministic irregular field ensures independent motion without
 * Math.random during render, timers or layout reads. */
const particles=[
 {x:5,y:11,dx:-12,dy:-10,delay:-1.7,duration:6.1,size:21},
 {x:97,y:18,dx:11,dy:-13,delay:-4.2,duration:7.3,size:17},
 {x:13,y:79,dx:-8,dy:10,delay:-5.9,duration:8.1,size:19},
 {x:93,y:83,dx:10,dy:9,delay:-.9,duration:5.7,size:22},
 {x:52,y:0,dx:2,dy:-13,delay:-3.6,duration:6.7,size:17},
 {x:49,y:98,dx:-3,dy:12,delay:-2.8,duration:7.9,size:18},
 {x:2,y:50,dx:-13,dy:-2,delay:-6.8,duration:9.2,size:20},
 {x:98,y:51,dx:12,dy:1,delay:-3.2,duration:8.6,size:17},
] as const;
export default function GoldRaritySparks(){
 return <span className="market-gold-sparks" aria-hidden="true">
  <span className="market-gold-ripple market-gold-ripple--one"/>
  <span className="market-gold-ripple market-gold-ripple--two"/>
  {particles.map((p,i)=><i key={i} className={'market-gold-spark market-gold-spark--'+(i%2?'b':'a')}
   style={{
    '--spark-x':p.x+'%','--spark-y':p.y+'%',
    '--spark-dx':p.dx+'px','--spark-dy':p.dy+'px',
    '--spark-mid-x':(p.dx*.42).toFixed(2)+'px','--spark-mid-y':(p.dy*.42).toFixed(2)+'px',
    '--spark-late-x':(p.dx*.85).toFixed(2)+'px','--spark-late-y':(p.dy*.85).toFixed(2)+'px',
    '--spark-delay':p.delay+'s','--spark-duration':p.duration+'s',
    '--spark-size':p.size+'px'
   } as CSSProperties}/>)}
 </span>;
}
