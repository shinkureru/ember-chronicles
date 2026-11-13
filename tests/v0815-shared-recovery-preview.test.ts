import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {TOWN_SERVICES} from '../src/game/data/town';
import {previewInnRest,remainingDailyRest,type RestServiceId} from '../src/game/engine/innRest';
import {clinicTreatmentOutcomes} from '../src/game/engine/clinic';
import {getTownServiceLock} from '../src/game/engine/townActions';
import {gameReducer} from '../src/game/engine/resolve';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const inn=read('src/features/town/InnRestDialog.tsx');
const clinic=read('src/features/town/ClinicDialog.tsx');
const css=read('src/styles/_v0815-shared-recovery-preview.scss');

describe('v0.8.15 shared recovery preview and stable inn checkout',()=>{
 it('reuses the same 6px two-tone token and keeps all color semantics',()=>{
  expect(css).toContain('--recovery-meter-height:6px');
  expect(css).toContain('height:var(--recovery-meter-height)!important');
  expect(css).toContain('--recovery-current:#ef5264');
  expect(css).toContain('--recovery-change:#ef9ca6');
  expect(css).toContain('--recovery-current:#54b59f');
  expect(css).toContain('--recovery-change:#a9dbcf');
  expect(css).toContain('--recovery-current:#a08cc5');
  expect(css).toContain('--recovery-change:#c4b4df');
  expect(css).toContain('.recovery-preview-meter > i:first-child');
  expect(css).toContain('.recovery-preview-meter > i:last-child');
  expect(inn).toContain('className="inn-rest-meter recovery-preview-meter"');
  expect(clinic).toContain('className="clinic-dialog__outcome-track recovery-preview-meter"');
  expect(inn).toContain('inn-rest-value--${stat.kind} recovery-preview-card');
  expect(clinic).toContain('clinic-dialog__outcome--${outcome.key} recovery-preview-card');
  expect(read('src/styles/main.scss')).toContain('@import "v0815-shared-recovery-preview"');
 });
 it('preserves independent segment formulas and rich accessible labels',()=>{
  expect(inn).toContain('inn-rest-meter__current');
  expect(inn).toContain('inn-rest-meter__gain');
  expect(inn).toContain('percent(stat.after-stat.now,stat.max)');
  expect(inn).toContain('role="progressbar"');
  expect(inn).toContain('aria-valuenow={stat.after}');
  expect(clinic).toContain('clinic-dialog__outcome-current');
  expect(clinic).toContain('clinic-dialog__outcome-change');
  expect(clinic).toContain('percent(greater)-percent(lesser)');
  expect(clinic).toContain('role="img" aria-label={');
  expect(clinic).toContain('clinicTreatmentOutcomes(s,service.id)');
 });
 it('fixes insufficient-coin layout by pinning a reserved status area above the footer',()=>{
  const scrollStart=inn.indexOf('className="inn-rest-dialog__scroll"');
  const advice=inn.indexOf('className="inn-rest-advice"');
  const checkout=inn.indexOf('className="inn-rest-dialog__checkout"');
  const footer=inn.indexOf('<footer>');
  expect(scrollStart).toBeGreaterThan(0);
  expect(scrollStart).toBeLessThan(advice);
  expect(advice).toBeLessThan(checkout);
  expect(checkout).toBeLessThan(footer);
  expect(inn).toContain('role="status" aria-live="polite" aria-atomic="true"');
  expect(inn).toContain('inn-rest-blocked ${blocked?\'is-blocked\':\'is-clear\'}');
  expect(inn).toContain("{blocked??' '}");
  expect(css).toContain('min-height:15px');
  expect(css).toContain('.inn-rest-blocked.is-clear');
  expect(css).toContain('visibility:hidden');
  expect(css).toContain('height:auto!important');
  expect(css).toContain('flex:0 0 auto');
  expect(css).toContain('overflow-y:auto');
 });
 it('reduces card/readout/advice sizes without clipping pricing or the action buttons',()=>{
  expect(css).toContain('grid-template-rows:auto var(--recovery-meter-height) auto');
  expect(css).toContain('font-size:var(--recovery-readout-size)!important');
  expect(css).toContain('min-height:51px');
  expect(css).toContain('min-height:36px!important');
  expect(css).toContain('grid-template-columns:minmax(0,1fr) max-content');
  expect(css).toContain('overflow-wrap:anywhere');
  expect(css).toContain('@media(max-width:365px)');
  expect(css).toContain('@media(max-height:620px)');
  expect(css).toContain('@media(max-height:460px)');
  expect(inn).toContain('getTownServiceLock(s,selected)');
  expect(inn).toContain('disabled={!!blocked}');
  expect(inn).toContain('onConfirm(selected)');
  expect(inn).toContain('remainingDailyRest(s)');
 });
 it('does not change recovery, fees, pay locks, or clinic treatment mechanics',()=>{
  for(const kind of ['rest_cot','rest_private','rest_short'] as RestServiceId[]){
   const state=makeInitialState('journalist');
   state.player.health=3;
   state.player.stamina=4;
   const forecast=previewInnRest(state,kind);
   const result=gameReducer(state,{type:'TOWN_SERVICE',serviceId:kind});
   expect(result.player.health).toBe(forecast.predictedHealth);
   expect(result.player.stamina).toBe(forecast.predictedStamina);
  }
  const noCoins=makeInitialState('journalist');
  noCoins.economy.coins=0;
  expect(getTownServiceLock(noCoins,'rest_private')).toContain('舊幣不足');
  expect(remainingDailyRest(noCoins)).toBe(2);
  expect(TOWN_SERVICES.find(x=>x.id==='rest_private')?.coins).toBe(40);
  const injured=makeInitialState('journalist');
  injured.player.health=6;
  injured.conditions={wounds:6,infection:0,poisoning:0,illness:0};
  expect(clinicTreatmentOutcomes(injured,'clinic_wounds').find(x=>x.key==='health')).toMatchObject({before:6,after:10});
  expect(clinicTreatmentOutcomes(injured,'clinic_wounds').find(x=>x.key==='wounds')).toMatchObject({before:6,after:4});
  expect(JSON.parse(read('package.json')).version).toBe('0.8.15');
 });
 it('does not force single-color HUD/town/armor bars into two-tone previews',()=>{
  for(const path of ['src/features/town/TownVitalStatus.tsx','src/features/town/WorkshopDialog.tsx','src/components/StatBar.tsx']){
   expect(read(path)).not.toContain('recovery-preview-meter');
  }
  expect(clinic).toContain("useClinicDragScroll()");
  expect(inn).toContain("useVerticalDragScroll");
 });
});
