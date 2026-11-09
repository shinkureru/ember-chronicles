import type { ActionChoice } from '../../game/types';
import { ATTACK_CARDS } from '../../game/data/attacks';

/** Original SVG scene objects. No stock assets, sprites, or third-party image licenses. */
export const getActionObject=(choice:ActionChoice):string=>{
  if(choice.attackCardId)return ATTACK_CARDS[choice.attackCardId]?.requiredItemId??'pen';
  if(choice.tags.includes('observe')||choice.tags.includes('search'))return 'camera';
  if(choice.tags.includes('talk'))return 'notebook';
  if(choice.tags.includes('run')||choice.tags.includes('sneak'))return 'route';
  return 'flashlight';
};
export default function ActionObjectArt({kind,className=''}:{kind:string;className?:string}){
 const stroke={fill:'none',stroke:'currentColor',strokeWidth:5,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
 return <svg className={className} viewBox="0 0 250 320" role="img" aria-label={kind==='pen'?'鋼筆':kind==='knife'?'菜刀':kind==='notebook'?'記事本':kind==='route'?'逃跑路線':'行動相關物件圖'}>
  <g transform="translate(125 160) rotate(-22) translate(-125 -160)">
   {kind==='pen'||kind==='metal_ruler'?<g {...stroke}>
     <path d="M106 48 L143 48 L150 246 L124 279 L98 246 Z" fill="#343434"/>
     <path d="M110 66 L137 66 M117 90 L117 229 M124 279 L124 298 M99 245 L149 245"/>
     <path d="M142 53 L159 61 L153 168" strokeWidth="8"/>
    </g>:null}
   {kind==='notebook'?<g {...stroke}>
     <rect x="60" y="37" width="137" height="242" rx="9" fill="#2e2e2e"/>
     <path d="M89 41 V273 M109 82 H177 M109 111 H175 M109 140 H173 M109 169 H177 M109 198 H166" strokeWidth="3"/>
     {Array.from({length:10},(_,i)=><circle key={i} cx="74" cy={56+i*21} r="4" fill="#a0a0a0" strokeWidth="1"/>)}
   </g>:null}
   {kind==='camera'?<g {...stroke}>
      <path d="M35 111 L69 111 L86 86 L165 86 L181 111 L216 111 L216 228 L35 228 Z" fill="#303030"/>
      <circle cx="125" cy="170" r="45" fill="#555"/><circle cx="125" cy="170" r="27" fill="#151515"/>
      <path d="M47 126 H75 M162 123 H194 M48 238 Q125 276 207 238" strokeWidth="3"/>
   </g>:null}
   {kind==='wrench'?<g {...stroke}>
     <path d="M103 50 Q81 60 77 90 L95 121 L100 267 Q125 287 149 264 L147 123 L167 94 Q168 60 144 45 L139 86 L109 89 Z" fill="#555"/>
     <circle cx="124" cy="249" r="9" strokeWidth="4"/>
   </g>:null}
   {kind==='screwdriver'?<g {...stroke}>
     <path d="M119 39 L130 39 L131 183 L118 183 Z" fill="#9a9a9a"/>
     <rect x="104" y="181" width="42" height="105" rx="13" fill="#333"/><path d="M122 209 V262 M131 210 V262" strokeWidth="3"/>
   </g>:null}
   {kind==='flashlight'||kind==='radio'?<g {...stroke}>
     <rect x="91" y="102" width="68" height="153" rx="9" fill="#444"/>
     <path d="M91 102 L73 77 H175 L159 102" fill="#777"/>
     <path d="M101 144 H149 M101 151 H149 M101 158 H149" strokeWidth="3"/>
     <circle cx="124" cy="197" r="14" fill="#777"/><path d="M151 100 L174 26" strokeWidth="3"/>
   </g>:null}
   {kind==='water'?<g {...stroke}>
      <rect x="98" y="42" width="55" height="36" rx="4" fill="#626262"/>
      <path d="M98 82 Q76 119 89 168 L85 271 Q125 293 163 271 L159 168 Q174 119 153 82 Z" fill="#404040"/>
      <path d="M90 158 H161 M90 240 H161" strokeWidth="3"/>
   </g>:null}
   {kind==='knife'?<g {...stroke}>
     <path d="M81 40 L177 40 L177 204 L94 224 Q77 189 81 40 Z" fill="#797979"/>
     <rect x="99" y="220" width="64" height="90" rx="9" fill="#2c2c2c"/><circle cx="132" cy="270" r="4" fill="#a9a9a9"/>
   </g>:null}
   {kind==='route'?<g {...stroke}>
     <path d="M45 265 Q62 209 114 205 Q187 201 190 127 Q190 91 159 79 M158 79 L166 109 M158 79 L191 75" strokeDasharray="16 10"/>
     <path d="M73 279 L106 233 M146 172 L178 147" strokeWidth="2"/>
     <circle cx="45" cy="265" r="12" fill="#777"/><circle cx="159" cy="79" r="12" fill="#777"/>
   </g>:null}
  </g>
 </svg>;
}
