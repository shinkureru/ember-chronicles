/** Artist-supplied market scene and image-space aligned cinematic glows.
 * All effects share image coordinates, so hero cropping keeps them aligned.
 * The illustration is atmospheric: vendor identity remains live game data.
 */
export default function BlackMarketSceneArt(){
 const imageUrl=`${import.meta.env.BASE_URL}black-market-merchant.webp`;
 return <svg className="market-v0823__art" viewBox="0 0 960 536"
  preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
  <defs>
   <radialGradient id="market-v0823-warm"><stop offset="0" stopColor="#ffeab4" stopOpacity=".49"/><stop offset=".42" stopColor="#ffbe66" stopOpacity=".18"/><stop offset="1" stopColor="#ffbe66" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0823-cold"><stop offset="0" stopColor="#b7eaf7" stopOpacity=".28"/><stop offset=".53" stopColor="#6bb5d5" stopOpacity=".12"/><stop offset="1" stopColor="#6bb5d5" stopOpacity="0"/></radialGradient>
   <radialGradient id="market-v0823-violet"><stop offset="0" stopColor="#eac6ff" stopOpacity=".91"/><stop offset=".32" stopColor="#b66df9" stopOpacity=".55"/><stop offset="1" stopColor="#7633c8" stopOpacity="0"/></radialGradient>
  </defs>
  <image href={imageUrl} width="960" height="536" x="0" y="0" preserveAspectRatio="none"/>
  <ellipse className="market-v0823__warm-light" cx="529" cy="51" rx="130" ry="97" fill="url(#market-v0823-warm)"/>
  <ellipse className="market-v0823__cold-light" cx="202" cy="67" rx="204" ry="99" fill="url(#market-v0823-cold)"/>
  <g className="market-v0823__eyes">
   <ellipse cx="335" cy="121" rx="34" ry="26" fill="url(#market-v0823-violet)"/>
   <ellipse cx="384" cy="128" rx="25" ry="25" fill="url(#market-v0823-violet)"/>
   <path d="M322 110Q337 113 349 123L344 130Q332 126 322 120Z" fill="#b689f9" opacity=".31"/>
   <path d="M379 124L391 119L387 135L379 137Z" fill="#db83f4" opacity=".34"/>
  </g>
 </svg>;
}
