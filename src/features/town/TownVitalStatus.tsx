import {useState} from 'react';
import {Activity,AlertTriangle,Bandage,ChevronDown,ChevronUp,HeartPulse,Moon,ShieldAlert,Skull,Thermometer,Utensils,Zap} from 'lucide-react';
import type {GameState} from '../../game/types';

const toPercent=(current:number,max:number)=>Math.max(0,Math.min(100,Math.round(current/Math.max(1,max)*100)));
const conditionInfo=[
 {id:'wounds',label:'外傷',Icon:Bandage,detail:'敵方實際命中會累積外傷。可用繃帶、急救包或地下診所清創。現行規則尚未直接扣除生命上限。'},
 {id:'infection',label:'感染',Icon:ShieldAlert,detail:'感染層數會保留在角色狀態中，可由診所感染治療或抗感染用品降低。目前不會自動扣除生命。'},
 {id:'poisoning',label:'中毒',Icon:Skull,detail:'中毒需要解毒針或地下診所處理；現行規則尚未設計持續扣血，層數會被保留。'},
 {id:'illness',label:'疾病',Icon:Thermometer,detail:'疾病需要診所處理；疾病診療可以降低層數並減少疲勞。目前沒有額外的行動成功率懲罰。'},
] as const;
export default function TownVitalStatus({state:s}:{state:GameState}){
 const [open,setOpen]=useState(false);
 const c={wounds:0,infection:0,poisoning:0,illness:0,...s.conditions};
 const totals=c.wounds+c.infection+c.poisoning+c.illness;
 const bars=[
  {name:'生命 HP',Icon:HeartPulse,now:s.player.health,max:s.player.maxHealth,type:'hp',detail:'當前生命；降到 0 會導致戰敗'},
  {name:'體力 ST',Icon:Zap,now:s.player.stamina,max:s.player.maxStamina,type:'st',detail:'執行行動的體力；不足時判定會受到懲罰'},
  {name:'飢餓',Icon:Utensils,now:s.player.hunger,max:100,type:'hunger',detail:'越高代表越飢餓；探索、撤退及服務會增加，休息與診療消耗較少；70／90／100 為風險門檻；高飢餓會降低行動成功率，可透過進食降低'},
  {name:'疲勞',Icon:Moon,now:s.player.fatigue,max:100,type:'fatigue',detail:'越高代表越疲勞；50 點起有判定懲罰，70 點以上更嚴重'},
 ] as const;
 return <section className="town-vitals" aria-label="角色生命、體力、飢餓與疲勞狀態">
  <div className="town-vitals__grid">
   {bars.map(({name,Icon,now,max,type,detail})=><div className={`town-vitals__stat town-vitals__stat--${type}`} key={type} title={detail}>
    <div className="town-vitals__label"><span><Icon size={15}/>{name}</span><strong>{now}<small> / {max}</small></strong></div>
    <div className="town-vitals__track" role="progressbar" aria-label={name} aria-valuemin={0} aria-valuemax={max} aria-valuenow={now}>
     <i style={{width:`${toPercent(now,max)}%`}}/>
    </div>
   </div>)}
  </div>
  <div className="town-vitals__conditions">
   <button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-controls="town-conditions-details">
    <span><Activity size={15}/>身體負面狀態 <strong>{totals>0?`共 ${totals} 層`:'目前無異常'}</strong></span>
    <span>{open?'收合':'查看影響'}{open?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</span>
   </button>
   <div className="town-vitals__badges" aria-label="負面狀態總覽">
    {conditionInfo.map(({id,label,Icon})=><span key={id} className={c[id]>0?'is-active':''}><Icon size={13}/>{label} {c[id]}</span>)}
   </div>
   {open&&<div id="town-conditions-details" className="town-vitals__detail">
    {conditionInfo.map(({id,label,Icon,detail})=><article key={id}><div><Icon size={16}/><strong>{label}</strong><span>{c[id]} 層</span></div><p>{detail}</p></article>)}
    <p className="town-vitals__hint"><AlertTriangle size={14}/>詳細說明以目前真正實作的遊戲效果為準；日後新增負面效果時會同步更新。</p>
   </div>}
  </div>
 </section>;
}
