import type { AttributeId,GameState,TownFacilityId } from '../types';
import { ITEMS } from './items';

export interface TownFacility {
 id:TownFacilityId; name:string; subtitle:string; description:string;
 keeper:string; lateKeeper:string; greeting:string;
 hours:[number,number]; icon:string; 
}
export interface TownService {
 id:string;facility:TownFacilityId;name:string;summary:string;coins:number;minutes:number;
}
export interface TownQuest {
 id:string;title:string;detail:string;rewardCoins:number;rewardAttribute:AttributeId;
 requirement:{kind:'stage'|'item'|'clues';stage?:number;itemId?:string;quantity?:number};
 /** One authored outcome per quest, preserved in the player diary. */
 ending:string;
}
export const TOWN_FACILITIES:TownFacility[]=[
 {id:'inn',name:'旅店／出租床位',subtitle:'REST & RECOVERY',icon:'bed',description:'一張床也是安全感。高品質房間的恢復效果與花費都不同。',keeper:'老闆娘・汪姨',lateKeeper:'夜班櫃檯・素梅',greeting:'「先把包放下。別把外面的事帶進夢裡。」',hours:[0,24]},
 {id:'clinic',name:'地下診所',subtitle:'CLINIC / INJURIES',icon:'heart',description:'真正處理外傷、感染、中毒和疾病；藥物花費、治療效果與飢餓代價各不相同。',keeper:'護理師・周苡',lateKeeper:'值夜醫師・唐洛',greeting:'「傷口不是逞強就會自己癒合的。讓我看看。」',hours:[0,24]},
 {id:'workshop',name:'修理工坊',subtitle:'WORKSHOP / EQUIPMENT',icon:'wrench',description:'修復磨損裝備，投入材料將裝備永久改良，強化防禦。',keeper:'工匠・羅叔',lateKeeper:'值班技師・坤仔',greeting:'「這件還修得好。但你下次要更小心一點。」',hours:[7,22]},
 {id:'tavern',name:'情報酒館',subtitle:'RUMORS / CONTACTS',icon:'wine',description:'不同時段會交換不同的謠言；確實取得線索才有情報加成。',keeper:'情報販子・阿鈞',lateKeeper:'酒保・蘇姐',greeting:'「在這裡，說實話的人通常最先出事。」',hours:[14,3]},
 {id:'training',name:'訓練場所',subtitle:'PERMANENT GROWTH',icon:'target',description:'每天最多專注一項永久屬性。投入舊幣進行訓練，獲得真實的數值成長。',keeper:'訓練官・程野',lateKeeper:'晚班教練・阿敬',greeting:'「今天只練一樣。把那樣做好，再想其他的。」',hours:[6,23]},
 {id:'noticeboard',name:'公告欄',subtitle:'SIDE QUESTS / LEADS',icon:'clipboard',description:'承接委託、回關卡收集證物，完成後獲得舊幣及指定的永久屬性。',keeper:'社區聯絡人・林姐',lateKeeper:'收件處・匿名投遞',greeting:'「有人留下這些委託。你可以決定要不要接。」',hours:[0,24]},
 {id:'laundry',name:'公共澡堂／洗衣店',subtitle:'CLEANUP / SOCIAL',icon:'droplets',description:'整理身體與衣著。短暫降低壓力，讓後續交涉更得體。',keeper:'洗衣店主・薛伯',lateKeeper:'夜班店員・小齊',greeting:'「先把灰塵洗掉，路上再吵也不會跟著你回家。」',hours:[5,23]},
 {id:'canteen',name:'公共食堂',subtitle:'FOOD / SOCIAL LIFE',icon:'utensils',description:'熱飯能減輕飢餓並補充體力，也有機會聽到附近居民的閒談。',keeper:'食堂師傅・吳阿嬤',lateKeeper:'早班備餐・阿仁',greeting:'「趁熱吃。想知道什麼，就坐著慢慢聽。」',hours:[5,22]},
];
export const TOWN_SERVICES:TownService[]=[
 {id:'rest_cot',facility:'inn',name:'普通床位',summary:'依目前體力比例預估生命恢復；體力恢復至滿、疲勞 −22',coins:15,minutes:120},
 {id:'rest_private',facility:'inn',name:'安靜單人房',summary:'高品質睡眠：依體力比例恢復更多生命，體力補滿、疲勞 −38、膽量 +10',coins:40,minutes:180},
 {id:'rest_short',facility:'inn',name:'短暫打盹',summary:'短暫休息：恢復部分體力與少量生命、疲勞 −10',coins:7,minutes:65},
 {id:'clinic_wounds',facility:'clinic',name:'外傷清創與包紮',summary:'外傷 −2、生命最多 +4',coins:24,minutes:50},
 {id:'clinic_infection',facility:'clinic',name:'感染治療',summary:'感染 −2、生命最多 +2',coins:32,minutes:90},
 {id:'clinic_poison',facility:'clinic',name:'中毒處置',summary:'中毒 −2、體力最多 +2',coins:38,minutes:75},
 {id:'clinic_illness',facility:'clinic',name:'疾病診療',summary:'疾病 −2、疲勞 −12',coins:28,minutes:90},
 {id:'clinic_general',facility:'clinic',name:'基本診察',summary:'生命最多 +3',coins:20,minutes:40},
 {id:'workshop_repair',facility:'workshop',name:'修復目前裝備',summary:'將指定裝備耐久恢復至 100%',coins:22,minutes:50},
 {id:'workshop_upgrade',facility:'workshop',name:'精工改良',summary:'消耗修理材料，永久提高指定裝備防禦（最多 III 階）',coins:45,minutes:95},
 {id:'tavern_rumor',facility:'tavern',name:'購買本時段情報',summary:'每天一項確實可用的線索；黑市商人好感 +1',coins:10,minutes:35},
 {id:'train',facility:'training',name:'今日專項訓練',summary:'選定一項永久屬性 +1；每個台北日只能訓練一次',coins:42,minutes:90},
 {id:'bath',facility:'laundry',name:'洗澡與整裝',summary:'膽量 +12、疲勞 −8；交涉短暫 +5%',coins:12,minutes:45},
 {id:'wash_clothes',facility:'laundry',name:'清洗外衣與裝備',summary:'膽量 +6；交涉短暫 +5%（效果較久）',coins:18,minutes:65},
 {id:'hot_meal',facility:'canteen',name:'熱食套餐',summary:'飢餓 −38、體力 +14',coins:14,minutes:30},
 {id:'canteen_talk',facility:'canteen',name:'聽居民閒談',summary:'每天一次支線情報，可取得線索',coins:5,minutes:30},
];
export const TOWN_QUESTS:TownQuest[]=[
 {id:'shift_report',title:'被塗改的排班表',detail:'有人想確認舊物流站到底有沒有改過值班紀錄。',rewardCoins:68,rewardAttribute:'reasoning',requirement:{kind:'stage',stage:1},ending:'有人終於肯承認那張排班表被改過。我的推理能力也變得更有條理。'},
 {id:'emergency_water',title:'給受困者的飲水',detail:'避難所需要 2 瓶密封飲水，交付物資才能領取獎勵。',rewardCoins:48,rewardAttribute:'empathy',requirement:{kind:'item',itemId:'water',quantity:2},ending:'我把飲水送給受困的人。她沒問我是誰，只是向我點了點頭。'},
 {id:'missing_receipt',title:'沒有日期的收據',detail:'帶回一張褪色收據，協助釐清物資消失的時間。',rewardCoins:75,rewardAttribute:'observation',requirement:{kind:'item',itemId:'receipt',quantity:1},ending:'收據的折痕與編號，終於接回了失蹤事件的某一段時間。'},
 {id:'alley_testimony',title:'後巷目擊者的口供',detail:'完成第二關「後巷的目擊者」，把掌握的情報整理成證詞。',rewardCoins:95,rewardAttribute:'negotiation',requirement:{kind:'stage',stage:2},ending:'這次我不只記下對方說過什麼，也記住了他刻意避開的部分。'},
 {id:'rumor_archive',title:'城市流言的交叉核對',detail:'蒐集至少 3 條不同的線索，再回公告欄整理。',rewardCoins:60,rewardAttribute:'memory',requirement:{kind:'clues',quantity:3},ending:'幾條看似獨立的流言有了共同的來源。至少我能記得哪一段話可信。'},
];
export const getTownFacility=(id:TownFacilityId)=>TOWN_FACILITIES.find(x=>x.id===id)!;
export const isTownOpen=(id:TownFacilityId,minute:number)=>{
 const f=getTownFacility(id),hour=Math.floor((((minute%1440)+1440)%1440)/60);
 const [start,end]=f.hours;
 return end===24&&start===0?true:start<end?hour>=start&&hour<end:hour>=start||hour<end;
};
export const townAbsoluteMinute=(s:GameState)=> (s.world.day-1)*1440+s.world.minute;
export const townKeeper=(id:TownFacilityId,minute:number)=>{
 const f=getTownFacility(id),hour=Math.floor(((minute%1440)+1440)%1440/60);
 return hour>=19||hour<6?f.lateKeeper:f.keeper;
};
export const townQuestReady=(s:GameState,q:TownQuest):boolean=>{
 const requirement=q.requirement;
 if(requirement.kind==='stage')return s.chapterProgress.completed.includes(requirement.stage??0);
 if(requirement.kind==='clues')return s.clues.length>=(requirement.quantity??1);
 const id=requirement.itemId??'';
 return (s.bag[id]??0)+(s.warehouse[id]??0)>=(requirement.quantity??1)&&!!ITEMS[id];
};
