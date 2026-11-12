import type {GameState} from '../types';

export interface CardArchiveVariant {
 id:string;
 /** User-visible upgrade level: 1 to 5; unrelated to rarity. */
 level:number;
 /** Number of cards of this exact variant. 0 means an undiscovered card. */
 quantity:number;
 locked:boolean;
}

/** Cards are granted at level I. Upgrading consumes base copies to improve
 * the ONE primary owned card, so unspent copies remain separate level-I tiles.
 * Existing saves only contain {level,copies}, so no inventory migration is needed.
 */
export const buildCardArchiveVariants=(
 ids:string[],owned:GameState['ownedCards'],filter:'all'|'owned'
):CardArchiveVariant[]=>ids.flatMap(id=>{
 const entry=owned[id];
 if(!entry)return filter==='owned'?[]:[{id,level:1,quantity:0,locked:true}];
 const level=Math.max(1,Math.min(5,Math.floor(entry.level)||1));
 const copies=Math.max(0,Math.floor(entry.copies)||0);
 return level===1?[{id,level:1,quantity:copies+1,locked:false}]:[
  {id,level,quantity:1,locked:false},
  ...(copies>0?[{id,level:1,quantity:copies,locked:false}]:[])
 ];
});
