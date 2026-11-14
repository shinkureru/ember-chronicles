import type {OnboardingProgress,ProfessionId,ShelterId} from '../types';

export const INTRO_STORY_PAGES=[
 {eyebrow:'PROLOGUE / 01',title:'城市沉默之後',text:'夜色吞沒街道，消息一則接一則中斷。這座城市還有人生活，卻沒有人願意說出完整的真相。',art:'城市遠景・故事插圖預留'},
 {eyebrow:'PROLOGUE / 02',title:'那些失去聯絡的人',text:'有人失蹤，有人消失在封鎖線另一側。你手中的線索不多，但每個答案都指向一個更大的疑問。',art:'失蹤事件・故事插圖預留'},
 {eyebrow:'PROLOGUE / 03',title:'第一次走進黑暗',text:'你準備出門尋找線索。這次經歷會讓你知道，想在這裡活下去，必須先找到能夠稱作據點的地方。',art:'出發前夕・故事插圖預留'},
] as const;

/** Temporary tutorial cards, not the live combat engine. A fixed narrative defeat follows. */
export const TUTORIAL_PLACEHOLDER_STEPS=[
 {eyebrow:'TUTORIAL / 01',title:'觀察周圍',text:'這裡將安排移動、場景互動及畫面資訊的第一段教學。正式版本會替換成可操作的新手關卡。',art:'移動與探索教學畫面預留'},
 {eyebrow:'TUTORIAL / 02',title:'作出選擇',text:'此處預留行動選項、成功率、卡牌及風險警告的操作教學。現在只展示流程，不會進行隨機判定。',art:'行動選擇教學畫面預留'},
 {eyebrow:'TUTORIAL / 03',title:'不可避免的失敗',text:'你試著抵抗，但對方顯然早有準備。視野漸漸模糊……這場遭遇注定以失敗收尾。',art:'戰敗劇情演出預留'},
] as const;

export const SHELTER_OPTIONS=[
 {id:'warehouse',name:'廢棄倉庫',en:'ABANDONED WAREHOUSE',short:'資源與設備',description:'空間寬敞，適合搜刮物資及設置工作設備。已準備完整的倉庫場景。',art:'廢棄倉庫場景已備妥'},
 {id:'apartment',name:'廢棄公寓',en:'ABANDONED APARTMENT',short:'居住與生存',description:'生活機能的起點，適合偏向日常生存與休息的據點規劃。',art:'公寓場景圖片尚待製作'},
 {id:'bunker',name:'地下防空室',en:'UNDERGROUND BUNKER',short:'隱蔽與安全',description:'封閉且隱密的生存空間，未來可朝防護與安全設施發展。',art:'防空室場景圖片尚待製作'},
] as const satisfies ReadonlyArray<{id:ShelterId;name:string;en:string;short:string;description:string;art:string}>;

export const isShelterId=(id:unknown):id is ShelterId=>
 id==='warehouse'||id==='apartment'||id==='bunker';

/** Direct profession fixture support keeps pre-v0.8.37 engine scenarios usable. */
export const makeInitialOnboarding=(profession:ProfessionId|null):OnboardingProgress=>({
 phase:profession?'complete':'story',storyPage:0,tutorialStep:0,shelter:null,
});

/** Upgrading an old save must not replay the introduction or defeat real players.
 * They choose a shelter once, with all prior game inventory/mission progress intact.
 */
export const restoreOnboarding=(raw:unknown):OnboardingProgress=>{
 const legacy:OnboardingProgress={phase:'shelter',storyPage:0,tutorialStep:0,shelter:null};
 if(!raw||typeof raw!=='object')return legacy;
 const input=raw as Record<string,unknown>;
 if(input.phase!=='story'&&input.phase!=='tutorial'&&input.phase!=='shelter'&&input.phase!=='complete')return legacy;
 const shelter=isShelterId(input.shelter)?input.shelter:null;
 const storyPage=Number.isInteger(input.storyPage)?Math.max(0,Math.min(INTRO_STORY_PAGES.length-1,input.storyPage as number)):0;
 const tutorialStep=Number.isInteger(input.tutorialStep)?Math.max(0,Math.min(TUTORIAL_PLACEHOLDER_STEPS.length-1,input.tutorialStep as number)):0;
 // A completed onboarding must always identify a real shelter, otherwise let the player choose.
 return {phase:input.phase==='complete'&&!shelter?'shelter':input.phase,storyPage,tutorialStep,shelter};
};
