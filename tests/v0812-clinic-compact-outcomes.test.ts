import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {clinicTreatmentOutcomes,clinicTreatmentPreview,CLINIC_TREATMENTS} from '../src/game/engine/clinic';
import {getTownServiceLock} from '../src/game/engine/townActions';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const jsx=read('src/features/town/ClinicDialog.tsx');
const css=read('src/styles/_v0812-clinic-compact-outcomes.scss');

describe('v0.8.12 compact clinic treatment outcomes',()=>{
 it('keeps each original colored before/after segment and accessible range text',()=>{
  expect(jsx).toContain('function ClinicTreatmentMeter');
  expect(jsx).toContain('clinic-dialog__outcome-head');
  expect(jsx).toContain('clinic-dialog__outcome-numbers');
  expect(jsx).toContain('clinic-dialog__outcome-track');
  expect(jsx).toContain('role="img" aria-label={');
  expect(jsx).toContain('clinic-dialog__outcome-current');
  expect(jsx).toContain('clinic-dialog__outcome-change');
  expect(jsx).toContain('percent(greater)-percent(lesser)');
  const oldCss=read('src/styles/_v086-clinic-polish.scss');
  for(const term of [
   '.clinic-dialog__outcome--health .clinic-dialog__outcome-current',
   '.clinic-dialog__outcome--health .clinic-dialog__outcome-change',
   '.clinic-dialog__outcome--stamina .clinic-dialog__outcome-current',
   '.clinic-dialog__outcome--fatigue .clinic-dialog__outcome-change',
  ])expect(oldCss).toContain(term);
 });
 it('compresses stacked cards to a readout row and full-width narrow meter, with readable labels',()=>{
  expect(css).toContain('grid-template-columns:minmax(0,1fr)!important');
  expect(css).toContain('grid-template-columns:minmax(0,1fr) max-content');
  expect(css).toContain('grid-template-rows:auto auto;');
  expect(css).toContain('grid-column:1/-1;');
  expect(css).toContain('height:9px');
  expect(css).toContain('padding:8px 10px!important');
  expect(css).toContain('flex-wrap:wrap');
  expect(css).toContain('font-variant-numeric:tabular-nums');
  expect(css).toContain('white-space:nowrap');
  expect(css).toContain('min-width:0');
 });
 it('avoids overflow on very narrow or short screens and leaves other clinic tabs alone',()=>{
  expect(css).toContain('@media(max-width:360px)');
  expect(css).toContain('grid-template-rows:auto auto auto;');
  expect(css).toContain('@media(max-height:650px)');
  expect(css).not.toContain('.clinic-dialog__card--supply');
  expect(css).not.toContain('.clinic-dialog__daily');
  expect(css).not.toContain('.clinic-dialog__scene');
  expect(css).not.toContain('overflow:hidden');
  expect(read('src/styles/main.scss')).toContain('@import "v0812-clinic-compact-outcomes"');
 });
 it('does not change clinic service calculations, prices, and treatment restrictions',()=>{
  const state=makeInitialState('journalist');
  state.player.health=6;
  state.conditions={wounds:6,infection:0,poisoning:0,illness:0};
  const woundResults=clinicTreatmentOutcomes(state,'clinic_wounds');
  expect(woundResults.find(row=>row.key==='health')).toMatchObject({before:6,after:10});
  expect(woundResults.find(row=>row.key==='wounds')).toMatchObject({before:6,after:4});
  expect(CLINIC_TREATMENTS.length).toBeGreaterThan(0);
  expect(typeof clinicTreatmentPreview(state,'clinic_wounds').fee).toBe('number');
  expect(getTownServiceLock(state,'clinic_wounds')).not.toBe(undefined);
  for(const term of [
   'clinicTreatmentOutcomes(s,service.id)','clinicTreatmentPreview(s,service.id)',
   'getTownServiceLock(s,service.id)',"type:'TOWN_SERVICE'",
   "type:'CLINIC_BUY_ITEM'","type:'CLINIC_ACCEPT_DAILY'","type:'CLINIC_COMPLETE_DAILY'",
   "useClinicDragScroll()",
  ])expect(jsx).toContain(term);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.12');
 });
});
