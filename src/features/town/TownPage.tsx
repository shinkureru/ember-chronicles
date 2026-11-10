import { ArrowRight, BedDouble, Clock3 } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { playCue } from '../../audio/sound';
import { worldPhase,worldClock,worldPhaseToken } from '../../game/engine/rules';
export default function TownPage(){
 const {state:s,dispatch}=useGame();
 return <div className="page-stack town-page viewport-page">
  <section className="page-heading"><span className="eyebrow">SAFE ZONE / TOWN</span><h1>舊街避難所</h1><p>「城裡的燈一盞接著一盞熄掉。我至少得找個能把東西放下的地方。」</p></section>
  <div className={`town-visual phase--${worldPhaseToken(s.world.minute)}`}><span>LAST SHELTER / 07</span><div className="town-visual__structure"/><small>第 {s.world.day} 日　{worldPhase(s.world.minute)} {worldClock(s.world.minute)}</small></div>
  <section className="surface-card"><h3><BedDouble size={17}/>租下簡易床位</h3><p>我可以休息兩個小時。生命、體力與疲勞會改善，但必須支付 15 枚舊幣。</p>
   <div className="town-rest-preview"><span><Clock3 size={14}/> 世界時間 +120 分鐘</span><span>體力 +35</span><span>疲勞 -22</span><span>生命 +12</span></div>
   <button className="primary-button primary-button--full" disabled={s.mode==='adventure'||s.economy.coins<15} onClick={()=>{dispatch({type:'REST_TOWN'});playCue('confirm')}}>休息（15 舊幣）<ArrowRight size={16}/></button>
   {s.economy.coins<15&&<p className="muted">身上的錢不夠了。</p>}
  </section>
  <p className="town-return-hint">需要整理物資、交易或檢視裝備時，請回到主地圖選擇對應地點。</p>
 </div>;
}
