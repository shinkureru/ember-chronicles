export type ProfessionId = 'journalist' | 'courier';
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
  resourceCost: number; projectedStamina: number; projectedCourage: number;
  damage?:number; attackAvailable?:boolean;
  warnings: { title: string; detail: string; remedy: string }[];
}
export interface GameState {
  version: 1;
  mode: Mode;
  profession: ProfessionId | null;
  player: { health: number; maxHealth: number; stamina: number; maxStamina: number; courage: number; hunger: number; fatigue: number; temperature: number; resource: number; maxResource: number; attributes: Attributes };
  world: { minute: number; day: number; weather: 'clear' | 'rain' };
  npc: { hostility: number; trust: number; met: number; adaptations: Record<string, number>; remembers: string[]; stolenGear: string[] };
  attempt: number; sceneId: SceneId; flags: string[]; searchedSources: string[]; lootSearches:Record<string,number>;
  attackDeck:string[]; enemy:{id:string;name:string;health:number;maxHealth:number};
  clues: string[]; insightBonus: number;
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
