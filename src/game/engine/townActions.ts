import { TOWN_SERVICES,isTownOpen,townAbsoluteMinute } from '../data/town';
import type { AttributeId,GameState,TownProgress,SurvivorConditions } from '../types';
import { ITEMS } from '../data/items';
import { clamp } from './rules';

export const ensureTownProgress=(s:GameState):TownProgress=>{
 if(!s.town)s.town={visits:{},lastTrainingDay:0,lastRumorDay:0,lastCanteenTalkDay:0,socialPoiseUntil:0,upgrades:{},wear:{},quests:{}};
 return s.town;
};
export const ensureConditions=(s:GameState):SurvivorConditions=>{
 if(!s.conditions)s.conditions={wounds:0,infection:0,poisoning:0,illness:0};
 return s.conditions;
};
export const getTrainingFee=(s:GameState,attribute:AttributeId):number=>42+Math.max(0,s.player.attributes[attribute]-10)*11;
export const getTownServiceLock=(s:GameState,id:string,attribute?:AttributeId,itemId?:string):string|null=>{
 if(s.mode!=='home')return '任務期間無法離開戰場使用城鎮服務';
 const service=TOWN_SERVICES.find(x=>x.id===id);
 if(!service)return '找不到這項服務';
 if(!isTownOpen(service.facility,s.world.minute))return '這間設施在目前時段沒有營業';
 const town=s.town;
 if(id==='train'){
  if(!attribute||!(attribute in s.player.attributes))return '先選擇要提升的永久屬性';
  if(s.player.attributes[attribute]>=20)return '這項永久屬性已達訓練上限 20';
  if(town?.lastTrainingDay===s.world.day)return '今天已訓練過一次；每天只能專精一項';
 }
 if(id==='tavern_rumor'&&town?.lastRumorDay===s.world.day)return '今天已購買過情報，明天再來';
 if(id==='canteen_talk'&&town?.lastCanteenTalkDay===s.world.day)return '今天已聽過居民閒談，明天再來';
 if(id==='workshop_repair'||id==='workshop_upgrade'){
  if(!itemId||!Object.values(s.equipment).includes(itemId))return '請先在人物檔案裝備一件要處理的物品';
  if(id==='workshop_repair'&&(town?.wear[itemId]??100)>=100)return '這件裝備目前沒有磨損';
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
 const fee=id==='train'&&attribute?getTrainingFee(s,attribute):service.coins;
 if(s.economy.coins<fee)return `舊幣不足，需要 ${fee} 枚`;
 return null;
};
const restore=(now:number,amount:number,max:number)=>clamp(now+amount,0,max);
const consumeOneMaterial=(s:GameState,ids:string[]):string|null=>{
 for(const id of ids)for(const storage of [s.bag,s.warehouse]){
  if((storage[id]??0)<=0)continue;
  storage[id]--;
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
 const fee=id==='train'&&attribute?getTrainingFee(s,attribute):service.coins;
 s.economy.coins-=fee;
 town.visits[service.facility]=(town.visits[service.facility]??0)+1;
 let message='';
 switch(id){
  case 'rest_cot':p.health=restore(p.health,12,p.maxHealth);p.stamina=restore(p.stamina,35,p.maxStamina);p.fatigue=restore(p.fatigue,-22,100);message='我租下了普通床位。暫時安全的兩個小時，終於讓疲憊退去。';break;
  case 'rest_private':p.health=restore(p.health,24,p.maxHealth);p.stamina=restore(p.stamina,55,p.maxStamina);p.fatigue=restore(p.fatigue,-38,100);p.courage=restore(p.courage,10,100);message='單人房的門可以反鎖。我睡得比任何一次都深。';break;
  case 'rest_short':p.stamina=restore(p.stamina,18,p.maxStamina);p.fatigue=restore(p.fatigue,-10,100);message='我在角落短暫打盹，稍微找回一些力氣。';break;
  case 'clinic_wounds':conds.wounds=Math.max(0,conds.wounds-2);p.health=restore(p.health,25,p.maxHealth);message='傷口清理好了。繃帶壓住疼痛，至少不會繼續流血。';break;
  case 'clinic_infection':conds.infection=Math.max(0,conds.infection-2);p.health=restore(p.health,12,p.maxHealth);message='醫師替我處理感染，提醒我別再忽視發炎的徵兆。';break;
  case 'clinic_poison':conds.poisoning=Math.max(0,conds.poisoning-2);p.stamina=restore(p.stamina,15,p.maxStamina);message='中毒症狀有所緩解，呼吸終於穩定下來。';break;
  case 'clinic_illness':conds.illness=Math.max(0,conds.illness-2);p.fatigue=restore(p.fatigue,-12,100);message='診療結束後，身體裡那種難熬的沉重感少了許多。';break;
  case 'clinic_general':p.health=restore(p.health,18,p.maxHealth);message='我接受了一次基本診察，至少能安心繼續移動。';break;
  case 'workshop_repair':town.wear[itemId!]=100;message=`「${ITEMS[itemId!]?.name??itemId}」恢復了完整的耐久度。`;break;
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
   if(attribute==='maxHealth'){p.maxHealth+=5;p.health=restore(p.health,5,p.maxHealth);}
   if(attribute==='maxStamina'){p.maxStamina+=4;p.stamina=restore(p.stamina,4,p.maxStamina);}
   message=`今天我專心練習了一項能力。「${attribute}」永久提升至 ${p.attributes[attribute!]}，明天才能再訓練。`;break;
  }
  case 'bath':p.courage=restore(p.courage,12,100);p.fatigue=restore(p.fatigue,-8,100);town.socialPoiseUntil=townAbsoluteMinute(s)+service.minutes+180;message='洗去灰塵與疲倦。我看起來總算比較像個可以信任的人，短時間交涉更順利。';break;
  case 'wash_clothes':p.courage=restore(p.courage,6,100);town.socialPoiseUntil=townAbsoluteMinute(s)+service.minutes+300;message='外衣乾淨了。至少短時間內，我不會因狼狽的外表先被人排斥。';break;
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
 s.log.push(`城鎮 · ${service.name}：花費 ${fee} 舊幣、${service.minutes} 分鐘。`);
 return {message,minutes:service.minutes};
};
