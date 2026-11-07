import type { SceneDef, SceneId } from '../../../types';
export const SCENES: Record<SceneId, SceneDef> = {
 gate:{id:'gate',label:'倉庫外圍',location:'南區・舊物流站',narration:'我終於來到那座倉庫。鐵皮屋頂被風拍得喀啦作響，出入口的燈還亮著。我要查清失蹤員工最後出現在哪裡。',npcText:'「喂！你是誰？這時間來這裡做什麼？」',actions:[
  {id:'gate_talk',title:'坦白說明',thought:'「我先把來意說清楚，也許他願意讓我進去。」',detail:'需要對方接受說法；失敗後會引起警戒。',tags:['talk'],baseChance:62,staminaCost:0,courageDelta:-2,minutes:5,successScene:'inside',failureScene:'confrontation',npcHostilitySuccess:-5,npcHostilityFailure:12,flagsOnSuccess:['talked_honestly']},
  {id:'gate_observe',title:'觀察周圍',thought:'「先別急著回答。我想看看門口、監視器和巡邏動線。」',detail:'安全觀察；可能發現環境線索。',tags:['observe'],baseChance:100,staminaCost:0,courageDelta:0,minutes:8,successScene:'survey',flagsOnSuccess:['route_known']},
  {id:'gate_sneak',title:'繞過警衛',thought:'「正面講不通的話，我也許能從側門溜進去。」',detail:'可能成功潛入；失敗會遭到當場質問。',tags:['sneak'],baseChance:54,staminaCost:5,courageDelta:-4,minutes:7,successScene:'inside',failureScene:'confrontation',npcHostilityFailure:16,flagsOnFailure:['caught_sneaking']},
 ]},
 survey:{id:'survey',label:'外圍觀察',location:'南區・倉庫側門',narration:'我躲到貨櫃後面，從縫隙看見側門的門閂有點鬆。警衛偶爾會往這裡看，但沒有一直盯著。',actions:[
  {id:'survey_route',title:'利用側門',thought:'「我已經看過動線了。現在應該有機會從旁邊進去。」',detail:'已發現捷徑，本次判定額外受到情報加成。',tags:['sneak','run'],baseChance:66,staminaCost:3,courageDelta:-2,minutes:6,successScene:'inside',failureScene:'confrontation',npcHostilityFailure:12},
  {id:'survey_talk',title:'回去交涉',thought:'「我還是試著和他談吧，至少現在知道另一條路。」',detail:'憑觀察取得更完整的說明。',tags:['talk'],baseChance:65,staminaCost:0,courageDelta:0,minutes:5,successScene:'inside',failureScene:'confrontation',npcHostilityFailure:8},
  {id:'survey_wait',title:'耐心等待',thought:'「等他巡邏離開，我再行動。只是時間可能不太夠……」',detail:'等待巡邏間隙，可能增加疲勞與時間成本。',tags:['observe'],baseChance:100,staminaCost:0,courageDelta:0,minutes:20,successScene:'inside',flagsOnSuccess:['guard_shift_changed']},
 ]},
 inside:{id:'inside',label:'倉庫內部',location:'南區・辦公區',narration:'我進到了倉庫內。空氣裡有些灰塵味，辦公桌沒收乾淨，旁邊的貨架還放著補給品。遠處傳來有人開門的聲音。',actions:[
  {id:'inside_desk',title:'翻找辦公桌',thought:'「抽屜裡可能藏著東西。我得動作快一點。」',detail:'消耗世界時間，隨機取得文件、工具或卡牌。',tags:['search','observe'],baseChance:100,staminaCost:1,courageDelta:-1,minutes:8,successScene:'inside',lootSource:'desk',requiresNotSearched:'desk'},
  {id:'inside_shelf',title:'查看貨架物資',thought:'「這裡應該有些能帶走的補給。拿多少才不會太重？」',detail:'消耗時間，隨機取得食物、醫療或工具。',tags:['search'],baseChance:100,staminaCost:2,courageDelta:0,minutes:7,successScene:'inside',lootSource:'shelves',requiresNotSearched:'shelves'},
  {id:'inside_listen',title:'聽清腳步聲',thought:'「先聽聽看外面有幾個人，這能讓我少吃點虧。」',detail:'取得一項行動線索；但會消耗世界時間。',tags:['observe'],baseChance:100,staminaCost:0,courageDelta:0,minutes:5,successScene:'confrontation',flagsOnSuccess:['heard_steps']},
  {id:'inside_forward',title:'往深處前進',thought:'「不能再拖了。我得找到失蹤員工的線索。」',detail:'推進主線衝突。',tags:['run','observe'],baseChance:100,staminaCost:2,courageDelta:0,minutes:5,successScene:'confrontation'},
 ]},
 confrontation:{id:'confrontation',label:'最後對峙',location:'南區・物流通道',narration:'我走到物流通道時，那名管理員突然擋住去路。他的手緊握著對講機，看起來不打算輕易放我走。',npcText:'「東西放下！我問你到底在找什麼？」',actions:[
  {id:'fight_talk',title:'以證據交涉',thought:'「直接硬碰硬太危險。先把我發現的矛盾說給他聽。」',detail:'交涉成功則解決衝突；失敗時局勢可能惡化。',tags:['talk'],baseChance:41,staminaCost:0,courageDelta:-3,minutes:8,successScene:'loot',failureOutcome:'defeat',npcHostilitySuccess:-15,npcHostilityFailure:10,flagsOnSuccess:['won_by_talk']},
  {id:'fight_bluff',title:'故作鎮定',thought:'「我要裝得像有後援一樣。他會信嗎？」',detail:'成功可讓對方退讓；失敗會被識破。',tags:['talk','fight'],baseChance:43,staminaCost:3,courageDelta:-6,minutes:4,successScene:'loot',failureOutcome:'defeat',npcHostilityFailure:15,flagsOnFailure:['bluff_exposed'],flagsOnSuccess:['won_by_bluff']},
  {id:'fight_run',title:'趁機衝過',thought:'「既然談不攏，就從他身邊衝過去！希望我跑得夠快。」',detail:'高體力消耗的機動行動。',tags:['run','fight'],baseChance:46,staminaCost:12,courageDelta:-8,minutes:3,successScene:'loot',failureOutcome:'defeat',npcHostilityFailure:12,flagsOnSuccess:['won_by_speed']},
 ]},
 loot:{id:'loot',label:'衝突結束・搜查',location:'南區・倉庫辦公區',narration:'對峙終於結束了。我還有機會搜查現場，但天色正在變暗。我不確定下一班巡邏員什麼時候會回來。',actions:[
  {id:'loot_pockets',title:'搜查管理員口袋',thought:'「先看看他口袋裡有什麼。我必須趕在其他人來之前完成。」',detail:'花費 4 分鐘，可能拿到鑰匙、文件或卡牌。',tags:['search'],baseChance:100,staminaCost:0,courageDelta:0,minutes:4,successScene:'loot',lootSource:'pockets',requiresNotSearched:'pockets'},
  {id:'loot_gear',title:'取下管理員裝備',thought:'「他身上那幾件裝備很實用……但拆下來會花點時間。」',detail:'取得他實際仍持有的裝備，並增加負重。',tags:['search'],baseChance:100,staminaCost:3,courageDelta:-1,minutes:9,successScene:'loot',lootSource:'npcGear',requiresNotSearched:'npcGear'},
  {id:'loot_desk',title:'搜查辦公桌',thought:'「還有那個抽屜……也許有我想要的紀錄。」',detail:'消耗時間取得一批場景戰利品。',tags:['search'],baseChance:100,staminaCost:1,courageDelta:-1,minutes:8,successScene:'loot',lootSource:'desk',requiresNotSearched:'desk'},
  {id:'loot_exit',title:'結束搜查',thought:'「這樣就夠了。把找到的東西帶回去比較安全。」',detail:'完成任務並返回據點，不會遺失已取得的物品。',tags:['run'],baseChance:100,staminaCost:0,courageDelta:0,minutes:5,successOutcome:'victory'},
 ]},
};
