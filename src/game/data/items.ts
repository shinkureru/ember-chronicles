import type { ItemDef } from '../types';
export const ITEMS: Record<string, ItemDef> = {
  flashlight:{id:'flashlight',name:'照明手電筒',emoji:'🔦',type:'tool',weight:0.5,description:'昏暗區域中的實用工具。'},
  keyring:{id:'keyring',name:'倉庫鑰匙串',emoji:'🗝️',type:'tool',weight:0.2,description:'幾把編號不明的鑰匙。'},
  radio:{id:'radio',name:'短距離對講機',emoji:'📻',type:'tool',weight:0.35,description:'可以接收附近巡邏人員的通訊。'},
  vest:{id:'vest',name:'舊式防護背心',emoji:'🦺',type:'gear',weight:2.8,description:'有磨損痕跡，仍具有防護作用。'},
  gloves:{id:'gloves',name:'工業工作手套',emoji:'🧤',type:'gear',weight:0.3,description:'搬運粗糙物品時很有幫助。'},
  cap:{id:'cap',name:'管理員工作帽',emoji:'🧢',type:'gear',weight:0.2,description:'印著倉儲公司的商標。'},
  notes:{id:'notes',name:'折疊值班紀錄',emoji:'📋',type:'misc',weight:0.1,description:'似乎有幾天的記錄被修改。'},
  water:{id:'water',name:'瓶裝飲水',emoji:'💧',type:'food',weight:0.55,description:'密封完整的飲水。'},
  biscuit:{id:'biscuit',name:'乾糧餅乾',emoji:'🍪',type:'food',weight:0.15,description:'容易攜帶的補給。'},
  canned:{id:'canned',name:'罐頭食品',emoji:'🥫',type:'food',weight:0.4,description:'可以保存一段時間的食物。'},
  firstaid:{id:'firstaid',name:'簡易急救包',emoji:'🩹',type:'medical',weight:0.65,description:'用於處理小型傷勢。'},
  bandage:{id:'bandage',name:'繃帶',emoji:'🩺',type:'medical',weight:0.1,description:'常見的傷口護理用品。'},
  tape:{id:'tape',name:'工業膠帶',emoji:'🧵',type:'tool',weight:0.2,description:'在維修與簡單固定時有用。'},
  batteries:{id:'batteries',name:'備用電池',emoji:'🔋',type:'tool',weight:0.18,description:'可用於一般電池設備。'},
  screwdriver:{id:'screwdriver',name:'十字螺絲起子',emoji:'🪛',type:'tool',weight:0.22,description:'一般維修工具。'},
  wrench:{id:'wrench',name:'小型活動扳手',emoji:'🔧',type:'tool',weight:0.52,description:'處理簡單機械零件。'},
  card_question:{id:'card_question',name:'卡牌碎頁・追問破綻',emoji:'🃏',type:'card',weight:0.01,description:'可作為技能卡升級素材。'},
  card_route:{id:'card_route',name:'卡牌碎頁・路線預判',emoji:'🃏',type:'card',weight:0.01,description:'可作為技能卡升級素材。'},
  memorychip:{id:'memorychip',name:'損壞的記憶卡',emoji:'💾',type:'misc',weight:0.02,description:'可能藏有重要檔案。'},
  badge:{id:'badge',name:'訪客證',emoji:'🎫',type:'misc',weight:0.02,description:'不知道是否仍然有效。'},
  receipt:{id:'receipt',name:'褪色收據',emoji:'🧾',type:'misc',weight:0.01,description:'上面的金額似乎被人劃掉。'},
  handwarm:{id:'handwarm',name:'暖暖包',emoji:'🔥',type:'tool',weight:0.08,description:'低溫天氣下很有用。'},
  scarf:{id:'scarf',name:'舊羊毛圍巾',emoji:'🧣',type:'gear',weight:0.35,description:'厚實但略顯陳舊。'},
  rope:{id:'rope',name:'捆貨繩索',emoji:'🪢',type:'tool',weight:0.6,description:'倉庫常見的貨物固定工具。'},
};
export const LOOT_POOLS: Record<string, string[]> = {
  desk:['notes','badge','receipt','batteries','card_question','memorychip'],
  shelves:['biscuit','water','canned','tape','gloves','rope','firstaid','handwarm'],
  pockets:['keyring','notes','receipt','bandage','card_route','radio'],
};
export const INITIAL_NPC_GEAR=['flashlight','vest','radio'];
export const WAREHOUSE_CAPACITY_KG = 30;
