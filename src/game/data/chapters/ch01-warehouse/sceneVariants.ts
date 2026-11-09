import type { ActionChoice, GameState, SceneId } from '../../../types';
import { SCENES } from './scenes';

/** Narrative variations reuse tested outcomes but change decisions, cost and viewpoint.
 * Additional scenes can register their own pools without changing the engine. */
const variant=(scene:SceneId,index:number,fields:Partial<ActionChoice>):ActionChoice=>{
  const base=SCENES[scene].actions[index]!;
  return {...base,...fields,id:`${scene}_variation_${fields.id??base.id}`};
};
export const SCENE_VARIANTS:Record<SceneId,ActionChoice[]>={
 gate:[
  variant('gate',0,{id:'delivery',title:'假裝送貨',thought:'「我可以說自己只是來送一份遲到的文件。」',detail:'藉工作理由交涉，若被識破會提高戒心。',baseChance:56,courageDelta:-3}),
  variant('gate',1,{id:'camera',title:'留意鏡頭',thought:'「監視器轉動的方向，也許會暴露看守的死角。」',detail:'從環境尋找安全路線。',minutes:6}),
  variant('gate',2,{id:'shade',title:'退入陰影',thought:'「先貼著圍牆慢慢移動，別讓他看見我的臉。」',detail:'嘗試從陰影潛入，失敗可能被質問。',baseChance:58,staminaCost:3}),
  variant('gate',0,{id:'lost',title:'假裝迷路',thought:'「或許裝作只是走錯路，能讓他放低戒心。」',baseChance:65,minutes:7}),
  variant('gate',2,{id:'gategap',title:'窺探門縫',thought:'「側門後面好像有個缺口，我想冒險試試。」',baseChance:49,staminaCost:4}),
  variant('gate',0,{id:'call',title:'假裝通話',thought:'「我拿著手機假裝跟主管說話，他會信嗎？」',baseChance:42,npcHostilityFailure:18}),
  variant('gate',1,{id:'footprints',title:'尋找腳印',thought:'「雨後地上的腳印，比他的表情更值得相信。」',minutes:10}),
 ],
 survey:[
  variant('survey',0,{id:'drain',title:'沿排水溝走',thought:'「排水溝旁可能繞得到側門，但會沾上一身泥。」',baseChance:59,staminaCost:4}),
  variant('survey',1,{id:'bargain',title:'試著討價還價',thought:'「或許我能提出一個對他也有好處的條件。」',baseChance:61,courageDelta:-1}),
  variant('survey',2,{id:'shift',title:'記住換班時間',thought:'「我再看一會兒，應該能抓到值班空檔。」',minutes:16}),
  variant('survey',0,{id:'container',title:'貼近貨櫃',thought:'「就從這排貨櫃後面繞過去。」',baseChance:72,staminaCost:5}),
  variant('survey',1,{id:'name',title:'詢問失蹤者',thought:'「我試著提到那個失蹤的名字，看看他反應如何。」',baseChance:57}),
 ],
 inside:[
  variant('inside',0,{id:'folders',title:'整理舊文件',thought:'「這幾份舊紀錄被刻意擺到最底層了。」',minutes:6,lootSource:'desk'}),
  variant('inside',1,{id:'crates',title:'翻查貨箱',thought:'「紙箱堆裡可能有我能用上的東西。」',minutes:9,lootSource:'shelves'}),
  variant('inside',2,{id:'vent',title:'聽通風管聲音',thought:'「有人在走動，聲音從通風口傳了過來。」',minutes:7}),
  variant('inside',3,{id:'stairs',title:'沿樓梯前進',thought:'「上面有一小段樓梯，走過去或許更快。」',staminaCost:4,minutes:4}),
  variant('inside',3,{id:'lights',title:'循燈光前進',thought:'「那盞燈好像還亮著，至少能帶我走向有人工作的地方。」',minutes:6}),
 ],
 confrontation:[
  variant('confrontation',0,{id:'records',title:'拿出值班紀錄',thought:'「如果讓他看看這份矛盾的紀錄，或許還有談的空間。」',baseChance:49,minutes:7}),
  variant('confrontation',1,{id:'boss',title:'佯稱上級授權',thought:'「只要他沒去查證，我就有機會脫身。」',baseChance:38}),
  variant('confrontation',2,{id:'barrel',title:'借貨箱閃避',thought:'「他身後的貨箱足夠讓我擋一擋。」',baseChance:52,staminaCost:10}),
  variant('confrontation',0,{id:'empathy',title:'試著安撫對方',thought:'「我先不逼他，讓他把話說完。」',baseChance:47,courageDelta:-2}),
  variant('confrontation',2,{id:'door',title:'衝向旁門',thought:'「旁邊的門還沒上鎖，我想賭這一次。」',baseChance:43,staminaCost:11}),
  variant('confrontation',1,{id:'silence',title:'維持沉默',thought:'「我不說話，看他會不會先露出破綻。」',baseChance:35,minutes:6}),
 ],
 loot:[
  variant('loot',0,{id:'innercoat',title:'翻查外套內襯',thought:'「外套裡面好像還有個小口袋。」',minutes:5,lootSource:'pockets'}),
  variant('loot',1,{id:'belt',title:'檢查腰間配備',thought:'「還有綁在腰上的工具，我得看清楚。」',minutes:7,lootSource:'npcGear'}),
  variant('loot',2,{id:'cabinet',title:'查看抽屜夾層',thought:'「這個抽屜的底板高度不太自然。」',minutes:10,lootSource:'desk'}),
  variant('loot',0,{id:'pockets',title:'再摸一次口袋',thought:'「或許剛才漏掉一個小隔層。」',minutes:4,lootSource:'pockets'}),
  variant('loot',2,{id:'archive',title:'翻看辦公舊帳',thought:'「這疊帳目後面，可能藏著更重要的東西。」',minutes:9,lootSource:'desk'}),
 ],
};
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
/** The scene's narrative choice set varies by entry attempt while keeping a route forward.
 * The selection is deterministic for a given attempt, so React re-render never changes buttons.
 */
export const getSceneVariation=(state:GameState):ActionChoice[]=>{
  const scene=SCENES[state.sceneId];
  if(!scene)return [];
  const extras=SCENE_VARIANTS[state.sceneId];
  const attempt=Math.max(0,state.attempt);
  const chosen=extras[(attempt+(hash(state.sceneId)%extras.length))%extras.length]!;
  if(state.sceneId==='loot')return [...scene.actions,chosen];
  const base=scene.actions;
  if(state.sceneId==='inside'){
    const rot=(attempt+1)%base.length;
    return [base[3]!,base[rot]!,base[(rot+1)%3]!,chosen].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i);
  }
  if(state.sceneId==='confrontation')return [base[0]!,base[1+(attempt%2)]!,chosen];
  if(state.sceneId==='gate')return [base[1]!,base[attempt%2===0?0:2]!,chosen];
  const start=attempt%base.length;
  return [base[start]!,base[(start+1)%base.length]!,chosen];
};
