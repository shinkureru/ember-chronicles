import {ATTACK_CARDS,attackStatus} from '../../game/data/attacks';
import {ITEMS} from '../../game/data/items';
import {bagWeight} from '../../game/engine/rules';
import type {GameState} from '../../game/types';

/** View-only projection. The reducer alone equips/transfers weapons on selection
 * and START_ATTEMPT remains the original authoritative mission transition.
 */
export function getPreparationReadiness(s:GameState){
 let projectedWeight=bagWeight(s.bag);
 const invalid:string[]=[];
 for(const id of s.attackDeck){
  const status=attackStatus(s,id);
  if(status.inBag)continue;
  const itemId=ATTACK_CARDS[id]?.requiredItemId;
  const item=itemId?ITEMS[itemId]:undefined;
  if(status.inWarehouse&&item&&projectedWeight+item.weight<=15){
   projectedWeight+=item.weight;
  }else invalid.push(id);
 }
 return {
  invalid,
  readyCount:s.attackDeck.length-invalid.length,
  projectedWeight,
 };
}
