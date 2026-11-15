# 餘燼紀事｜第六輪・都市科幻 UI 與城鎮視覺改版（v0.8.42–v0.8.46）

使用者定案：2026-11-15。每批一個 Pull Request；需合併後才繼續；交接一律附入 `docs/PROJECT_HANDOFF.md`。以手機直式遊戲為主，桌面置中、不直接在全球全量替換既有 UI。

## 風格決策
- 視覺基調：深藍鐵灰霧面、末世都市霓虹、冷青作功能高亮、暖橘作事件/生活點綴；低飽和、高對比、避免炫光搶走文字。
- 三層邊框：主框（銀鈦材質，只用重點大面板）、次框（低亮金屬）、輕框（極淡細線/角標）；禁止把每顆按鈕一律套最亮銀框。
- 進度條：先 CSS/SVG 前緣柔光 + 少量粒子，映射生命/能量顏色，尊重 `prefers-reduced-motion`、不得動畫干擾 FPS。素材影片與 WebM alpha 暫無需求。
- 商品槽：通用方形 icon 底盤 + 外部名稱/價格資訊；灰/白、綠、藍、紫、金。紫少量邊框微光，金僅保留視覺樣式，**金色稀有度系統規則尚未實裝**，不得改掉落表。
- 城鎮：總覽一張拼接圖（使用者附圖1）上下等分三區，每區中央毛玻璃卡。詳細圖1外環高架區=原圖4；圖2蒸霧商街=原圖3；圖3舊城核心=原圖2。下批詳頁連回既有服務/對話，不複製其邏輯。

## 第2批 v0.8.43（2026-11-15 已開發，PR #71 待 Merge）

- 前批 PR #70 已 Merge，main `8206a9f3bbbf8435157a3d62fdaa4cc3e203db79`。本批單一 PR #71：`feat/v0.8.43-town-district-live-services`。
- 直接在三區各自原畫面放真正可點的設施標記，對應 2+2+4 共8個舊 TownFacility ID；另有可從任何比例選到的完整設施清單作觸控/鍵盤 fallback。外環公告欄保留，其他未開放點無實際入口。
- 直接重用五種原 dialog + RestCinematic 與原 `getTownServiceLock`、`TOWN_SERVICE`、`TOWN_QUESTS`、`CLINIC_*`，價格/飢餓/每日限額/台北時鐘同舊城鎮、不得自行改平衡。閉店可打開閱讀，但服務仍原有鎖定。
- 原 768×1376 全圖改用 ResizeObserver 等比例顯示與共用定位座標，修復上一批 cover 裁切場景；熱點位置為**初步視覺定位**，真機與美術仍需人工校正。新增 `src/styles/_v0843-town-district-live.scss` 最後匯入、焦點/響應式/營業狀態/已到訪數量。
- 詳細驗收 `docs/V0843_TOWN_LIVE_SERVICES_QA.md`，永久更新 `docs/PROJECT_HANDOFF.md`。只有 CI build/test 在最新 head 全綠才能告知用戶 Merge；**在 PR 合併前絕不啟動第3批**。

## 第3批 v0.8.44（2026-11-15 已開發，PR 待 Merge）

- 第2批 PR #71 已 Merge，main `a29f8aeec50b4b7e8e5c47949ae0737ceff698fc`。本批分支 `feat/v0.8.44-ui-showcase-tokens`；只有這一個 PR，待使用者自行 Merge。
- 新增 `src/components/ui/` 四個檔：安全進度比例與五色 token、`LuminousProgressBar`（HP、體力、>100%數字）、`SquareRaritySlot`（正方形圖層＋卡片名稱分離）、`MetalFrame`（主/次/輕）。現有卡牌和物品的稀有度規則、價格、屬性完全不變。
- 從「設定」第三頁標籤進入 `#/ui-lab`，可拉 0～1500 HP、0～900 ST，獨立開關柔光動畫和小粒子、點選5種色彩、比較3個銀色框。新頁沒有遊戲 reducer 或本機存檔修改權限。
- 動畫用 CSS 漸層、transform 與 opacity，不需影片；`prefers-reduced-motion` 停止動態。多數視覺僅在 Showroom 出現，第4批再逐步選用，先避免全域視覺疲勞與畫面回歸。
- 新 QA `docs/V0844_URBAN_UI_SHOWCASE_QA.md`；前批四張都市 WebP 及八家具與 JSON 由原測試鎖住、不改檔。每批完成必 GitHub Actions 最終 build/test 全綠。

## 第4批 v0.8.45（2026-11-15 已開發，本 PR 待使用者 Merge）

- 第3批 PR #72 已 Merge，main `2630331ab8f0ea0532d327deb2ac16605f91c06d`，本批唯一分支 `feat/v0.8.45-urban-ui-selective-adoption`。GitHub Actions 最終 head `npm run build` / `npm test` 全綠後交由使用者 Merge。
- 將 `SquareRaritySlot` 的無互動 1:1 子視覺獨立成 `RarityArtwork`，進入三處正式**原本就有的 button**：黑市 `market-v12__offer` 的圖示槽、牌庫 `card-library-tile__art`、關卡 `skill-tile__illustration`。外部文字、數量、舊幣、升級、技能費用與原 disabled 均保留。
- `urbanUiAdapters` 把現有黑市4 tier→灰綠藍紫、現有卡牌 normal/rare/chaos→灰藍紫；正式畫面**不顯示金色**，第3批實驗室金色預覽仍可用。遊戲掉落、等級、價格與存檔不變。
- 章節 HUD 只對既有 `StatBar` 的生命/體力作 opt-in 小亮點，不強塞實驗室 37px 高完整元件。城鎮圖上加不可互動低 z-index CSS 霧氣、營業中標記柔光，尊重 reduced-motion、不能搶走前景按鈕或裁切原圖。
- 以 `src/styles/_v0845-urban-selective-adoption.scss` 最後匯入，處理窄手機、短高、視覺層級與降低動態。詳細專項測試 `tests/v0845-urban-live-adoption.test.ts` 和人工 QA `docs/V0845_URBAN_LIVE_ADOPTION_QA.md`。
- **完成就停**：第5批 `v0.8.46` 僅在使用者 Merge 並通知後進行；本次不碰新劇情、金色掉落、HUD 重建與額外商品階級。

## 第5批 v0.8.46（2026-11-15：最後整合收尾，本 PR 待使用者 Merge）

**起點已核對**：第4批 PR #73 已 Merge，main `0d2584570453f900d05f72fcda6e492d8f42ddf9`，開發時無未合併 PR；本批唯一分支 `feat/v0.8.46-urban-final-integration`。原定五批在此結束，不自行建立第6批。

- 共用 `fitPortraitStage` 算出城鎮/避難所雙向等比縮放，取代原有重複 768×1376 數學，不改用戶家具對位 JSON 或百分比熱點；HUD 用安全 `meterPercent`，無效數值不產生 NaN/Infinity CSS。
- 正式黑市/卡牌/手牌的紫階稀有度美術正常顯示，但不再所有列表項目常駐動畫，只有 hover/focus/技能選中時啟動；`prefers-reduced-motion` 與 `update:slow` 關掉動態。城鎮霧氣取消大型 blur、保留透明漸層、八設施點擊仍可觸控，短高/窄寬恢復44px熱點；避難所四快捷44px且 Drawer 可內捲。
- 新 `tests/v0846-urban-final-integration.test.ts` 綜合驗證 14 張用戶原圖 SHA256、三區8店、倉庫空/部分/8件滿切圖、真實城鎮/市場 reducer、保存/重開、版本與沒有額外正式金色階。原前批測試不得被刪除。最後 HEAD 必需 GitHub Actions build + tests 全綠。
- 新 `docs/V0846_URBAN_FINAL_QA.md` 作為人工驗收 checklist；實測前不得把手機流暢度/FPS、位置或 touch 表現標示為已驗收。
- **完成就停止**：無第6批；由使用者自行 Merge 本 PR 之後，任何新遊戲內容都應進入新的規劃，不自行增加功能。

## 批次與停止條件
| 批次 | 版本 | 可交付範圍 | 明確不做 |
|---|---|---|---|
| 1 | v0.8.42 | 真實4張WebP入庫、城鎮三等分總覽/3詳頁路由骨架；避難所固定一頁顯示整張場景，下方4快捷、開發測試功能預設收合並在 Drawer 可滾動；保留所有8原城鎮功能在 /town/classic；專項回歸、文件 | 不做 HUD、稀有度商品槽、場景特效、真設施 Dialog 重構 |
| 2 | v0.8.43 | 將三詳頁設施點擊/熱點接原8個真實 dialog/service；返回流程、台北時鐘/鎖定狀態、互動聲音、焦點與 RWD | 不更改金幣/飢餓平衡，不額外添加街區服務 |
| 3 | v0.8.44 | 專用 Showcase 與可重用的進度條粒子、正方商品稀有度底板、金屬框三階、透明毛玻璃 tokens；變數、reduced motion、鍵盤/觸控 | 不全局套用每一顆按鈕，不冒充真正金色掉落機制 |
| 4 | v0.8.45 | 將核准元件逐步導入已有黑市商品格、卡牌縮圖/關卡技能選擇；城鎮局部蒸汽/霓虹/設施提示、HUD局部對齊，保持畫面閱讀性 | 不預先擴充未定義任務或永久升級規則 |
| 5 | v0.8.46 | 全輪整合、原使用者四場景圖與舊8家具 checksum、真機人工驗收清單、效能與小螢幕/低動態、永久交接收尾 | 不自行延長成第6批；不自動 Merge |

### 每批驗收標準
1. GitHub Actions `npm run build` 與 `npm test` 全綠（使用者 Merge 前最後 head）。
2. 新功能必須真實連到既有路由/功能，不能只留下空框；第1批詳頁因明確分批開發，入口能進，但服務操作先指向完整可用的舊城鎮頁。
3. 新素材遵循 Vite `BASE_URL`，放在 `public/assets/town`。記錄 checksum、檔案尺寸及來源、未授權不得改動藝術構圖。
4. 回歸必檢查固定框架 vs 內滾動畫面（避難所首頁不捲、Drawer 要捲、城鎮一頁、舊城鎮保留原捲動）。大量不同尺寸需人工 Safari/Android/Chrome 驗收；CI contract test 不等同真機。
5. 原角色、NPC、商人、金錢、飢餓、台北真實時鐘、關卡、遺留存檔不重置；新增 UI 不偷改遊戲玩法。
