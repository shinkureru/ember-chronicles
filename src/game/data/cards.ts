import type { SkillCard, ProfessionId } from '../types';

export const CARDS: Record<string, SkillCard> = {
  question: {id:'question', name:'追問破綻',emoji:'🗞️',description:'針對對話矛盾展開追問。交涉成功率提升。',profession:'journalist',tags:['talk'],chanceBonus:19,resourceCost:2,rarity:'normal'},
  verify: {id:'verify', name:'交叉查證',emoji:'🔎',description:'結合線索驗證事實，提升交涉與觀察。',profession:'journalist',tags:['observe','talk'],chanceBonus:16,resourceCost:2,rarity:'normal'},
  record: {id:'record',name:'暗中蒐證',emoji:'📸',description:'偷偷記下關鍵資訊，提高調查判定。',profession:'journalist',tags:['observe','search','sneak'],chanceBonus:17,resourceCost:3,rarity:'rare'},
  pressure: {id:'pressure',name:'輿論施壓',emoji:'📣',description:'借助已知訊息，強化交涉效果。',profession:'journalist',tags:['talk','fight'],chanceBonus:22,resourceCost:4,rarity:'rare'},
  route: {id:'route',name:'路線預判',emoji:'🗺️',description:'提前辨認捷徑，逃跑消耗體力減少 5。',profession:'courier',tags:['run','sneak','observe'],chanceBonus:17,staminaSaved:5,resourceCost:2,rarity:'normal'},
  sprint: {id:'sprint',name:'爆發衝刺',emoji:'💨',description:'短時間提高機動性，逃跑成功率明顯提升。',profession:'courier',tags:['run'],chanceBonus:27,resourceCost:4,rarity:'normal'},
  weave: {id:'weave',name:'穿梭地形',emoji:'🛣️',description:'利用街區障礙突破封鎖。',profession:'courier',tags:['run','sneak'],chanceBonus:20,staminaSaved:3,resourceCost:3,rarity:'rare'},
  delivery: {id:'delivery',name:'緊急投遞',emoji:'📦',description:'在混亂場景中迅速移動與交付物資。',profession:'courier',tags:['run','search'],chanceBonus:12,staminaSaved:2,resourceCost:2,rarity:'normal'},
  breathe: {id:'breathe',name:'穩住呼吸',emoji:'🍃',description:'抵銷 6 點膽量損失，並略微改善判定。',tags:['talk','run','sneak','fight'],chanceBonus:7,courageSaved:6,resourceCost:1,rarity:'normal'},
  focus: {id:'focus',name:'臨機應變',emoji:'✨',description:'對多數行動提供基礎成功率加成。',tags:['talk','observe','run','sneak','search','fight'],chanceBonus:9,resourceCost:2,rarity:'normal'},
  cover: {id:'cover',name:'尋找掩護',emoji:'🛡️',description:'減輕衝突中的體力消耗，改善躲藏與逃離。',tags:['sneak','run','fight'],chanceBonus:10,staminaSaved:4,resourceCost:2,rarity:'normal'},
  calm: {id:'calm',name:'審慎判斷',emoji:'🧠',description:'掌握環境細節，提升探索與交涉判定。',tags:['observe','talk','search'],chanceBonus:11,resourceCost:2,rarity:'normal'},
  bluff: {id:'bluff',name:'虛張聲勢',emoji:'🎭',description:'利用對手的遲疑爭取時間，可能刺激戒心。',tags:['talk','fight'],chanceBonus:13,resourceCost:2,rarity:'normal'},
  steady: {id:'steady',name:'整理思緒',emoji:'🫧',description:'冷靜思考以保護膽量。',tags:['talk','observe','sneak'],chanceBonus:5,courageSaved:5,resourceCost:1,rarity:'normal'},
};
export const STARTER_CARDS: Record<ProfessionId, string[]> = {
  journalist:['question','verify','record','pressure','breathe','focus','cover','calm','bluff','steady'],
  courier:['route','sprint','weave','delivery','breathe','focus','cover','calm','bluff','steady'],
};
export const UPGRADE_COST = {normal:[5,8,10,12],rare:[3,4,5,6],chaos:[1,1,1,1]} as const;
export const getUpgradeRequirement = (rarity: SkillCard['rarity'], level: number): number | null =>
  level >= 1 && level < 5 ? (UPGRADE_COST[rarity][level-1] ?? null) : null;
