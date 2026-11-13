import { AlertTriangle, ArrowLeft, Footprints } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { retreatPreview } from '../../game/engine/rules';
import {HUNGER_DEFEAT_COST} from '../../game/engine/hungerCosts';
export default function RetreatDialog({onClose}:{onClose:()=>void}){
 const {state,dispatch}=useGame();const r=retreatPreview(state);
 return <div className="overlay" role="presentation"><div className="modal-panel" role="alertdialog" aria-modal="true" aria-labelledby="retreat-title" aria-describedby="retreat-description">
  <div className="modal-panel__icon"><AlertTriangle size={25}/></div><span className="eyebrow">WITHDRAW / CONSEQUENCE</span><h2 id="retreat-title">確定要撤退嗎？</h2><p id="retreat-description">我真的要現在離開嗎？這會留下新的心理負擔，而且我還沒看清楚所有線索。</p>
  <div className="modal-panel__line"><span>逃離成功率</span><strong>{r.chance}%</strong></div>
  <div className="modal-panel__line"><span>確定代價</span><strong>體力 -{r.staminaCost} ／ 膽量 -{r.courageLoss} ／ 飢餓 +{r.hungerCost}（{state.player.hunger}→{r.projectedHunger}）</strong></div>
  <div className="warning-panel"><AlertTriangle size={15}/><span>{r.hungerWarning&&<strong>{r.hungerWarning.title}：{r.hungerWarning.detail}</strong>} 撤退失敗並戰敗時，額外飢餓 +{HUNGER_DEFEAT_COST}。撤退後可能在再次面對此 NPC 時產生暫時畏懼。你會錯過尚未搜刮的物資；撤退情報也少於真正戰敗。失敗的撤退嘗試可能直接導致戰敗。</span></div>
  <p className="fine-print">這段提醒每次撤退都會出現，無法設定永久跳過。</p>
  <div className="modal-panel__actions"><button className="secondary-button" type="button" onClick={onClose}><ArrowLeft size={16}/>留下來</button><button className="danger-button" type="button" onClick={()=>{dispatch({type:'RETREAT'});onClose()}}><Footprints size={16}/>承擔代價，撤退</button></div>
 </div></div>;
}
