import type {ReactNode} from 'react';
import type {UrbanRarity} from './urbanUiTokens';

/** Shared square artwork, intentionally NOT a button.
 * Can be placed inside existing market, codex and skill buttons without
 * nesting interactive elements or changing their gameplay handlers.
 */
export default function RarityArtwork({rarity,icon,className=''}:{
 rarity:UrbanRarity;icon:ReactNode;className?:string;
}){
 return <span className={`urban-slot__square urban-rarity-artwork urban-slot--${rarity} ${className}`.trim()}
  data-urban-artwork={rarity} aria-hidden="true">
  <span className="urban-slot__brushed-metal"/>
  <span className="urban-slot__icon">{icon}</span>
  <span className="urban-slot__rim"/>
 </span>;
}
