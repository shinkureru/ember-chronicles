import { describe, expect, it, vi } from 'vitest';
import { makeInitialState } from '../src/game/state/initial';
import { gameReducer } from '../src/game/engine/resolve';
import { loadGame } from '../src/game/state/storage';
import { getVisibleActions, calculateActionPreview } from '../src/game/engine/rules';
import { ATTACK_CARDS, STARTER_ATTACK_CARDS, getAttackDamage, MAX_ATTACK_DECK } from '../src/game/data/attacks';

describe('v0.7 attack preparation and weapon-backed combat',()=>{
  it('automatically transfers the required weapon from the warehouse on selection',()=>{
    const before=makeInitialState('journalist');
    expect(before.attackDeck).toEqual([]);
    const after=gameReducer(before,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
    expect(after.attackDeck).toEqual(['pen_thrust']);
    expect(after.bag.pen).toBe(1);
    expect(after.warehouse.pen).toBeUndefined();
    expect(after.lastEvent).toContain('鋼筆');
  });
  it('keeps a maximum of five attack cards and allows removing a card',()=>{
    let s=makeInitialState('journalist');
    for(const id of STARTER_ATTACK_CARDS.journalist)s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:id});
    expect(s.attackDeck).toHaveLength(MAX_ATTACK_DECK);
    s.ownedCards.wrench_hit={copies:0,level:1};
    s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'wrench_hit'});
    expect(s.attackDeck).toHaveLength(MAX_ATTACK_DECK);
    s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
    expect(s.attackDeck).not.toContain('pen_thrust');
  });
  it('shows prepared attacks only during the confrontation, with an exact damage preview',()=>{
    let s=makeInitialState('journalist');
    s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
    s=gameReducer(s,{type:'START_ATTEMPT'});
    expect(getVisibleActions(s).some(a=>a.attackCardId)).toBe(false);
    s.sceneId='confrontation';
    const attack=getVisibleActions(s).find(a=>a.attackCardId==='pen_thrust');
    expect(attack).toBeDefined();
    const preview=calculateActionPreview(s,attack!,null);
    expect(preview.attackAvailable).toBe(true);
    expect(preview.damage).toBe(getAttackDamage(s,'pen_thrust'));
    expect(preview.chance).toBeGreaterThan(0);
  });
  it('cannot execute an attack without the matching weapon, even when it was selected in preparation',()=>{
    let s=makeInitialState('journalist');
    s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
    s=gameReducer(s,{type:'START_ATTEMPT'});
    s.sceneId='confrontation';
    delete s.bag.pen;
    const action=getVisibleActions(s).find(a=>a.attackCardId==='pen_thrust');
    expect(action).toBeDefined();
    expect(calculateActionPreview(s,action!,null).chance).toBe(0);
    expect(calculateActionPreview(s,action!,null).attackAvailable).toBe(false);
    const after=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
    expect(after).toBe(s);
    expect(after.enemy.health).toBe(s.enemy.health);
  });
  it('can activate a previously unusable attack by obtaining its matching item mid-mission',()=>{
    let s=makeInitialState('journalist');
    s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'camera_swing'});
    s=gameReducer(s,{type:'START_ATTEMPT'});
    s.sceneId='confrontation';
    const action=getVisibleActions(s).find(a=>a.attackCardId==='camera_swing');
    expect(action).toBeDefined();
    expect(calculateActionPreview(s,action!,null).chance).toBe(0);
    s.bag.camera=1;
    expect(calculateActionPreview(s,action!,null).chance).toBeGreaterThan(0);
  });
  it('reduces enemy HP only on a successful hit and transitions to loot when HP reaches zero',()=>{
    let s=makeInitialState('journalist');
    s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
    s=gameReducer(s,{type:'START_ATTEMPT'});
    s.sceneId='confrontation';
    const expectedDamage=getAttackDamage(s,'pen_thrust');
    s.rngSeed=0;
    const first=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
    expect(first.enemy.health).toBe(s.enemy.maxHealth-expectedDamage);
    expect(first.sceneId).toBe('confrontation');
    s=first;
    for(let i=0;i<12&&s.mode==='adventure'&&s.sceneId==='confrontation';i++){
      s.rngSeed=0;
      s=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
    }
    expect(s.enemy.health).toBe(0);
    expect(s.sceneId).toBe('loot');
  });
  it('applies retaliation on a failed attack without deleting acquired items',()=>{
    let s=makeInitialState('journalist');
    s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
    s=gameReducer(s,{type:'START_ATTEMPT'});
    s.sceneId='confrontation';s.rngSeed=1894;
    const health=s.player.health;
    const after=gameReducer(s,{type:'CHOOSE',choiceId:'attack_pen_thrust',skillId:null});
    expect(after.enemy.health).toBe(s.enemy.health);
    expect(after.player.health).toBeLessThan(health);
    expect(after.bag.pen).toBe(1);
  });
  it('preserves selected loadout weapons when returning to town',()=>{
    let s=makeInitialState('journalist');
    s=gameReducer(s,{type:'PREPARE_ATTACK_CARD',cardId:'pen_thrust'});
    s=gameReducer(s,{type:'START_ATTEMPT'});
    s.mode='result';s.outcome='retreat';
    const result=gameReducer(s,{type:'RETURN_HUB'});
    expect(result.attackDeck).toContain('pen_thrust');
    expect(result.bag.pen).toBe(1);
    expect(result.mode).toBe('home');
  });
  it('migrates existing v0.6 saves without erasing story and NPC progress',()=>{
    const legacy=JSON.parse(JSON.stringify(makeInitialState('journalist')));
    delete legacy.attackDeck;delete legacy.enemy;delete legacy.ownedCards.pen_thrust;
    legacy.npc.met=3;legacy.chapterProgress.completed=[1];legacy.warehouse={};
    vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify(legacy),setItem:()=>{}});
    const restored=loadGame();
    expect(restored.npc.met).toBe(3);
    expect(restored.chapterProgress.completed).toEqual([1]);
    expect(restored.attackDeck).toEqual([]);
    expect(restored.enemy.health).toBeGreaterThanOrEqual(20);
    expect(restored.ownedCards.pen_thrust).toBeDefined();
    expect(restored.warehouse.pen).toBe(1);
    vi.unstubAllGlobals();
  });
  it('defines playable attacker equipment and never treats attack cards as support skills',()=>{
    for(const [id,card] of Object.entries(ATTACK_CARDS)){
      expect(card.requiredItemId).toBeTruthy();
      expect(id).toBe(card.id);
      expect(card.damage).toBeGreaterThan(0);
    }
    expect(makeInitialState('journalist').activeDeck).not.toContain('pen_thrust');
  });
});
