import {CARDS} from '../../game/data/cards';
import type {GameState,ProfessionId,SkillCard} from '../../game/types';

/** Visual-only archive filters; they never alter ownership or deck/save data. */
export type CodexRarity='all'|SkillCard['rarity'];
export type CodexProfession='all'|'shared'|ProfessionId;
export const CODEX_RARITIES=[
 {id:'all',label:'全部稀有度'},
 {id:'normal',label:'普通'},
 {id:'rare',label:'稀有'},
 {id:'chaos',label:'混沌'},
] as const satisfies ReadonlyArray<{id:CodexRarity;label:string}>;
export const CODEX_PROFESSIONS=[
 {id:'all',label:'所有職業'},
 {id:'shared',label:'共通'},
 {id:'journalist',label:'記者'},
 {id:'infiltrator',label:'滲透者'},
 {id:'courier',label:'騎士'},
] as const satisfies ReadonlyArray<{id:CodexProfession;label:string}>;

export function filterSkillCodexIds(
 ownedCards:GameState['ownedCards'],
 options:{owned:'all'|'owned';rarity:CodexRarity;profession:CodexProfession},
):string[]{
 return Object.keys(CARDS).filter(id=>{
  const card=CARDS[id]!;
  if(options.owned==='owned'&&!ownedCards[id])return false;
  if(options.rarity!=='all'&&card.rarity!==options.rarity)return false;
  if(options.profession!=='all'&&(card.profession??'shared')!==options.profession)return false;
  return true;
 }).sort((a,b)=>Number(!!ownedCards[b])-Number(!!ownedCards[a])||a.localeCompare(b));
}
