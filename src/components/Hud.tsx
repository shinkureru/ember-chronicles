import { Clock3, Heart, Footprints, Sparkles, Thermometer, Moon, Utensils } from 'lucide-react';
import { useGame } from '../app/GameContext';
import { worldClock,worldPhase,bagWeight } from '../game/engine/rules';
import { PROFESSIONS } from '../game/data/professions';
import StatBar from './StatBar';
export default function Hud(){
  const {state:s}=useGame();const p=s.player;
  return <section className="hud" aria-label="玩家狀態">
    <div className="hud__top"><div className="hud__time"><Clock3 size={14}/><strong>第 {s.world.day} 天</strong> · {worldPhase(s.world.minute)} {worldClock(s.world.minute)}</div><div className="hud__weather"><Moon size={14}/> {s.world.weather==='clear'?'晴朗':'下雨'}</div></div>
    <div className="hud__bars"><StatBar value={p.health} max={p.maxHealth} label="生命 HP" color="red"/><StatBar value={p.stamina} max={p.maxStamina} label="體力" color="mint"/></div>
    <div className="hud__chips">
      <span><Heart size={13}/>膽量 {p.courage}</span>
      <span><Utensils size={13}/>飢餓 {p.hunger}</span>
      <span><Moon size={13}/>疲勞 {p.fatigue}</span>
      <span><Thermometer size={13}/>{p.temperature.toFixed(1)}°</span>
      <span><Footprints size={13}/>{bagWeight(s.bag).toFixed(1)} kg</span>
      {s.profession&&<span className="hud__resource"><Sparkles size={13}/>{PROFESSIONS[s.profession].resourceName} {p.resource}/{p.maxResource}</span>}
    </div>
  </section>;
}
