import { useEffect, useState } from 'react';
import { getAmbientThoughts } from '../../game/data/ambientThoughts';
import type { GameState } from '../../game/types';

type Whisper={id:number;text:string;x:number;y:number;tilt:number};
/** Sparse, context-aware first-person OS. Floats above the scene without consuming layout.
 * No external AI required, and nothing blocks pointer input. */
const contextualThoughts=(s:GameState):string[]=>{
 const lines=getAmbientThoughts(s.sceneId,s.attempt,s.world.minute,12,s.stageId);
 if(s.player.courage<40)lines.push('我的心跳得太快了。我得控制住。');
 if(s.player.health<=Math.max(2,Math.ceil(s.player.maxHealth*.35)))lines.push('傷口還在疼，我不能再硬撐。');
 if(s.player.stamina<=Math.max(2,Math.ceil(s.player.maxStamina*.25)))lines.push('我已經快沒力氣了……先想清楚。');
 if(s.player.hunger>70)lines.push('肚子空得難受，我需要找些吃的。');
 if(s.world.weather==='rain')lines.push('雨聲讓我聽不清遠處的腳步。');
 if(s.sceneId==='confrontation'&&s.npc.hostility>55)lines.push('他的眼神越來越不對勁……');
 if(s.sceneId==='loot'&&s.bag&&Object.keys(s.bag).length>9)lines.push('背包愈來愈重，我得快點離開。');
 return lines;
};
export default function ThoughtWhisper({state,paused}:{state:GameState;paused:boolean}){
 const [visible,setVisible]=useState<Whisper[]>([]);
 const scene=state.sceneId,attempt=state.attempt,minute=Math.floor(state.world.minute/60);
 const danger=state.player.health<=Math.ceil(state.player.maxHealth*.35)||state.player.courage<40;
 useEffect(()=>{
  setVisible([]);
  if(paused||state.mode!=='adventure')return;
  let active=true,sequence=0;
  let lastText='';
  const timers:ReturnType<typeof setTimeout>[]=[];
  const schedule=(delay:number)=>{
   const timer=setTimeout(()=>{
    if(!active)return;
    const pool=contextualThoughts(state);
    const options=[...new Set(pool)].filter(line=>line!==lastText);
    const text=options[Math.floor(Math.random()*options.length)]??pool[0]??'我得小心一點。';
    lastText=text;
    const whisper:Whisper={id:++sequence,text,x:8+Math.random()*47,y:15+Math.random()*66,tilt:-8+Math.random()*15};
    setVisible([whisper]);
    timers.push(setTimeout(()=>{if(active)setVisible([])},3900));
    // One thought at a time, with a longer clear gap before the next.
    schedule(19000+Math.random()*9000);
   },delay);
   timers.push(timer);
  };
  schedule(6500+Math.random()*5500);
  return()=>{active=false;timers.forEach(clearTimeout);};
 // Reseed only for a new location, attempt, hour or relevant health thresholds.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[scene,attempt,minute,danger,paused,state.mode]);
 if(!visible.length)return null;
 return <div className="thought-whisper-layer" aria-hidden="true">
  {visible.map((whisper,index)=><span className="thought-whisper" key={whisper.id}
    style={{left:`${whisper.x}%`,top:`${whisper.y}%`,transform:`rotate(${whisper.tilt}deg)`,animationDelay:`${index*.4}s`}}>
    「{whisper.text}」
  </span>)}
 </div>;
}
