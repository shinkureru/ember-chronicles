import type { GameState } from '../types';
import {ARMOR_STAGE_MULTIPLIER,armorHits,armorStage,equippedArmorEntries,perfectRepairActive} from '../engine/armor';

/** Armor protects survival only, not successful action rolls. Non-defensive slots never mitigate. */
export const EQUIPMENT_EFFECTS:Record<string,{defense:number;description:string}>={
 cap:{defense:2,description:'頭部防禦 +2'},
 vest:{defense:10,description:'身體防禦 +10'},
 gloves:{defense:1,description:'手臂防禦 +1'},
 torn_gloves:{defense:1,description:'手臂防禦 +1'},
 arm_guard:{defense:3,description:'手臂防禦 +3'},
 leg_guard:{defense:3,description:'腿部防禦 +3'},
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
export const getEquippedDefense=(s:GameState):number=>equippedArmorEntries(s).reduce((total,{itemId})=>{
 const base=EQUIPMENT_EFFECTS[itemId]?.defense??0;
 const upgrade=Math.max(0,s.town?.upgrades[itemId]??0);
 const factor=ARMOR_STAGE_MULTIPLIER[armorStage(armorHits(s,itemId))];
 const effective=Math.max(0,Math.round((base+upgrade*2)*factor));
 const perfect=s.mode==='adventure'&&perfectRepairActive(s,itemId)?1:0;
 return total+effective+perfect;
},0);

/** At 10 base HP, armor cannot convert a 2-hit threat into immunity.
 * Maximum damage reduction: 35% of the unarmored hit (rounded down);
 * a nonzero incoming hit always deals at least 1 HP. */
export const mitigateCounterDamage=(raw:number,defense:number):number=>{
 if(!Number.isFinite(raw)||raw<=0)return 0;
 const whole=Math.max(1,Math.ceil(raw));
 const reduction=Math.min(Math.floor(whole*.35),Math.floor(Math.max(0,defense)/4));
 return Math.max(1,whole-reduction);
};
