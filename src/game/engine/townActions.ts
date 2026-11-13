import { TOWN_SERVICES,isTownOpen,townAbsoluteMinute } from '../data/town';
import type { AttributeId,GameState,TownProgress,SurvivorConditions } from '../types';
import { ITEMS } from '../data/items';
import { clamp } from './rules';
import {clinicTreatmentPreview} from './clinic';
import { isRestService,previewInnRest,remainingDailyRest } from './innRest';
import {armorRepairFee,armorSlotForItem,completeArmorRepair,ensureArmorTownFields} from './armor';

export const ensureTownProgress=(s:GameState):TownProgress=>{
 if(!s.town)s.town={visits:{},lastTrainingDay:0,lastRumorDay:0,lastCanteenTalkDay:0,socialPoiseUntil:0,upgrades:{},wear:{},quests:{}};
 ensureArmorTownFields(s.town);
 return s.town;
};
export const ensureConditions=(s:GameState):SurvivorConditions=>{
 if(!s.conditions)s.conditions={wounds:0,infection:0,poisoning:0,illness:0};
 return s.conditions;
};
export const getTrainingFee=(s:GameState,attribute:AttributeId):number=>42+Math.max(0,s.player.attributes[attribute])*11;
export const getTownServiceFee=(s:GameState,id:string,attribute?:AttributeId,itemId?:string):number=>
 id==='train'&&attribute?getTrainingFee(s,attribute):
 id==='workshop_repair'&&itemId?armorRepairFee(s,itemId):
 TOWN_SERVICES.find(x=>x.id===id)?.coins??0;
export const getTownServiceLock=(s:GameState,id:string,attribute?:AttributeId,itemId?:string):string|null=>{
 if(s.mode!=='home')return '任務期間無法離開戰場使用城鎮服務';
 const service=TOWN_SERVICES.find(x=>x.id===id);
 if(!service)return '找不到這項服務';
 if(!isTownOpen(service.facility,s.world.minute))return '這間設施在目前時段沒有營業';
 const town=s.town;
 if(isRestService(id)&&remainingDailyRest(s)<=0)return '今日已休息兩次，請等到下一個台北日';
 if(id==='train'){
  if(!attribute||!(attribute in s.player.attributes))return '先選擇要提升的永久屬性';
  if(s.player.attributes[attribute]>=20)return '這項永久屬性已達訓練上限 20';
  if(town?.lastTrainingDay===s.world.day)return '今天已訓練過一次；每天只能專精一項';
 }
 if(id==='tavern_rumor'&&town?.lastRumorDay===s.world.day)return '今天已購買過情報，明天再來';
 if(id==='canteen_talk'&&town?.lastCanteenTalkDay===s.world.day)return '今天已聽過居民閒談，明天再來';
 if(id==='workshop_repair'||id==='workshop_upgrade'){
  if(!itemId||!Object.values(s.equipment).includes(itemId))return '請先在人物檔案裝備一件要處理的物品';
  if(id==='workshop_repair'){
   if(!armorSlotForItem(s,itemId))return '只可修復已穿戴的頭部、身體、手臂或腿部防具';
   if(armorRepairFee(s,itemId)<=0)return '這個防禦部位目前完整，不需要修理';
  }
  if(id==='workshop_upgrade'){
   if((town?.upgrades[itemId]??0)>=3)return '這件裝備已達 III 階改良上限';
   if((s.bag.tape??0)+(s.warehouse.tape??0)+(s.bag.wire_piece??0)+(s.warehouse.wire_piece??0)<1)return '缺少工業膠帶或沾水的電線（需要 1 份材料）';
  }
 }
 const conditions=s.conditions;
 if(id==='clinic_wounds'&&!(conditions?.wounds??0))return '目前沒有需要清創的外傷';
 if(id==='clinic_infection'&&!(conditions?.infection??0))return '目前沒有感染症狀';
 if(id==='clinic_poison'&&!(conditions?.poisoning??0))return '目前沒有中毒症狀';
 if(id==='clinic_illness'&&!(conditions?.illness??0))return '目前沒有疾病症狀';
 if(id==='clinic_general'&&s.player.health>=s.player.maxHealth)return '目前生命已完全恢復';
 const fee=getTownServiceFee(s,id,attribute,itemId);
 if(s.economy.coins<fee)return `舊幣不足，需要 ${fee} 枚`;
 return null;
};
const restore=(now:number,amount:number,max:number)=>clamp(now+amount,0,max);
const consumeOneMaterial=(s:GameState,ids:string[]):string|null=>{
 for(const id of ids)for(const storage of [s.bag,s.warehouse]){
  if((storage[id]??0)<=0)continue;
  storage[id]=(storage[id]??0)-1;
  if(storage[id]===0)delete storage[id];
  return id;
 }
 return null;
};
/** Mutable on the reducer's structuredClone only, never on React's old state. */
export const applyTownService=(s:GameState,id:string,attribute?:AttributeId,itemId?:string):{message:string;minutes:number}|null=>{
 if(getTownServiceLock(s,id,attribute,itemId))return null;
 const service=TOWN_SERVICES.find(x=>x.id===id)!;
 const town=ensureTownProgress(s),conds=ensureConditions(s),p=s.player;
 const fee=getTownServiceFee(s,id,attribute,itemId);
 s.economy.coins-=fee;
 town.visits[service.facility]=(town.visits[service.facility]??0)+1;
 let message='';
 // Record the day BEFORE the sleep time is advanced, so crossing midnight
 // still spends a rest opportunity on the day the player went to bed.
 if(isRestService(id)){
  if(town.lastRestDay!==s.world.day){town.lastRestDay=s.world.day;town.restsToday=0;}
  town.restsToday=(town.restsToday??0)+1;
 }
 switch(id){
  case 'rest_cot':
  case 'rest_private':
  case 'rest_short':{
   const preview=previewInnRest(s,id);
   p.health=preview.predictedHealth;p.stamina=preview.predictedStamina;
   p.fatigue=restore(p.fatigue,id==='rest_private'?-38:id==='rest_cot'?-22:-10,100);
   if(id==='rest_private')p.courage=restore(p.courage,10,100);
   message=`我休息了一陣子，生命 +${preview.healthGain}、體力 +${preview.staminaGain}。越疲憊時身體對休息的反應越明顯。`;
   break;
  }
  case 'clinic_wounds':
  case 'clinic_infection':
  case 'clinic_poison':
  case 'clinic_illness':
  case 'clinic_general':{
   const preview=clinicTreatmentPreview(s,id);
   p.health=preview.resultingHealth;p.stamina=preview.resultingStamina;
   p.fatigue=restore(p.fatigue,preview.fatigue,100);
   conds.wounds=restore(conds.wounds,preview.wounds,100);
   conds.infection=restore(conds.infection,preview.infection,100);
   conds.poisoning=restore(conds.poisoning,preview.poisoning,100);
   conds.illness=restore(conds.illness,preview.illness,100);
   message=`診療完成：生命 +${preview.health}、體力 +${preview.stamina}，症狀已依療程處理。`;
   break;
  }
  case 'workshop_repair':{
   const perfect=completeArmorRepair(s,itemId!);
   message=`「${ITEMS[itemId!]?.name??itemId}」修復至 100%。${perfect?'工匠完成了完美修理！下一次任務該部位防禦額外 +1。':'耐久度已恢復，能再承受接下來的衝擊。'}`;
   break;
  }
  case 'workshop_upgrade':{
   const material=consumeOneMaterial(s,['tape','wire_piece']);
   if(!material)throw Error('workshop material check drifted from preview');
   town.upgrades[itemId!]=(town.upgrades[itemId!]??0)+1;
   message=`我交出「${ITEMS[material]?.name}」，將「${ITEMS[itemId!]?.name}」改良至 ${town.upgrades[itemId!]} 階。裝備效能確實提高。`;
   break;
  }
  case 'tavern_rumor':{
   town.lastRumorDay=s.world.day;s.economy.blackMarketFavor+=1;
   const lines=['一台沒有登記的廂型車在深夜往北開。','封鎖區某個診所每週都會收到陌生藥箱。','倉庫的排班表在失蹤事件發生後被人改過。','有人深夜在公寓門口掛起沒有署名的信。','河堤附近的監視器總是在同個時間失效。'];
   const clue=`第 ${s.world.day} 日酒館情報：${lines[(s.world.day+Math.floor(s.world.minute/240))%lines.length]}`;
   if(!s.clues.includes(clue))s.clues.push(clue);
   message=`我拿到一項新情報：「${clue}」黑市人脈也更願意跟我說話。`;break;
  }
  case 'train':{
   town.lastTrainingDay=s.world.day;
   p.attributes[attribute!]+=1;
   if(attribute==='maxHealth'){p.maxHealth+=1;p.health=restore(p.health,1,p.maxHealth);}
   if(attribute==='maxStamina'){p.maxStamina+=1;p.stamina=restore(p.stamina,1,p.maxStamina);}
   message=`今天我專心練習了一項能力。「${attribute}」永久提升至 ${p.attributes[attribute!]}，明天才能再訓練。`;break;
  }
  case 'bath':p.courage=restore(p.courage,12,100);p.fatigue=restore(p.fatigue,-8,100);town.socialPoiseUntil=townAbsoluteMinute(s)+180;message='洗去灰塵與疲倦。我看起來總算比較像個可以信任的人，短時間交涉更順利。';break;
  case 'wash_clothes':p.courage=restore(p.courage,6,100);town.socialPoiseUntil=townAbsoluteMinute(s)+300;message='外衣乾淨了。至少短時間內，我不會因狼狽的外表先被人排斥。';break;
  case 'hot_meal':p.hunger=restore(p.hunger,-38,100);p.stamina=restore(p.stamina,14,p.maxStamina);message='熱飯和一碗湯讓我終於恢復些精神。';break;
  case 'canteen_talk':{
   town.lastCanteenTalkDay=s.world.day;
   const lines=['食堂裡的人說，巡邏車有時會繞過本來應該檢查的路口。','有人認得後巷的灰衣守望者，他不是一直都在那裡。','最近常有人買走所有乾糧，似乎在準備長途離城。'];
   const clue=`第 ${s.world.day} 日居民閒談：${lines[s.world.day%lines.length]}`;
   if(!s.clues.includes(clue))s.clues.push(clue);
   message='我聽完隔桌的談話，記下了一條可以追查的城市線索。';break;
  }
  default:throw Error('unhandled town service '+id);
 }
 s.lastEvent=message;
 s.log.push(`城鎮 · ${service.name}：花費 ${fee} 舊幣；現實時間照常流動。`);
 return {message,minutes:service.minutes};
};
