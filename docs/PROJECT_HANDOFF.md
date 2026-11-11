# 餘燼紀事｜永久跨對話開發交接（PROJECT_HANDOFF）

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
