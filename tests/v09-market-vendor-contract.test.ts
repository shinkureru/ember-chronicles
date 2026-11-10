import {describe,expect,it} from 'vitest';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';

describe('v0.9 final audit: every black-market card exchange is vendor-specific',()=>{
 it('refuses a card that is not offered by that merchant, even if dispatched directly',()=>{
   const s=makeInitialState('journalist');
   s.economy.coins=5000;
   s.ownedCards.question={copies:2,level:1};
   const coins=s.economy.coins;
   const stock=s.ownedCards.question.copies;
   expect(gameReducer(s,{type:'MARKET_BUY',vendorId:'medic',cardId:'question'})).toBe(s);
   expect(gameReducer(s,{type:'MARKET_SELL',vendorId:'medic',cardId:'question'})).toBe(s);
   expect(s.economy.coins).toBe(coins);
   expect(s.ownedCards.question.copies).toBe(stock);
 });
 it('accepts a valid card transaction only with the correct vendor',()=>{
   let s=makeInitialState('journalist');
   s.economy.coins=5000;
   s.ownedCards.question={copies:2,level:1};
   const before=s.economy.coins;
   s=gameReducer(s,{type:'MARKET_SELL',vendorId:'broker',cardId:'question'});
   expect(s.economy.coins).toBeGreaterThan(before);
   expect(s.ownedCards.question.copies).toBe(1);
   const afterSell=s.economy.coins;
   s=gameReducer(s,{type:'MARKET_BUY',vendorId:'broker',cardId:'question'});
   expect(s.economy.coins).toBeLessThan(afterSell);
   expect(s.ownedCards.question.copies).toBe(2);
 });
 it('every vendor has at least two meaningful card-trade preferences',()=>{
   expect(MARKET_VENDORS.length).toBeGreaterThanOrEqual(5);
   expect(MARKET_VENDORS.every(v=>v.cardIds.length>=2)).toBe(true);
   for(const vendor of MARKET_VENDORS){
     const s=makeInitialState('journalist');
     expect(gameReducer(s,{type:'MARKET_BUY',vendorId:vendor.id,cardId:'nonexistent'})).toBe(s);
   }
 });
});
