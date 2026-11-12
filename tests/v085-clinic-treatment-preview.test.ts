import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {CLINIC_TREATMENTS,clinicTreatmentOutcomes,clinicTreatmentPreview} from '../src/game/engine/clinic';
import {getTownServiceLock} from '../src/game/engine/townActions';
import type {GameState} from '../src/game/types';

const file=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const measure=(s:GameState,key:string):number=>{
 const p=s.player,c=s.conditions!;
 switch(key){
  case 'health':return p.health;
  case 'stamina':return p.stamina;
  case 'fatigue':return p.fatigue;
  case 'wounds':return c.wounds;
  case 'infection':return c.infection;
  case 'poisoning':return c.poisoning;
  case 'illness':return c.illness;
 }
 throw new Error('Unknown clinic outcome '+key);
};
const injured=()=>{
 const s=makeInitialState('journalist');
 s.mode='home';s.world.minute=720;
 s.player.health=3;s.player.stamina=5;s.player.fatigue=25;
 s.economy.coins=1000;
 s.conditions={wounds:3,infection:3,poisoning:3,illness:3};
 return s;
};

describe('v0.8.5 clinic treatment projections',()=>{
 for(const treatment of CLINIC_TREATMENTS){
  it(`${treatment}: exactly matches actual reducer fields after payment`,()=>{
   const s=injured();
   expect(getTownServiceLock(s,treatment)).toBeNull();
   const outcomes=clinicTreatmentOutcomes(s,treatment);
   const quoted=clinicTreatmentPreview(s,treatment);
   const after=gameReducer(s,{type:'TOWN_SERVICE',serviceId:treatment});
   expect(after.economy.coins).toBe(s.economy.coins-quoted.fee);
   expect(after).not.toBe(s);
   expect(outcomes.length).toBeGreaterThan(0);
   for(const row of outcomes){
    expect(row.before).toBe(measure(s,row.key));
    expect(row.after).toBe(measure(after,row.key));
    expect(row.after).not.toBe(row.before);
    if(row.max!==undefined)expect(row.after).toBeLessThanOrEqual(row.max);
   }
  });
 }
 it('shows no imaginary treatment effect when stats are already healthy',()=>{
  const s=makeInitialState('journalist');
  s.player.health=s.player.maxHealth;
  s.player.stamina=s.player.maxStamina;
  s.player.fatigue=0;
  s.conditions={wounds:0,infection:0,poisoning:0,illness:0};
  for(const service of CLINIC_TREATMENTS){
   expect(clinicTreatmentOutcomes(s,service)).toEqual([]);
   expect(getTownServiceLock(s,service)).not.toBeNull();
  }
 });
 it('caps negative condition levels at zero and never overpromises healing',()=>{
  const s=injured();
  s.conditions!.wounds=1;s.conditions!.infection=1;s.player.health=s.player.maxHealth-1;
  const wound=clinicTreatmentOutcomes(s,'clinic_wounds');
  expect(wound.find(x=>x.key==='health')?.after).toBe(s.player.maxHealth);
  expect(wound.find(x=>x.key==='wounds')?.after).toBe(0);
  expect(wound.find(x=>x.key==='wounds')?.before).toBe(1);
 });
 it('adds a concise actionable triage strip inside existing treatment tab, not a second status dashboard',()=>{
  const jsx=file('src/features/town/ClinicDialog.tsx');
  const css=file('src/styles/_v085-clinic-outcomes.scss');
  expect(jsx).toContain('clinic-dialog__triage');
  expect(jsx).toContain('triageNeeds');
  expect(jsx).toContain('clinicTreatmentOutcomes(s,service.id)');
  expect(jsx).toContain('clinic-dialog__outcome-grid');
  expect(jsx).toContain('outcome.before');
  expect(jsx).toContain('outcome.after');
  expect(jsx).not.toContain('TownVitalStatus');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
  expect(css).toContain('overflow-wrap:anywhere');
  // Existing clinic already owns a draggable scrollable content pane.
  expect(jsx).toContain('ref={dragScroll.scrollRef}');
  expect(jsx).toContain('onPointerMove={dragScroll.onPointerMove}');
 });
});
