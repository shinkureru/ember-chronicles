# 餘燼紀事｜永久跨對話開發交接（PROJECT_HANDOFF）

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
