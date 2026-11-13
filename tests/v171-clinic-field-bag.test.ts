import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {CLINIC_SUPPLIES,clinicBuyBlock,clinicUnitPrice,clinicQuestBlock,clinicTreatmentPreview,getClinicQuest,getClinicProgress} from '../src/game/engine/clinic';
import {previewConsumable} from '../src/game/engine/consumables';
import {getTownServiceLock} from '../src/game/engine/townActions';
import {getEquippedDefense} from '../src/game/data/equipmentEffects';
import ItemArt from '../src/components/ItemArt';

describe('v1.7.1 underground clinic and in-mission bag',()=>{
 it('offers real treatment outcomes identical to reducer commits',()=>{
  let s=makeInitialState('journalist');
  s.player.health=2;s.player.stamina=7;s.conditions!.wounds=3;
  const preview=clinicTreatmentPreview(s,'clinic_wounds');
  expect(preview.health).toBe(4);expect(preview.wounds).toBe(-2);
  expect(preview.resultingHealth).toBe(6);
  expect(getTownServiceLock(s,'clinic_wounds')).toBeNull();
  const after=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'clinic_wounds'});
  expect(after.player.health).toBe(preview.resultingHealth);
  expect(after.conditions!.wounds).toBe(1);
  expect(after.economy.coins).toBe(s.economy.coins-preview.fee);
 });
 it('does not sell unnecessary treatments as available when the symptoms are absent',()=>{
  const s=makeInitialState('journalist');
  expect(getTownServiceLock(s,'clinic_infection')).toContain('沒有感染');
  expect(getTownServiceLock(s,'clinic_general')).toContain('已完全恢復');
 });
 it('accepts and finishes one real rotating daily quest with earned favor',()=>{
  let s=makeInitialState('journalist');s.world.day=1;
  expect(getClinicQuest(s).id).toBe('water');
  const initial=s.economy.coins;
  s=gameReducer(s,{type:'CLINIC_ACCEPT_DAILY'});
  expect(getClinicProgress(s).acceptedDay).toBe(1);
  s=gameReducer(s,{type:'CLINIC_COMPLETE_DAILY'});
  expect(getClinicProgress(s).completedDay).toBe(1);
  expect(getClinicProgress(s).favor).toBe(2);
  expect(s.bag.water).toBeUndefined();
  expect(s.economy.coins).toBe(initial+22);
  expect(clinicQuestBlock(s,false)).toContain('已完成');
  const again=gameReducer(s,{type:'CLINIC_COMPLETE_DAILY'});
  expect(again).toBe(s);
  s={...s,world:{...s.world,day:2}};
  expect(getClinicQuest(s).id).toBe('bandage');
  expect(clinicQuestBlock(s,false)).toBeNull();
 });
 it('sells exclusive medical supplies, applies favor discounts and daily limits',()=>{
  let s=makeInitialState('journalist');s.world.day=1;
  expect(CLINIC_SUPPLIES).toHaveLength(4);
  expect(clinicBuyBlock(s,'antiseptic_kit')).toBeNull();
  const firstPrice=clinicUnitPrice(s,'sterile_bandage');
  s=gameReducer(s,{type:'CLINIC_ACCEPT_DAILY'});
  s=gameReducer(s,{type:'CLINIC_COMPLETE_DAILY'});
  expect(clinicUnitPrice(s,'sterile_bandage')).toBeLessThan(firstPrice);
  const paid=clinicUnitPrice(s,'sterile_bandage'),oldCoins=s.economy.coins;
  s=gameReducer(s,{type:'CLINIC_BUY_ITEM',itemId:'sterile_bandage'});
  expect(s.bag.sterile_bandage).toBe(1);
  expect(s.economy.coins).toBe(oldCoins-paid);
  s.economy.coins+=200;
  s=gameReducer(s,{type:'CLINIC_BUY_ITEM',itemId:'sterile_bandage'});
  expect(clinicBuyBlock(s,'sterile_bandage')).toContain('售完');
  expect(gameReducer(s,{type:'CLINIC_BUY_ITEM',itemId:'sterile_bandage'})).toBe(s);
 });
 it('provides exact single-use heal previews for clinic medical items',()=>{
  let s=makeInitialState('journalist');s.player.health=3;s.conditions!.wounds=3;
  s.bag.sterile_bandage=1;
  const preview=previewConsumable(s,'sterile_bandage')!;
  expect(preview.player.health).toBe(7);expect(preview.conditions.wounds).toBe(1);
  s=gameReducer(s,{type:'USE_ITEM',itemId:'sterile_bandage'});
  expect(s.player.health).toBe(7);expect(s.conditions?.wounds).toBe(1);
  expect(s.bag.sterile_bandage).toBeUndefined();
 });
 it('can consume supplies inside a mission but blocks them during a queued counterattack',()=>{
  let s=makeInitialState('journalist');
  s.mode='adventure';s.player.health=2;s.bag.bandage=1;
  let next=gameReducer(s,{type:'USE_ITEM',itemId:'bandage'});
  expect(next.player.health).toBe(4);
  expect(next.bag.bandage).toBeUndefined();
  s.enemyCounter={id:1,itemId:'radio',damage:4,hit:true,phase:'waiting'};
  expect(gameReducer(s,{type:'USE_ITEM',itemId:'bandage'})).toBe(s);
 });
 it('allows carried protective gear in a mission but cannot pull gear from the town warehouse',()=>{
  let s=makeInitialState('journalist');
  s.mode='adventure';
  s.bag.vest=1;
  const before=getEquippedDefense(s);
  let next=gameReducer(s,{type:'EQUIP_ITEM',slot:'body',itemId:'vest'});
  expect(next.equipment.body).toBe('vest');
  expect(getEquippedDefense(next)).toBeGreaterThan(before);
  expect(next.world).toEqual(s.world);
  s.warehouse.cap=1;
  expect(gameReducer(s,{type:'EQUIP_ITEM',slot:'head',itemId:'cap'})).toBe(s);
  next.enemyCounter={id:1,itemId:'radio',damage:4,hit:true,phase:'waiting'};
  expect(gameReducer(next,{type:'UNEQUIP_ITEM',slot:'body'})).toBe(next);
 });
 it('draws exact clinic supplies instead of unrelated placeholders',()=>{
  for(const {id} of CLINIC_SUPPLIES){
   const html=renderToStaticMarkup(createElement(ItemArt,{id}));
   expect(html).toContain('<svg');
   expect(html).toContain(`data-item-id="${id}"`);
  }
 });
});
