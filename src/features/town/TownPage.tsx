import { ArrowRight, Backpack, BedDouble, BookMarked, Clock3, Layers3, Store, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGame } from '../../app/GameContext';
import { playCue } from '../../audio/sound';
import { worldPhase,worldClock } from '../../game/engine/rules';
export default function TownPage(){
 const {state:s,dispatch}=useGame();
 return <div className="page-stack town-page viewport-page">
  <section className="page-heading"><span className="eyebrow">SAFE ZONE / TOWN</span><h1>舊街避難所</h1><p>「城裡的燈一盞接著一盞熄掉。我至少得找個能把東西放下的地方。」</p></section>
  <div className="town-visual"><span>LAST SHELTER / 07</span><div className="town-visual__structure"/><small>第 {s.world.day} 日　{worldPhase(s.world.minute)} {worldClock(s.world.minute)}</small></div>
  <section className="surface-card"><h3><BedDouble size={17}/>租下簡易床位</h3><p>我可以休息兩個小時。生命、體力與疲勞會改善，但必須支付 15 枚舊幣。</p>
   <div className="town-rest-preview"><span><Clock3 size={14}/> 世界時間 +120 分鐘</span><span>體力 +35</span><span>疲勞 -22</span><span>生命 +12</span></div>
   <button className="primary-button primary-button--full" disabled={s.mode==='adventure'||s.economy.coins<15} onClick={()=>{dispatch({type:'REST_TOWN'});playCue('confirm')}}>休息（15 舊幣）<ArrowRight size={16}/></button>
   {s.economy.coins<15&&<p className="muted">身上的錢不夠了。</p>}
  </section>
  <div className="town-links">
   <Link to="/warehouse"><Warehouse/><span><strong>物資倉庫</strong><small>整理撿回來的裝備與戰利品</small></span><ArrowRight/></Link>
   <Link to="/black-market"><Store/><span><strong>地下交易所</strong><small>昂貴的卡牌、低聲的交易與隱藏人脈</small></span><ArrowRight/></Link>
   <Link to="/character"><BookMarked/><span><strong>人物檔案</strong><small>檢查全身裝備、屬性與記憶</small></span><ArrowRight/></Link>
   <Link to="/cards"><Layers3/><span><strong>牌組收藏</strong><small>整理技能與重複卡</small></span><ArrowRight/></Link>
   <Link to="/warehouse"><Backpack/><span><strong>出發前準備</strong><small>管理負重與常用道具</small></span><ArrowRight/></Link>
  </div>
  <Link to="/" className="secondary-button">返回第一章地圖</Link>
 </div>;
}
