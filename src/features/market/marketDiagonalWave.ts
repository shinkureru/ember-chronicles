/** Responsive diagonal MARKET CARD wave with no browser or game-state reads.
 * The grid is 3 columns at regular widths, 2 columns at <=375px.
 * Same row+column phase moves together; overlapping phases look like a
 * moving diagonal region, rather than one-by-one sequence.
 */
export type MarketWaveColumns=2|3;
export const MARKET_WAVE_STEP_MS=41;
export const MARKET_WAVE_DURATION_MS=360;
export const MARKET_WAVE_MAX_PHASE=12;
export const MARKET_WAVE_WINDOW_MS=
 MARKET_WAVE_MAX_PHASE*MARKET_WAVE_STEP_MS+MARKET_WAVE_DURATION_MS+40;

export function marketWavePhase(index:number,columns:MarketWaveColumns):number{
 if(!Number.isInteger(index)||index<0)return 0;
 return Math.min(MARKET_WAVE_MAX_PHASE,Math.floor(index/columns)+(index%columns));
}
export const marketWaveDelay=(index:number,columns:MarketWaveColumns):number=>
 marketWavePhase(index,columns)*MARKET_WAVE_STEP_MS;
