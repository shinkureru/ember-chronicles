import {ATTACK_CARDS} from '../../game/data/attacks';
import type {GameState} from '../../game/types';
import type {CodexProfession,CodexRarity} from './cardCodexFilters';

/** Attack codex display filter only. Card ownership, deck and readiness never mutate. */
export function filterAttackCodexIds(
 ownedCards:GameState['ownedCards'],
 options:{owned:'all'|'owned';rarity:CodexRarity;profession:CodexProfession},
):string[]{
 return Object.keys(ATTACK_CARDS).filter(id=>{
  const card=ATTACK_CARDS[id]!;
  if(options.owned==='owned'&&!ownedCards[id])return false;
  if(options.rarity!=='all'&&card.rarity!==options.rarity)return false;
  if(options.profession!=='all'&&(card.profession??'shared')!==options.profession)return false;
  return true;
 }).sort((a,b)=>Number(!!ownedCards[b])-Number(!!ownedCards[a])||a.localeCompare(b));
}
