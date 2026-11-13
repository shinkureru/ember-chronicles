import {getMarketShiftCountdown} from './marketShiftCountdown';

/** Render-only shift forecast, driven exclusively by state.world.minute.
 * Re-renders automatically after WORLD_CLOCK_TICK, actions and saved loads.
 * It does not create its own timer or modify the world clock.
 */
export default function MarketShiftCountdown({minute,compact=false}:{minute:number;compact?:boolean}){
 const shift=getMarketShiftCountdown(minute);
 if(compact)return <div className="market-v0826__countdown market-v0828__countdown" role="status"
  aria-label={`距離下一位商人 ${shift.nextVendorName} 到班還有 ${shift.remainingMinutes} 分鐘遊戲時間，預定 ${shift.nextStartClock} 換班`}>
  <span className="market-v0828__countdown-kicker">交班</span>
  <strong className="market-v0828__countdown-value">{shift.remainingClock}</strong>
  <span className="market-v0828__countdown-time">{shift.nextStartClock}</span>
  <small className="market-v0828__countdown-vendor" title={shift.nextVendorRole}>{shift.nextVendorName}</small>
 </div>;
 return <div className="market-v0826__countdown" role="status"
  aria-label={`距離黑市下次輪班還有 ${shift.remainingMinutes} 分鐘遊戲時間。下一班 ${shift.nextPhaseName} ${shift.nextStartClock}，商人 ${shift.nextVendorName}`}>
  <div className="market-v0826__countdown-main">
   <span>下一位商人</span>
   <strong title="依遊戲世界時間計算，非現實時間">{shift.remainingClock}</strong>
  </div>
  <div className="market-v0826__countdown-next">
   <span>{shift.nextStartClock} · {shift.nextPhaseName}</span>
   <b title={shift.nextVendorRole}>{shift.nextVendorName}</b>
  </div>
  <small>世界時間 · 換班時商品同步更新</small>
 </div>;
}
