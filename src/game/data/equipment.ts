export type EquipmentSlot = 'head' | 'body' | 'hands' | 'mainHand' | 'utility' | 'accessory';
export const EQUIPMENT_SLOTS: {id:EquipmentSlot; name:string; icon:string; allowed:string[]}[] = [
  {id:'head',name:'頭部',icon:'◉',allowed:['cap']},
  {id:'body',name:'身體防護',icon:'⬡',allowed:['vest','scarf']},
  {id:'hands',name:'手部',icon:'⌁',allowed:['gloves']},
  {id:'mainHand',name:'主手工具',icon:'╱',allowed:['wrench','screwdriver','rope']},
  {id:'utility',name:'戰術工具',icon:'✧',allowed:['flashlight','radio','firstaid']},
  {id:'accessory',name:'隨身配件',icon:'◇',allowed:['badge','keyring','handwarm']},
];
