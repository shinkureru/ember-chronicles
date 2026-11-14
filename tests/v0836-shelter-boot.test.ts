import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {loadGame,saveGame,clearPrototypeSave,resetPrototypeAndReload} from '../src/game/state/storage';
import {BOOT_PRESENTATION_MS} from '../src/app/BootSplash';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
afterEach(()=>vi.unstubAllGlobals());

describe('v0.8.36: boot cover and prototype full-restart',()=>{
 it('boots on every fresh app mount and entirely outside the old game frame',()=>{
  const app=read('src/app/App.tsx');
  const boot=read('src/app/BootSplash.tsx');
  expect(BOOT_PRESENTATION_MS).toBeGreaterThanOrEqual(850);
  expect(BOOT_PRESENTATION_MS).toBeLessThanOrEqual(1800);
  expect(app).toContain('<GameBootGate><Frame>');
  expect(app).toContain('booting?<BootSplash');
  expect(boot).toContain('window.setTimeout(onComplete,BOOT_PRESENTATION_MS)');
  expect(boot).toContain('window.clearTimeout(timer)');
  expect(boot).toContain('aria-live="polite"');
  expect(boot).not.toContain('localStorage');
  const css=read('src/styles/_v0836-boot-splash.scss');
  expect(css).toContain('position:fixed;inset:0');
  expect(css).toContain('100svh');
  expect(css).toContain('prefers-reduced-motion:reduce');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0839-shelter-build";$/);
 });
 it('deletes only this game save then calls full-page reload instead of RESET',()=>{
  const original=makeInitialState('journalist');
  original.economy.coins=987;
  original.warehouse.wrench=3;
  const entries=new Map<string,string>([['unrelated-preference','keep'],['ember-chronicles-prototype-v1',JSON.stringify(original)]]);
  const removed:string[]=[];
  vi.stubGlobal('localStorage',{
   getItem:(k:string)=>entries.get(k)??null,
   setItem:(k:string,v:string)=>{entries.set(k,v)},
   removeItem:(k:string)=>{removed.push(k);entries.delete(k)},
  });
  expect(loadGame().economy.coins).toBe(987);
  expect(saveGame(original)).toBe(true);
  const reloader=vi.fn(()=>{
   expect(entries.has('ember-chronicles-prototype-v1')).toBe(false);
  });
  expect(resetPrototypeAndReload(reloader)).toBe(true);
  expect(reloader).toHaveBeenCalledTimes(1);
  expect(removed).toEqual(['ember-chronicles-prototype-v1']);
  expect(entries.get('unrelated-preference')).toBe('keep');
  const fresh=loadGame();
  expect(fresh.profession).toBeNull();
  expect(fresh.economy.coins).toBe(120);
  expect(fresh.warehouse.wrench).toBe(1);
 });
 it('refuses reload when browser storage removal is rejected',()=>{
  const reload=vi.fn();
  vi.stubGlobal('localStorage',{removeItem:()=>{throw new Error('blocked by browser')}});
  expect(clearPrototypeSave()).toBe(false);
  expect(resetPrototypeAndReload(reload)).toBe(false);
  expect(reload).not.toHaveBeenCalled();
 });
 it('keeps RESET action and existing profession flow for later onboarding batches',()=>{
  const s=makeInitialState('courier');
  const reset=gameReducer(s,{type:'RESET'});
  expect(reset.profession).toBeNull();
  expect(reset.mode).toBe('home');
  expect(s.profession).toBe('courier');
  expect(read('src/features/chapter/HomePage.tsx')).toContain('<ShelterHomePage/>');
  expect(read('src/app/App.tsx')).toContain('path="/world-map"');
  expect(read('src/features/dev/DevPage.tsx')).toContain('resetPrototypeAndReload()');
  expect(read('src/app/App.tsx')).toContain('resetPrototypeAndReload()');
 });
 it('updates both package versions and does not add new UI or world clock rules',()=>{
  expect(JSON.parse(read('package.json')).version).toBe('0.8.39');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.39');
  expect(read('src/app/GameContext.tsx')).toContain("type:'WORLD_CLOCK_SYNC'");
  expect(read('src/app/App.tsx')).toContain('<Route path="/chapter" element={<ChapterPage/>}/>');
  expect(read('src/app/App.tsx')).toContain('<Route path="/black-market" element={<BlackMarketPage/>}/>');
 });
});
