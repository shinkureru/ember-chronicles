import { ATTACK_CARDS } from './attacks';
import type { GameState } from '../types';

/** Ten distinct thoughts per NPC's first ten COMBAT defeats. Peaceful bypasses do not change them. */
export const DEFEAT_THOUGHTS=[
 '他用「{method}」傷到了我。下次不能再輕敵。',
 '又是「{method}」。我以為自己早就看透那個動作。',
 '「{method}」竟然也能把我逼倒，得重新估算距離。',
 '這次是「{method}」。他到底是運氣好，還是看穿我了？',
 '看到他拿出「{method}」，我又想起前幾次的痛。',
 '他用「{method}」改了出手順序，我的防備又落空了。',
 '那件「{method}」才是真正的威脅，我不能只看他的眼神。',
 '「{method}」配上這個地形，他比我更懂這裡的破綻。',
 '他又靠「{method}」擊倒我。我不會忘記這一次。',
 '第十次，還是輸給「{method}」。原本的反擊方式已經沒用了。',
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
 const oldAdaptation=npc.adaptations.fight??0,oldHostility=npc.hostility;
 npc.adaptations.fight=Math.min(12,oldAdaptation+2);
 npc.hostility=Math.min(100,oldHostility+2);
 const entry:DefeatMemory={
  count,method,
  thought:DEFEAT_THOUGHTS[Math.min(DEFEAT_THOUGHTS.length-1,count-1)]!.replace('{method}',method),
  effect:`攻擊適應 +${npc.adaptations.fight-oldAdaptation}（累計 ${npc.adaptations.fight}）；敵意 +${npc.hostility-oldHostility}（目前 ${npc.hostility}）`,
 };
 npc.defeatMemories=[...(npc.defeatMemories??[]),entry].slice(-10);
};
