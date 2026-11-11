import type { ActionChoice,GameState } from '../types';

/** Crisis diplomacy is a slow, earned alternate ending.
 * First visit: at most 14%; 4th 26%; 7th 38%; 10th 50%; 15th 70%.
 * Skill cards, stats and clues still matter BELOW the cap; repeated taps do not stack odds.
 * Counts are per NPC, never global stage count.
 */
export const getPeacefulResolutionCap=(s:GameState,choice:ActionChoice):number|null=>{
 if(s.sceneId!=='confrontation'||choice.attackCardId||choice.successScene!=='loot')return null;
 if(!choice.tags.some(t=>t==='talk'||t==='run'||t==='sneak'))return null;
 const visits=Math.max(1,s.stageId===2?(s.alleyNpc?.met??1):s.npc.met);
 return Math.min(70,14+(visits-1)*4);
};
