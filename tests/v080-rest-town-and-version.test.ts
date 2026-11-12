import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {makeInitialState} from '../src/game/state/initial';
import {previewInnRest,remainingDailyRest,type RestServiceId} from '../src/game/engine/innRest';
import {gameReducer} from '../src/game/engine/resolve';
import TownVitalStatus from '../src/features/town/TownVitalStatus';
import {REST_CINEMATIC_MS} from '../src/features/town/RestCinematic';
const src=(file:string)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

describe('v0.8.0 rest confirms use one shared calculation',()=>{
 for(const id of ['rest_cot','rest_private','rest_short'] as RestServiceId[]){
  it(`${id}: preview matches the real reducer settlement for weak and full energy`,()=>{
   for(const stamina of [0,4,10]){
    const s=makeInitialState('journalist');
    s.player.health=2;s.player.stamina=stamina;
    const prediction=previewInnRest(s,id);
    expect(prediction.healthGain).toBe(prediction.predictedHealth-s.player.health);
    expect(prediction.staminaGain).toBe(prediction.predictedStamina-s.player.stamina);
    expect(prediction.healthGain).toBeGreaterThanOrEqual(0);
    const changed=gameReducer(s,{type:'TOWN_SERVICE',serviceId:id});
    expect(changed.player.health).toBe(prediction.predictedHealth);
    expect(changed.player.stamina).toBe(prediction.predictedStamina);
    expect(changed.economy.coins).toBeLessThan(s.economy.coins);
   }
  });
 }
 it('does not encourage draining stamina when the chosen rest already heals to full',()=>{
  const s=makeInitialState('journalist');s.player.health=9;s.player.stamina=0;
  expect(previewInnRest(s,'rest_private').recommendation).toContain('無須刻意消耗體力');
 });
 it('keeps the twice-per-day rest cap after the new sleep cutscene',()=>{
  let s=makeInitialState('journalist');
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_short'});
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_cot'});
  expect(remainingDailyRest(s)).toBe(0);
  expect(gameReducer(s,{type:'TOWN_SERVICE',serviceId:'rest_short'})).toBe(s);
 });
 it('renders the current and projected gain as independently animated colored segments',()=>{
  const dialog=src('src/features/town/InnRestDialog.tsx');
  const css=src('src/styles/_v080-rest-town.scss');
  expect(dialog).toContain('inn-rest-meter__current');
  expect(dialog).toContain('inn-rest-meter__gain');
  expect(dialog).toContain('stat.after-stat.now');
  expect(css).toContain('.inn-rest-value--hp .inn-rest-meter__current{background:#ef5264}');
  expect(css).toContain('.inn-rest-value--hp .inn-rest-meter__gain{background:#ef9ca6}');
  expect(css).toContain('.inn-rest-value--stamina .inn-rest-meter__gain{background:#a9dbcf}');
  expect(css).toContain('transition:width .48s');
 });
 it('launches three distinct sleep animations and original warm musical phrases only upon confirmation',()=>{
  const town=src('src/features/town/TownPage.tsx');
  const music=src('src/audio/sound.ts');
  const cinematic=src('src/features/town/RestCinematic.tsx');
  expect(town).toContain('setRestCinematic(selectedBed)');
  expect(cinematic).toContain("kind==='rest_short'");
  expect(cinematic).toContain("kind==='rest_private'");
  expect(cinematic).toContain('playRestLullaby(kind)');
  expect(music).toContain('export const playRestLullaby');
  expect(music).toContain('config.master*config.music');
  expect(music).toContain('rest_cot:[261.63');
  expect(music).toContain('rest_private:[261.63');
  expect(music).toContain('rest_short:[293.66');
  expect(REST_CINEMATIC_MS).toBeGreaterThan(3000);
 });
});
describe('v0.8.0 town dashboard',()=>{
 it('always has four accurate meters and four icon-led expandable diagnoses',()=>{
  const s=makeInitialState('journalist');
  s.player.health=7;s.player.stamina=3;s.player.hunger=45;s.player.fatigue=60;
  s.conditions!.wounds=1;
  const html=renderToStaticMarkup(createElement(TownVitalStatus,{state:s}));
  for(const text of ['生命 HP','體力 ST','飢餓','疲勞','外傷','感染','中毒','疾病'])
   expect(html).toContain(text);
  expect(html.match(/role="progressbar"/g)?.length).toBe(4);
  expect(html).toContain('aria-valuenow="7"');
  expect(html).toContain('aria-valuenow="3"');
  expect(html).toContain('aria-valuenow="45"');
  expect(html).toContain('aria-valuenow="60"');
  expect(html).toContain('aria-expanded="false"');
 });
 it('does not invent currently unimplemented wound HP-cap or toxin damage rules',()=>{
  const code=src('src/features/town/TownVitalStatus.tsx');
  expect(code).toContain('尚未直接扣除生命上限');
  expect(code).toContain('目前不會自動扣除生命');
 });
 it('labels the next release as a pre-1.0 prototype without changing the save schema',()=>{
  const pkg=JSON.parse(src('package.json'));
  expect(pkg.version).toBe('0.8.0');
  expect(src('src/game/state/storage.ts')).toContain('ember');
 });
});
