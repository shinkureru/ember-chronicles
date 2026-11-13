import type {AttributeId} from '../../game/types';

/** Top-level character navigation and original 18 permanent attribute IDs. */
export const CHARACTER_TABS=[
 {id:'equipment',label:'全身裝備'},
 {id:'attributes',label:'屬性'},
 {id:'town',label:'城鎮成長'},
 {id:'record',label:'NPC 記憶'},
 {id:'story',label:'人物故事'},
] as const;
export type CharacterTab=typeof CHARACTER_TABS[number]['id'];
export type AttributeGroupId='physical'|'mental'|'social';
export type AttributeGroup={id:AttributeGroupId;title:string;ids:readonly AttributeId[]};
export const ATTRIBUTE_GROUPS:readonly AttributeGroup[]=[
 {id:'physical',title:'身體與生存',ids:['maxHealth','maxStamina','mobility','melee','endurance','climate']},
 {id:'mental',title:'觀察與思維',ids:['observation','reasoning','memory','focus','adaptability','planning']},
 {id:'social',title:'社交與心理',ids:['persuasion','deception','negotiation','empathy','intimidation','resilience']},
];
