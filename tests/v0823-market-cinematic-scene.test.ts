import {describe,expect,it} from 'vitest';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {MARKET_VENDORS} from '../src/game/data/marketVendors';
import {getScheduledVendor} from '../src/game/data/marketSchedule';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read('src/features/market/BlackMarketPage.tsx');
const scene=read('src/features/market/BlackMarketSceneArt.tsx');
const css=read('src/styles/_v0823-market-cinematic-scene.scss');
const asset=join(process.cwd(),'public/black-market-merchant.webp');

describe('v0.8.23 locally bundled cinematic black market scene',()=>{
 it('ships a real compressed WebP and uses Vite base URL for GitHub Pages',()=>{
  expect(existsSync(asset)).toBe(true);
  const b=readFileSync(asset);
  expect(statSync(asset).size).toBe(b.length);
  expect(b.length).toBeGreaterThan(10000);
  expect(b.length).toBeLessThan(40000);
  expect(b.subarray(0,4).toString('ascii')).toBe('RIFF');
  expect(b.subarray(8,12).toString('ascii')).toBe('WEBP');
  expect(scene).toContain('import.meta.env.BASE_URL');
  expect(scene).toContain('black-market-merchant.webp');
  expect(scene).toContain('viewBox="0 0 960 536"');
  expect(scene).toContain('preserveAspectRatio="xMidYMin slice"');
  expect(scene).toContain('<image href={imageUrl}');
 });
 it('glows exactly over the original illustration eyes and its ambient lamps',()=>{
  expect(scene).toContain('cx="335" cy="121"');
  expect(scene).toContain('cx="384" cy="128"');
  expect(scene).toContain('cx="529" cy="51"');
  expect(scene).toContain('cx="202" cy="67"');
  expect(scene).toContain('market-v0823__eyes');
  expect(scene).toContain('market-v0823__warm-light');
  expect(scene).toContain('market-v0823__cold-light');
  expect(css).toContain('@keyframes market-v0823-eyes');
  expect(css).toContain('@keyframes market-v0823-warm');
  expect(css).toContain('@keyframes market-v0823-cold');
  expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  expect(css).toContain('animation:none!important');
  expect(css).toContain('pointer-events:none');
 });
 it('replaces two portrait layout with static scene while keeping actual vendor identity',()=>{
  expect(page).toContain('market-v12__meeting market-v0823__meeting');
  expect(page).toContain('<BlackMarketSceneArt/>');
  expect(page).toContain('market-v0823__vendor');
  expect(page).toContain('{vendor.name}');
  expect(page).toContain('{vendor.role}');
  expect(page).toContain('{vendor.line}');
  expect(page).toContain('market-v12__dialogue market-v0823__dialogue');
  expect(page).not.toContain('<MarketPortrait');
  expect(page).not.toContain('<SurvivorFigure');
  expect(MARKET_VENDORS.map(x=>x.id)).toHaveLength(5);
  expect(new Set(MARKET_VENDORS.map(x=>x.id)).size).toBe(5);
  const scheduled=[6,12,16,20,2].map(h=>getScheduledVendor(h*60).id);
  expect(scheduled).toEqual(['mechanic','medic','broker','runner','scavenger']);
 });
 it('keeps dynamic world-time badge and displays real favor on the right with proper range',()=>{
  for(const token of [
   'worldPhaseToken(s.world.minute)','getScheduledVendor(s.world.minute)',
   'worldPhase(s.world.minute)','worldClock(s.world.minute)',
   'market-v12__time market-v0823__time',
   'market-v13__favor market-v0823__favor',
   's.economy.blackMarketFavor}/100',
   'role="progressbar"','aria-valuemin={0}','aria-valuemax={100}',
   'aria-valuenow={Math.max(0,Math.min(100,s.economy.blackMarketFavor))}',
   'market-v0823__favor-meter',
  ])expect(page).toContain(token);
  const state=makeInitialState('journalist');
  state.world.minute=12*60;
  state.bag.bandage=1;
  const next=gameReducer(state,{type:'MARKET_SELL_ITEM',vendorId:'medic',itemId:'bandage'});
  expect(next.economy.blackMarketFavor).toBe(state.economy.blackMarketFavor+1);
  expect(next.world.minute).toBe(state.world.minute);
 });
 it('preserves narrow/short viewport readability and does not overlap catalog/filter/footer',()=>{
  expect(css).toContain('flex:0 0 clamp(180px,31%,285px)');
  expect(css).toContain('.market-v0823__shade');
  expect(css).toContain('.market-v0823__vendor');
  expect(css).toContain('.market-v12__dialogue.market-v0823__dialogue');
  expect(css).toContain('.market-v13__favor.market-v0823__favor');
  expect(css).toContain('right:7px');
  expect(css).toContain('bottom:5px');
  expect(css).toContain('overflow-wrap:anywhere');
  expect(css).toContain('@media(max-width:375px)');
  expect(css).toContain('@media(max-height:700px)');
  expect(css).toContain('@media(max-height:520px)');
  expect(css).not.toContain('position:fixed');
  expect(read('src/styles/main.scss')).toContain('@import "v0823-market-cinematic-scene"');
  for(const t of [
   'market-v12__offers market-v081__catalog','market-v13__filters',
   'market-v12__modes','market-v10__footer',
   "type:'MARKET_BUY_ITEM'","type:'MARKET_SELL_ITEM'",
   "type:'MARKET_BUY'","type:'MARKET_SELL'",
   'ReturnMainLink','GameUtilities','selected&&mode&&',
  ])expect(page).toContain(t);
  expect(JSON.parse(read('package.json')).version).toBe('0.8.23');
 });
});
