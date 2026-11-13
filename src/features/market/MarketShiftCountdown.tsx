import {getMarketShiftCountdown} from './marketShiftCountdown';

/** Render-only shift forecast, driven exclusively by state.world.minute.
 * Re-renders automatically after WORLD_CLOCK_TICK, actions and saved loads.
 * It does not create its own timer or modify the world clock.
 */
export default function MarketShiftCountdown({minute}:{minute:number}){
 const shift=getMarketShiftCountdown(minute);
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
