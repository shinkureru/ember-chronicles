import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {getVisibleActions,calculateActionPreview,retreatPreview} from '../src/game/engine/rules';
import {TOWN_SERVICES} from '../src/game/data/town';
import {townServiceHungerCost,townHungerProjection,actionHungerCost,
 HUNGER_MAX,HUNGER_COST_MINUTES_PER_POINT,HUNGER_DEFEAT_COST,HUNGER_FIELD_GEAR_COST,
 HUNGER_CLINIC_PURCHASE_COST,HUNGER_QUEST_HANDIN_COST,hungerCostFromMinutes,
 projectedHunger,hungerRisk,hungerSuccessPenalty} from '../src/game/engine/hungerCosts';
import {getTownServiceLock} from '../src/game/engine/townActions';
import {previewConsumable} from '../src/game/engine/consumables';
const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const townState=()=>{const s=makeInitialState('journalist');s.world.minute=16*60;s.economy.coins=5000;return s};
describe('v0.8.34 single-sourced hunger price and bounded state',()=>{
 it('converts historic minutes to positive bounded hunger, with explicit exemptions',()=>{
  expect(HUNGER_COST_MINUTES_PER_POINT).toBe(20);
  expect(HUNGER_MAX).toBe(100);
  expect([0,2,8,20,21,30,40,50,65,90,95,120,180].map(hungerCostFromMinutes))
   .toEqual([0,1,1,1,2,2,2,3,4,5,5,6,9]);
  expect(HUNGER_DEFEAT_COST).toBe(6);
  expect(HUNGER_FIELD_GEAR_COST).toBe(1);
  expect(HUNGER_CLINIC_PURCHASE_COST).toBe(1);
  expect(HUNGER_QUEST_HANDIN_COST).toBe(1);
  expect(hungerCostFromMinutes(-1)).toBe(0);
  expect(hungerCostFromMinutes(NaN)).toBe(0);
  for(const [before,delta,expected] of [[0,-38,0],[20,-38,0],[69,1,70],[89,2,91],[99,9,100],[100,10,100]]){
   expect(projectedHunger(before,delta)).toBe(expected);
  }
  expect(hungerSuccessPenalty(69)).toBe(0);
  expect(hungerSuccessPenalty(70)).toBe(4);
  expect(hungerSuccessPenalty(90)).toBe(10);
  expect(hungerSuccessPenalty(100)).toBe(16);
  expect(hungerRisk(69,70)?.title).toContain('70');
  expect(hungerRisk(89,90)?.title).toContain('90');
  expect(hungerRisk(99,100)?.title).toContain('100');
  expect(hungerRisk(10,15)).toBeNull();
 });
 it('has one cost for every town service and exactly preserves hot meal healing',()=>{
  expect(TOWN_SERVICES).toHaveLength(16);
  for(const service of TOWN_SERVICES){
   const costByService:Record<string,number>={
    rest_cot:3,rest_private:5,rest_short:2,
    clinic_general:2,clinic_wounds:2,clinic_infection:3,clinic_poison:3,clinic_illness:3,
    workshop_repair:3,workshop_upgrade:5,tavern_rumor:2,train:5,bath:3,
    wash_clothes:4,hot_meal:0,canteen_talk:2,
   };
   const expected=costByService[service.id];
   expect(townServiceHungerCost(service.id)).toBe(expected);
  }
  const state=townState();
  state.player.hunger=80;
  const food=townHungerProjection(state,'hot_meal');
  expect(food.hungerDelta).toBe(-38);
  expect(food.projectedHunger).toBe(42);
  const result=gameReducer(state,{type:'TOWN_SERVICE',serviceId:'hot_meal'});
  expect(result.player.hunger).toBe(food.projectedHunger);
  expect(result.player.stamina).toBeGreaterThanOrEqual(state.player.stamina);
  expect(result.world).toEqual(state.world);
 });
 it('uses one preview to commit every inn, clinic, workshop and other town service',()=>{
  const services=['rest_cot','rest_private','rest_short','clinic_wounds','clinic_infection',
   'clinic_poison','clinic_illness','clinic_general','workshop_repair','workshop_upgrade',
   'tavern_rumor','train','bath','wash_clothes','hot_meal','canteen_talk'];
  for(const id of services){
   const s=townState();s.player.hunger=68;s.player.health=3;s.player.stamina=4;
   s.conditions={wounds:3,infection:3,poisoning:3,illness:3};
   s.equipment.body='vest';s.bag.vest=1;s.bag.tape=1;s.town!.armorHits!.vest=5;s.town!.wear.vest=65;
   const attribute=id==='train'?'observation':undefined;
   const itemId=id.startsWith('workshop_')?'vest':undefined;
   expect(getTownServiceLock(s,id,attribute,itemId),id).toBeNull();
   const p=townHungerProjection(s,id),before=structuredClone(s);
   const after=gameReducer(s,{type:'TOWN_SERVICE',serviceId:id,attribute,itemId});
   expect(after).not.toBe(s);
   expect(after.player.hunger,id).toBe(p.projectedHunger);
   expect(after.world,id).toEqual(before.world);
   expect(s,id).toEqual(before);
  }
 });
 it('does not charge hunger for a rejected service or UI-only actions',()=>{
  const s=townState();s.player.hunger=55;s.economy.coins=0;
  const locked=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'train',attribute:'observation'});
  expect(locked).toBe(s);
  const selected=gameReducer(s,{type:'SELECT_STAGE',stageId:1});
  expect(selected.player.hunger).toBe(55);
  const before=structuredClone(s);
  const realtime=gameReducer(s,{type:'WORLD_CLOCK_SYNC',nowMs:Date.parse('2026-11-13T16:00:00Z')});
  expect(realtime.player.hunger).toBe(55);
  expect(s).toEqual(before);
 });
 it('uses preview == reducer for exploration, without accelerating Taipei time',()=>{
  let s=townState();s=gameReducer(s,{type:'START_ATTEMPT'});
  s.player.hunger=69;
  const choice=getVisibleActions(s).find(c=>c.id==='gate_observe')!;
  const preview=calculateActionPreview(s,choice,null);
  expect(preview.hungerCost).toBe(actionHungerCost(choice));
  expect(preview.projectedHunger).toBe(projectedHunger(69,preview.hungerCost));
  const originalWorld={...s.world};
  const next=gameReducer(s,{type:'CHOOSE',choiceId:choice.id,skillId:null});
  expect(next.player.hunger).toBe(preview.projectedHunger);
  expect(next.world).toEqual(originalWorld);
  expect(preview.warnings.some(w=>w.title.includes('70'))).toBe(preview.projectedHunger>=70);
  expect(actionHungerCost({id:'loot_exit',minutes:30})).toBe(0);
  expect(actionHungerCost({id:'alley_loot_exit',minutes:10})).toBe(0);
 });
 it('high hunger weakens subsequent chance while keeping guaranteed actions unchanged',()=>{
  const s=townState();s.mode='adventure';
  const action={...getVisibleActions(s).find(c=>c.id==='gate_observe')!,baseChance:52}; // force a non-guaranteed chance away from 5/95 caps
  s.player.hunger=69;const before=calculateActionPreview(s,action,null).chance;
  s.player.hunger=70;const mild=calculateActionPreview(s,action,null).chance;
  s.player.hunger=90;const heavy=calculateActionPreview(s,action,null).chance;
  s.player.hunger=100;const critical=calculateActionPreview(s,action,null).chance;
  expect(before-mild).toBe(4);
  expect(mild-heavy).toBe(6);
  expect(heavy-critical).toBe(6);
  const retreatBefore=retreatPreview({...s,player:{...s.player,hunger:0}}).chance;
  const retreatAfter=retreatPreview(s).chance;
  expect(retreatBefore-retreatAfter).toBe(16);
  const free=actionHungerCost({id:'alley_loot_exit',minutes:30});
  expect(free).toBe(0);
 });
 it('retreat pays once, failure additionally pays defeat cost, return home is free',()=>{
  const s=townState();s.mode='adventure';s.player.hunger=80;s.rngSeed=0;
  const forecast=retreatPreview(s);
  const after=gameReducer(s,{type:'RETREAT'});
  expect(after.player.hunger).toBe(projectedHunger(80,forecast.hungerCost+(after.outcome==='defeat'?HUNGER_DEFEAT_COST:0)));
  expect(after.world).toEqual(s.world);
  expect(after.mode).toBe('result');
  expect(gameReducer(after,{type:'RETURN_HUB'}).player.hunger).toBe(after.player.hunger);
  const dead=townState();dead.mode='adventure';dead.player.hunger=91;dead.player.health=1;dead.enemyCounter={id:1,itemId:'radio',damage:6,hit:true,phase:'throwing'};
  const hit=gameReducer(dead,{type:'ENEMY_COUNTER_HIT'});
  const defeated=gameReducer(hit,{type:'ENEMY_COUNTER_FINISH'});
  expect(defeated.player.hunger).toBe(97);
  expect(defeated.world).toEqual(dead.world);
  expect(defeated.clues.length).toBeGreaterThan(0);
 });
 it('field equipment, clinic purchases and quest hand-ins pay only when committed',()=>{
  const s=townState();s.player.hunger=96;s.bag.vest=1;s.mode='adventure';
  const equipped=gameReducer(s,{type:'EQUIP_ITEM',slot:'body',itemId:'vest'});
  expect(equipped.player.hunger).toBe(97);
  expect(gameReducer(equipped,{type:'EQUIP_ITEM',slot:'body',itemId:'vest'})).toBe(equipped);
  const unequipped=gameReducer(equipped,{type:'UNEQUIP_ITEM',slot:'body'});
  expect(unequipped.player.hunger).toBe(98);
  const city=townState();city.player.hunger=40;
  const bought=gameReducer(city,{type:'CLINIC_BUY_ITEM',itemId:'sterile_bandage'});
  expect(bought.player.hunger).toBe(41);
  expect(bought.bag.sterile_bandage).toBe(1);
  expect(gameReducer(city,{type:'CLINIC_COMPLETE_DAILY'})).toBe(city);
  const quest=townState();quest.player.hunger=30;
  quest.bag.water=2;quest.town!.quests.emergency_water='accepted';
  const completed=gameReducer(quest,{type:'TOWN_COMPLETE_QUEST',questId:'emergency_water'});
  expect(completed.player.hunger).toBe(31);
  expect(completed.world).toEqual(quest.world);
 });
 it('consumables continue healing hunger by twenty with no hidden cost',()=>{
  const s=townState();s.player.hunger=5;s.bag.biscuit=1;
  const preview=previewConsumable(s,'biscuit')!;
  expect(preview.player.hunger).toBe(0);
  const after=gameReducer(s,{type:'USE_ITEM',itemId:'biscuit'});
  expect(after.player.hunger).toBe(preview.player.hunger);
  const canned=townState();canned.player.hunger=100;canned.bag.canned=1;
  expect(gameReducer(canned,{type:'USE_ITEM',itemId:'canned'}).player.hunger).toBe(80);
 });
 it('shows exact costs and warnings in all active interfaces without old time labels',()=>{
  for(const [file,parts] of [
   ['src/features/chapter/ActionDecision.tsx',['preview.appliedHungerCost','preview.projectedHunger','v0834-hunger-risk']],
   ['src/features/chapter/SkillComparison.tsx',['data.original.hungerCost']],
   ['src/features/chapter/RetreatDialog.tsx',['r.hungerCost','HUNGER_DEFEAT_COST']],
   ['src/features/town/InnRestDialog.tsx',['townHungerProjection','hungerWarning']],
   ['src/features/town/ClinicDialog.tsx',['townHungerProjection','HUNGER_CLINIC_PURCHASE_COST']],
   ['src/features/town/WorkshopDialog.tsx',['repairHunger','upgradeHunger']],
   ['src/features/town/TownFacilityDialog.tsx',['signedHunger(hunger.hungerDelta)','HUNGER_QUEST_HANDIN_COST']],
   ['src/features/chapter/FieldBagDialog.tsx',['HUNGER_FIELD_GEAR_COST']],
  ] as const)for(const token of parts)expect(read(file),file).toContain(token);
  expect(read('src/game/engine/resolve.ts')).not.toContain('advanceTime(');
  expect(read('src/app/GameContext.tsx')).toContain("type:'WORLD_CLOCK_SYNC'");
  expect(JSON.parse(read('package.json')).version).toBe('0.8.37');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.37');
 });
});
