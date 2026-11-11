import {afterEach,describe,expect,it,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {makeInitialState} from '../src/game/state/initial';
import {loadGame,saveGame} from '../src/game/state/storage';
import {gameReducer} from '../src/game/engine/resolve';
import {ITEMS} from '../src/game/data/items';
import ItemArt from '../src/components/ItemArt';
import {DAMAGE_FEEDBACK_MS} from '../src/features/chapter/combatFeedbackTiming';

afterEach(()=>vi.unstubAllGlobals());

describe('v1.5.1 low-HP balance and saved progress',()=>{
 it('starts with only 10 health, giving two six-damage hits real consequences',()=>{
  let s=makeInitialState('journalist');
  expect(s.player.health).toBe(10);expect(s.player.maxHealth).toBe(10);
  s.mode='adventure';s.sceneId='confrontation';s.attempt=1;
  const counter=(id:number)=>({id,itemId:'radio',damage:6,hit:true,phase:'throwing' as const});
  s={...s,enemyCounter:counter(1)};
  s=gameReducer(s,{type:'ENEMY_COUNTER_HIT'});
  expect(s.player.health).toBe(4);
  s=gameReducer(s,{type:'ENEMY_COUNTER_FINISH'});
  expect(s.mode).toBe('adventure');
  s={...s,enemyCounter:counter(2)};
  s=gameReducer(s,{type:'ENEMY_COUNTER_HIT'});
  expect(s.player.health).toBe(0);
  s=gameReducer(s,{type:'ENEMY_COUNTER_FINISH'});
  expect(s.outcome).toBe('defeat');
  expect(s.mode).toBe('result');
  expect(s.clues.length).toBeGreaterThan(0);
  expect(s.player.health).toBe(1); // Defeat sends the survivor back injured, not deleted.
 });
 it('converts old 93/100 HP to 9/10 HP once without clearing items and quests',()=>{
  const legacy=makeInitialState('journalist');
  delete legacy.hpRulesVersion;
  legacy.player.maxHealth=100;legacy.player.health=93;
  legacy.town!.quests.emergency_water='accepted';
  legacy.bag.bandage=2;legacy.chapterProgress.unlocked=2;
  let raw=JSON.stringify(legacy);
  vi.stubGlobal('localStorage',{
   getItem:()=>raw,
   setItem:(_key:string,next:string)=>{raw=next;},
  });
  const converted=loadGame();
  expect(converted.hpRulesVersion).toBe(2);
  expect(converted.player.maxHealth).toBe(10);
  expect(converted.player.health).toBe(9);
  expect(converted.bag.bandage).toBe(2);
  expect(converted.town?.quests.emergency_water).toBe('accepted');
  expect(converted.chapterProgress.unlocked).toBe(2);
  expect(saveGame(converted)).toBe(true);
  const loadedAgain=loadGame();
  expect(loadedAgain.player.health).toBe(9);
  expect(loadedAgain.player.maxHealth).toBe(10);
 });
 it('preserves earned old-era life-training levels in new health units',()=>{
  const legacy=makeInitialState('journalist');delete legacy.hpRulesVersion;
  legacy.player.maxHealth=110;legacy.player.health=55;
  vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify(legacy)});
  const restored=loadGame();
  expect(restored.player.maxHealth).toBe(12);
  expect(restored.player.health).toBe(6);
 });
 it('makes permanent health training matter without granting five extra hit points at once',()=>{
  let s=makeInitialState('journalist');
  s=gameReducer(s,{type:'TOWN_SERVICE',serviceId:'train',attribute:'maxHealth'});
  expect(s.player.maxHealth).toBe(11);
  expect(s.player.health).toBe(11);
  expect(s.player.attributes.maxHealth).toBe(11);
 });
});

describe('v1.5.1 damage readability and item identity',()=>{
 it('holds both kinds of damage readout for at least two seconds',()=>{
  expect(DAMAGE_FEEDBACK_MS.incoming).toBeGreaterThanOrEqual(2500);
  expect(DAMAGE_FEEDBACK_MS.outgoing).toBeGreaterThanOrEqual(2200);
  expect(DAMAGE_FEEDBACK_MS.lethalHitPause).toBeGreaterThanOrEqual(DAMAGE_FEEDBACK_MS.incoming);
  expect(DAMAGE_FEEDBACK_MS.enemyFallHold).toBeGreaterThanOrEqual(DAMAGE_FEEDBACK_MS.outgoing);
 });
 it('renders specific item silhouettes rather than an unrelated emoji',()=>{
  const inaccurateLegacyIds=['bandage','wire_piece','tape','water','radio','firstaid','vest','handwarm','badge','folding_tool','keyring','torn_photo','vehicle_note','notes','biscuit','torn_gloves'];
  for(const id of inaccurateLegacyIds){
   const html=renderToStaticMarkup(createElement(ItemArt,{id}));
   expect(html).toContain(`data-item-id="${id}"`);
   expect(html).toContain(`aria-label="${ITEMS[id]!.name}"`);
   expect(html).toContain('<svg');
  }
  const bandage=renderToStaticMarkup(createElement(ItemArt,{id:'bandage'}));
  expect(bandage).not.toContain('🩺');
  expect(bandage).toContain('繃帶');
 });
 it('keeps clear native icons for already-correct objects',()=>{
  const html=renderToStaticMarkup(createElement(ItemArt,{id:'camera'}));
  expect(html).toContain('📷');
  expect(html).toContain('隨身相機');
 });
});
