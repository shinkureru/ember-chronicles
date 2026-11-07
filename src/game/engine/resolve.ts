import { CARDS, getUpgradeRequirement } from '../data/cards';
import { ITEMS, LOOT_POOLS, INITIAL_NPC_GEAR } from '../data/items';
import { calculateActionPreview, bagWeight, getVisibleActions, isSkillCompatible, retreatPreview, clamp } from './rules';
import { makeInitialState } from '../state/initial';
import { EQUIPMENT_SLOTS } from '../data/equipment';
import type { GameState, Outcome, ProfessionId, LootDrop } from '../types';

export type GameAction =
  | {type:'SELECT_PROFESSION';profession:ProfessionId}
  | {type:'START_ATTEMPT'}
  | {type:'CHOOSE';choiceId:string;skillId:string|null}
  | {type:'RETREAT'}
  | {type:'RETURN_HUB'}
  | {type:'UPGRADE_CARD';cardId:string}
  | {type:'MARKET_SELL';cardId:string}
  | {type:'MARKET_BUY';cardId:string}
  | {type:'REST_TOWN'}
  | {type:'EQUIP_ITEM';slot:string;itemId:string}
  | {type:'UNEQUIP_ITEM';slot:string}
  | {type:'PROTECT_ITEM';itemId:string}
  | {type:'WITHDRAW_ITEM';itemId:string}
  | {type:'USE_ITEM';itemId:string}
  | {type:'DEBUG';patch:{kind:'health'|'stamina'|'courage'|'resource'|'minute';value:number}}
  | {type:'RESET'};

const nextRand=(state:GameState)=>{
  state.rngSeed=(Math.imul(1664525,state.rngSeed)+1013904223)>>>0;
  return state.rngSeed/4294967296;
};
const advanceTime=(s:GameState,minutes:number)=>{
  const total=s.world.minute+minutes;
  s.world.day+=Math.floor(total/1440);
  s.world.minute=total%1440;
  s.player.hunger=clamp(s.player.hunger+Math.floor(minutes/15),0,100);
  s.player.fatigue=clamp(s.player.fatigue+Math.floor(minutes/12),0,100);
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
  if(source==='npcGear'){
    const available=INITIAL_NPC_GEAR.filter(id=>!s.npc.stolenGear.includes(id));
    if(available.length===0){s.searchedSources.push('npcGear');s.lastEvent='對方身上的可取裝備已經沒有剩下的了。';return null;}
    const id=available[0]!;
    if(bagWeight(s.bag)+ITEMS[id]!.weight>15){s.lastEvent=`背包太重了，無法帶走「${ITEMS[id]!.name}」。`;return null;}
    s.npc.stolenGear.push(id);
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
    const cardId=itemId==='card_question'?'question':'route';
    if(!s.ownedCards[cardId])s.ownedCards[cardId]={copies:0,level:1};
    s.ownedCards[cardId]!.copies+=1;
    s.lastEvent=`竟然找到「${CARDS[cardId]!.name}」的重複卡！已放入卡牌收藏庫。`;
  }else{
    s.bag[itemId]=(s.bag[itemId]??0)+1;
    s.lastEvent=`我仔細翻找，找到「${def.name}」。`;
  }
  s.searchedSources.push(source);
  return {itemId,quantity:1,source};
};
const resolveOutcome=(s:GameState,outcome:Outcome)=>{
  s.outcome=outcome;s.mode='result';
  if(outcome==='defeat'){
    s.player.health=clamp(s.player.health-18,1,s.player.maxHealth);
    s.npc.remembers=Array.from(new Set([...s.npc.remembers,'defeated_player']));
    s.npc.adaptations.talk=Math.min(12,(s.npc.adaptations.talk??0)+3);
    const clueNo=s.clues.length+1;
    const fragments=[
      '我終於注意到，管理員每次接近對講機前都會先看向側門。',
      '管理員對「失蹤員工」的名字反應異常，他似乎知道更多內情。',
      '我想起牆上的排班表：夜班的巡邏時間其實很規律。',
      '管理員真正害怕的似乎不是陌生人，而是出貨紀錄被查出問題。',
      '我逐漸摸清對方說話時避開的敏感話題。',
    ];
    const clue=fragments[(clueNo-1)%fragments.length]!+`（第 ${clueNo} 次失敗反思）`;
    s.clues.push(clue);
    s.insightBonus=6; // 單次下一局的有效判定加成；不會因為重複失敗無限累加
    s.lastEvent=`我失敗了，但想明白了一件事：${clue} 下一次首次關鍵判定額外 +6 個百分點。`;
  }else if(outcome==='retreat'){
    s.npc.remembers=Array.from(new Set([...s.npc.remembers,'player_retreat']));
    s.insightBonus=Math.max(s.insightBonus,2);
    s.lastEvent='我先撤退了。雖然沒弄清全部情況，至少記住了一點動線。下次首次關鍵判定可獲得 +2 個百分點；多次撤退無法疊加這項加成。';
  }else{
    if(!s.chapterProgress.completed.includes(1))s.chapterProgress.completed.push(1);
    s.chapterProgress.unlocked=Math.max(s.chapterProgress.unlocked,2);
    s.npc.remembers=Array.from(new Set([...s.npc.remembers,'player_victory']));
    s.lastEvent='我成功離開了倉庫。這次找到的物資都還在，應該回去整理一下。';
  }
  s.log.push(`${outcome==='victory'?'任務成功':outcome==='defeat'?'戰敗':'主動撤退'}：第 ${s.attempt} 次挑戰。`);
};
export const gameReducer=(state:GameState,action:GameAction):GameState=>{
  if(action.type==='RESET')return makeInitialState();
  if(action.type==='SELECT_PROFESSION')return makeInitialState(action.profession);
  const s:GameState=structuredClone(state);
  switch(action.type){
    case 'START_ATTEMPT':{
      if(!s.profession||s.mode==='adventure')return state;
      s.attempt+=1;s.npc.met+=1;s.mode='adventure';s.sceneId='gate';
      s.flags=[];s.searchedSources=[];s.outcome=null;s.lastLoot=null;s.lastEvent=null;
      s.hand=[];s.discardPile=[];s.drawPile=[...s.activeDeck];
      drawCards(s,3);
      s.player.resource=clamp(s.player.resource+2,0,s.player.maxResource);
      s.log.push(`第 ${s.attempt} 次前往倉庫。`);
      return s;
    }
    case 'CHOOSE':{
      if(s.mode!=='adventure')return state;
      const choice=getVisibleActions(s).find(c=>c.id===action.choiceId);
      if(!choice)return state;
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
      if(preview.chance<100&&s.insightBonus>0)s.insightBonus=0;
      const suffix=skill?`（附加「${skill.name}」）`:'';
      s.log.push(`${choice.title}${suffix}：${isSuccess?'成功':'失敗'}，判定成功率 ${preview.chance}%`);
      const hostility=isSuccess?(choice.npcHostilitySuccess??0):(choice.npcHostilityFailure??0);
      s.npc.hostility=clamp(s.npc.hostility+hostility,0,100);
      const flags=isSuccess?choice.flagsOnSuccess:choice.flagsOnFailure;
      if(flags)s.flags=Array.from(new Set([...s.flags,...flags]));
      if(s.flags.includes('bluff_exposed'))s.npc.remembers=Array.from(new Set([...s.npc.remembers,'bluff_exposed']));
      if(s.flags.includes('caught_sneaking'))s.npc.remembers=Array.from(new Set([...s.npc.remembers,'caught_sneaking']));
      if(choice.tags.includes('talk')&&!isSuccess)s.npc.adaptations.talk=Math.min(12,(s.npc.adaptations.talk??0)+2);
      if(s.profession==='journalist'&&choice.tags.includes('observe')&&isSuccess)s.player.resource=Math.min(s.player.maxResource,s.player.resource+1);
      if(s.profession==='courier'&&choice.tags.includes('run')&&isSuccess)s.player.resource=Math.min(s.player.maxResource,s.player.resource+1);
      if(isSuccess&&choice.lootSource){
        addLoot(s,choice.lootSource);
        // 裝備屬於同一個 NPC 的持久資產，取完前可以繼續拿
        if(choice.lootSource==='npcGear'&&INITIAL_NPC_GEAR.every(id=>s.npc.stolenGear.includes(id)))s.searchedSources.push('npcGear');
      }else{
        s.lastEvent=isSuccess?'我完成了這個行動。接下來該怎麼辦？':'事情沒有照我想的發展。我得面對新的局面。';
      }
      const outcome=isSuccess?choice.successOutcome:choice.failureOutcome;
      const nextScene=isSuccess?choice.successScene:choice.failureScene;
      if(outcome)resolveOutcome(s,outcome);
      else if(nextScene)s.sceneId=nextScene;
      // 有效關卡中的部分觀察行為恢復些許專屬資源，且不重複給予相同地點的情報
      if(isSuccess&&choice.id==='gate_observe')s.lastEvent='我看清楚了側門與巡邏路線。這或許能幫助下一步行動。';
      return s;
    }
    case 'RETREAT':{
      if(s.mode!=='adventure')return state;
      const preview=retreatPreview(s);
      advanceTime(s,preview.minutes);
      s.player.stamina=clamp(s.player.stamina-preview.staminaCost,0,s.player.maxStamina);
      s.player.courage=clamp(s.player.courage-preview.courageLoss,0,100);
      const passed=nextRand(s)*100<preview.chance;
      s.log.push(`嘗試撤退（${preview.chance}%）：${passed?'成功':'失敗'}`);
      if(passed){resolveOutcome(s,'retreat');}
      else {s.npc.hostility=clamp(s.npc.hostility+8,0,100);resolveOutcome(s,'defeat');}
      return s;
    }
    case 'RETURN_HUB':{
      if(s.mode!=='result')return state;
      const entries=Object.entries(s.bag);
      const protectedSet=new Set(s.protectedItems);
      for(const [id,qty] of entries){
        if(protectedSet.has(id)||!ITEMS[id])continue;
        const maxQty=Math.floor((s.warehouseCapacity-bagWeight(s.warehouse)+1e-8)/ITEMS[id]!.weight);
        const moved=Math.min(qty,Math.max(0,maxQty));
        if(moved>0){s.warehouse[id]=(s.warehouse[id]??0)+moved;s.bag[id]=qty-moved;if(s.bag[id]===0)delete s.bag[id];}
      }
      advanceTime(s,35);
      s.player.stamina=clamp(s.player.stamina+28,0,s.player.maxStamina);
      s.player.health=clamp(s.player.health+10,1,s.player.maxHealth);
      s.player.fatigue=clamp(s.player.fatigue-10,0,100);
      s.mode='home';s.lastEvent=bagWeight(s.bag)>0?'已自動整理戰利品；部分物品因保護設定或倉庫容量，仍保留在背包中。':'戰利品已自動入倉，常用裝備會保留在身上。';
      return s;
    }
    case 'MARKET_SELL':{
      if(s.mode==='adventure')return state;
      const card=CARDS[action.cardId],owned=s.ownedCards[action.cardId];
      if(!card||!owned||owned.copies<1)return state;
      const earnings=card.rarity==='normal'?18:card.rarity==='rare'?55:120;
      owned.copies-=1;s.economy.coins+=earnings;
      s.economy.blackMarketFavor=Math.min(100,s.economy.blackMarketFavor+(card.rarity==='normal'?2:5));
      s.lastEvent=`黑市收下了「${card.name}」重複卡，支付 ${earnings} 枚舊幣。`;
      return s;
    }
    case 'MARKET_BUY':{
      if(s.mode==='adventure')return state;
      const card=CARDS[action.cardId];if(!card||!s.ownedCards[action.cardId])return state;
      const price=card.rarity==='normal'?360:card.rarity==='rare'?980:4000;
      if(s.economy.coins<price)return state;
      s.economy.coins-=price;s.economy.marketPurchases+=1;
      s.ownedCards[action.cardId]!.copies+=1;
      s.lastEvent=`我花了 ${price} 枚舊幣取得「${card.name}」重複卡。這筆錢本來可以換很多補給。`;
      return s;
    }
    case 'REST_TOWN':{
      if(s.mode==='adventure'||s.economy.coins<15)return state;
      s.economy.coins-=15;advanceTime(s,120);
      s.player.stamina=clamp(s.player.stamina+35,0,s.player.maxStamina);
      s.player.health=clamp(s.player.health+12,1,s.player.maxHealth);
      s.player.fatigue=clamp(s.player.fatigue-22,0,100);
      s.lastEvent='我在城鎮的一角休息了兩小時，總算恢復了一點精神。';
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
      const card=CARDS[action.cardId];const owned=s.ownedCards[action.cardId];
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
        s.player.stamina=clamp(s.player.stamina+5,0,s.player.maxStamina);
      }else if(action.itemId==='water'){
        s.player.stamina=clamp(s.player.stamina+7,0,s.player.maxStamina);
      }else if(action.itemId==='firstaid'||action.itemId==='bandage'){
        s.player.health=clamp(s.player.health+(action.itemId==='firstaid'?20:8),0,s.player.maxHealth);
      }else return state;
      s.bag[action.itemId]=(s.bag[action.itemId]??0)-1;if(s.bag[action.itemId]===0)delete s.bag[action.itemId];
      s.lastEvent=`我使用了「${ITEMS[action.itemId]!.name}」，感覺稍微好一些。`;
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
