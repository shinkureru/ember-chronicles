/** Original monochrome SVG portraits; no external image licenses or stock photos. */
export default function MarketPortrait({face,name}:{face:number;name:string}){
 const hood=face===0||face===4;
 const hair=face===3;
 const mask=face===4;
 const scars=face===2;
 return <svg className={`market-portrait market-portrait--${face}`} viewBox="0 0 160 180" role="img" aria-label={name+'的人物肖像'}>
  <defs><linearGradient id={`portrait-jacket-${face}`} x1="0" x2="1"><stop stopColor="#131313"/><stop offset=".45" stopColor="#545454"/><stop offset="1" stopColor="#171717"/></linearGradient></defs>
  <rect width="160" height="180" rx="4" fill="#0a0a0a"/>
  <path d="M0 179 Q10 127 52 120 L105 118 Q155 128 160 179 Z" fill={`url(#portrait-jacket-${face})`} stroke="#4b4b4b" strokeWidth="2"/>
  {hood&&<path d="M43 123 Q20 76 37 38 Q57 5 85 9 Q128 12 135 63 L114 122 Z" fill="#171717" stroke="#737373" strokeWidth="3"/>}
  <path d="M56 49 Q82 22 109 49 L115 82 Q108 110 84 120 Q56 107 51 83 Z" fill={face===2?'#696666':'#5c5959'} stroke="#9b9999" strokeWidth="2"/>
  {face===1&&<path d="M45 52 Q44 16 88 21 Q122 22 124 47 L118 59 Q82 39 50 59 Z" fill="#151515"/>}
  {hair&&<path d="M48 72 Q40 11 82 17 Q118 9 126 77 L112 63 L115 39 Q87 54 52 52 Z" fill="#a0a0a0"/>}
  {scars&&<path d="M54 64 L73 91 M62 61 L79 87" stroke="#1a1515" strokeWidth="3"/>}
  {face===0&&<g><rect x="48" y="64" width="35" height="15" rx="4" fill="#080808" stroke="#aaa"/><rect x="87" y="64" width="35" height="15" rx="4" fill="#080808" stroke="#aaa"/><path d="M83 70 H89" stroke="#bbb" strokeWidth="3"/></g>}
  {face!==0&&!mask&&<g><path d="M61 70 L74 69 M92 69 L105 70" stroke="#171717" strokeWidth="4"/><path d="M79 91 L88 91" stroke="#393939" strokeWidth="2"/><path d="M75 100 Q82 105 94 100" stroke="#282828" fill="none" strokeWidth="3"/></g>}
  {mask&&<g><path d="M50 82 Q80 75 114 82 L106 118 L63 116 Z" fill="#222" stroke="#aaa" strokeWidth="2"/><circle cx="67" cy="96" r="13" fill="#080808" stroke="#777" strokeWidth="4"/><circle cx="96" cy="96" r="13" fill="#080808" stroke="#777" strokeWidth="4"/></g>}
  {face===2&&<path d="M50 52 Q80 31 116 52 M80 27 V48" stroke="#a0a0a0" strokeWidth="8" fill="none"/>}
  <path d="M80 125 V180 M44 135 L67 152 M119 135 L97 152" stroke="#777" strokeWidth="2" opacity=".5"/>
 </svg>;
}
