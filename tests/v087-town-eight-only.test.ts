import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {TOWN_FACILITIES,TOWN_SERVICES,TOWN_QUESTS} from '../src/game/data/town';
import {getTownServiceLock,getTownServiceFee} from '../src/game/engine/townActions';

const file=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=file('src/features/town/TownPage.tsx');
const modal=file('src/features/town/TownFacilityDialog.tsx');
const css=file('src/styles/_v087-town-dialogs.scss');

describe('v0.8.7 eight-facility town hub',()=>{
 it('has exactly eight navigable facility buttons and no duplicate inline detail below them',()=>{
  expect(TOWN_FACILITIES).toHaveLength(8);
  expect(page).toContain('TOWN_FACILITIES.map(f=>');
  expect(page).toContain('className="town-v15__facilities"');
  expect(page).not.toContain('className="town-v15__detail"');
  expect(page).not.toContain('className="town-v15__footer"');
  expect(page).not.toContain('town-v15__keeper');
  expect(page).toContain('aria-haspopup="dialog"');
  const gridEnd=page.indexOf('  </section>',page.indexOf('className="town-v15__facilities"'));
  expect(gridEnd).toBeGreaterThan(0);
  expect(page.indexOf('<TownFacilityDialog',gridEnd)).toBeGreaterThan(gridEnd);
 });
 it('keeps the three mature facility dialogs and opens five legacy screens independently',()=>{
  expect(page).toContain("if(f.id==='inn')setRestDialog('rest_cot')");
  expect(page).toContain("else if(f.id==='clinic')setClinicOpen(true)");
  expect(page).toContain("else if(f.id==='workshop')setWorkshopOpen(true)");
  expect(page).toContain('else setFacilityDialog(f.id)');
  expect(page).toContain('setRestCinematic(selectedBed)');
  for(const facility of ['tavern','training','noticeboard','laundry','canteen']){
   expect(modal).toContain(facility);
   expect(TOWN_FACILITIES.some(x=>x.id===facility)).toBe(true);
  }
 });
 it('retains all service data, real action locks and fees after relocating the UI',()=>{
  const s=makeInitialState('journalist');
  const secondary=['tavern','training','noticeboard','laundry','canteen'];
  const services=TOWN_SERVICES.filter(x=>secondary.includes(x.facility));
  expect(services.map(x=>x.id)).toEqual(['tavern_rumor','train','bath','wash_clothes','hot_meal','canteen_talk']);
  expect(modal).toContain('getTownServiceLock(s,service.id,attribute)');
  expect(modal).toContain('getTownServiceFee(s,service.id,attribute)');
  expect(modal).toContain("dispatch({type:'TOWN_SERVICE',serviceId,attribute})");
  for(const service of services){
   expect(getTownServiceFee(s,service.id,'observation')).toBeGreaterThanOrEqual(0);
   expect(typeof getTownServiceLock(s,service.id,'observation')==='string'||getTownServiceLock(s,service.id,'observation')===null).toBe(true);
  }
 });
 it('preserves noticeboard accept/complete actions, requirements and training selector',()=>{
  expect(TOWN_QUESTS).toHaveLength(5);
  expect(modal).toContain("type:'TOWN_ACCEPT_QUEST'");
  expect(modal).toContain("type:'TOWN_COMPLETE_QUEST'");
  expect(modal).toContain('townQuestReady(s,quest)');
  expect(modal).toContain('status===\'completed\'');
  expect(modal).toContain('onChange={event=>setAttribute(event.target.value as AttributeId)}');
  expect(modal).toContain('s.player.attributes[id]');
 });
 it('keeps facility scroll and actions within an accessible overlay rather than the town hub',()=>{
  expect(modal).toContain('role="dialog" aria-modal="true"');
  expect(modal).toContain("pauseClock('dialog',true)");
  expect(modal).toContain("pauseClock('dialog',false)");
  expect(modal).toContain('onPointerDown={scroll.onPointerDown}');
  expect(modal).toContain('onPointerMove={scroll.onPointerMove}');
  expect(modal).toContain('onClickCapture={scroll.onClickCapture}');
  expect(modal).toContain('onPointerDown={event=>event.stopPropagation()}');
  expect(modal).toContain('返回避難所');
  expect(css).toContain('overflow-x:hidden;overflow-y:auto');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('scrollbar-width:none');
 });
 it('retains the expanded negative-status browsing fix and only advances minor patch version',()=>{
  expect(page).toContain('<TownVitalStatus state={s}/>');
  expect(page).toContain('ref={townScroll.scrollRef}');
  expect(page).toContain('onPointerMove={townScroll.onPointerMove}');
  expect(JSON.parse(file('package.json')).version).toMatch(/^0\\.8\\.\\d+$/);
 });
});
