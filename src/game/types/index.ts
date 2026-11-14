export type ProfessionId = 'journalist' | 'courier' | 'infiltrator';
export type ShelterId = 'warehouse' | 'apartment' | 'bunker';
export type ShelterFurnitureId = import('../data/shelter').WarehouseFurnitureId;
export type OnboardingPhase = 'story' | 'tutorial' | 'shelter' | 'complete';
export interface OnboardingProgress { phase:OnboardingPhase; storyPage:number; tutorialStep:number; shelter:ShelterId|null }
export type Mode = 'home' | 'adventure' | 'result';
export type SceneId = 'gate' | 'survey' | 'inside' | 'confrontation' | 'loot';
export type ActionTag = 'talk' | 'observe' | 'sneak' | 'run' | 'search' | 'fight' | 'survival';
export type Outcome = 'victory' | 'defeat' | 'retreat';
export type AttributeId =
  | 'maxHealth' | 'maxStamina' | 'mobility' | 'melee' | 'endurance' | 'climate'
  | 'observation' | 'reasoning' | 'memory' | 'focus' | 'adaptability' | 'planning'
  | 'persuasion' | 'deception' | 'negotiation' | 'empathy' | 'intimidation' | 'resilience';

export interface Attributes extends Record<AttributeId, number> {}
export interface ItemDef {
  id: string; name: string; emoji: string; type: 'food'|'tool'|'gear'|'card'|'misc'|'medical';
  weight: number; description: string; rarity?: 'common'|'rare';
}
export interface SkillCard {
  id: string; name: string; emoji: string; description: string; profession?: ProfessionId;
  tags: ActionTag[]; chanceBonus: number; staminaSaved?: number; courageSaved?: number;
  resourceCost: number; rarity: 'normal' | 'rare' | 'chaos';
}
export interface AttackCard {
 id:string; name:string; emoji:string; description:string; detail:string;
 profession?:ProfessionId; requiredItemId:string; damage:number; baseChance:number;
 staminaCost:number; rarity:'normal'|'rare'|'chaos';
}
export interface ActionChoice {
  id: string; thought: string; title: string; detail: string; tags: ActionTag[]; attackCardId?:string;
  baseChance: number; staminaCost: number; courageDelta: number; minutes: number;
  successScene?: SceneId; failureScene?: SceneId;
  successOutcome?: Outcome; failureOutcome?: Outcome;
  npcHostilitySuccess?: number; npcHostilityFailure?: number;
  flagsOnSuccess?: string[]; flagsOnFailure?: string[];
  lootSource?: string; requiresNotSearched?: string;
  guaranteed?: boolean;
}
export interface SceneDef { id: SceneId; label: string; location: string; narration: string; npcText?: string; actions: ActionChoice[] }
export interface LootDrop { itemId: string; quantity: number; source: string }
export interface ActionPreview {
  chance: number; staminaCost: number; courageDelta: number; minutes: number;
  hungerCost:number; appliedHungerCost:number; projectedHunger:number;
  resourceCost: number; projectedStamina: number; projectedCourage: number;
  damage?:number; attackAvailable?:boolean;
  warnings: { title: string; detail: string; remedy: string }[];
}
export type TownFacilityId='inn'|'clinic'|'workshop'|'tavern'|'training'|'noticeboard'|'laundry'|'canteen';
export type TownQuestStatus='accepted'|'completed';
export interface TownProgress {
 visits:Partial<Record<TownFacilityId,number>>;
 lastTrainingDay:number;
 lastRumorDay:number;
 lastCanteenTalkDay:number;
 socialPoiseUntil:number;
 upgrades:Record<string,number>;
 wear:Record<string,number>;
 /** Number of genuine enemy hits absorbed by each defensive item (capped at ten). */
 armorHits?:Record<string,number>;
 /** +1 defense applies to the next mission only. */
 perfectRepairs?:Record<string,{bonus:number;expiresAfterAttempt:number}>;
 quests:Record<string,TownQuestStatus>;
 lastRestDay?:number;
 restsToday?:number;
 clinic?:import('../engine/clinic').ClinicProgress;
}
export interface SurvivorConditions { wounds:number;infection:number;poisoning:number;illness:number }
export interface NpcDefeatMemory {count:number;method:string;thought:string;effect:string}
export interface NpcState {hostility:number;trust:number;met:number;adaptations:Record<string,number>;remembers:string[];stolenGear:string[];combatDefeats?:number;defeatMemories?:NpcDefeatMemory[];playerDefeats?:number}
export interface LevelProgression {level:number;xp:number;totalXp:number;points:number;dailyAwards:Record<string,number>}
export interface GameState {
  version: 1;
  /** 2 = low-HP balance; missing on v1.5 and older saves. */
  hpRulesVersion?: 2;
  /** Current ten-stamina and zero-base-attribute scale; absence means old scale. */
  growthRulesVersion?: 2;
  progression?:LevelProgression;
  mode: Mode;
  profession: ProfessionId | null;
  /** First-play story/tutorial/shelter choice; migrated legacy players go straight to shelter selection. */
  onboarding:OnboardingProgress;
  /** Purchased shelter furniture (legacy saves are migrated to an empty list). */
  shelterFurniture:ShelterFurnitureId[];
  player: { health: number; maxHealth: number; stamina: number; maxStamina: number; courage: number; hunger: number; fatigue: number; temperature: number; resource: number; maxResource: number; attributes: Attributes };
  world: { minute: number; day: number; weather: 'clear' | 'rain'; clockBasis?:'taipei-realtime' };
  town?:TownProgress;
  conditions?:SurvivorConditions;
  npc: NpcState;
  /** Current mission selection; absent in older saves means first mission. */
  stageId?: 1 | 2;
  /** Each important NPC remembers visits and personal grudges separately. */
  alleyNpc?:GameState['npc'];
  attempt: number; sceneId: SceneId; flags: string[]; searchedSources: string[]; lootSearches:Record<string,number>;
  attackDeck:string[]; enemy:{id:string;name:string;health:number;maxHealth:number};
  enemyStrike?:{id:number;itemId:string;damage:number;hit:boolean}|null;
  enemyCounter?:{id:number;itemId:string;damage:number;hit:boolean;phase:'waiting'|'windup'|'throwing'|'hit'}|null;
  clues: string[]; insightBonus: number; /** Outstanding one-time chance boost by opponent (old insightBonus is legacy). */ insightByEnemy?:Record<string,number>;
  bag: Record<string, number>; warehouse: Record<string, number>; warehouseCapacity: number;
  protectedItems: string[];
  ownedCards: Record<string, { copies: number; level: number }>;
  activeDeck: string[]; hand: string[]; drawPile: string[]; discardPile: string[];
  log: string[]; lastEvent: string | null; lastLoot: LootDrop | null; outcome: Outcome | null;
  rngSeed: number; hasSeenIntro: boolean;
  chapterProgress: { completed: number[]; unlocked: number };
  economy: { coins: number; blackMarketFavor: number; marketPurchases: number; marketStock:Record<string,number> };
  equipment: Record<string, string | null>;
}
