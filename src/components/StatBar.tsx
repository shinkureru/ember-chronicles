export default function StatBar({value,max,color,label,showValue=true}:{value:number;max:number;color:'red'|'mint'|'gold'|'violet';label:string;showValue?:boolean}){
  const pct=Math.max(0,Math.min(100,value/Math.max(max,1)*100));
  return <div className="statbar">
    <div className="statbar__label"><span>{label}</span>{showValue&&<strong>{value} <span className="statbar__divider">/ {max}</span></strong>}</div>
    <div className="statbar__track"><div className={`statbar__fill statbar__fill--${color}`} style={{width:`${pct}%`}}/></div>
  </div>;
}
