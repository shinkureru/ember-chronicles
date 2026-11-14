import { INITIAL_ATTRIBUTES } from '../data/attributes';
import { makeInitialProgression } from '../engine/progression';
import { STARTER_CARDS } from '../data/cards';
import { STARTER_ATTACK_CARDS, makeInitialEnemy } from '../data/attacks';
import { INITIAL_NPC_GEAR, WAREHOUSE_CAPACITY_KG } from '../data/items';
import type { GameState, ProfessionId } from '../types';
import {getTaipeiClock} from '../engine/taipeiClock';
import {makeInitialOnboarding} from '../engine/onboarding';

export const makeInitialState=(profession:ProfessionId|null=null):GameState=>{
  const deck=profession?STARTER_CARDS[profession]:[];
  return {
    version:1,hpRulesVersion:2,growthRulesVersion:2,progression:makeInitialProgression(),mode:'home',profession,onboarding:makeInitialOnboarding(profession),
    player:{health:10,maxHealth:10,stamina:10,maxStamina:10,courage:55,hunger:20,fatigue:12,temperature:36.5,resource:6,maxResource:6,attributes:{...INITIAL_ATTRIBUTES}},
    world:{...getTaipeiClock(),clockBasis:'taipei-realtime',weather:'clear'},
    town:{visits:{},lastTrainingDay:0,lastRumorDay:0,lastCanteenTalkDay:0,socialPoiseUntil:0,upgrades:{},wear:{},armorHits:{},perfectRepairs:{},quests:{}},
    conditions:{wounds:0,infection:0,poisoning:0,illness:0},
    npc:{hostility:18,trust:15,met:0,adaptations:{},remembers:[],stolenGear:[]},
    stageId:1,alleyNpc:{hostility:18,trust:12,met:0,adaptations:{},remembers:[],stolenGear:[]},
    attempt:0,sceneId:'gate',flags:[],searchedSources:[],lootSearches:{},clues:[],insightBonus:0,insightByEnemy:{},
    bag:{biscuit:2,water:1},warehouse:{pen:1,notebook:1,wrench:1,screwdriver:1,...(profession==='infiltrator'?{hook:1,folding_tool:1}:{})},warehouseCapacity:WAREHOUSE_CAPACITY_KG,
    protectedItems:[],
    ownedCards:Object.fromEntries([...deck,...(profession?STARTER_ATTACK_CARDS[profession]:[])].map(id=>[id,{copies:0,level:1}])),
    activeDeck:[...deck],hand:[],drawPile:[],discardPile:[],attackDeck:[],enemy:makeInitialEnemy(),enemyStrike:null,enemyCounter:null,
    log:[],lastEvent:null,lastLoot:null,outcome:null,rngSeed:123456789,hasSeenIntro:false,
    chapterProgress:{completed:[],unlocked:1},
    economy:{coins:120,blackMarketFavor:0,marketPurchases:0,marketStock:{}},
    equipment:{head:null,body:null,arms:null,legs:null,mainHand:null,utility:null,accessory:null},
  };
};
export const starterGear=[...INITIAL_NPC_GEAR];
