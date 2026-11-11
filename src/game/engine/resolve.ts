import { getScheduledVendorId } from '../data/marketSchedule';
import { awardExperience,allocatePoint } from './progression';
import { TOWN_QUESTS, townQuestReady } from '../data/town';
import { applyTownService,ensureTownProgress,ensureConditions } from './townActions';
import type { AttributeId } from '../types';
import { CARDS, getUpgradeRequirement } from '../data/cards';
import { ATTACK_CARDS, attackStatus, getAttackDamage, MAX_ATTACK_DECK, makeInitialEnemy } from '../data/attacks';
import { rememberCombatDefeat } from '../data/npcDefeatMemory';
import { ITEMS, LOOT_POOLS, INITIAL_NPC_GEAR } from '../data/items';
import { calculateActionPreview, bagWeight, getVisibleActions, isSkillCompatible, retreatPreview, clamp } from './rules';
import { makeInitialState } from '../state/initial';
import { remainingSearches } from './lootLimits';
import { EQUIPMENT_SLOTS } from '../data/equipment';
import { getEquippedDefense, mitigateCounterDamage } from '../data/equipmentEffects';
import { getVendorStockKey, marketSellPrice, vendorById } from '../data/marketVendors';
import type { GameState, Outcome, ProfessionId, LootDrop } from '../types';

export type GameAction =
  | {type:'SELECT_PROFESSION';profession:ProfessionId}
  | {type:'START_ATTEMPT'}
  | {type:'SELECT_STAGE';stageId:1|2}
  | {type:'WORLD_CLOCK_TICK';minutes?:number}
  | {type:'ENEMY_COUNTER_WINDUP'}
  | {type:'ENEMY_COUNTER_THROW'}
  | {type:'ENEMY_COUNTER_HIT'}
  | {type:'ENEMY_COUNTER_FINISH'}
  | {type:'PREPARE_ATTACK_CARD';cardId:string}
  | {type:'CHOOSE';choiceId:string;skillId:string|null}
  | {type:'RETREAT'}
  | {type:'RETURN_HUB'}
  | {type:'UPGRADE_CARD';cardId:string}
  | {type:'MARKET_SELL_ITEM';vendorId:string;itemId:string}
  | {type:'MARKET_BUY_ITEM';vendorId:string;itemId:string}
  | {type:'MARKET_SELL';vendorId:string;cardId:string}
  | {type:'MARKET_BUY';vendorId:string;cardId:string}
  | {type:'ALLOCATE_POINT';attribute:AttributeId}
  | {type:'REST_TOWN'}
  | {type:'TOWN_SERVICE';serviceId:string;attribute?:AttributeId;itemId?:string}
  | {type:'TOWN_ACCEPT_QUEST';questId:string}
  | {type:'TOWN_COMPLETE_QUEST';questId:string}
  | {type:'EQUIP_ITEM';slot:string;itemId:string}
  | {type:'UNEQUIP_ITEM';slot:string}
  | {type:'PROTECT_ITEM';itemId:string}
  | {type:'WITHDRAW_ITEM';itemId:string}
  | {type:'DEPOSIT_ITEM';itemId:string}
  | {type:'USE_ITEM';itemId:string}
  | {type:'DEBUG';patch:{kind:'health'|'stamina'|'courage'|'resource'|'minute';value:number}}
  | {type:'RESET'};

const activeNpc=(s:GameState)=>s.stageId===2?(s.alleyNpc??s.npc):s.npc;
const nextRand=(state:GameState)=>{
  state.rngSeed=(Math.imul(1664525,state.rngSeed)+1013904223)>>>0;
  return state.rngSeed/4294967296;
};
const advanceTime=(s:GameState,minutes:number,restorative=false)=>{
  const total=s.world.minute+minutes;
  s.world.day+=Math.floor(total/1440);
  s.world.minute=total%1440;
  s.player.hunger=clamp(s.player.hunger+Math.floor(minutes/15),0,100);
  // Sleep, medical rest and washing are restorative despite taking world time.
  if(!restorative)s.player.fatigue=clamp(s.player.fatigue+Math.floor(minutes/12),0,100);
};
const drawCards=(s:GameState,count:number)=>{
  for(let i=0;i<count;i++){
    if(s.drawPile.length===0){
      if(s.discardPile.length===0)break;
      s.drawPile=[...s.discardPile];s.discardPile=[];
    }
    const next=s.drawPile.shift();if(next)s.hand.push(next);
  }
};
const addLoot=(s:GameState,source:string):LootDrop|null=>{
  if(remainingSearches(s,source)<=0){s.lastEvent='這裡已經沒有可搜查的東西了。';return null;}
  if(source==='npcGear'){
    const available=INITIAL_NPC_GEAR.filter(id=>!s.npc.stolenGear.includes(id));
    if(available.length===0){s.searchedSources.push('npcGear');s.lastEvent='對方身上的可取裝備已經沒有剩下的了。';return null;}
    const id=available[0]!;
    if(bagWeight(s.bag)+ITEMS[id]!.weight>15){s.lastEvent=`背包太重了，無法帶走「${ITEMS[id]!.name}」。`;return null;}
    s.npc.stolenGear.push(id);
    s.lootSearches[source]=(s.lootSearches[source]??0)+1;
    if(remainingSearches(s,source)===0&&!s.searchedSources.includes(source))s.searchedSources.push(source);
    s.bag[id]=(s.bag[id]??0)+1;
    s.lastEvent=`我取下了「${ITEMS[id]!.name}」。這東西有點重量。`;
    return {itemId:id,quantity:1,source};
  }
  const pool=LOOT_POOLS[source]??[];
  if(pool.length===0)return null;
  const itemId=pool[Math.floor(nextRand(s)*pool.length)]!;
  const def=ITEMS[itemId]!;
  if(bagWeight(s.bag)+def.weight>15){s.lastEvent=`我看到「${def.name}」，但背包快裝不下了。得先整理物品。`;return null;}
  if(def.type==='card'){
    const cardId=itemId==='card_question'?'question':itemId==='card_route'?'route':itemId==='card_pen'?'pen_thrust':'wrench_hit';
    if(!s.ownedCards[cardId])s.ownedCards[cardId]={copies:0,level:1};
    s.ownedCards[cardId]!.copies+=1;
    s.lastEvent=`竟然找到「${(CARDS[cardId]??ATTACK_CARDS[cardId])!.name}」的重複卡！已放入卡牌收藏庫。`;
  }else{
    s.bag[itemId]=(s.bag[itemId]??0)+1;
    s.lastEvent=`我仔細翻找，找到「${def.name}」。`;
  }
  s.lootSearches[source]=(s.lootSearches[source]??0)+1;
  if(remainingSearches(s,source)===0&&!s.searchedSources.includes(source))s.searchedSources.push(source);
  return {itemId,quantity:1,source};
};
const resolveOutcome=(s:GameState,outcome:Outcome)=>{
  s.outcome=outcome;s.mode='result';
  const npc=activeNpc(s),isAlley=s.stageId===2;
  if(outcome==='defeat'){
    s.player.health=1;
    ensureConditions(s).wounds=Math.max(1,s.conditions?.wounds??0);
    // A defeat costs two in-world hours plus treatment planning, but never gear or coins.
    advanceTime(s,120,true);
    npc.remembers=Array.from(new Set([...npc.remembers,isAlley?'alley_defeat':'defeated_player']));
    npc.adaptations.talk=Math.min(12,(npc.adaptations.talk??0)+3);
    const clueNo=s.clues.length+1;
    const fragments=[
      '我終於注意到，管理員每次接近對講機前都會先看向側門。',
      '管理員對「失蹤員工」的名字反應異常，他似乎知道更多內情。',
      '我想起牆上的排班表：夜班的巡邏時間其實很規律。',
      '管理員真正害怕的似乎不是陌生人，而是出貨紀錄被查出問題。',
      '我逐漸摸清對方說話時避開的敏感話題。',
    ];
    const alleyFragments=[
      '巷口的守望者始終盯著排水溝。他大概怕有人從那個方向靠近。',
      '那名目擊者說的車號有個數字和倉庫紀錄對不上。',
      '我發現舊電話亭後面的鐵梯可以躲過第一輪巡邏。',
      '守望者聽到公寓兩個字，表情明顯變了。',
      '牆上的拖行痕跡被人故意遮住，這更能確定目擊者沒有說完。',
    ];
    const clue=(isAlley?alleyFragments:fragments)[(clueNo-1)%(isAlley?alleyFragments:fragments).length]!+`（第 ${clueNo} 次失敗反思）`;
    s.clues.push(clue);
    s.insightBonus=6; // 單次下一局的有效判定加成；不會因為重複失敗無限累加
    s.lastEvent=`我失敗了，但想明白了一件事：${clue} 下一次首次關鍵判定額外 +6 個百分點。`;
  }else if(outcome==='retreat'){
    npc.remembers=Array.from(new Set([...npc.remembers,isAlley?'alley_retreat':'player_retreat']));
    s.insightBonus=Math.max(s.insightBonus,2);
    s.lastEvent='我先撤退了。雖然沒弄清全部情況，至少記住了一點動線。下次首次關鍵判定可獲得 +2 個百分點；多次撤退無法疊加這項加成。';
  }else{
    const mission=s.stageId===2?2:1;
    awardExperience(s,`mission:win:${mission}`,24);
    if(!s.chapterProgress.completed.includes(mission))s.chapterProgress.completed.push(mission);
    s.chapterProgress.completed.sort((a,b)=>a-b);
    s.chapterProgress.unlocked=Math.max(s.chapterProgress.unlocked,Math.min(12,mission+1));
    npc.remembers=Array.from(new Set([...npc.remembers,isAlley?'alley_victory':'player_victory']));
    if(isAlley){
      const clue='後巷目擊者留下的線索指向一棟無人接聽的公寓，以及凌晨出入的深色廂型車。';
      if(!s.clues.includes(clue))s.clues.push(clue);
      s.lastEvent='我離開了那條暗巷，取得了通往第三關「無人接聽」的新線索。目擊者現在知道我會再回來。';
    }else s.lastEvent='我成功離開了倉庫。這次找到的物資都還在，應該回去整理一下。';
  }
  s.log.push(`${outcome==='victory'?'任務成功':outcome==='defeat'?'戰敗':'主動撤退'}：第 ${s.attempt} 次挑戰。`);
};
export const gameReducer=(state:GameState,action:GameAction):GameState=>{
  if(action.type==='RESET')return makeInitialState();
  if(action.type==='SELECT_PROFESSION')return makeInitialState(action.profession);
  const s:GameState=structuredClone(state);
  switch(action.type){
    case 'SELECT_STAGE':{
      if(s.mode!=='home'||action.stageId>s.chapterProgress.unlocked)return state;
      s.stageId=action.stageId;
      return s;
    }
    case 'WORLD_CLOCK_TICK':{
      // World time advances even on map and during missions. Do not mutate other events.
      // Five in-game minutes per ten seconds of visible unpaused play.
      const minutes=action.minutes??5;
      if(!Number.isFinite(minutes)||minutes<=0||minutes>1440)return state;
      if(s.mode==='result')return state;
      advanceTime(s,minutes);
      return s;
    }
    case 'ENEMY_COUNTER_WINDUP':{
      if(s.mode!=='adventure'||s.enemyCounter?.phase!=='waiting')return state;
      s.enemyCounter.phase='windup';
      return s;
    }
    case 'ENEMY_COUNTER_THROW':{
      if(s.mode!=='adventure'||s.enemyCounter?.phase!=='windup')return state;
      s.enemyCounter.phase='throwing';
      s.enemyStrike={id:s.enemyCounter.id,itemId:s.enemyCounter.itemId,
        damage:s.enemyCounter.damage,hit:s.enemyCounter.hit};
      return s;
    }
    case 'ENEMY_COUNTER_HIT':{
      if(s.mode!=='adventure'||s.enemyCounter?.phase!=='throwing')return state;
      s.enemyCounter.phase='hit';
      const {itemId,damage,hit}=s.enemyCounter;
      if(hit){
        s.player.health=clamp(s.player.health-damage,0,s.player.maxHealth);
        if(damage>0){
          const conditions=ensureConditions(s);
          conditions.wounds=Math.min(6,conditions.wounds+1);
          const wornId=s.equipment.body??s.equipment.head??s.equipment.hands;
          if(wornId){const town=ensureTownProgress(s);town.wear[wornId]=Math.max(15,(town.wear[wornId]??100)-6);}
        }
        s.lastEvent=`對方把「${ITEMS[itemId]?.name??'工具'}」扔向我。我被擊中，生命 -${damage}！`;
        // Keep HIT state visible long enough for full-screen damage shake, even if lethal.
        // Defeat resolves after the final impact phase.
      }else s.lastEvent='對方扔來的物品擦身而過，我閃開了。';
      return s;
    }
    case 'ENEMY_COUNTER_FINISH':{
      if(s.mode!=='adventure'||s.enemyCounter?.phase!=='hit')return state;
      const fatal=s.player.health<=0;
      s.enemyCounter=null;s.enemyStrike=null;
      if(fatal)resolveOutcome(s,'defeat');
      return s;
    }
    case 'START_ATTEMPT':{
      if(!s.profession||s.mode==='adventure')return state;
      // Re-use the player's previous loadout: selected weapons remain with the player
      // or are re-withdrawn from storage if available and under the weight limit.
      for(const cardId of s.attackDeck){
        const itemId=ATTACK_CARDS[cardId]?.requiredItemId,def=itemId?ITEMS[itemId]:undefined;
        if(!def||(s.bag[itemId!]??0)>0||(s.warehouse[itemId!]??0)<=0)continue;
        if(bagWeight(s.bag)+def.weight>15)continue;
        s.warehouse[itemId!]=(s.warehouse[itemId!]??0)-1;if(s.warehouse[itemId!]===0)delete s.warehouse[itemId!];
        s.bag[itemId!]=(s.bag[itemId!]??0)+1;
      }
      s.attempt+=1;
      if(s.stageId===2){if(!s.alleyNpc)s.alleyNpc={hostility:18,trust:12,met:0,adaptations:{},remembers:[],stolenGear:[]};s.alleyNpc.met+=1;}
      else s.npc.met+=1;
      s.mode='adventure';s.sceneId='gate';
      s.flags=[];s.searchedSources=[];s.lootSearches={};s.outcome=null;s.lastLoot=null;s.lastEvent=null;s.enemy=makeInitialEnemy(s.stageId??1);s.enemyStrike=null;s.enemyCounter=null;
      s.hand=[];s.discardPile=[];s.drawPile=[...s.activeDeck];
      drawCards(s,3);
      s.player.resource=clamp(s.player.resource+2,0,s.player.maxResource);
      s.log.push(`第 ${s.stageId===2?'二':'一'} 關、第 ${s.stageId===2?s.alleyNpc?.met:s.npc.met} 次進入${s.stageId===2?'後巷':'倉庫'}。`);
      return s;
    }
    case 'PREPARE_ATTACK_CARD':{
      if(s.mode!=='home')return state;
      const card=ATTACK_CARDS[action.cardId];
      if(!card||!s.ownedCards[card.id])return state;
      if(s.attackDeck.includes(card.id)){
        s.attackDeck=s.attackDeck.filter(id=>id!==card.id);
        s.lastEvent=`我先把「${card.name}」從這次準備的攻擊牌組移除。`;
        return s;
      }
      if(s.attackDeck.length>=MAX_ATTACK_DECK){
        s.lastEvent='最多只能準備五張攻擊型主動牌。';return s;
      }
      s.attackDeck.push(card.id);
      const status=attackStatus(s,card.id);
      if(!status.inBag&&status.inWarehouse){
        const item=ITEMS[card.requiredItemId]!;
        if(bagWeight(s.bag)+item.weight<=15){
          s.warehouse[item.id]=(s.warehouse[item.id]??0)-1;
          if(s.warehouse[item.id]===0)delete s.warehouse[item.id];
          s.bag[item.id]=(s.bag[item.id]??0)+1;
          s.lastEvent=`我把「${item.name}」放進了背包，準備使用「${card.name}」。`;
        }else s.lastEvent=`已加入「${card.name}」，但背包負重不足，無法帶上「${item.name}」。這張卡目前無效。`;
      }else if(status.inBag)s.lastEvent=`「${card.name}」已準備好，背包裡有對應的「${ITEMS[card.requiredItemId]!.name}」。`;
      else s.lastEvent=`已加入「${card.name}」，但缺少「${ITEMS[card.requiredItemId]!.name}」。進關卡若找到它，這張卡就能使用。`;
      return s;
    }
    case 'CHOOSE':{
      if(s.mode!=='adventure'||s.enemyCounter||s.sceneId==='confrontation'&&s.enemy.health<=0)return state;
      s.enemyStrike=null;
      const npc=activeNpc(s);
      const choice=getVisibleActions(s).find(c=>c.id===action.choiceId);
      if(!choice)return state;
      if(choice.attackCardId&&(!s.attackDeck.includes(choice.attackCardId)||!attackStatus(s,choice.attackCardId).inBag))return state;
      const card=action.skillId?CARDS[action.skillId]:undefined;
      const skill=card&&isSkillCompatible(choice,card)&&s.hand.includes(card.id)&&s.player.resource>=card.resourceCost?card:undefined;
      const preview=calculateActionPreview(s,choice,skill?.id??null);
      advanceTime(s,preview.minutes);
      s.player.stamina=preview.projectedStamina;
      s.player.courage=preview.projectedCourage;
      s.player.resource=clamp(s.player.resource-preview.resourceCost,0,s.player.maxResource);
      s.lastLoot=null;
      if(skill){
        s.hand=s.hand.filter(id=>id!==skill.id);
        s.discardPile.push(skill.id);
        drawCards(s,1);
      }
      const isSuccess=preview.chance===100 || nextRand(s)*100<preview.chance;
      awardExperience(s,`action:${s.stageId??1}:${choice.id}`,isSuccess?5:2);
      if(preview.chance<100&&s.insightBonus>0)s.insightBonus=0;
      const suffix=skill?`（附加「${skill.name}」）`:'';
      s.log.push(`${choice.title}${suffix}：${isSuccess?'成功':'失敗'}，判定成功率 ${preview.chance}%`);
      const hostility=isSuccess?(choice.npcHostilitySuccess??0):(choice.npcHostilityFailure??0);
      npc.hostility=clamp(npc.hostility+hostility,0,100);
      const flags=isSuccess?choice.flagsOnSuccess:choice.flagsOnFailure;
      if(flags)s.flags=Array.from(new Set([...s.flags,...flags]));
      if(s.flags.includes('bluff_exposed'))npc.remembers=Array.from(new Set([...npc.remembers,'bluff_exposed']));
      if(s.flags.includes('caught_sneaking'))npc.remembers=Array.from(new Set([...npc.remembers,'caught_sneaking']));
      if(s.flags.includes('alley_spotted'))npc.remembers=Array.from(new Set([...npc.remembers,'alley_spotted']));
      if(choice.tags.includes('talk')&&!isSuccess)npc.adaptations.talk=Math.min(12,(npc.adaptations.talk??0)+2);
      if(s.profession==='journalist'&&choice.tags.includes('observe')&&isSuccess)s.player.resource=Math.min(s.player.maxResource,s.player.resource+1);
      if(s.profession==='courier'&&choice.tags.includes('run')&&isSuccess)s.player.resource=Math.min(s.player.maxResource,s.player.resource+1);
      if(s.profession==='infiltrator'&&choice.tags.includes('sneak')&&isSuccess)s.player.resource=Math.min(s.player.maxResource,s.player.resource+1);
      if(choice.attackCardId){
        if(!s.flags.includes('attacked_enemy'))s.flags.push('attacked_enemy');
        const cardName=ATTACK_CARDS[choice.attackCardId]?.name??choice.title;
        if(isSuccess){
          const damage=getAttackDamage(s,choice.attackCardId);
          s.enemy.health=clamp(s.enemy.health-damage,0,s.enemy.maxHealth);
          s.lastEvent=`我用「${cardName}」命中對方，造成 ${damage} 點傷害；對方剩下 ${s.enemy.health}/${s.enemy.maxHealth} 生命。`;
          if(s.enemy.health===0){
            rememberCombatDefeat(s,choice.attackCardId);
            s.flags=Array.from(new Set([...s.flags,'won_by_combat']));
            s.sceneId='loot';
            s.lastEvent+=' 對方倒在地上，終於失去抵抗能力。';
            return s;
          }
        }else s.lastEvent=`「${cardName}」失手了。我必須準備承受他的反擊。`;

        // One explicit enemy turn after an attempted weapon attack while the guard remains standing.
        // Items are drawn from his still-held gear; no infinite spam or inventory deletion.
        const available=(s.stageId===2?['wire_piece','flashlight','batteries']:['radio','flashlight','keyring']).filter(id=>!npc.stolenGear.includes(id));
        const itemId=available[Math.floor(nextRand(s)*available.length)]??'keyring';
        const hit=!isSuccess||nextRand(s)<.68;
        const rawDamage=itemId==='flashlight'?8:itemId==='radio'||itemId==='wire_piece'?6:4;
        const damage=hit?mitigateCounterDamage(rawDamage+Math.floor(npc.hostility/40),getEquippedDefense(s)):0;
        // Store the rolled attack once, then play it in distinct timed phases.
        // Health is only deducted at the on-screen impact; the player cannot bypass the queued counter.
        s.enemyCounter={id:s.attempt*1000+s.log.length,itemId,damage,hit,phase:'waiting'};
        s.lastEvent+=' 對方正準備反擊，我得提防他接下來的動作。';
        return s;
      }
      if(!isSuccess&&s.sceneId==='confrontation'&&!choice.attackCardId&&choice.tags.includes('talk')&&choice.successScene==='loot'){
        // One failed negotiation transitions into combat. The enemy gets their regular
        // wind-up/counter animation, not an instant "mission failed" popup.
        s.flags=Array.from(new Set([...s.flags,'negotiation_rejected']));
        const itemId=s.stageId===2?'wire_piece':'radio';
        const rawDamage=itemId==='radio'?6:5;
        s.enemyCounter={id:s.attempt*1000+s.log.length,itemId,damage:mitigateCounterDamage(rawDamage+Math.floor(npc.hostility/40),getEquippedDefense(s)),hit:true,phase:'waiting'};
        s.lastEvent='交涉失敗。對方再也不肯聽我的解釋，已經準備動手。我要想辦法防禦或反擊。';
        return s;
      }
      if(isSuccess&&choice.lootSource){
        s.lastLoot=addLoot(s,choice.lootSource);
        // 裝備屬於同一個 NPC 的持久資產，取完前可以繼續拿
        if(choice.lootSource==='npcGear'&&INITIAL_NPC_GEAR.every(id=>npc.stolenGear.includes(id))&&!s.searchedSources.includes('npcGear'))s.searchedSources.push('npcGear');
      }else{
        s.lastEvent=isSuccess?'我完成了這個行動。接下來該怎麼辦？':'事情沒有照我想的發展。我得面對新的局面。';
      }
      const outcome=isSuccess?choice.successOutcome:choice.failureOutcome;
      const nextScene=isSuccess?choice.successScene:choice.failureScene;
      if(outcome)resolveOutcome(s,outcome);
      else if(nextScene)s.sceneId=nextScene;
      // 有效關卡中的部分觀察行為恢復些許專屬資源，且不重複給予相同地點的情報
      if(isSuccess&&(choice.id==='gate_observe'||choice.id==='alley_gate_scan'))s.lastEvent='我看清楚了側門與巡邏路線。這或許能幫助下一步行動。';
      return s;
    }
    case 'RETREAT':{
      if(s.mode!=='adventure'||s.enemyCounter)return state;
      const preview=retreatPreview(s);
      advanceTime(s,preview.minutes);
      s.player.stamina=clamp(s.player.stamina-preview.staminaCost,0,s.player.maxStamina);
      s.player.courage=clamp(s.player.courage-preview.courageLoss,0,100);
      const passed=nextRand(s)*100<preview.chance;
      s.log.push(`嘗試撤退（${preview.chance}%）：${passed?'成功':'失敗'}`);
      if(passed){resolveOutcome(s,'retreat');}
      else {const npc=activeNpc(s);npc.hostility=clamp(npc.hostility+8,0,100);resolveOutcome(s,'defeat');}
      return s;
    }
    case 'RETURN_HUB':{
      if(s.mode!=='result')return state;
      const entries=Object.entries(s.bag);
      const protectedSet=new Set(s.protectedItems);
      // Weapons from the prepared attack deck count as part of the player's loadout.
      for(const cardId of s.attackDeck){
        const itemId=ATTACK_CARDS[cardId]?.requiredItemId;if(itemId)protectedSet.add(itemId);
      }
      for(const [id,qty] of entries){
        if(protectedSet.has(id)||!ITEMS[id])continue;
        const maxQty=Math.floor((s.warehouseCapacity-bagWeight(s.warehouse)+1e-8)/ITEMS[id]!.weight);
        const moved=Math.min(qty,Math.max(0,maxQty));
        if(moved>0){s.warehouse[id]=(s.warehouse[id]??0)+moved;s.bag[id]=qty-moved;if(s.bag[id]===0)delete s.bag[id];}
      }
      advanceTime(s,35);
      // Returning to the hub is not free healing. The player must use the inn,
      // supplies or clinic. Keep the one-HP defeat state until treatment.
      s.mode='home';s.lastEvent=bagWeight(s.bag)>0?'已自動整理戰利品；部分物品因保護設定或倉庫容量，仍保留在背包中。':'戰利品已自動入倉，常用裝備會保留在身上。';
      return s;
    }
    case 'MARKET_BUY_ITEM':{
      if(s.mode==='adventure')return state;
      if(action.vendorId!==getScheduledVendorId(s.world.minute))return state;
      const vendor=vendorById(action.vendorId);
      const offer=vendor?.sellItems.find(x=>x.id===action.itemId),item=ITEMS[action.itemId];
      if(!vendor||!offer||!item)return state;
      const stockKey=getVendorStockKey(vendor.id,item.id);
      if((s.economy.marketStock[stockKey]??0)>=offer.stock||s.economy.coins<offer.price)return state;
      if(bagWeight(s.bag)+item.weight>15){s.lastEvent='背包已接近負重上限，現在裝不下這件商品。';return s;}
      s.economy.coins-=offer.price;
      s.economy.marketStock[stockKey]=(s.economy.marketStock[stockKey]??0)+1;
      s.economy.marketPurchases+=1;
      s.bag[item.id]=(s.bag[item.id]??0)+1;
      s.lastEvent=`我向「${vendor.name}」購買了「${item.name}」，花掉 ${offer.price} 枚舊幣。`;
      awardExperience(s,`market:buy-item:${vendor.id}:${item.id}`,3);
      return s;
    }
    case 'MARKET_SELL_ITEM':{
      if(s.mode==='adventure')return state;
      if(action.vendorId!==getScheduledVendorId(s.world.minute))return state;
      const vendor=vendorById(action.vendorId),item=ITEMS[action.itemId];
      if(!vendor||!item||!vendor.buyItems.includes(action.itemId))return state;
      if(s.protectedItems.includes(item.id)||Object.values(s.equipment).includes(item.id))return state;
      // Keep selected weapon cards functional; never silently sell a prepared weapon.
      if(s.attackDeck.some(id=>ATTACK_CARDS[id]?.requiredItemId===item.id)&&
        (s.warehouse[item.id]??0)+(s.bag[item.id]??0)<=1)return state;
      const source=(s.warehouse[item.id]??0)>0?'warehouse':'bag';
      if((s[source][item.id]??0)<=0)return state;
      s[source][item.id]=(s[source][item.id]??0)-1;
      if(s[source][item.id]===0)delete s[source][item.id];
      const gain=marketSellPrice(item.id);
      s.economy.coins+=gain;
      s.economy.blackMarketFavor=Math.min(100,s.economy.blackMarketFavor+1);
      s.lastEvent=`我把「${item.name}」賣給「${vendor.name}」，得到 ${gain} 枚舊幣。`;
      awardExperience(s,`market:sell-item:${vendor.id}:${item.id}`,3);
      return s;
    }
    case 'MARKET_SELL':{
      if(s.mode==='adventure')return state;
      if(action.vendorId!==getScheduledVendorId(s.world.minute))return state;
      const vendor=vendorById(action.vendorId);
      if(!vendor||!vendor.cardIds.includes(action.cardId))return state;
      const card=CARDS[action.cardId],owned=s.ownedCards[action.cardId];
      if(!card||!owned||owned.copies<1)return state;
      const earnings=card.rarity==='normal'?18:card.rarity==='rare'?55:120;
      owned.copies-=1;s.economy.coins+=earnings;
      s.economy.blackMarketFavor=Math.min(100,s.economy.blackMarketFavor+(card.rarity==='normal'?2:5));
      s.lastEvent=`黑市收下了「${card.name}」重複卡，支付 ${earnings} 枚舊幣。`;
      awardExperience(s,`market:sell-card:${vendor.id}:${card.id}`,3);
      return s;
    }
    case 'MARKET_BUY':{
      if(s.mode==='adventure')return state;
      if(action.vendorId!==getScheduledVendorId(s.world.minute))return state;
      const vendor=vendorById(action.vendorId);
      if(!vendor||!vendor.cardIds.includes(action.cardId))return state;
      const card=CARDS[action.cardId];if(!card||!s.ownedCards[action.cardId])return state;
      const price=card.rarity==='normal'?360:card.rarity==='rare'?980:4000;
      if(s.economy.coins<price)return state;
      s.economy.coins-=price;s.economy.marketPurchases+=1;
      s.ownedCards[action.cardId]!.copies+=1;
      s.lastEvent=`我花了 ${price} 枚舊幣取得「${card.name}」重複卡。這筆錢本來可以換很多補給。`;
      awardExperience(s,`market:buy-card:${vendor.id}:${card.id}`,3);
      return s;
    }
    case 'TOWN_SERVICE':{
      const result=applyTownService(s,action.serviceId,action.attribute,action.itemId);
      if(!result)return state;
      awardExperience(s,`town:${action.serviceId}`,6);
      const restorative=['rest_cot','rest_private','rest_short','clinic_illness','bath','wash_clothes'].includes(action.serviceId);
      advanceTime(s,result.minutes,restorative);
      return s;
    }
    case 'TOWN_ACCEPT_QUEST':{
      if(s.mode!=='home')return state;
      const quest=TOWN_QUESTS.find(q=>q.id===action.questId),town=ensureTownProgress(s);
      if(!quest||town.quests[quest.id])return state;
      town.quests[quest.id]='accepted';
      s.lastEvent=`我接下了「${quest.title}」。完成條件後，再回公告欄交付即可。`;
      s.log.push(`承接委託：${quest.title}`);
      awardExperience(s,`quest:accept:${quest.id}`,8);
      return s;
    }
    case 'TOWN_COMPLETE_QUEST':{
      if(s.mode!=='home')return state;
      const quest=TOWN_QUESTS.find(q=>q.id===action.questId),town=ensureTownProgress(s);
      if(!quest||town.quests[quest.id]!=='accepted'||!townQuestReady(s,quest))return state;
      if(quest.requirement.kind==='item'){
        const id=quest.requirement.itemId??'',qty=quest.requirement.quantity??1;
        let left=qty;
        for(const bucket of [s.bag,s.warehouse]){
          const n=Math.min(left,bucket[id]??0);bucket[id]=(bucket[id]??0)-n;
          if(bucket[id]===0)delete bucket[id];left-=n;
        }
        if(left!==0)throw Error('Quest inventory preview drift');
      }
      town.quests[quest.id]='completed';
      s.economy.coins+=quest.rewardCoins;
      s.player.attributes[quest.rewardAttribute]=Math.min(20,s.player.attributes[quest.rewardAttribute]+1);
      s.lastEvent=quest.ending+` 得到 ${quest.rewardCoins} 舊幣及一項永久屬性成長。`;
      s.log.push(`委託完成：「${quest.title}」。`);
      awardExperience(s,`quest:complete:${quest.id}`,22);
      advanceTime(s,10);
      return s;
    }
    case 'REST_TOWN':{
      const result=applyTownService(s,'rest_cot');
      if(!result)return state;
      awardExperience(s,'town:rest_cot',6);
      advanceTime(s,result.minutes,true);
      return s;
    }
    case 'ALLOCATE_POINT':{
      if(!allocatePoint(s,action.attribute))return state;
      s.lastEvent='我將升級獲得的一點能力點數投入了永久屬性。';
      return s;
    }
    case 'EQUIP_ITEM':{
      if(s.mode==='adventure')return state;
      const hasBag=(s.bag[action.itemId]??0)>0,hasStock=(s.warehouse[action.itemId]??0)>0;
      if(!ITEMS[action.itemId]||(!hasBag&&!hasStock)||!EQUIPMENT_SLOTS.some(slot=>slot.id===action.slot&&slot.allowed.includes(action.itemId)))return state;
      if(Object.entries(s.equipment).some(([slot,id])=>slot!==action.slot&&id===action.itemId))return state;
      if(!hasBag){
        if(bagWeight(s.bag)+ITEMS[action.itemId]!.weight>15){s.lastEvent='裝備後背包會超過負重上限，請先整理物品。';return s;}
        s.warehouse[action.itemId]=(s.warehouse[action.itemId]??0)-1;if(s.warehouse[action.itemId]===0)delete s.warehouse[action.itemId];
        s.bag[action.itemId]=(s.bag[action.itemId]??0)+1;
      }
      const previous=s.equipment[action.slot];
      s.equipment[action.slot]=action.itemId;
      if(previous&&!Object.values(s.equipment).includes(previous))s.protectedItems=s.protectedItems.filter(id=>id!==previous);
      if(!s.protectedItems.includes(action.itemId))s.protectedItems.push(action.itemId);
      s.lastEvent=`我將「${ITEMS[action.itemId]!.name}」指定為常用裝備。`;
      return s;
    }
    case 'UNEQUIP_ITEM':{
      if(s.mode==='adventure')return state;
      const id=s.equipment[action.slot];if(!id)return state;
      s.equipment[action.slot]=null;
      if(!Object.values(s.equipment).includes(id))s.protectedItems=s.protectedItems.filter(item=>item!==id);
      s.lastEvent='我卸下了常用裝備。';
      return s;
    }
    case 'UPGRADE_CARD':{
      const card=CARDS[action.cardId]??ATTACK_CARDS[action.cardId];const owned=s.ownedCards[action.cardId];
      if(!card||!owned)return state;
      const cost=getUpgradeRequirement(card.rarity,owned.level);
      if(cost===null||owned.copies<cost)return state;
      owned.copies-=cost;owned.level+=1;
      s.lastEvent=`「${card.name}」已升級至 ${['','I','II','III','IV','V'][owned.level]}。`;
      return s;
    }
    case 'PROTECT_ITEM':{
      if(Object.values(s.equipment).includes(action.itemId))return state;
      if((s.bag[action.itemId]??0)<=0 && (s.warehouse[action.itemId]??0)<=0)return state;
      if(s.protectedItems.includes(action.itemId))s.protectedItems=s.protectedItems.filter(id=>id!==action.itemId);
      else s.protectedItems.push(action.itemId);
      return s;
    }
    case 'DEPOSIT_ITEM':{
      if(s.mode!=='home')return state;
      const item=ITEMS[action.itemId];
      if(!item||(s.bag[action.itemId]??0)<=0)return state;
      if(Object.values(s.equipment).includes(action.itemId)){
        s.lastEvent='這件裝備目前正在穿戴，必須先卸下才能存進倉庫。';return s;
      }
      if(s.protectedItems.includes(action.itemId)){
        s.lastEvent='這是常用隨身物品。先取消常用標記，才能手動入倉。';return s;
      }
      if(bagWeight(s.warehouse)+item.weight>s.warehouseCapacity+1e-8){
        s.lastEvent='倉庫容量已滿。物品仍安全留在背包裡。';return s;
      }
      s.bag[action.itemId]=(s.bag[action.itemId]??0)-1;
      if(s.bag[action.itemId]===0)delete s.bag[action.itemId];
      s.warehouse[action.itemId]=(s.warehouse[action.itemId]??0)+1;
      s.lastEvent=`我把「${item.name}」存進了倉庫。`;
      return s;
    }
    case 'WITHDRAW_ITEM':{
      if((s.warehouse[action.itemId]??0)<=0||!ITEMS[action.itemId])return state;
      if(bagWeight(s.bag)+ITEMS[action.itemId]!.weight>15){s.lastEvent='目前背包負重不足，無法領出這件物品。';return s;}
      s.warehouse[action.itemId]=(s.warehouse[action.itemId]??0)-1;if(s.warehouse[action.itemId]===0)delete s.warehouse[action.itemId];
      s.bag[action.itemId]=(s.bag[action.itemId]??0)+1;
      s.lastEvent=`我從倉庫領出了「${ITEMS[action.itemId]!.name}」。`;return s;
    }
    case 'USE_ITEM':{
      if((s.bag[action.itemId]??0)<=0)return state;
      if(action.itemId==='biscuit'||action.itemId==='canned'){
        s.player.hunger=clamp(s.player.hunger-20,0,100);
        s.player.stamina=clamp(s.player.stamina+1,0,s.player.maxStamina);
      }else if(action.itemId==='water'){
        s.player.stamina=clamp(s.player.stamina+2,0,s.player.maxStamina);
      }else if(action.itemId==='firstaid'||action.itemId==='bandage'){
        s.player.health=clamp(s.player.health+(action.itemId==='firstaid'?20:8),0,s.player.maxHealth);
      }else return state;
      s.bag[action.itemId]=(s.bag[action.itemId]??0)-1;if(s.bag[action.itemId]===0)delete s.bag[action.itemId];
      s.lastEvent=`我使用了「${ITEMS[action.itemId]!.name}」，感覺稍微好一些。`;
      awardExperience(s,`use:${action.itemId}`,1);
      advanceTime(s,3);
      return s;
    }
    case 'DEBUG':{
      if(!import.meta.env.DEV)return state;
      if(action.patch.kind==='minute')s.world.minute=clamp(action.patch.value,0,1439);
      else if(action.patch.kind==='resource')s.player.resource=clamp(action.patch.value,0,s.player.maxResource);
      else if(action.patch.kind==='health')s.player.health=clamp(action.patch.value,1,s.player.maxHealth);
      else if(action.patch.kind==='stamina')s.player.stamina=clamp(action.patch.value,0,s.player.maxStamina);
      else s.player.courage=clamp(action.patch.value,0,100);
      return s;
    }
    default:return state;
  }
};
