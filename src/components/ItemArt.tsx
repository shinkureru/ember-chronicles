import type { ReactNode } from 'react';
import { ITEMS } from '../game/data/items';

/**
 * Item-specific silhouettes replace inaccurate generic emoji.
 * Every illustration below depicts the item actually named in ITEMS.
 * Remaining emoji are used only for objects whose native emoji is unambiguous.
 */
const exactArt:Record<string,ReactNode>={
 arm_guard:<>
  <path d="M19 8L44 11L48 52L22 56L15 45Z" fill="#596368" stroke="#b9c4c5"/>
  <path d="M20 17L43 20M21 46L46 42" stroke="#d7c8b8" strokeWidth="4"/>
  <path d="M24 22L39 24L42 38L24 41Z" fill="#929da1" stroke="#cad1d0"/>
  <path d="M15 29h8M43 30h8" stroke="#c2ad94" strokeWidth="3"/>
 </>,
 leg_guard:<>
  <path d="M20 8C26 5 38 5 44 8L49 28L45 57L19 57L15 28Z" fill="#626568" stroke="#b5b9b9"/>
  <path d="M19 18L45 18M19 46L45 46" stroke="#ded0b5" strokeWidth="5"/>
  <path d="M21 23L43 23L41 41Q32 48 23 41Z" fill="#a9b2b4" stroke="#d7d9d6"/>
  <path d="M24 29H40M24 36H40" stroke="#697274" strokeWidth="2"/>
 </>,
 sterile_bandage:<>
  <ellipse cx="25" cy="39" rx="17" ry="18" fill="#d6d4cd" stroke="#8d9998"/><ellipse cx="25" cy="39" rx="7" ry="9" fill="#525960"/>
  <path d="M25 22h25v33H25" stroke="#e0ddd7" fill="#b7b9b4" strokeWidth="4"/><path d="M34 23v31M43 23v31" stroke="#7c8586"/>
  <rect x="35" y="7" width="23" height="15" rx="2" fill="#788991"/><path d="M46 10v9M42 14h8" stroke="#e4e4dd" strokeWidth="3"/>
 </>,
 antiseptic_kit:<>
  <rect x="14" y="14" width="36" height="46" rx="6" fill="#56666c" stroke="#c6cccb"/>
  <path d="M23 14v-7h18v7" stroke="#b8c1c3"/><rect x="19" y="28" width="26" height="24" rx="2" fill="#b8c4c2"/>
  <path d="M32 33v14M25 40h14" stroke="#7e4549" strokeWidth="5"/>
 </>,
 antidote_injector:<>
  <g transform="rotate(-34 32 32)">
   <rect x="25" y="13" width="14" height="30" rx="2" fill="#b6cbd0" stroke="#60747b"/>
   <path d="M25 29h14M25 35h14M28 17v17" stroke="#618f8e" strokeWidth="2"/>
   <path d="M32 43v15M27 58h10M32 13V6M24 6h16" stroke="#dae6e5" strokeWidth="3"/>
  </g>
 </>,
 pain_relief:<>
  <rect x="13" y="10" width="38" height="46" rx="4" fill="#64666b" stroke="#b8aeaa"/>
  <rect x="19" y="18" width="26" height="30" rx="2" fill="#929da5"/>
  {[0,1,2].map(i=><g key={i}><ellipse cx="26" cy={24+i*9} rx="4" ry="3" fill="#ded2bc"/><ellipse cx="38" cy={24+i*9} rx="4" ry="3" fill="#ded2bc"/></g>)}
 </>,

 bandage:<>
  <path d="M14 39h27v13H14z" fill="#b9b6ae"/><path d="M14 39v13M23 39v13M32 39v13" stroke="#77716e" strokeWidth="1.6"/>
  <ellipse cx="14" cy="45.5" rx="10" ry="13" fill="#e1ddd5"/><ellipse cx="14" cy="45.5" rx="5" ry="7" fill="#615c5a"/>
  <path d="M41 39c7-1 10-4 11-10l-9-3c0 3-2 5-6 5" fill="#c6c0b6" stroke="#dcd4ca"/>
  <path d="M40 39v13" stroke="#a9a49a" strokeDasharray="2 3"/>
 </>,
 firstaid:<>
  <rect x="8" y="19" width="48" height="35" rx="5" fill="#363b3b"/><path d="M22 19v-6h20v6" />
  <path d="M8 31h48" stroke="#8b9190"/><path d="M28 25h8v7h7v8h-7v7h-8v-7h-7v-8h7z" fill="#cf6a70" stroke="#e5b9b8"/>
  <path d="M14 19v35M50 19v35" stroke="#777"/>
 </>,
 water:<>
  <rect x="25" y="6" width="14" height="8" rx="2" fill="#adb8c0"/><path d="M22 15h20c0 5-4 8-4 11l5 27c0 5-6 7-11 7s-11-2-11-7l5-27c0-3-4-6-4-11z" fill="#738f9e" fillOpacity=".55"/>
  <path d="M23 35h18l2 12H21z" fill="#8eafb7"/><path d="M28 18h8" stroke="#e6e2db"/>
 </>,
 radio:<>
  <rect x="19" y="16" width="30" height="42" rx="5" fill="#454c4e"/><path d="M24 15L17 3" strokeWidth="4"/>
  <rect x="25" y="24" width="18" height="10" rx="2" fill="#758b92"/><path d="M26 40h16M26 44h16M26 48h16" stroke="#bfc8ca"/>
  <circle cx="28" cy="19" r="2" fill="#c1b4aa"/><circle cx="40" cy="19" r="2" fill="#c1b4aa"/>
 </>,
 tape:<>
  <ellipse cx="25" cy="33" rx="19" ry="22" fill="#747678"/><ellipse cx="25" cy="33" rx="9" ry="12" fill="#242628"/>
  <path d="M27 11h13c11 1 18 10 18 22s-7 21-18 22H27" fill="none" stroke="#a8aaac" strokeWidth="5"/>
  <path d="M39 11v12M39 43v12" stroke="#56595a"/>
 </>,
 wire_piece:<>
  <path d="M9 11c16-9 24 5 15 17s3 28 18 18S58 32 51 24" stroke="#6c7f88" strokeWidth="7"/>
  <path d="M9 11L6 6M9 11l5-7M51 24l5-6M51 24l8-1" stroke="#d4975b" strokeWidth="3"/>
  <path d="M9 11c16-9 24 5 15 17s3 28 18 18S58 32 51 24" stroke="#9daeb5" strokeWidth="2"/>
 </>,
 vest:<>
  <path d="M14 13l10-5 8 12 8-12 10 5 8 18-10 5v23H16V36L6 31z" fill="#4b5050"/>
  <path d="M24 8l8 12 8-12M19 27h26v27H19z" stroke="#a4aaa8"/>
  <path d="M22 34h20M22 41h20M22 48h20M12 27l7 5M52 27l-7 5" stroke="#777e7d"/>
 </>,
 handwarm:<>
  <path d="M13 15h38l-2 38c-1 6-33 6-34 0z" fill="#ac9e8d"/>
  <path d="M15 15h34" stroke="#d6c5ac" strokeWidth="4"/>
  <path d="M23 37c-5-6 3-8 0-13M33 37c-5-6 3-8 0-13M43 37c-5-6 3-8 0-13" stroke="#874c42" strokeWidth="2.5"/>
  <path d="M24 45h16" stroke="#675750"/>
 </>,
 folding_tool:<>
  <rect x="17" y="23" width="28" height="33" rx="8" fill="#777677"/>
  <path d="M21 22V11l8-5 5 5-7 11M38 23l6-17 7 5-7 16" fill="#adb5b7"/>
  <circle cx="31" cy="30" r="3" fill="#252728"/><path d="M25 39h13M25 46h13" stroke="#d1c5bd"/>
 </>,
 badge:<>
  <path d="M23 5c0 19 4 22 9 24 5-2 9-5 9-24" stroke="#8e8380" strokeWidth="3"/>
  <rect x="14" y="27" width="36" height="31" rx="4" fill="#d2c7b6"/><rect x="20" y="32" width="10" height="10" rx="1" fill="#696d70"/>
  <path d="M34 34h10M34 39h9M20 48h24M20 53h15" stroke="#69615d" strokeWidth="2"/>
 </>,
 torn_photo:<>
  <path d="M9 10h45v38l-7 5-8-4-9 7-9-5-12 3z" fill="#c0b2a1"/>
  <path d="M14 16h35v29H14z" fill="#626c73"/>
  <path d="M17 38l10-12 7 8 6-6 7 11z" fill="#9fa9a6"/><circle cx="40" cy="22" r="4" fill="#dbceae"/>
  <path d="M9 48l12 3 9 5 9-7 8 4 7-5" stroke="#b5a89a"/>
 </>,
 keyring:<>
  <circle cx="23" cy="22" r="15" stroke="#b8b9b9" strokeWidth="4"/>
  <path d="M33 29l22 19-6 7-7-4-5 2-11-15M28 35l13 23h-10l-6-10-5-2" stroke="#c5bcaa" strokeWidth="6"/>
  <path d="M48 43l-5 6M37 47l-5 4" stroke="#7b736b"/>
 </>,
 notes:<>
  <path d="M15 7h29l7 7v43H15z" fill="#c0b6a7"/>
  <path d="M44 7v7h7M21 22h24M21 29h24M21 36h20M21 43h16" stroke="#655e58"/>
  <path d="M15 50l8-5 7 8 10-3 11 7" stroke="#a69e8f"/>
 </>,
 vehicle_note:<>
  <path d="M12 7h37l5 7v37l-9 5-8-3-8 4-8-5-9 3z" fill="#c7c0b3"/>
  <path d="M18 21h30M18 41h30M19 47h16" stroke="#726d67"/>
  <text x="32" y="35" fontSize="14" fontWeight="800" textAnchor="middle" fill="#575453" stroke="none">7?4</text>
 </>,
 biscuit:<>
  <rect x="13" y="13" width="35" height="38" rx="4" fill="#a88d68"/>
  <rect x="17" y="9" width="35" height="38" rx="4" fill="#d3b385"/>
  <path d="M23 15v26M29 15v26M35 15v26M41 15v26M47 15v26M20 21h29M20 31h29M20 40h29" stroke="#ad936e" strokeWidth="1.2"/>
 </>,
 torn_gloves:<>
  <path d="M18 52l-4-19-5-12 4-4 7 9-4-18 5-2 7 18-3-21h6l5 23 3-14 6 1-1 27-7 15z" fill="#7b7774"/>
  <path d="M21 36l12 3-5 6 9 4M14 22l8 9" stroke="#b69e8f" strokeWidth="2"/>
 </>,
};

export default function ItemArt({id,className=''}:{id:string;className?:string}){
 const item=ITEMS[id];
 const shape=exactArt[id];
 if(!shape)return <span className={className} role="img" aria-label={item?.name??id}>{item?.emoji??'📦'}</span>;
 return <svg className={className} data-item-id={id} viewBox="0 0 64 64" width="1em" height="1em"
  role="img" aria-label={item?.name??id} xmlns="http://www.w3.org/2000/svg"
  fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
  {shape}
 </svg>;
}
