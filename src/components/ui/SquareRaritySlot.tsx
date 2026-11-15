import type {ReactNode} from 'react';
import {URBAN_RARITIES,type UrbanRarity} from './urbanUiTokens';
import RarityArtwork from './RarityArtwork';

interface SquareRaritySlotProps{
 rarity:UrbanRarity;
 name:string;
 icon:ReactNode;
 detail?:string;
 selected?:boolean;
 disabled?:boolean;
 onSelect?:()=>void;
 className?:string;
}

/** A genuine keyboard-accessible square slot, while title and price sit
 * outside its square artwork surface and never distort a rectangular image.
 */
export default function SquareRaritySlot({rarity,name,icon,detail,selected=false,disabled=false,onSelect,className=''}:SquareRaritySlotProps){
 const grade=URBAN_RARITIES.find(x=>x.id===rarity)!;
 return <button type="button" className={`urban-slot urban-slot--${rarity} ${selected?'is-selected':''} ${className}`.trim()}
  data-urban-rarity={rarity} aria-pressed={selected} aria-label={`${name}，${grade.label}${detail?'，'+detail:''}`}
  disabled={disabled} onClick={onSelect}>
  <RarityArtwork rarity={rarity} icon={icon}/>
  <span className="urban-slot__info">
   <strong>{name}</strong>
   <small>{detail??grade.label}</small>
  </span>
 </button>;
}
