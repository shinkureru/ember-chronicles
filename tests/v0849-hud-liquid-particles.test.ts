import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {GameProvider} from '../src/app/GameContext';
import Hud from '../src/components/Hud';
import StatBar from '../src/components/StatBar';
import {meterPercent} from '../src/components/ui/urbanUiTokens';
import {HUD_HEALTH_SPARKS,HUD_STAMINA_SPARKS,makeHudSparks} from '../src/components/ui/hudParticles';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const render=(e:ReturnType<typeof createElement>)=>renderToStaticMarkup(e);
const sha=(p:string)=>createHash('sha256').update(readFileSync(new URL('../'+p,import.meta.url))).digest('hex');

describe('v0.8.49 — actual original-PNG HUD, liquid smoke and separate fine particles',()=>{
 it('preserves the user-supplied ornate two-tone transparent sprite',()=>{
  const path='public/assets/ui/hud-frames-v0849.png';
  const image=readFileSync(new URL('../'+path,import.meta.url));
  expect(image.length).toBe(3187);
  expect(image.toString('hex',0,8)).toBe('89504e470d0a1a0a');
  expect(image.readUInt32BE(16)).toBe(512);
  expect(image.readUInt32BE(20)).toBe(70);
  expect(sha(path)).toBe('108eb1e5f1c3f45f6c3670b390e576b5aff5a73588ce652843a041bdb260b196');
 });
 it('generates 12 stable separately seeded tiny sparks per meter and never changes seed during render',()=>{
  expect(HUD_HEALTH_SPARKS).toHaveLength(12);
  expect(HUD_STAMINA_SPARKS).toHaveLength(12);
  expect(HUD_HEALTH_SPARKS).not.toEqual(HUD_STAMINA_SPARKS);
  expect(makeHudSparks(0x49ba1938)).toEqual(HUD_HEALTH_SPARKS);
  expect(makeHudSparks(0xc0219e73)).toEqual(HUD_STAMINA_SPARKS);
  for(const s of [...HUD_HEALTH_SPARKS,...HUD_STAMINA_SPARKS]){
   expect(s.size).toBeGreaterThanOrEqual(.8);
   expect(s.size).toBeLessThan(1.86);
   expect(s.duration).toBeGreaterThan(1.3);
   expect(s.duration).toBeLessThan(4.06);
   expect(s.dx).toBeGreaterThanOrEqual(-17);
   expect(s.dx).toBeLessThanOrEqual(18);
  }
 });
 it('uses real player HP and STA with independent fields and original safety percent',()=>{
  const hp=render(createElement(StatBar,{value:5,max:10,color:'red',label:'生命 HP',urban:true,liquid:true}));
  const st=render(createElement(StatBar,{value:5,max:10,color:'mint',label:'體力',urban:true,liquid:true}));
  for(const markup of [hp,st]){
   expect(markup).toContain('width:50%');
   expect((markup.match(/class="statbar__particle"/g)??[])).toHaveLength(12);
   expect(markup).toContain('assets/ui/hud-frames-v0849.png');
   expect(markup).toContain('statbar--v0849-liquid');
   expect(markup).toContain('aria-hidden="true"');
   expect(markup).toContain('5 <span class="statbar__divider">/ 10</span>');
  }
  expect(hp).toContain('statbar--v0849-red');
  expect(st).toContain('statbar--v0849-mint');
  expect(hp).not.toBe(st);
  expect(meterPercent(5,10)).toBe(50);
  expect(render(createElement(StatBar,{value:10,max:10,color:'red',label:'生命',urban:true,liquid:true}))).toContain('width:100%');
  expect(render(createElement(StatBar,{value:0,max:10,color:'mint',label:'體力',urban:true,liquid:true}))).toContain('opacity:0');
  for(const [value,max] of [[NaN,10],[Infinity,10],[-5,10],[5,0]])
   expect(render(createElement(StatBar,{value,max,color:'red',label:'生命',urban:true,liquid:true}))).toContain('width:0%');
 });
 it('does not create live sprites on unselected legacy or non-HP meters',()=>{
  for(const opts of [
   {value:1,max:2,color:'red' as const,label:'生命'},
   {value:1,max:2,color:'red' as const,label:'生命',urban:true},
   {value:1,max:2,color:'gold' as const,label:'道具',urban:true,liquid:true},
  ]){
   const html=render(createElement(StatBar,opts));
   expect(html).not.toContain('statbar__particle');
   expect(html).not.toContain('hud-frames-v0849.png');
  }
  const hud=read('src/components/Hud.tsx');
  expect(hud).toContain('hud--v0849-fluid');
  expect(hud).toContain('label="生命 HP" color="red" urban liquid');
  expect(hud).toContain('label="體力" color="mint" urban liquid');
  expect(render(createElement(GameProvider,null,createElement(MemoryRouter,null,createElement(Hud))))).toContain('hud--v0849-fluid');
 });
 it('keeps distinct smoke/current/spray speeds while honoring reduced motion and narrow HUD',()=>{
  const css=read('src/styles/_v0849-hud-liquid.scss');
  for(const token of [
   '.hud--v0849-fluid','.statbar__particle-field','.statbar__particle',
   'v0849-hp-smoke','v0849-st-smoke','v0849-hp-current','v0849-st-current',
   'v0849-hp-spray','v0849-st-spray','background-image:var(--v0849-frame-image)',
   'background-size:100% 200%','height:clamp(13px,3.1vw,17px)',
   '@media(max-width:390px)','prefers-reduced-motion:reduce','update:slow',
   '@media(forced-colors:active)','animation:none!important',
  ])expect(css).toContain(token);
  expect(css).not.toContain('requestAnimationFrame');
  expect(read('src/components/ui/hudParticles.ts')).not.toContain('Math.random');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0849-hud-liquid";$/);
 });
 it('only updates package release and leaves 14 original town/warehouse assets and save schema intact',()=>{
  expect(JSON.parse(read('package.json')).version).toBe('0.8.49');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.49');
  const old=read('tests/v0846-urban-final-integration.test.ts');
  for(const token of ['city-overview.webp','outer-ring.webp','steam-street.webp','old-core.webp','background_full.jpg','bed.png'])expect(old).toContain(token);
  expect(read('src/game/state/storage.ts')).toContain('ember-chronicles-prototype-v1');
 });
});
