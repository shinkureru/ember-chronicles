import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {buildCardArchiveVariants} from '../src/game/engine/cardArchiveVariants';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
const src=(file:string)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

describe('v0.8.2 card variant modeling',()=>{
 it('shows unowned in gray level 1, owned I as total copies, and upgraded primary separate from I duplicates',()=>{
  const ids=['a','b','c'];
  const owned={a:{copies:0,level:1},b:{copies:3,level:1},c:{copies:2,level:3}};
  expect(buildCardArchiveVariants(ids,owned,'all')).toEqual([
   {id:'a',level:1,quantity:1,locked:false},
   {id:'b',level:1,quantity:4,locked:false},
   {id:'c',level:3,quantity:1,locked:false},
   {id:'c',level:1,quantity:2,locked:false},
  ]);
  expect(buildCardArchiveVariants(['locked'],owned,'all')).toEqual([{id:'locked',level:1,quantity:0,locked:true}]);
  expect(buildCardArchiveVariants(['locked'],owned,'owned')).toEqual([]);
 });
 it('clamps legacy malformed levels and does not manufacture extra higher-tier copies',()=>{
  const data={foo:{copies:7,level:5},bar:{copies:-1,level:2},baz:{copies:0,level:900}};
  const variants=buildCardArchiveVariants(Object.keys(data),data,'owned');
  expect(variants.find(x=>x.id==='foo'&&x.level===5)?.quantity).toBe(1);
  expect(variants.find(x=>x.id==='foo'&&x.level===1)?.quantity).toBe(7);
  expect(variants.filter(x=>x.id==='bar')).toHaveLength(1);
  expect(variants.find(x=>x.id==='baz')?.level).toBe(5);
 });
 it('preserves the original upgrade reducer; new archive presentation requires no save migration',()=>{
  const s=makeInitialState('journalist');
  const id=Object.keys(s.ownedCards)[0]!;
  s.ownedCards[id]={level:2,copies:20};
  const before=buildCardArchiveVariants([id],s.ownedCards,'all');
  const changed=gameReducer(s,{type:'UPGRADE_CARD',cardId:id});
  expect(changed.ownedCards[id]!.level).toBe(3);
  const after=buildCardArchiveVariants([id],changed.ownedCards,'all');
  expect(before.find(x=>x.level===2)?.quantity).toBe(1);
  expect(after.find(x=>x.level===3)?.quantity).toBe(1);
  expect(after.find(x=>x.level===1)?.quantity).toBeLessThan(before.find(x=>x.level===1)!.quantity);
 });
});
describe('v0.8.2 card archive interaction and rarity distinctions',()=>{
 it('replaces pagination with four-column five-row scroll and desktop drag',()=>{
  const ui=src('src/features/cards/CardsPage.tsx'),css=src('src/styles/_v082-card-archive.scss');
  expect(ui).not.toContain('PageStepper');
  expect(ui).not.toContain('CARD_LIBRARY_PAGE_SIZE');
  expect(ui).toContain('buildCardArchiveVariants');
  expect(ui).toContain('role="region" tabIndex={0}');
  expect(ui).toContain('onPointerMove={dragScroll.onPointerMove}');
  expect(ui).toContain('onClickCapture={dragScroll.onClickCapture}');
  expect(css).toContain('grid-template-columns:repeat(4,minmax(0,1fr))!important');
  expect(css).toContain('grid-auto-rows:clamp(');
  expect(css).toContain('scrollbar-width:none!important');
  expect(css).toContain('touch-action:pan-y');
 });
 it('distinguishes five level colors consistently while keeping rarity as a separate label',()=>{
  const css=src('src/styles/_v082-card-archive.scss');
  for(const lvl of [1,2,3,4,5])expect(css).toContain(`card-library-tile--level-${lvl}`);
  expect(new Set([...css.matchAll(/--level-color:#([0-9a-f]{6})/g)].map(x=>x[1])).size).toBeGreaterThanOrEqual(5);
  const ui=src('src/features/cards/CardsPage.tsx');
  expect(ui).toContain('rarity-tile--${card.rarity}');
  expect(ui).toContain('LV.${variant.level}');
  expect(ui).toContain('×{variant.quantity}');
  expect(ui).toContain('setSelectedLevel(variant.level)');
  expect(JSON.parse(src('package.json')).version).toBe('0.8.2');
 });
});
