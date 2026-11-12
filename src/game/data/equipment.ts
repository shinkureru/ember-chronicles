export type EquipmentSlot = 'head' | 'body' | 'arms' | 'legs' | 'mainHand' | 'utility' | 'accessory';
export const EQUIPMENT_SLOTS: {id:EquipmentSlot; name:string; icon:string; allowed:string[]}[] = [
  {id:'head',name:'頭部',icon:'◉',allowed:['cap']},
  {id:'body',name:'身體防護',icon:'⬡',allowed:['vest','scarf']},
  {id:'arms',name:'手臂防護',icon:'⌁',allowed:['gloves','torn_gloves','arm_guard']},
  {id:'legs',name:'腿部防護',icon:'⌓',allowed:['leg_guard']},
  {id:'mainHand',name:'主手工具',icon:'╱',allowed:['wrench','screwdriver','rope']},
  {id:'utility',name:'戰術工具',icon:'✧',allowed:['flashlight','radio','firstaid']},
  {id:'accessory',name:'隨身配件',icon:'◇',allowed:['badge','keyring','handwarm']},
];
