import type { AttackCard, ProfessionId, GameState, ActionChoice } from '../types';
import { ITEMS } from './items';

/** Attack cards are never part of the support-skill draw pile.
 * Each requires an actual item in the character's bag at the time it is played.
 */
export const ATTACK_CARDS:Record<string,AttackCard>={
  hook_snap:{id:'hook_snap',name:'掛鉤勾擊',description:'把藏在外套裡的小掛鉤握緊，趁對方靠近時擋開。',detail:'需要隨身掛鉤。',emoji:'🪝',profession:'infiltrator',requiredItemId:'hook',damage:7,baseChance:75,staminaCost:4,rarity:'normal'},
  pocket_tool:{id:'pocket_tool',name:'折疊工具格擋',description:'折疊工具能擋下一次近身的威嚇。',detail:'需要折疊工具。',emoji:'🛠️',profession:'infiltrator',requiredItemId:'folding_tool',damage:8,baseChance:69,staminaCost:5,rarity:'normal'},
  pen_thrust:{id:'pen_thrust',name:'鋼筆突刺',description:'我握緊鋼筆，試著迫使對方退開。',detail:'短距離突刺。需要背包中有鋼筆。',emoji:'🖊️',profession:'journalist',requiredItemId:'pen',damage:7,baseChance:76,staminaCost:4,rarity:'normal'},
  notebook_slam:{id:'notebook_slam',name:'記事本猛擊',description:'這本厚記事本也許能讓他分心一瞬。',detail:'以隨身記事本揮擊。需要記事本。',emoji:'📓',profession:'journalist',requiredItemId:'notebook',damage:5,baseChance:86,staminaCost:3,rarity:'normal'},
  flashlight_strike:{id:'flashlight_strike',name:'手電筒格擋反擊',description:'我能用手電筒擋開他的手，再試著反擊。',detail:'需要照明手電筒。',emoji:'🔦',requiredItemId:'flashlight',damage:8,baseChance:69,staminaCost:5,rarity:'rare'},
  camera_swing:{id:'camera_swing',name:'相機甩擊',description:'相機很重……但這可能毀了我的蒐證工具。',detail:'需要相機；以設備重量造成傷害。',emoji:'📷',profession:'journalist',requiredItemId:'camera',damage:10,baseChance:57,staminaCost:7,rarity:'rare'},
  ruler_hit:{id:'ruler_hit',name:'金屬尺反擊',description:'這把尺應該能暫時拉開距離。',detail:'需要金屬直尺。',emoji:'📏',profession:'journalist',requiredItemId:'metal_ruler',damage:6,baseChance:79,staminaCost:4,rarity:'normal'},
  wrench_hit:{id:'wrench_hit',name:'扳手重擊',description:'我得抓準距離，不能讓他先出手。',detail:'需要小型活動扳手。',emoji:'🔧',profession:'courier',requiredItemId:'wrench',damage:11,baseChance:63,staminaCost:8,rarity:'rare'},
  screwdriver_guard:{id:'screwdriver_guard',name:'起子反制',description:'我先守住退路，這工具至少能讓對方猶豫。',detail:'需要十字螺絲起子。',emoji:'🪛',profession:'courier',requiredItemId:'screwdriver',damage:6,baseChance:79,staminaCost:5,rarity:'normal'},
  radio_bash:{id:'radio_bash',name:'對講機敲擊',description:'看來只能拿手邊的對講機擋一下。',detail:'需要短距離對講機。',emoji:'📻',profession:'courier',requiredItemId:'radio',damage:7,baseChance:74,staminaCost:5,rarity:'normal'},
  bottle_bash:{id:'bottle_bash',name:'水瓶揮擊',description:'這瓶水可不只是拿來喝的。',detail:'需要瓶裝飲水。',emoji:'💧',profession:'courier',requiredItemId:'water',damage:5,baseChance:84,staminaCost:3,rarity:'normal'},
};
export const STARTER_ATTACK_CARDS:Record<ProfessionId,string[]>={
  journalist:['pen_thrust','notebook_slam','flashlight_strike','camera_swing','ruler_hit'],
  courier:['wrench_hit','screwdriver_guard','flashlight_strike','radio_bash','bottle_bash'],
  infiltrator:['hook_snap','pocket_tool','flashlight_strike','radio_bash','bottle_bash'],
};
export const MAX_ATTACK_DECK=5;
export const makeInitialEnemy=(stageId:1|2=1)=>stageId===2?
  ({id:'alley_watchman',name:'灰夾克・巷口守望者',health:36,maxHealth:36}):
  ({id:'warehouse_guard',name:'倉庫管理員・阿忠',health:28,maxHealth:28});
export const isAttackOwned=(state:GameState,id:string)=>!!ATTACK_CARDS[id]&&!!state.ownedCards[id];
export const attackStatus=(state:GameState,id:string)=>{
  const card=ATTACK_CARDS[id],item=card&&ITEMS[card.requiredItemId];
  if(!card||!item)return {valid:false,owned:false,inBag:false,inWarehouse:false,reason:'卡牌資料不存在'};
  const owned=isAttackOwned(state,id);
  const inBag=(state.bag[card.requiredItemId]??0)>0;
  const inWarehouse=(state.warehouse[card.requiredItemId]??0)>0;
  return {valid:true,owned,inBag,inWarehouse,
    reason:!owned?'尚未取得卡牌':inBag?'背包已有對應物品':inWarehouse?'倉庫有對應物品，可自動備妥':'缺少對應物品；進關卡取得後可啟用'};
};
export const getAttackDamage=(state:GameState,id:string):number=>{
  const card=ATTACK_CARDS[id];if(!card)return 0;
  const level=state.ownedCards[id]?.level??1;
  const bonus=Math.max(0,Math.floor(state.player.attributes.melee/4));
  const gearUpgrade=(state.equipment.mainHand===card.requiredItemId||state.equipment.utility===card.requiredItemId)?(state.town?.upgrades[card.requiredItemId]??0)*2:0;
  return Math.min(99,card.damage+Math.max(0,level-1)*2+bonus+gearUpgrade);
};
export const createAttackChoice=(state:GameState,id:string):ActionChoice|null=>{
  const card=ATTACK_CARDS[id];if(!card||!state.ownedCards[id])return null;
  return {
    id:`attack_${card.id}`,attackCardId:card.id,
    title:card.name,thought:`「${card.description}」`,detail:card.detail,
    tags:['fight'],baseChance:card.baseChance,staminaCost:card.staminaCost,
    courageDelta:-1,minutes:2,
  };
};
