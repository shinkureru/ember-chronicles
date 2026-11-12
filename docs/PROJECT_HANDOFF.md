# 餘燼紀事｜永久跨對話開發交接（PROJECT_HANDOFF）

## 2026-11-12｜第四輪功能（v1.7.4 第一批，最新狀態優先）

**更新基準：** 本批從已合併 PR #22、#23 之後的 `main` Commit `58fc3f81214145bf36717b875d7291af8aa2c7a0` 建立。現在 `main` 已有敵人個別失敗反思／獨立判定加成、和平搜刮限制、有限搜索舊幣及 v1.7.3 介面；歷史段落的「PR #22/#23 尚未合併」已過時。

**第一批 UI（待 PR CI 與人工驗收，不代表已部署）：**
- 分支 `feature/v1.7.4-ui-clinic-scene-injury`，版本 `v1.7.4`，詳見 `docs/V174_UI_CLINIC_SCENE_TRAUMA.md` 和 `tests/v174-ui-clinic-scene-injury.test.ts`。
- 地下診所內容：桌面拖曳上下滑動、觸控與滾輪、鍵盤焦點瀏覽，隱藏可見 scrollbar，拖曳不得誤觸藥品購買。
- 場景改 SCENE（左側固定高度、內容可拖曳）＋「查看背包」（右側顯眼按鈕），不再遮擋場景圖；SCENE 的劇情與 NPC 文字取消 line clamp 截斷。
- 敵方命中採大字紅色「遭受攻擊 −X」，僅放大真實結算值；嚴重受傷提示改緊湊醫療面板與 HP 前後變化、心電動畫，支援減少動態。
- 本批**不改 GameState、裝備或戰鬥傷害**；先完成人工 UI 驗收。

**第二批引擎／城鎮（尚未實作、不能說已完成）：**
- 新增頭部／身體／手臂／腿部四種可損壞防禦部位。只有實際命中且造成傷害時，隨機選中實際穿著的一個防具、逐件累積受擊：3 次輕微、5 次中度、10 次嚴重；重傷不刪裝備。
- 修理工坊依部位／損傷報價，完美修理有 25% 機率給單部位短期 +1 防禦（上限另控），避免防禦在 10 HP 系統中大量提高容錯。
- 新防具不增加關卡判定成功率、失敗反思或 NPC 適應數值；單獨開 PR、進行舊存檔遷移、裝備與防禦公式回歸測試。不可擅自與 UI 第一批混合發布。

**驗收及發布流程：** 查即時 GitHub PR、TypeScript/Vitest、Pages 部署 SHA；CI 成功不能代替電腦滑鼠及手機直式版面人工驗收。不要自動合併 main。

---


## 2026-11-12｜第三輪九項回饋（優先閱讀）

**已部署的起點：** main `a861f5ad03e89c8fa6f141b4b4a1f56081620edb`，v1.7.2；PR #21 已合併且部署成功。下方 PR #22 / #23 均為**尚未合併、未部署**，不能以 CI 成功當成實機驗收。

- **PR #22** `fix/v1.7.3-encounter-loot-insight`：https://github.com/shinkureru/ember-chronicles/pull/22  
  ①非暴力通關不能再搜 NPC 口袋或取走穿戴裝備，仍可搜現場；②有效有限次的搜索 18% 機率得 2～5 舊幣，入錢包不占負重；③失敗反思次數、下一次首次關鍵判定 +6/+2 依每名敵人獨立儲存、獨立消耗；舊存檔遷移。詳見 `docs/V173_ENCOUNTER_ECONOMY_INSIGHT.md` 與 `tests/v173-enemy-loot-currency-and-insight.test.ts`。
- **PR #23** `feature/v1.7.4-ui-interactions`：https://github.com/shinkureru/ember-chronicles/pull/23  
  ①旅店文字最小高度；②關卡場景左側明確標示「查看背包」；③附加技能卡三欄兩列預覽、超過六張可上下滑動、職業專屬資源圖案與簡潔扣點圖示；④黑市預設購買、鼠標拖曳垂直商品清單、隱藏 scrollbar；⑤閃避成功改場景中央大字；⑥停用遊戲文字選取/複製但保留表單編輯。詳見 `docs/V173_UI_INTERACTIONS.md` 與 `tests/v173-portrait-interactions.test.ts`。

**合併順序：先 #22 再 #23。** #23 分支建立在 #22 的程式上，目前暫時以 main 為 base 觸發整合測試，故在 #22 合併前 Files changed 會包含第一批。兩 PR 目前 package 版本同為 **v1.7.3**，避免分支同時改版號引發衝突；合併與 Pages 發布後以頁首 **Git 短碼**區分。不得自行 Merge。若 main 更新，先重新檢查 PR 合併狀態與 CI。

**回歸測試和重要規則：** 不允許和平通關搜敵人物品的漏洞；舊幣搜索必須消耗來源搜索額度；每名 NPC 的失敗反思和一次加成不得轉移到其他敵人。新 UI 保留桌面滑鼠拖曳和手機手指原生滾動；無法用 CSS 阻止從開發者工具複製原始文字。**完成開發、CI 通過與實機驗收分別記錄。**

---


## 2026-11-12 最新追蹤：v1.7.2 旅店與戰敗介面修正（優先於下方歷史段落）

**基準確認：** 兩批 PR #19 (v1.7.0) 與 PR #20 (v1.7.1) **已合併**。GitHub Pages 已成功部署 main 的 `46ab986b15f4b16024cb0cc72e8a03d38e63d1e2`，使用者截圖的版本標示是 `v1.7.1 · 46ab986`。故此輪「旅店大卡點了沒反應／戰敗畫面會自動關閉」為真實的互動問題，不是漏合併或瀏覽器仍在看舊版本。

**正在修復（待驗收，勿當作已上線）：**
- **PR #21**：https://github.com/shinkureru/ember-chronicles/pull/21
- 分支：`fix/v1.7.2-inn-and-defeat-persistence`，檢查 `docs/V172_INN_DEFEAT_FIX.md` 與 `tests/v172-inn-and-defeat-regressions.test.ts`。
- 根本原因一：`TownPage` 大型旅店設施卡片只有切換已經預設選取的 `facility='inn'`，沒有呼叫 `setRestDialog`。PR #19 的 Portal 修正只作用於**下方的床位服務按鈕**。修復後點大卡立即開啟，視窗有三種床位選單，預覽與真實扣款／回血使用同一 selected id。
- 根本原因二：`MissionTransition` 戰敗結果本身略過自動 timer，但 `GameFeedback` 同時生成一張 3.3 秒後消失的短暫「戰敗」通知。修復後 `TRANSITION_DURATION.defeat=null` 並且不再重複彈出結果短通知；`RETURN_HUB` 僅玩家按右下角按鈕時才發出。
- 新版維持原存檔 KEY 及資料結構，未改戰鬥數值、其他城鎮服務或人物劇情；發行版號沿用 `v1.7.2`，是否全面改用 `v0.x.x` 留後續獨立處理。
- 驗收：**先確認本 PR 的 TypeScript build/Vitest 成功、再由使用者合併、Pages success、遊戲頁首新 Commit 短碼**；手機/桌面實機檢查旅店大卡、三房型、每日兩次限制、戰敗畫面停留與點擊後返回。

> 下方的「2026-11-11 最新交接」等標題是歷史快照，其中「PR #19/#20 尚未合併」的敘述已過期。以此最新段落及即時 GitHub 為準。

---


## 2026-11-11 最新交接（優先閱讀）

**實際 main 起點：** v1.6b 的 PR #17、#18 已合併；建立此輪分支時 main 為 `3d8e6333dc2f4e2af85adf1b8788fff4ef67b6de`。以下兩批新功能 **尚待 PR 合併和手機人工驗收**，不能說已在正式 Pages 上線。

1. **PR #19** `feature/v1.7-build-combat-inn-qa`，依據 `docs/V17_QUALITY_AND_COMBAT.md`：頁首顯示版號及 GitHub 部署 Commit 短碼；出租床位預覽視窗 Portal 修復（滿 HP/體力仍可打開）；戰敗結果由玩家手動離開；敵方反擊等待 0.5 秒；敵方開始戰鬥前的 20 種 10 秒間隔嘲諷。https://github.com/shinkureru/ember-chronicles/pull/19
2. **PR #20** `feature/v1.7-clinic-field-bag`，依據 `docs/V171_CLINIC_FIELD_BAG.md`：地下診所自製場景、療程預覽、每日任務與好感、四種專賣藥品；任務中打開背包、使用補給、換裝和物品可用性限制。https://github.com/shinkureru/ember-chronicles/pull/20

**合併依賴：** PR #20 是建立在 PR #19 的分支上。**PR #20 目前以 main 為 Base 以啟動 CI，故在 #19 合併之前會暫時顯示兩批變更；必須先合併 #19 再合併 #20**，並在主分支更新後重新確認 GitHub Actions 與合併狀態；避免單獨提前將 #20 合到 main。

**授權與美術：** BGM 仍由使用者自行選擇，傳入實際音檔及原作者授權網址才能納入，不要把下載免費視為 CC0。人物原創故事留待使用者提交，不擅自編寫。

**實作與驗收區別：** 新 PR 建置與自動測試通過 ≠ GitHub Pages 正式部署或手機操作驗收通過。合併後需按文件的 QA 清單確認。

---


> 這是**目前狀態的入口文件**，供新的 ChatGPT 對話、開發者及協作工具快速接手。請以 GitHub 最新 `main`、最新 PR、測試紀錄和實際程式碼重新核對；這份文件不取代程式碼。  
> 最後人工同步：2026-11-11（Asia/Taipei）。此時 `main` 基線 Commit：`d1ddb46479605ae4746ed8d73f3aa8ea646e8e5d`（v1.5.0 / PR #15）。此 SHA 是**快照基線**，不是永遠不變的最新版。

## 1. 專案概覽與技術架構

- 名稱：《餘燼紀事》（Ember Chronicles）；Repo：`shinkureru/ember-chronicles`；Web 優先，GitHub Pages，桌面與手機均採置中直式界面。
- 主要技術：React 19、Vite 6、TypeScript、React Router、Bootstrap、SCSS、Vitest；專案目前 `package.json` 版本 `1.5.0`。
- 視覺方向：黑暗、壓抑、恐怖、灰黑／暗紅、第一人稱內心敘事，拒絕可愛明亮的整體風格。
- 維持遊戲引擎與 React UI 分離；規則預覽與實際結算須一致；不要在 UI 重新發明另一套數值公式。

## 2. 接手時必讀

1. 先確認 `main` 最新 HEAD、分支、未合併 PR、最新 GitHub Actions、近期 Commit；如有開發分支，區分已合併與尚未合併的工作。
2. 本檔 `docs/PROJECT_HANDOFF.md` → `docs/AI_CONTEXT.md` → `docs/V15_TOWN_IMPLEMENTATION.md`（或更高版本文件）。
3. 遊戲設計：`docs/GAME_DESIGN.md`、`docs/PROTOTYPE_SCOPE.md`、`docs/GAME_DATA_SCHEMA.md`、`docs/STORY_BIBLE.md`。
4. 依修改範圍閱讀 `src/game/types/index.ts`、`src/game/state/{initial,storage}.ts`、`src/game/engine/{resolve,rules,encounterBalance,townActions}.ts`、`src/game/data/`、`src/features/`、`src/audio/`、`src/styles/`。
5. 查看 `tests/`、`.github/workflows/{deploy,validate-pr}.yml`、`docs/AUDIO_LICENSES.md`、`docs/V15_MUSIC_LICENSES.md`。

⚠️ 已確認 **`README.md`、`docs/FEATURE_STATUS.md` 的開頭尚停留在 v0.4**，不應據此認定只有第一關可玩；`docs/AI_CONTEXT.md` 也保有舊標題及歷代「最新」標記。後續請同步修正文檔，勿單靠最上方標題推斷現況。

## 3. 截至 v1.5.0 已合併的主要系統

- 第 01、02 關可玩，下一關節點依進度解鎖；第三職業「滲透者」已加入。
- 行動選擇、攻擊牌／附加技能、敵人 HP／反擊、第一人稱場景、NPC 個別記憶、戰敗情報、任務準備、倉庫／裝備、黑市分時段商人。
- 世界時間、五時段場景呈現；城鎮八設施、16 種服務及 5 個委託；18 項永久人物屬性訓練。
- 戰鬥交涉的重試與機率上限；CC0 OGG 場景配樂與 Kenney CC0 操作音效。
- 本機 `localStorage` 存檔，使用既有 `GameState.version=1` 格式，對新增 `town`／`conditions` 等欄位採相容遷移。

依據：`docs/V14_IMPLEMENTATION.md`、`docs/V15_TOWN_IMPLEMENTATION.md`、`src/`、合併 PR #14／#15。

## 4. 目前驗證範圍

- 2026-11-11 查到 v1.5 `main` 的 GitHub Pages Deploy workflow 成功（run 43004151278）；PR #15 最新驗證成功（run 42978399693）。
- **CI 成功 ≠ 已通過所有真機遊玩驗收**。狹窄手機畫面、音效感受、戰鬥數值、動畫可讀性及持續遊玩的體驗，需另外人工確認。
- 不可聲稱高品質 AI 美術圖已實際替換。美術管線目前是 `docs/AI_ART_PIPELINE.md` 的規劃。
- 不清除舊玩家 `localStorage`；變動初始狀態時區分**新存檔**和**既有存檔**。

## 5. 使用者 2026-11-11 最新回饋（依需求拆小批處理）

**已確認要改進、但本文件本身不代表已修復：**

1. 戰鬥受傷數字、敵人扣血數字的顯示時間過短；需提高停留時間、可讀性，避免被其他動畫遮住。
2. 新角色起始血量過高；設計方向為 10 HP 左右、兩次重擊可能致命。須與敵傷、防具減傷、城鎮回復、永久生命訓練、舊存檔及測試一起平衡；不能只改 HUD 數字。
3. 物品視覺錯置（例：`bandage` 繃帶現在顯示聽診器 🩺）。應系統化稽核每個 `ITEMS[id]` 圖示，避免圖像與實際物品不符；emoji 找不到準確形狀時應以專屬 SVG/圖檔替代。
4. 各場景配樂重複、氛圍不理想。由使用者親自挑選曲目；確認**逐首的原始作者、授權、來源和音檔**後更新 `src/audio/licensedMusic.ts` 與授權清單。
5. 戰敗懲罰要能產生慎重選擇的壓力，但避免太痛苦；**目前僅進行設計討論，不可在未確認前直接實作**。

使用者傾向每次僅處理小範圍、深入驗證。新一輪先確認上一輪已合併/待合併事項，不要一次改造整套遊戲。

## 6. 版本完成度分類

新對話與交接報告請固定區分：
- **企劃已定案**／**尚未定案**。
- **程式已完成但未合併**／**已合併至 main**。
- **TypeScript/自動測試通過**／**瀏覽器或手機實機驗收通過**。
- **目前阻塞或已知缺陷**。

沒有可靠證據時標示「尚未確認」，不以過時文檔、PR 描述或單一截圖取代驗證。

## 7. 開發工作流程及更新規範

- 每次開始：核對最新 `main`、未合併 PR，對修改模組作依賴追蹤，先避免與其他分支衝突。
- 每批修改儘量單一議題、建立 feature branch、補相應測試，再開 PR 供驗收；不要未經指示直接合併。
- 涉及角色、戰鬥、資料模型、時間或裝備，應一起檢查 `src/game/state/storage.ts` 的舊存檔相容性。
- 每次版本合併：更新此檔的日期/版本/Commit SHA、已完成/未完成/待測清單、相關 PR；同步維護對應 `docs/Vxx_*.md`，勿把規劃誤記成已實作。
- 公開商用素材：音效／音樂／美術逐項記錄來源、作者、許可證、使用與轉檔情況，不能把「免費下載」當成 CC0。

## 8. 新對話快速接手提示

「請先透過 GitHub 讀取 `shinkureru/ember-chronicles` 的最新 main、所有未合併 PR、`docs/PROJECT_HANDOFF.md`、`docs/AI_CONTEXT.md`、最新版本實作文件、實際程式碼及 CI。比對這份交接檔是否過期，列出已合併、尚未合併、待人工驗收和待定案的事項，**先報告，勿直接動手改程式**。」


---

## 9. 2026-11-11 第二輪需求與分批更新（此段保留為即時交接，勿誤認 PR 已合併）

**實際 main 狀態**：前一批 PR #16（v1.5.1 戰鬥數字 10 HP、物品 SVG）已合併，merge SHA `16415a4a83938e44ee16f4ea8239fa530d1148a7`。以下兩個 PR 獨立以此為起點開發，**目前仍應視為待驗收分支**：

- **PR #17：`feature/v1.6a-whisper-npc-memory`**，https://github.com/shinkureru/ember-chronicles/pull/17  
  主角第一人稱 OS 同時只一則、排除剛才相同句、間距拉長；NPC 前十次被玩家用實際攻擊牌擊倒的獨立記憶、用過的武器手段、敵意與攻擊適應變化。和平繞過與重訪不改寫 NPC 的戰鬥心理 OS。人物故事保留現況等待使用者原創主線。驗收：`docs/V16A_NPC_MEMORY_OS.md`。GitHub Actions 首輪 CI 成功（run 43028372922）。
- **PR #18：`feature/v1.6b-level-rest-balance`**，https://github.com/shinkureru/ember-chronicles/pull/18  
  玩家起始生命/體力均 10/10；18 項永久可升級屬性初始 0；已存檔的舊值按比例與已成長增量換算。新增等級 XP、每遊戲日相同有效行動只給一次經驗、每日總 XP 上限、升級可分配點數；出租床位三種服務共用每天兩次限制，休息前進度條預覽生命與體力與最佳休息建議，使用百分比以適應不同生命/體力上限。戰敗採偏輕度 B：留下 1 HP + 外傷 + 2 小時、不沒收裝備、金錢、任務進度，保留線索；回城不免費補血。驗收：`docs/V16B_GROWTH_INN.md`、`tests/v16b-rest-xp-growth.test.ts`。**CI 與手機/舊存檔驗收狀態必須重新查詢，請勿猜測已通過**。

### 跨對話特別注意

1. **PR #17、#18 是兩條不同開發線**，各自基於已合併的 PR #16 main；在兩條 PR 未合併前，不可單靠 main 認定新的功能可用。兩邊 UI/型別可能需要在兩次合併時解決小衝突。
2. 早期 v1.5 的 `README.md`、`FEATURE_STATUS.md` 仍有過時內容；優先看這份交接、最新 PR、實際程式碼及 CI。
3. 配樂目前還沒替換：使用者將自行從 OpenGameArt、itch.io 等選擇並附上音檔和原始作品網址；**必須逐首驗證授權**。優先 CC0 1.0，CC BY 要署名，CC BY-NC 不採用，Free Download/Royalty-Free 不可直接視為無授權限制。存放授權來源於 `docs/V15_MUSIC_LICENSES.md` 等相關文件。
4. 下一步仍需逐項手機實機檢查 OS 節奏、NPC 戰敗記憶、10 體力行動成本、XP 防刷與升級、床位預覽/每日兩次上限，及長期數值曲線。
5. 以上需求可能仍須回合制手感調整；**不要擅自大範圍重設職業、NPC、劇情、戰鬥或音訊**。逐批建立 PR，先綁定驗收再討論下批。
