import {Link} from 'react-router-dom';
import {LoaderCircle,RefreshCw,ArrowLeft} from 'lucide-react';
import type {MarketSceneLoadState} from './useMarketSceneLoad';

/** Full viewport cover on entry. Does not mount the trading UI before the
 * merchant scene is decoded; failures offer explicit retry/navigation.
 */
export default function MarketLoadingScreen({
 status,onRetry,
}:{status:Exclude<MarketSceneLoadState,'ready'>;onRetry:()=>void}){
 return <div className="market-v0825__loading" role={status==='error'?'alert':'status'}
  aria-live="polite" aria-busy={status==='loading'}>
  <div className="market-v0825__loading-content">
   <span className="market-v0825__loading-kicker">UNDERGROUND / SECRET EXCHANGE</span>
   {status==='loading'?<LoaderCircle className="market-v0825__loading-icon" size={35} aria-hidden="true"/>:
    <RefreshCw className="market-v0825__error-icon" size={35} aria-hidden="true"/>}
   <strong>{status==='loading'?'正在確認交易現場…':'無法載入黑市場景'}</strong>
   <p>{status==='loading'?'正在載入商人、物品資料與場景圖片。':'場景圖片暫時無法讀取。請重新嘗試，或返回主畫面。'}</p>
   {status==='error'&&<div className="market-v0825__loading-actions">
    <button type="button" onClick={onRetry}><RefreshCw size={14}/>重新載入</button>
    <Link to="/"><ArrowLeft size={14}/>返回主畫面</Link>
   </div>}
  </div>
 </div>;
}
