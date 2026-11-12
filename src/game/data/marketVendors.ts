/** Five distinct underground contacts. Each purchases and stocks different supplies. */
export interface MarketVendor{
 id:string;name:string;role:string;line:string;face:number;
 buyItems:string[];
 sellItems:{id:string;price:number;stock:number}[];
 cardIds:string[];
}
export const MARKET_VENDORS:MarketVendor[]=[
 {id:'broker',name:'墨鏡阿黛',role:'情報掮客',line:'「你找到的紀錄，有時比錢還值錢。要交易，就別問來源。」',face:0,
  buyItems:['notes','receipt','memorychip','badge'],sellItems:[{id:'notebook',price:130,stock:2},{id:'pen',price:90,stock:3}],cardIds:['question','verify','record','pressure','bluff']},
 {id:'mechanic',name:'灰手羅恩',role:'廢鐵修理師',line:'「你手裡那把工具，還能再救你一次。只要付得起。」',face:1,
  buyItems:['batteries','wrench','screwdriver','radio'],sellItems:[{id:'wrench',price:260,stock:2},{id:'screwdriver',price:150,stock:2},{id:'flashlight',price:240,stock:2},{id:'arm_guard',price:145,stock:2},{id:'leg_guard',price:175,stock:2}],cardIds:['cover','weave']},
 {id:'medic',name:'傷疤醫師',role:'地下醫療商',line:'「我只做買賣。想活下去，先確定你帶夠錢。」',face:2,
  buyItems:['bandage','firstaid','gloves'],sellItems:[{id:'firstaid',price:230,stock:2},{id:'bandage',price:90,stock:4},{id:'gloves',price:180,stock:2}],cardIds:['breathe','steady','calm']},
 {id:'runner',name:'白髮信使',role:'路線情報販',line:'「每條捷徑都有代價；有些代價，可能不是金錢。」',face:3,
  buyItems:['rope','badge','keyring','receipt'],sellItems:[{id:'rope',price:210,stock:2},{id:'water',price:60,stock:4},{id:'handwarm',price:100,stock:3}],cardIds:['route','sprint','delivery']},
 {id:'scavenger',name:'防毒面具',role:'物資回收商',line:'「有人丟下的垃圾，可能是你下一晚唯一的活路。」',face:4,
  buyItems:['canned','scarf','tape','memorychip'],sellItems:[{id:'biscuit',price:65,stock:5},{id:'canned',price:115,stock:3},{id:'tape',price:85,stock:4},{id:'scarf',price:230,stock:2}],cardIds:['focus','question']},
];
export const vendorById=(id:string)=>MARKET_VENDORS.find(x=>x.id===id);
export const getVendorStockKey=(vendorId:string,itemId:string)=>vendorId+':'+itemId;
export const marketSellPrice=(id:string):number=>{
 const basics:Record<string,number>={memorychip:38,radio:35,notes:19,firstaid:28,wrench:25,scarf:22,keyring:14};
 return basics[id]??10;
};
