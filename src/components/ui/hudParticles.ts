/** Stable seeded scattering: visually non-repeating bursts without timers,
 * Math.random during render or hydration drift. Independent HP/ST fields.
 * Former UI laboratory: three tiny sparks. Live HUD: twelve per bar. */
export interface HudSpark{dx:number;dy:number;turn:number;size:number;duration:number;delay:number}
export function makeHudSparks(seed:number,count=12):readonly HudSpark[]{
 let value=seed>>>0;
 const rand=()=>{
  value^=value<<13;value^=value>>>17;value^=value<<5;
  return (value>>>0)/4294967296;
 };
 return Array.from({length:count},()=>({
  dx:Math.round(rand()*35-17),
  dy:Math.round(rand()*18-11),
  turn:Math.round(rand()*100-50),
  size:Number((.8+rand()*1.05).toFixed(2)),
  duration:Number((1.35+rand()*2.7).toFixed(2)),
  delay:Number((-rand()*7.2).toFixed(2)),
 }));
}
export const HUD_HEALTH_SPARKS=Object.freeze(makeHudSparks(0x49ba1938));
export const HUD_STAMINA_SPARKS=Object.freeze(makeHudSparks(0xc0219e73));
