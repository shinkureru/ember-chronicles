import { useEffect, useRef, useState } from 'react';
/** Always visible above the combat scene, with a hit response driven by committed HP. */
export default function EnemyPresence({health,maxHealth,name}:{health:number;maxHealth:number;name:string}){
 const previous=useRef(health);
 const [impact,setImpact]=useState<{id:number;damage:number}|null>(null);
 useEffect(()=>{
   const damage=Math.max(0,previous.current-health);
   previous.current=health;
   if(damage<=0)return;
   setImpact({id:Date.now(),damage});
   const timer=window.setTimeout(()=>setImpact(null),900);
   return()=>window.clearTimeout(timer);
 },[health]);
 const injured=health<maxHealth;
 return <div className="enemy-presence" aria-label={`${name}，生命值 ${health}/${maxHealth}`}>
   <div className={`enemy-presence__model ${impact?'enemy-presence__model--struck':''} ${health<=0?'enemy-presence__model--fallen':''}`} data-combat-target="true">
    <svg viewBox="0 0 220 310" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="enemyJacket" x1="0" x2="1"><stop offset="0" stopColor="#161616"/><stop offset=".45" stopColor="#484848"/><stop offset="1" stopColor="#101010"/></linearGradient>
        <linearGradient id="enemyFace" x1="0" x2="1"><stop offset="0" stopColor="#353535"/><stop offset="1" stopColor="#727272"/></linearGradient>
      </defs>
      <ellipse cx="111" cy="303" rx="75" ry="7" fill="#111" opacity=".7"/>
      <path d="M80 174 L104 176 L108 286 L78 290 Z M116 175 L139 174 L149 289 L116 286 Z" fill="#151515" stroke="#383838" strokeWidth="3"/>
      <path d="M72 83 Q110 69 149 85 L162 173 Q111 193 61 173 Z" fill="url(#enemyJacket)" stroke="#727272" strokeWidth="3"/>
      <path d="M71 91 Q45 126 51 170 L71 182 L89 116 Z M148 88 Q179 126 172 174 L152 183 L129 115 Z" fill="#333" stroke="#5a5a5a" strokeWidth="3"/>
      <path d="M95 82 L107 111 L122 81 L133 83 L112 146 L83 90 Z" fill="#191919" stroke="#858585" strokeWidth="2"/>
      <path d="M90 21 Q112 7 132 29 L135 61 Q127 84 110 83 Q92 83 86 61 Z" fill="url(#enemyFace)" stroke="#777" strokeWidth="3"/>
      <path d="M88 39 Q84 7 113 9 Q142 14 135 41 L121 29 L103 34 L89 37 Z" fill="#111"/>
      <path d="M98 52 L107 49 M118 49 L127 52 M108 66 L119 68" stroke="#161616" strokeWidth="3"/>
      <rect x="88" y="138" width="41" height="21" rx="2" fill="#171717" stroke="#888" strokeWidth="2"/>
      <path d="M98 143 H119 M103 149 H116" stroke="#777" strokeWidth="2"/>
      {injured&&<g className="enemy-presence__wound"><path d="M124 114 L139 124 L126 136 M75 135 L85 147" stroke="#a5222b" strokeWidth="5" strokeLinecap="round"/><path d="M132 133 L128 145" stroke="#c53b45" strokeWidth="2"/></g>}
    </svg>
    {impact&&<span key={impact.id} className="enemy-presence__damage">-{impact.damage}</span>}
   </div>
 </div>;
}
