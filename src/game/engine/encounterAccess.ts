import type {GameState} from '../types';

/** Keyed by actual NPC id. The player cannot carry a defeat bonus to another enemy. */
export const currentEnemyId=(s:GameState):string=>s.stageId===2?'alley_watchman':'warehouse_guard';
export const activeEnemyInsight=(s:GameState):number=>Math.max(0,s.insightByEnemy?.[currentEnemyId(s)]??0);

/** Personal effects may only be taken after this exact encounter ended through combat. */
export const PERSONAL_LOOT_SOURCES=new Set(['pockets','npcGear','alley_pockets']);
export const maySearchSource=(s:GameState,source:string):boolean=>
 !PERSONAL_LOOT_SOURCES.has(source)||(s.sceneId==='loot'&&s.flags.includes('won_by_combat')&&s.enemy.health===0);
