import { ATTACK_CARDS } from './attacks';
import type { GameState } from '../types';

/** Ten distinct thoughts per NPC's first ten COMBAT defeats. Peaceful bypasses do not change them. */
export const DEFEAT_THOUGHTS=[
 '這個人已經摸清我出手的節奏……下次不能再輕敵。',
 '他又回來了。上次那個動作，我明明已經記住。',
 '那件工具居然能傷到我。距離必須重新抓。',
 '我開始分不清，他到底是僥倖還是真的看透我。',
 '只要他靠近，我就想起前幾次倒下的感覺。',
 '他的攻擊順序變了，我原本準備的防備全落空。',
 '我不該再被他的表情騙過，得先看他手裡拿什麼。',
 '這次失手讓我確定：那個人很懂得利用環境。',
 '我記得所有敗北。下一次我一定先守住自己的破綻。',
 '十次了。我不能再用最初那一套應付這個人。',
] as const;

export interface DefeatMemory {
 count:number;
 method:string;
 thought:string;
 effect:string;
}

/** Called only on a final successful weapon hit (enemy HP reaches zero). */
export const rememberCombatDefeat=(s:GameState,cardId:string):void=>{
 const npc=s.stageId===2?(s.alleyNpc??s.npc):s.npc;
 const count=(npc.combatDefeats??0)+1;
 const method=ATTACK_CARDS[cardId]?.name??'未知的攻擊';
 npc.combatDefeats=count;
 // Fighting adaptation already participates in calculateActionPreview().
 npc.adaptations.fight=Math.min(12,(npc.adaptations.fight??0)+2);
 npc.hostility=Math.min(100,npc.hostility+2);
 const entry:DefeatMemory={
  count,method,
  thought:DEFEAT_THOUGHTS[Math.min(DEFEAT_THOUGHTS.length-1,count-1)]!,
  effect:`攻擊適應 +2（累計 ${npc.adaptations.fight}）；敵意 +2（目前 ${npc.hostility}）`,
 };
 npc.defeatMemories=[...(npc.defeatMemories??[]),entry].slice(-10);
};
