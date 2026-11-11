import type { SceneId } from '../../game/types';

/** Mission 02: five distinct, original, lightweight SVG scene illustrations.
 * Designed for portrait Web use; no image downloads, external fonts, or art licenses. */
const labels:Record<SceneId,string>={
 gate:'夜色後巷入口、殘破招牌與背光燈柱',
 survey:'排水溝邊的腳印、潮濕牆面與翻倒垃圾桶',
 inside:'鐵梯下的舊電話亭、磚縫照片與昏暗證詞現場',
 confrontation:'巷口鐵門、被截斷的退路與灰衣守望者',
 loot:'長椅下的帆布包、破損照片與散落線索'
};
export default function AlleySceneArtwork({scene}:{scene:SceneId}){
 return <svg className={`alley-scene alley-scene--${scene}`} viewBox="0 0 680 280"
  preserveAspectRatio="xMidYMid slice" role="img" aria-label={labels[scene]}>
  <defs>
   <linearGradient id="alley-sky" x1="0" y1="0" x2="0" y2="1">
    <stop stopColor="#070b12"/><stop offset=".72" stopColor="#1c2630"/><stop offset="1" stopColor="#05080d"/>
   </linearGradient>
   <linearGradient id="alley-brick" x1="0" y1="0" x2="1" y2="1">
    <stop stopColor="#303b46"/><stop offset=".48" stopColor="#1d242c"/><stop offset="1" stopColor="#0b0f14"/>
   </linearGradient>
   <linearGradient id="alley-ground" x1="0" y1="0" x2="0" y2="1">
    <stop stopColor="#29323a"/><stop offset="1" stopColor="#080a10"/>
   </linearGradient>
   <radialGradient id="alley-light"><stop stopColor="#b2c7da" stopOpacity=".35"/><stop offset="1" stopColor="#b2c7da" stopOpacity="0"/></radialGradient>
   <pattern id="alley-tiles" width="42" height="17" patternUnits="userSpaceOnUse"><path d="M0 0H42M0 0V17M21 0V8M0 8H42" stroke="#657381" strokeWidth=".75" opacity=".27"/></pattern>
  </defs>
  <rect width="680" height="280" fill="url(#alley-sky)"/>
  {(scene==='gate'||scene==='survey')&&<g>
   <path d="M0 7H249L170 219H0ZM413 5H680V220H503Z" fill="url(#alley-brick)" stroke="#5b6268" strokeWidth="3"/>
   <path d="M0 7H249L170 219H0ZM413 5H680V220H503Z" fill="url(#alley-tiles)"/>
   <path d="M0 279L170 219H503L680 279Z" fill="url(#alley-ground)" stroke="#444e56" strokeWidth="2"/>
   <path d="M252 10H403M251 15L178 218M407 15L498 218" stroke="#565e67" strokeWidth="2" opacity=".55"/>
   <path d="M335 50V186" stroke="#929ca8" strokeWidth="4"/><path d="M324 49H346" stroke="#a5adb9" strokeWidth="3"/>
   <circle cx="335" cy="54" r="10" fill="#d8d4b5"/><ellipse cx="335" cy="67" rx="120" ry="102" fill="url(#alley-light)"/>
   <path d="M250 225L421 227" stroke="#69839d" strokeWidth="2" opacity=".6"/>
  </g>}
  {scene==='gate'&&<g>
   <g fill="#182027" stroke="#83888c" strokeWidth="2">
    <rect x="7" y="75" width="130" height="55"/><rect x="548" y="58" width="107" height="62"/>
    <rect x="23" y="88" width="44" height="28"/><rect x="72" y="88" width="44" height="28"/>
   </g>
   <path d="M129 142L178 148L156 169L115 163Z" fill="#6c7175" stroke="#a7a4a0" strokeWidth="2"/>
   <path d="M36 151L112 152M39 171L110 172" stroke="#7d8488" strokeWidth="2"/>
   <path d="M556 92L595 106L627 89" fill="none" stroke="#6b747a" strokeWidth="3"/>
   <path d="M429 159L451 163L437 180M380 234L391 230L402 234" fill="none" stroke="#9ea1a2" strokeWidth="3" opacity=".65"/>
  </g>}
  {scene==='survey'&&<g>
   <path d="M140 236L540 238" stroke="#a1aab4" strokeWidth="8" opacity=".45"/>
   <path d="M150 241L530 244" stroke="#0c0f13" strokeWidth="5"/>
   <g stroke="#6e7983" fill="#161c23" strokeWidth="3"><path d="M472 155L540 167L528 214L463 205Z"/><path d="M473 157L483 127L521 137L540 167"/><path d="M471 158L530 204M520 163L470 206"/></g>
   <path d="M270 237q-15 5-6 12m33-14q-8 6-5 12m37-10q-6 5-6 12M359 233q-12 7-10 12" fill="none" stroke="#8a969e" strokeWidth="3" opacity=".6"/>
   <path d="M200 69L252 78L245 92L201 87Z" fill="#88919b" stroke="#c0b5a1" strokeWidth="1.5"/>
   <rect x="204" y="73" width="31" height="4" fill="#333b46"/>
  </g>}
  {(scene==='inside'||scene==='confrontation')&&<g>
   <rect x="0" y="0" width="216" height="236" fill="url(#alley-brick)" stroke="#677078" strokeWidth="3"/>
   <rect x="475" y="0" width="205" height="237" fill="url(#alley-brick)" stroke="#677078" strokeWidth="3"/>
   <rect x="0" y="0" width="216" height="236" fill="url(#alley-tiles)"/>
   <rect x="475" y="0" width="205" height="236" fill="url(#alley-tiles)"/>
   <path d="M216 40L278 84H401L475 38M216 230L300 151H397L475 228" stroke="#505c65" fill="none" strokeWidth="3"/>
   <path d="M0 236H680V280H0Z" fill="url(#alley-ground)"/>
   <g stroke="#858a8c" strokeWidth="5">
    <path d="M95 35V226M163 30V225M95 63H163M95 94H163M95 126H163M95 158H163M95 191H163"/>
   </g>
  </g>}
  {scene==='inside'&&<g>
   <rect x="255" y="116" width="154" height="113" rx="9" fill="#12191f" stroke="#9ea5ab" strokeWidth="4"/>
   <path d="M286 137Q335 112 378 138L385 178H279Z" fill="#374a50" stroke="#8e9699" strokeWidth="3"/>
   <rect x="311" y="186" width="44" height="26" fill="#0c1216" stroke="#626b73"/>
   <path d="M348 186Q366 149 377 159L384 182" stroke="#aab1b5" strokeWidth="3" fill="none"/>
   <rect x="489" y="110" width="59" height="42" fill="#a3a6a3" transform="rotate(-8 518 132)"/>
   <path d="M498 118L528 130L540 120M504 142L531 136" stroke="#4c5860" strokeWidth="3" fill="none"/>
   <path d="M555 81L638 93" stroke="#8b9ca5" strokeWidth="2" strokeDasharray="5 5"/>
   <ellipse cx="339" cy="60" rx="170" ry="100" fill="url(#alley-light)"/>
  </g>}
  {scene==='confrontation'&&<g>
   <path d="M236 20H462V250H234Z" fill="#101319" stroke="#828f96" strokeWidth="4"/>
   <path d="M252 25V241M281 25V241M308 25V241M335 25V241M362 25V241M389 25V241M420 25V241M447 25V241" stroke="#566169" strokeWidth="5"/>
   <path d="M235 35L461 195M455 29L246 199" stroke="#80919d" strokeWidth="3" opacity=".5"/>
   <rect x="320" y="117" width="65" height="35" fill="#1b242e" stroke="#9ba5aa" strokeWidth="3"/>
   <path d="M220 247L400 245" stroke="#84949f" strokeWidth="3"/>
   <circle cx="347" cy="39" r="19" fill="#8a383a"/><ellipse cx="345" cy="47" rx="120" ry="81" fill="#932d3950"/>
  </g>}
  {scene==='loot'&&<g>
   <path d="M0 218L680 197V280H0Z" fill="url(#alley-ground)"/>
   <path d="M0 40L680 30V206L0 215Z" fill="url(#alley-brick)" stroke="#77848b" strokeWidth="3"/>
   <path d="M0 40L680 30V206L0 215Z" fill="url(#alley-tiles)"/>
   <path d="M127 164H526V185H127Z" fill="#4d5459" stroke="#a1a4a4" strokeWidth="3"/>
   <path d="M150 182L135 268M499 182L517 263" stroke="#7d8489" strokeWidth="11"/>
   <path d="M254 191Q323 159 394 191L410 237H234Z" fill="#343a3d" stroke="#b6a88c" strokeWidth="3"/>
   <path d="M281 190Q319 143 364 185" fill="none" stroke="#b6a88c" strokeWidth="7"/>
   <path d="M437 210L482 202L493 230L443 237Z" fill="#afa99d" stroke="#5e6063" strokeWidth="2"/>
   <path d="M443 214L469 221L487 208M448 230H485" stroke="#50565a" strokeWidth="2"/>
   <path d="M75 140L143 136L149 155L82 161Z" fill="#c0bdaf" stroke="#78787d" strokeWidth="2"/>
   <ellipse cx="468" cy="64" rx="155" ry="105" fill="url(#alley-light)" opacity=".65"/>
  </g>}
  <rect width="680" height="280" fill="#000" opacity=".12"/>
 </svg>;
}
