export default function SurvivorFigure({equipment,view='front'}:{equipment:Record<string,string|null>;view?:'front'|'profile'}){
 if(view==='profile')return <svg className="survivor-figure survivor-figure--profile" viewBox="0 0 200 375" role="img" aria-label="與人物檔案同步裝備的主角側面全身像">
  <defs><linearGradient id="profile-coat" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#454a4e"/><stop offset=".55" stopColor="#1b2228"/><stop offset="1" stopColor="#080a0d"/></linearGradient></defs>
  <ellipse cx="111" cy="358" rx="66" ry="10" fill="#020306" opacity=".8"/>
  <path d="M85 200L116 200L111 337L91 339Z M119 198L144 204L155 339L131 339Z" fill="#171b20" stroke="#71777b" strokeWidth="2"/>
  <path d="M88 328L112 332L112 351L79 351Z M129 328L151 330L166 352L131 352Z" fill="#0e1113" stroke="#61696f" strokeWidth="2"/>
  <path d="M84 91Q113 76 138 91L154 178L141 219L79 210L74 142Z" fill="url(#profile-coat)" stroke="#79818a" strokeWidth="3"/>
  <path d="M91 94L75 149L65 193L83 201L107 132 M142 103L157 178L146 212L130 200L130 139" fill="#283036" stroke="#717a7f" strokeWidth="3"/>
  <path d="M105 52L103 89L122 91L129 61Z" fill="#646264" stroke="#98989a" strokeWidth="2"/>
  <path d="M115 18Q86 23 87 61L76 69L90 75L91 88Q122 104 131 67L128 31Z" fill="#696565" stroke="#9a9694" strokeWidth="2"/>
  <path d="M91 20Q112 2 132 22L129 34L96 31L88 49L83 46Z" fill="#1c1e22"/>
  <path d="M88 53L99 50 M82 75L100 80" stroke="#191919" strokeWidth="3"/>
  <path d="M113 88L126 118L113 149" fill="none" stroke="#899195" strokeWidth="2"/>
  {equipment.head==='cap'&&<g><path d="M90 27L87 14L118 8L135 21L128 29Z" fill="#41464b" stroke="#a0a7ad" strokeWidth="2"/><path d="M87 25L61 30L86 33Z" fill="#35383d" stroke="#9ba0a4" strokeWidth="1.5"/></g>}
  {equipment.body==='vest'&&<path d="M89 101L126 96L140 191L80 187Z" fill="#61666a" stroke="#b6b8bc" strokeWidth="2"/>}
  {equipment.body==='scarf'&&<path d="M98 88Q111 95 130 88L135 99L119 106L116 149L105 145L104 107L95 102Z" fill="#77777b" stroke="#a0a0a0" strokeWidth="2"/>}
  {(equipment.arms==='gloves'||equipment.arms==='torn_gloves')&&<path d="M63 187L85 191L80 215L63 213Z" fill="#555b5e" stroke="#999" strokeWidth="2"/>}
  {equipment.arms==='arm_guard'&&<path d="M68 149L85 159L76 197L64 193Z" fill="#969da1" stroke="#dad5cd" strokeWidth="3"/>}
  {equipment.legs==='leg_guard'&&<path d="M87 263L115 263L113 305L86 306Z M126 266L150 268L154 306L130 305Z" fill="#8a9394" stroke="#c6cccb" strokeWidth="3"/>}
  {equipment.arms==='arm_guard'&&<g fill="#9ca1a3" stroke="#d0c7ba" strokeWidth="2"><path d="M49 141L68 147L61 185L44 181Z"/><path d="M132 146L148 142L157 181L140 183Z"/></g>}
 {equipment.legs==='leg_guard'&&<g fill="#90999b" stroke="#d4d1c9" strokeWidth="2"><path d="M71 255L96 256L92 303L68 299Z"/><path d="M108 256L131 254L137 299L113 304Z"/></g>}
 {equipment.mainHand==='wrench'&&<path d="M67 208L45 256M42 250L57 258L49 267" fill="none" stroke="#a9a9a9" strokeWidth="6" strokeLinecap="round"/>}
  {equipment.mainHand==='screwdriver'&&<path d="M67 207L42 264M42 264L38 278" fill="none" stroke="#9f9f9f" strokeWidth="5" strokeLinecap="round"/>}
  {equipment.utility==='flashlight'&&<g transform="translate(130 203) rotate(-12)" fill="#aaa"><rect width="10" height="28" rx="3"/><rect x="-3" y="-3" width="16" height="8" rx="2"/></g>}
  {equipment.utility==='radio'&&<g><rect x="124" y="177" width="16" height="20" rx="2" fill="#555e64" stroke="#aaa"/><path d="M131 176L136 162" stroke="#aaa" strokeWidth="2"/></g>}
  {equipment.accessory==='keyring'&&<circle cx="127" cy="214" r="7" fill="none" stroke="#d3c9b2" strokeWidth="2"/>}
 </svg>;
 return <svg className="survivor-figure" viewBox="0 0 200 375" role="img" aria-label="主角全身裝備輪廓示意">
 <defs><linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3e3d3e"/><stop offset=".56" stopColor="#17191b"/><stop offset="1" stopColor="#080a0b"/></linearGradient></defs>
 <ellipse cx="100" cy="359" rx="64" ry="11" fill="#050608" opacity=".7"/>
 <path d="M79 58L75 77 59 89 54 137 45 206 56 215 69 174 78 158 76 214 67 330 83 338 97 236 105 233 117 337 134 333 124 209 130 161 141 203 153 197 145 132 139 88 118 77 117 57Z" fill="url(#body)" stroke="#726b68" strokeOpacity=".6" strokeWidth="1.5"/>
 <path d="M81 21 Q100 2 119 21L124 47 117 66 108 73 89 69 78 52Z" fill="#4c4340" stroke="#756762" strokeWidth="1.3"/>
 <path d="M81 24L95 22 108 31 120 25 115 17 104 13 88 14Z" fill="#151516"/>
 <path d="M83 76L100 104 117 76M100 104L103 218M74 89L81 155M126 89L121 155" stroke="#8d7871" strokeWidth="2" opacity=".55" fill="none"/>
 <path d="M77 216Q97 224 126 215L122 231 80 233Z" fill="#332b2b" stroke="#77645c" strokeWidth="1"/>
 <path d="M67 332L89 334 89 350 60 351ZM115 334L135 330 141 353 113 351Z" fill="#151515" stroke="#68605b" strokeWidth="1"/>
 <path d="M82 38L91 39M108 39L117 38" stroke="#d4b29d" strokeWidth="1" opacity=".6"/>
 {equipment.head==='cap'&&<g fill="#37363a" stroke="#93847e" strokeWidth="1"><path d="M79 24L82 13 111 11 122 21 115 27Z"/><path d="M95 22Q114 17 132 22L135 26Q119 30 104 27Z"/></g>}
 {equipment.body==='vest'&&<g><path d="M78 88L92 83 100 110 111 83 123 91 130 159 77 157Z" fill="#514e4b" stroke="#a59a88" strokeWidth="2"/><path d="M92 85L92 154M111 85L111 154M80 114L126 114M82 142L124 142" stroke="#a39a8e" strokeWidth="3" opacity=".6"/><rect x="101" y="118" width="11" height="12" rx="2" fill="#282b2c"/></g>}
 {equipment.body==='scarf'&&<path d="M81 72Q99 83 118 72L126 83 118 96 108 90 106 136 95 137 94 91 80 88Z" fill="#77706d" stroke="#a69a8e" strokeWidth="1.5"/>}
 {(equipment.arms==='gloves'||equipment.arms==='torn_gloves')&&<g fill="#555054" stroke="#948681" strokeWidth="1"><path d="M46 194L60 196 64 214 50 218Z"/><path d="M140 190L156 190 159 204 146 209Z"/></g>}
 {equipment.mainHand==='wrench'&&<g stroke="#a7a2a0" strokeWidth="5" strokeLinecap="round" fill="none"><path d="M158 177L165 229"/><path d="M152 170L158 178L167 172"/></g>}
 {equipment.mainHand==='screwdriver'&&<g stroke="#a5a09d" strokeWidth="4" strokeLinecap="round"><path d="M155 181L163 229"/><path d="M161 212L165 239" strokeWidth="2"/></g>}
 {equipment.utility==='flashlight'&&<g transform="translate(143 184) rotate(18)" fill="#aba39c"><rect x="0" y="0" width="10" height="26" rx="3"/><rect x="-3" y="-4" width="16" height="9" rx="3"/></g>}
 {equipment.utility==='radio'&&<g><rect x="118" y="181" width="18" height="22" rx="2" fill="#656365" stroke="#ae9e95" strokeWidth="1"/><path d="M127 181L128 167" stroke="#a99d94" strokeWidth="2"/><circle cx="126" cy="189" r="2" fill="#a67a6b"/></g>}
 {equipment.accessory==='keyring'&&<g stroke="#b4a196" fill="none"><circle cx="76" cy="231" r="5" strokeWidth="2"/><path d="M76 235L78 247L82 246"/></g>}
 </svg>}

