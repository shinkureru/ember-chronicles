import type { SceneId } from '../../game/types';

/** Five original lightweight vector scenes; distinct composition per story scene.
 * Layered SVG keeps mobile transfer small and preserves clarity at any resolution.
 */
export default function SceneArtwork({scene}:{scene:SceneId}){
 return <svg className={`scene-v11 scene-v11--${scene}`} viewBox="0 0 680 280"
  preserveAspectRatio="xMidYMid slice" role="img" aria-label={{
   gate:'舊物流站外觀與鐵絲圍籬',
   survey:'貨櫃間的側門與監視器',
   inside:'灰暗的物流站辦公室與檔案桌',
   confrontation:'昏暗長廊的警衛與紅色警示燈',
   loot:'散落物資的辦公桌與搜刮現場',
  }[scene]}>
  <defs>
   <linearGradient id="v11-sky" x2="0" y2="1"><stop stopColor="#111b26"/><stop offset=".7" stopColor="#25272b"/><stop offset="1" stopColor="#0a0c10"/></linearGradient>
   <linearGradient id="v11-wall" x2=".9" y2="1"><stop stopColor="#45444a"/><stop offset=".55" stopColor="#2b3035"/><stop offset="1" stopColor="#14161a"/></linearGradient>
   <linearGradient id="v11-floor" x2="0" y2="1"><stop stopColor="#393b40"/><stop offset="1" stopColor="#101114"/></linearGradient>
   <radialGradient id="v11-bulb"><stop stopColor="#ffd9a3" stopOpacity=".8"/><stop offset="1" stopColor="#edd9a6" stopOpacity="0"/></radialGradient>
  </defs>
  <rect width="680" height="280" fill="url(#v11-sky)"/>
  {scene==='gate'&&<g>
   <rect y="201" width="680" height="79" fill="url(#v11-floor)"/>
   <path d="M65 212V86L105 48H576L619 88V212" fill="url(#v11-wall)" stroke="#687077" strokeWidth="4"/>
   <path d="M105 48H576L619 88H65Z" fill="#353a40" stroke="#93959a" strokeWidth="3"/>
   <rect x="115" y="137" width="220" height="53" fill="#111821" stroke="#717a81" strokeWidth="3"/>
   {Array.from({length:5},(_,i)=><rect key={i} x={125+i*43} y="150" width="29" height="28" fill="#171d25" stroke="#777b7f"/>)}
   <rect x="459" y="120" width="91" height="92" fill="#111820" stroke="#58636e" strokeWidth="4"/>
   <path d="M566 212L578 40" stroke="#878b89" strokeWidth="3"/>
   <path d="M576 49L622 56" stroke="#868784" strokeWidth="3"/>
   <ellipse cx="627" cy="62" rx="105" ry="90" fill="url(#v11-bulb)"/>
   <g stroke="#7b8283" strokeWidth="1.5" opacity=".56">{Array.from({length:8},(_,i)=><path key={i} d={`M0 ${140+i*16}L80 ${125+i*17}`}/>)}</g>
   <path d="M0 207L680 222" stroke="#899097" strokeWidth="2"/>
  </g>}
  {scene==='survey'&&<g>
   <path d="M0 231L680 203V280H0Z" fill="url(#v11-floor)"/>
   <g stroke="#73808a" strokeWidth="2">
    <rect x="-18" y="67" width="286" height="143" fill="#273946"/><rect x="16" y="83" width="220" height="13" fill="#16252e"/>
    <rect x="0" y="96" width="278" height="112" fill="#1e303a"/>
    {Array.from({length:10},(_,i)=><path key={i} d={`M${i*27} 100V206`} stroke="#536775" opacity=".7"/>)}
    <rect x="407" y="101" width="302" height="118" fill="#2e353c"/>
    {Array.from({length:11},(_,i)=><path key={i} d={`M${418+i*28} 107V215`} stroke="#56616c" opacity=".6"/>)}
   </g>
   <rect x="287" y="64" width="111" height="158" fill="#0d151c" stroke="#6b7278" strokeWidth="4"/>
   <path d="M298 75L390 205" stroke="#89959c" strokeWidth="2" opacity=".5"/>
   <path d="M340 38V74M337 39L377 45" stroke="#979da0" strokeWidth="4"/>
   <path d="M369 45L386 56L373 69L352 61" fill="#424c56" stroke="#9ba5ac" strokeWidth="2"/>
   <circle cx="377" cy="60" r="4" fill="#b9d5d8"/>
   <path d="M400 67L557 169" stroke="#91d1dd" strokeWidth="2" strokeDasharray="4 7" opacity=".45"/>
   <g fill="#171c20" stroke="#5a6570" strokeWidth="2"><rect x="45" y="200" width="95" height="45"/><rect x="131" y="217" width="77" height="37"/></g>
  </g>}
  {scene==='inside'&&<g>
   <path d="M0 200L680 201V280H0Z" fill="url(#v11-floor)"/>
   <rect x="20" y="30" width="640" height="174" fill="url(#v11-wall)" stroke="#667078" strokeWidth="2"/>
   <rect x="71" y="54" width="128" height="100" fill="#11171c" stroke="#85949d" strokeWidth="4"/>
   <path d="M135 54V155M71 100H199" stroke="#67717a" strokeWidth="3"/>
   <g fill="#232a2d" stroke="#747c80" strokeWidth="2"><rect x="453" y="60" width="166" height="160"/>{Array.from({length:4},(_,i)=><rect key={i} x="465" y={75+i*32} width="141" height="24"/>)}</g>
   <path d="M135 188H446L486 222H114Z" fill="#34383a" stroke="#8d9494" strokeWidth="3"/>
   <rect x="139" y="216" width="20" height="64" fill="#171b20"/><rect x="423" y="216" width="20" height="64" fill="#171b20"/>
   <rect x="202" y="146" width="100" height="41" fill="#99958a" stroke="#414447" strokeWidth="2"/>
   <path d="M212 153H288M212 161H273M212 169H292" stroke="#33363a" strokeWidth="2"/>
   <rect x="344" y="159" width="76" height="28" fill="#152028" stroke="#7a7a7b" strokeWidth="2"/>
   <ellipse cx="340" cy="38" rx="120" ry="102" fill="url(#v11-bulb)" opacity=".62"/>
   <path d="M322 10V34" stroke="#6b6b6b" strokeWidth="3"/><rect x="298" y="32" width="50" height="8" fill="#b6ae9b"/>
  </g>}
  {scene==='confrontation'&&<g>
   <path d="M0 280L130 70H548L680 280Z" fill="#242831"/>
   <path d="M130 70L200 112L165 280H0ZM548 70L480 112L510 280H680Z" fill="url(#v11-wall)" stroke="#64676c" strokeWidth="3"/>
   <path d="M200 112H480V280H200Z" fill="#10151d"/>
   <path d="M130 70H548L480 112H200Z" fill="#3e4144"/>
   <path d="M210 278L322 112M476 280L361 112" stroke="#5e6870" strokeWidth="2"/>
   <rect x="321" y="65" width="44" height="12" fill="#6d252a" stroke="#b56568" strokeWidth="2"/>
   <ellipse cx="340" cy="113" rx="149" ry="91" fill="#a22127" opacity=".14"/>
   <path d="M334 103L347 103L354 116H325Z" fill="#1a1c21" stroke="#737577" strokeWidth="2"/>
   <path d="M328 125L354 125L377 205L364 256H317L303 205Z" fill="#1a1d20" stroke="#707075" strokeWidth="2"/>
   <circle cx="342" cy="126" r="16" fill="#3c4143" stroke="#686e73" strokeWidth="2"/>
   <path d="M324 162L282 223M355 165L393 216" stroke="#1b1d20" strokeWidth="14"/>
   <path d="M333 255L326 285M358 255L368 285" stroke="#0d0f11" strokeWidth="18"/>
   <rect x="382" y="200" width="23" height="32" fill="#1c262b" stroke="#77858a" strokeWidth="2"/>
  </g>}
  {scene==='loot'&&<g>
   <rect x="0" y="32" width="680" height="189" fill="url(#v11-wall)"/>
   <rect x="56" y="55" width="148" height="137" fill="#1c232a" stroke="#7a7977" strokeWidth="4"/>
   {Array.from({length:4},(_,i)=><path key={i} d={`M65 ${84+i*27}H194`} stroke="#7a7774" strokeWidth="3"/>)}
   <path d="M0 208L680 205V280H0Z" fill="url(#v11-floor)"/>
   <path d="M155 171H551L605 218H115Z" fill="#393a3a" stroke="#98918b" strokeWidth="4"/>
   <path d="M169 219V280M541 217V280" stroke="#161b21" strokeWidth="15"/>
   <g fill="#a8a091" stroke="#57595a" strokeWidth="1.5">
    <path d="M211 156L297 150L315 182L229 190Z"/><path d="M325 146L415 161L405 189L310 181Z"/>
    <path d="M418 148L501 153L510 181L425 178Z"/>
   </g>
   <g stroke="#525b60" strokeWidth="2"><path d="M234 168L287 163M241 176L293 170M331 161L399 173M425 161L495 167"/></g>
   <rect x="478" y="103" width="45" height="51" rx="3" fill="#1d2428" stroke="#8a8b89" strokeWidth="3"/>
   <path d="M490 104V87H507V104" stroke="#99938c" strokeWidth="3" fill="none"/>
   <ellipse cx="100" cy="48" rx="90" ry="60" fill="url(#v11-bulb)" opacity=".48"/>
  </g>}
  <rect width="680" height="280" fill="#000" opacity=".07"/>
 </svg>;
}
