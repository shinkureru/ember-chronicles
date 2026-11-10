import type { GameState } from '../types';
/** Only numerical bonuses that actually apply in the combat engine are shown as combat stats. */
export const EQUIPMENT_EFFECTS:Record<string,{defense:number;description:string}>={
 cap:{defense:2,description:'防禦 +2'},
 vest:{defense:10,description:'防禦 +10'},
 gloves:{defense:1,description:'防禦 +1'},
 scarf:{defense:0,description:'保暖衣物'},
 wrench:{defense:0,description:'可使用扳手攻擊卡'},
 screwdriver:{defense:0,description:'可使用起子攻擊卡'},
 rope:{defense:0,description:'可供行動事件使用'},
 flashlight:{defense:0,description:'可使用手電筒攻擊卡'},
 radio:{defense:0,description:'通訊與調查工具'},
 firstaid:{defense:0,description:'緊急醫療補給'},
 badge:{defense:0,description:'身分識別工具'},
 keyring:{defense:0,description:'可用於解鎖場景'},
 handwarm:{defense:0,description:'緊急保暖用品'},
};
export const getEquippedDefense=(state:GameState):number=>Object.values(state.equipment)
 .reduce((sum,id)=>sum+(id?EQUIPMENT_EFFECTS[id]?.defense??0:0),0);
export const mitigateCounterDamage=(raw:number,defense:number):number=>Math.max(1,raw-Math.floor(Math.max(0,defense)/3));
