import type { ActionChoice, GameState, SceneDef, SceneId } from '../../../types';

/** Mission 02: authored route and noncombat endings. All narration uses the player's first person. */
export const ALLEY_SCENES:Record<SceneId,SceneDef>={
 gate:{id:'gate',label:'抵達後巷',location:'南區・雨渠後巷',
  narration:'倉庫資料指向一條沒有名字的後巷。牆面滲出深色水痕，唯一一盞街燈忽明忽暗。有人說目擊者躲在這裡，可我連他的模樣都不知道。',
  npcText:'「找誰？這裡沒人在等你。」',actions:[
  {id:'alley_gate_scan',title:'沿牆尋找痕跡',thought:'「先沿牆慢慢看，至少得確定這裡真的有人走過。」',detail:'保持距離，辨識鞋印與被撕毀的告示。',tags:['observe'],baseChance:100,staminaCost:0,courageDelta:0,minutes:6,successScene:'survey',flagsOnSuccess:['alley_trace_found']},
  {id:'alley_gate_talk',title:'詢問暗處的人',thought:'「有人在看著我。或許先把話講清楚，才不會引來麻煩。」',detail:'成功進入證詞調查；失敗則遭到盤問。',tags:['talk'],baseChance:52,staminaCost:0,courageDelta:-2,minutes:5,successScene:'inside',failureScene:'confrontation',npcHostilityFailure:12},
  {id:'alley_gate_sneak',title:'藏進狹窄通道',thought:'「走到攝影機看不到的地方，應該還有另一條路。」',detail:'潛行可避開巷口守望者，失敗時進入衝突。',tags:['sneak'],baseChance:60,staminaCost:4,courageDelta:-3,minutes:6,successScene:'survey',failureScene:'confrontation',flagsOnSuccess:['alley_hidden'],flagsOnFailure:['alley_spotted'],npcHostilityFailure:11},
  {id:'alley_gate_listen',title:'靜聽腳步節奏',thought:'「等一等，樓梯後面好像有人在說話。」',detail:'消耗時間，取得敵人的巡查節奏。',tags:['observe'],baseChance:100,staminaCost:0,courageDelta:0,minutes:9,successScene:'survey',flagsOnSuccess:['alley_patrol_timing']},
 ]},
 survey:{id:'survey',label:'目擊現場',location:'南區・排水溝與後巷',narration:'水溝旁有不連續的拖行痕跡，一只紙杯壓在灰黑的積水下。有人刻意清掃過地面，卻忘了牆上的細小刮痕。',
  actions:[
  {id:'alley_survey_marks',title:'拍下地上的拖痕',thought:'「這幾道痕跡太整齊了。我應該記下來。」',detail:'留下現場證據，提升之後的資訊判定。',tags:['observe','search'],baseChance:100,staminaCost:0,courageDelta:0,minutes:7,successScene:'inside',flagsOnSuccess:['alley_marks_recorded']},
  {id:'alley_survey_container',title:'搜查倒下的垃圾桶',thought:'「垃圾桶像是被誰撞翻的。裡面會不會有東西？」',detail:'取得物資或紙面線索，須留意巡邏時間。',tags:['search'],baseChance:100,staminaCost:1,courageDelta:-1,minutes:8,successScene:'survey',lootSource:'alley_bin',requiresNotSearched:'alley_bin'},
  {id:'alley_survey_shadow',title:'從樓梯陰影穿過',thought:'「我應該能靠著牆繞開照明範圍。」',detail:'快速進入更深的巷子。',tags:['sneak'],baseChance:66,staminaCost:5,courageDelta:-3,minutes:5,successScene:'inside',failureScene:'confrontation',flagsOnFailure:['alley_spotted']},
  {id:'alley_survey_wait',title:'等最後一班巡邏離開',thought:'「等他們走了再進去，雖然我得多耗一點時間。」',detail:'用時間換取安全，無需風險判定。',tags:['observe'],baseChance:100,staminaCost:0,courageDelta:0,minutes:17,successScene:'inside',flagsOnSuccess:['alley_patrol_timing']},
 ]},
 inside:{id:'inside',label:'不可靠的證詞',location:'南區・鐵梯下方',narration:'我走進巷尾。幾張相片被塞在磚縫裡，旁邊的公共電話只剩斷掉的聽筒。一名穿灰色外套的人說他見過失蹤的倉庫員工，卻不肯承認那天有人帶走對方。',
  npcText:'「我只看見一台車。你要是再問，我就什麼都沒看見。」',actions:[
  {id:'alley_inside_listen',title:'請他描述那輛車',thought:'「先別談人。他願意說車，我就從車開始問。」',detail:'透過對話取得下一個線索。',tags:['talk','observe'],baseChance:60,staminaCost:0,courageDelta:-2,minutes:8,successScene:'loot',failureScene:'confrontation',flagsOnSuccess:['alley_witness_statement']},
  {id:'alley_inside_proof',title:'拿出物流站記錄',thought:'「我帶著之前的紀錄，也許可以讓他明白我已經知道一些事情。」',detail:'需要推理和交涉，成功能讓對方交出資料。',tags:['talk'],baseChance:56,staminaCost:0,courageDelta:-2,minutes:7,successScene:'loot',failureScene:'confrontation',flagsOnSuccess:['alley_witness_statement','alley_witness_trust']},
  {id:'alley_inside_photo',title:'撿起牆邊的相片',thought:'「我想看清上面的車牌，或許還有日期。」',detail:'探索牆壁夾層，可能找到珍貴的物品。',tags:['search'],baseChance:100,staminaCost:1,courageDelta:0,minutes:6,successScene:'inside',lootSource:'alley_wall',requiresNotSearched:'alley_wall'},
  {id:'alley_inside_follow',title:'繞到目擊者背後',thought:'「他一直想離開。我或許可以先看他打算去哪裡。」',detail:'不正面接觸的迂迴手段，成功進入搜查，失敗引發衝突。',tags:['sneak'],baseChance:58,staminaCost:6,courageDelta:-3,minutes:7,successScene:'loot',failureScene:'confrontation',flagsOnSuccess:['alley_silent_route'],flagsOnFailure:['alley_spotted']},
 ]},
 confrontation:{id:'confrontation',label:'被截斷的退路',location:'南區・鐵梯與巷尾',narration:'身後的鐵門猛然關上。灰外套守望者把手伸向口袋，卻沒有立刻攻擊。我看見他的腳邊有一張被踩過的車號紙，他究竟想守住誰的秘密？',
  npcText:'「別再問那台車。你今天最好就到這裡為止。」',actions:[
  {id:'alley_fight_truth',title:'指出車牌的錯字',thought:'「他說車牌只有四碼，可剛剛那張紙看起來有六碼。我要試著拆穿他。」',detail:'以觀察和查證結束衝突，失敗後對方更警惕。',tags:['talk','observe'],baseChance:45,staminaCost:0,courageDelta:-3,minutes:7,successScene:'loot',failureScene:'confrontation',flagsOnSuccess:['alley_witness_statement'],npcHostilityFailure:8},
  {id:'alley_fight_shadow',title:'利用鐵梯遮住視線',thought:'「那座鐵梯也許能幫我躲開他，至少可以找到轉機。」',detail:'用環境與位移化解對峙，失敗將受傷並撤退。',tags:['sneak','run'],baseChance:49,staminaCost:9,courageDelta:-5,minutes:5,successScene:'loot',failureOutcome:'defeat',flagsOnSuccess:['alley_silent_route']},
  {id:'alley_fight_deal',title:'承諾不公開他的名字',thought:'「我只要真相，不必讓他成為眾矢之的。我可以試著談條件。」',detail:'避免正面衝突，但需要對方相信你的承諾。',tags:['talk'],baseChance:52,staminaCost:0,courageDelta:-4,minutes:6,successScene:'loot',failureOutcome:'defeat',npcHostilitySuccess:-8,flagsOnSuccess:['alley_witness_trust']},
  {id:'alley_fight_break',title:'趁空檔撞開側門',thought:'「再拖下去我會陷得更深。先衝進那條巷子。」',detail:'高體力成本、低成功率，成功進入搜查階段。',tags:['run','fight'],baseChance:42,staminaCost:12,courageDelta:-6,minutes:3,successScene:'loot',failureOutcome:'defeat',flagsOnSuccess:['alley_breakthrough']},
 ]},
 loot:{id:'loot',label:'最後的證據',location:'南區・無燈後巷',narration:'對峙暫時告一段落。我能拿走現場留下的證物，但我聽見遠處巡邏車在轉彎。那張褪色的照片，以及半張寫著公寓樓層的紙條，也許足以帶我走向下一個地方。',
  actions:[
  {id:'alley_loot_photo',title:'取出破損照片',thought:'「照片的另一半也許藏在袋子底下。我想再翻找一次。」',detail:'可取得照片、藥品、食物或少量卡牌素材。',tags:['search','observe'],baseChance:100,staminaCost:1,courageDelta:0,minutes:5,successScene:'loot',lootSource:'alley_wall',requiresNotSearched:'alley_wall'},
  {id:'alley_loot_bag',title:'翻看長椅底下的帆布包',thought:'「包裡還有重量。我應該把能用的東西帶走。」',detail:'搜尋工具、線索和生存補給。',tags:['search'],baseChance:100,staminaCost:1,courageDelta:0,minutes:6,successScene:'loot',lootSource:'alley_bag',requiresNotSearched:'alley_bag'},
  {id:'alley_loot_pockets',title:'搜查守望者的口袋',thought:'「如果他已經失去反抗能力，我還能查一下他的口袋。」',detail:'拿取敵人隨身的可搜刮物品。',tags:['search'],baseChance:100,staminaCost:1,courageDelta:-1,minutes:5,successScene:'loot',lootSource:'alley_pockets',requiresNotSearched:'alley_pockets'},
  {id:'alley_loot_exit',title:'帶著證物離開',thought:'「夠了。今晚知道的事情已經太多，我應該先把證據帶回去。」',detail:'完成第二關，解鎖第三關「無人接聽」。',tags:['run'],baseChance:100,staminaCost:0,courageDelta:0,minutes:4,successOutcome:'victory'},
 ]},
};

/** Stable across rerenders, different attempts reveal alternate authored choices. */
export const getAlleySceneActions=(state:GameState):ActionChoice[]=>{
 const scene=ALLEY_SCENES[state.sceneId];
 if(!scene)return [];
 const base=scene.actions.filter(action=>!action.lootSource || true);
 const attempt=state.alleyNpc?.met??1;
 const versions:Record<SceneId,ActionChoice[]>={
  gate:[
   {...base[1]!,id:'alley_entry_delivery',title:'假裝只是路過',thought:'「我可以裝作什麼都沒看見，也許能先靠近。」',baseChance:58},
   {...base[2]!,id:'alley_entry_roof',title:'借屋簷掩護',thought:'「上面的招牌投下一大片陰影，我想沿著那裡過去。」',baseChance:55,staminaCost:6},
   {...base[0]!,id:'alley_entry_tire',title:'檢查車輪印',thought:'「這道車輪印比我剛才看到的更新。」',minutes:10},
  ],
  survey:[
   {...base[0]!,id:'alley_survey_reflection',title:'觀察水窪倒影',thought:'「倒影能看見我背後的轉角，或許可以免去回頭。」',minutes:7},
   {...base[1]!,id:'alley_survey_paper',title:'翻查紙袋',thought:'「這袋子應該有人匆忙丟掉。」',minutes:5},
   {...base[2]!,id:'alley_survey_pipe',title:'沿水管前進',thought:'「水管遮住我的大半身體。我想試試。」',baseChance:62},
  ],
  inside:[
   {...base[0]!,id:'alley_inside_number',title:'先問車牌數字',thought:'「只問數字，他應該比較願意回答。」',baseChance:63},
   {...base[1]!,id:'alley_inside_shift',title:'問車輛離開的時間',thought:'「時間比人物身分更不容易說謊。」',baseChance:60},
   {...base[3]!,id:'alley_inside_wait',title:'繞過電話亭',thought:'「電話亭後面還有一道門。我不確定那條路通往哪裡。」',baseChance:56},
  ],
  confrontation:[
   {...base[0]!,id:'alley_confession',title:'讓他把話說完',thought:'「他一直在躲避某個名字。我再讓他說幾句。」',baseChance:49},
   {...base[1]!,id:'alley_drain',title:'滑入排水道',thought:'「從排水口旁滑過去，應該能甩掉他。」',baseChance:47},
   {...base[2]!,id:'alley_exchange',title:'先交換情報',thought:'「我先交代自己知道的一部分，看他願不願意接著說。」',baseChance:44},
  ],
  loot:[
   {...base[1]!,id:'alley_loot_crack',title:'檢查牆邊破洞',thought:'「牆面破得太整齊。有人動過這裡嗎？」',minutes:8},
   {...base[2]!,id:'alley_loot_pouch',title:'確認外套夾層',thought:'「那人的衣服上還有一個小口袋。」',minutes:4},
  ],
 };
 const choices=versions[state.sceneId];
 const indices=Array.from({length:Math.min(2,choices.length)},(_,i)=>choices[(attempt+i+state.sceneId.length)%choices.length]!);
 return [...base,...indices];
};
