import type { ChangeEvent } from 'react';
import { Activity, FlaskConical, RotateCcw } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import type { GameAction } from '../../game/engine/resolve';
export default function DevPage(){
 const {state:s,dispatch}=useGame();
 if(!import.meta.env.DEV)return <section className="surface-card">開發者面板僅在本機開發模式顯示。</section>;
 const inputs:{label:string;kind:Extract<GameAction,{type:'DEBUG'}>['patch']['kind'];value:number;max:number}[]=[
  {label:'生命',kind:'health',value:s.player.health,max:s.player.maxHealth},
  {label:'體力',kind:'stamina',value:s.player.stamina,max:s.player.maxStamina},
  {label:'膽量',kind:'courage',value:s.player.courage,max:100},
  {label:'職業資源',kind:'resource',value:s.player.resource,max:s.player.maxResource},
  {label:'世界分鐘',kind:'minute',value:s.world.minute,max:1439},
 ];
 return <div className="page-stack"><section className="page-heading"><span className="eyebrow">DEVELOPMENT ONLY</span><h1><FlaskConical size={23}/> 開發測試</h1><p>在本機快速調整角色狀態，驗證行動卡數值與存檔。正式版本不會顯示。</p></section>
 <section className="surface-card">{inputs.map(input=><label className="debug-slider" key={input.kind}><span>{input.label} <strong>{input.value}</strong></span><input type="range" min={input.kind==='health'?1:0} max={input.max} value={input.value} onChange={(e:ChangeEvent<HTMLInputElement>)=>dispatch({type:'DEBUG',patch:{kind:input.kind,value:Number(e.target.value)}})}/></label>)}</section>
 <section className="surface-card"><h3><Activity size={18}/>目前遊戲狀態</h3><pre className="debug-json">{JSON.stringify({mode:s.mode,scene:s.sceneId,attempt:s.attempt,hostility:s.npc.hostility,adaptations:s.npc.adaptations,flags:s.flags,clues:s.clues,bag:s.bag},null,2)}</pre><button type="button" className="danger-button" onClick={()=>{if(window.confirm('確定清除這個瀏覽器的全部原型進度嗎？'))dispatch({type:'RESET'})}}><RotateCcw size={16}/>刪除本機存檔</button></section></div>;
}
