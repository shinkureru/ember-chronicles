/** Original monochrome SVG portraits; no external image licenses or stock photos. */
export default function MarketPortrait({face,name,profile=false}:{face:number;name:string;profile?:boolean}){
 if(profile)return <svg className={`market-portrait market-portrait--profile market-portrait--${face}`} viewBox="0 0 200 370" role="img" aria-label={name+'的側面像'}>
  <defs><linearGradient id={`market-profile-coat-${face}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5d6263"/><stop offset=".55" stopColor="#24262a"/><stop offset="1" stopColor="#0b0b0d"/></linearGradient></defs>
  <path d="M44 359L68 189L65 114Q88 87 130 108L154 170L175 357Z" fill={`url(#market-profile-coat-${face})`} stroke="#818589" strokeWidth="3"/>
  <path d="M64 129L49 207L61 270M137 126L160 221L151 263" fill="none" stroke="#6f777a" strokeWidth="4"/>
  <path d="M88 45L99 95L124 107L137 65Z" fill="#5d6063" stroke="#96999a" strokeWidth="2"/>
  <path d="M76 43Q99 19 131 43L140 66L151 78L140 87L135 97Q96 111 80 84Z" fill={face===2?'#737173':'#626466'} stroke="#a0a0a0" strokeWidth="3"/>
  {face===3&&<path d="M75 64Q55 1 119 14Q146 22 140 90L132 70L126 35L77 60Z" fill="#a2a2a2" stroke="#acacac" strokeWidth="2"/>}
  {face!==3&&<path d="M75 64Q58 10 105 17Q138 16 141 48L126 39L81 49Z" fill="#242426"/>}
  {face===0&&<g><rect x="116" y="58" width="32" height="13" rx="4" fill="#050505" stroke="#999" strokeWidth="2"/><path d="M114 61L100 59" stroke="#999" strokeWidth="3"/></g>}
  {face===4&&<g><path d="M119 76L159 78L150 108L128 111Z" fill="#151515" stroke="#919191" strokeWidth="2"/><circle cx="144" cy="95" r="11" fill="#303030" stroke="#888" strokeWidth="3"/></g>}
  {face===2&&<path d="M113 58L124 93M105 59L116 79" stroke="#2f2d2d" strokeWidth="3"/>}
  {face===1&&<path d="M53 151L87 137M63 169L96 155" stroke="#444" strokeWidth="5"/>}
  {face!==4&&<path d="M120 62L133 61M132 86L142 86" stroke="#191919" strokeWidth="3"/>}
  <path d="M98 125L113 156L98 197M100 262L90 350" stroke="#74797d" strokeWidth="3" fill="none" opacity=".8"/>
 </svg>;
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
