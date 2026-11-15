# 餘燼紀事｜第七輪都市場景與介面強化（v0.8.47～v0.8.51）

前一輪 PR #74 已 Merge，本輪從 main d1b6ee5471312fe25da69cfb09d518fe24cb759d 開發。每批只開一個 PR，使用者自行 Merge 並通知後才接下一批。所有參考黃點圖只用來人工校正，不覆蓋已儲存在 GitHub 的原城鎮場景素材。

| 批次 | 版本 | 工作範圍 |
|---|---|---|
| 第 1 批 | v0.8.47 | 整張三等分毛玻璃總覽，背景局部光影持續，分區上下位移與原獨立街區完整圖展開路由 |
| 第 2 批 | v0.8.48 | 三詳頁滿版化、局部光暈；設施按圖片本體打開原 dialog；按金點校正旅店 1、澡堂/食堂 2、工坊/診所/酒館/訓練 4；公告欄整合至情報酒館第二頁籤 |
| 第 3 批 | v0.8.49 | 使用者提供的 PNG 生命/體力外框、降低高度、2～3 倍更細端點粒子與不同步動畫、內部黑煙液體流紋 |
| 第 4 批 | v0.8.50 | 未選取商品格僅顯示底盤、選取才有等級彩框，金階預覽偶發星芒和水紋；不新增正式金階掉落 |
| 第 5 批 | v0.8.51 | 加粗銀色金屬邊框與粗糙紋理質感，整輪 RWD/效能/無障礙/遊戲與存檔回歸，永久交接 |

第 1 批規則：三區每段仍取單張 city-overview.webp 的各三分之一，同一個玻璃層使畫面和局部光效一同柔焦，文字浮在前景。選外環時上段下移一列，其餘向下離場；選蒸霧時上段向上／下段向下；選舊城時下段上移，上方兩段向上。對應的原完整詳頁圖由中段向上下展開、blur 歸零，900ms 後導入現有詳頁。尊重 reduced-motion / update:slow；不得更動八項現有城鎮服務、遊戲數值與存檔。

每批均需最新 GitHub Actions npm run build 和 npm test 成功，真機視覺與 FPS 另由使用者人工驗收。各批完成後更新 docs/PROJECT_HANDOFF.md 與各版 QA 文件。合併權完全交由使用者，不自動做下一批。


## 第 2 批 v0.8.48：實作交接（PR 待自行 Merge）

- 基準 PR #75 已 Merge，main `7f4aac241246e91e72a56d4c18263657f4febc2f`。唯一分支 `feat/v0.8.48-fullbleed-district-tavern-noticeboard`，只做第 2 批。
- 三街區原圖滿版 cover-fit，圖片與熱點同比例放大並在中心裁邊。七處校正點依使用者附圖黃點位置；酒館內新增公告欄委託分頁，原八設施和原任務資料完整保留。
- 舊設施列表改為預設收合的輔助抽屜；新增局部霓虹光點，支援 reduced-motion / update:slow。原圖 SHA256 和存檔 schema 不變。
- 測試 `tests/v0848-town-fullbleed-services.test.ts`；人工 QA `docs/V0848_FULLBLEED_DISTRICT_QA.md`。使用者 Merge 並告知後，才做第 3 批 v0.8.49。


## 第 3 批 v0.8.49（PR 待使用者 Merge）

- 起點：PR #76 已合併，main `503846b410ae020f52c3011404647ab1ee68467e`，唯一分支 `feat/v0.8.49-hud-liquid-particles`。
- 使用者原始 PNG 雙色框已轉 512×70 透明精簡 PNG 保存於 `public/assets/ui/hud-frames-v0849.png`，HP=上半部紅銅金屬，STA=下半部藍銀金屬；此批新增檔、不覆蓋任何舊圖片。
- 正式 HUD opt-in 液流，原 `StatBar` 維持預設邏輯；每條9顆固定不同粒子軌跡/相位，HP/STA分別動畫，黑煙液流 2 組不同週期。低動態與 update:slow 禁用動畫，保留實際數值和安全比例。
- 測試 `tests/v0849-hud-liquid-particles.test.ts`；人工 QA `docs/V0849_HUD_LIQUID_QA.md`。使用者 Merge 後才繼續 v0.8.50。


## 第 4 批 v0.8.50｜已提交分支，PR 由使用者自行 Merge

- 前批 PR #77 已 Merge；起始 main cf121e898c17d3e3ce1237c6b1ec2a31368c8e48。新分支 feat/v0.8.50-rarity-selected-gold-glimmer。
- 正方圖格、黑市整卡及圖鑑整卡未選取只有中性底盤；真正選取後灰綠藍紫按原稀有度亮框。既有 onClick/交易/卡牌操作不改。
- 僅 UI 實驗室金色選取格新增偶發星芒和雙層水紋，無正式金色掉落。低動態/低更新率關閉特效。
- 永久交接 docs/PROJECT_HANDOFF.md；自動測試 tests/v0850-rarity-selection-gold.test.ts；人工 docs/V0850_RARITY_SELECTION_QA.md。待使用者 Merge 後才進入最後第 5 批 v0.8.51。


## 第 5 批 v0.8.51｜最終批：厚重拉絲銀色框及全輪 QA（PR 待自行 Merge）

- 基準：PR #78 已 Merge，main `246c69228ced5ae17260b726cb065e765d381c07`。唯一分支 `feat/v0.8.51-silver-metal-final-qa`。
- 原創靜態 128×128 拉絲／磨點可平鋪 SVG 存 `src/assets/brushed-silver-v0851.svg`，三層 `MetalFrame` 的框環主 6px、次 4px、輕 3px（窄手機縮減），採專用 SCSS `src/styles/_v0851-brushed-metal-final.scss` 最後匯入；局部加在真實城鎮設施、黑市詳情、卡牌詳情 dialog。不改全域商品格或 HUD。
- 新測試 `tests/v0851-silver-metal-final-integration.test.ts` 覆蓋紋理與三級框、v0847 轉場／v0848 七處熱點／v0849 PNG／v0850 選取與金色 preview、真實交易/委託和 v1 存檔。歷史 14 個原始圖片 SHA256 測試保留。
- 完整人工驗收在 `docs/V0851_FINAL_VISUAL_QA.md`，iOS Safari／Android FPS、實際光影質感仍需要使用者部署後確認。這是第七輪第 5／5 批：只有一個 PR，使用者自行 Merge；不得無授權自行開始 v0.8.52。


## v0.8.52｜第七輪實測視覺修復

- PR #79 已由使用者合併，基準 main 17742eb4479234b47e728dbc18a4e5f3b4b699aa。本批唯一分支 feat/v0.8.52-viewport-town-transitions-visual-audit，僅一個 PR。
- 桌機強制 390×844 直式容器；總覽 atlas 由三段背景 0/50/100% 裁切，詳頁 useLayoutEffect 首幀完成 cover-fit，避免中間空白與尺寸二跳。
- 首頁進總覽三段分別滑入、詳頁返回總覽採左右分割滑入／分開，進詳頁 1050ms iOS 類柔和曲線與局部光影。
- 未選商品灰綠藍紫、暗金各自有低飽和底盤但不帶彩框；金色仍只展示。三級金屬框精確縮至 70%（4.2 / 2.8 / 2.1px），紋理不變。
- 第七輪 v0847～v0851 程式與回歸測試逐項核對；測試 tests/v0852-viewport-town-cinematic-audit.test.ts，人工驗收 docs/V0852_VISUAL_REGRESSION_QA.md。CI 不能取代真機 FPS／畫面驗收。
