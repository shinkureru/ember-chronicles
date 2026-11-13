# v0.8.25｜黑市第四批：商人自言自語、讀取畫面、切換區微調、商品微彈跳

## 正式基準與界線
- 2026-11-13 開工 main `2563e63753cc3bdad90da5dc3a1a92d20978c38f`，PR #50／v0.8.24 已 Merge、Pages 部署成功、open PR 0。唯一分支 `ui/v0.8.25-market-dialogue-loading-polish`。
- 本批在原訂第4批「每10秒一則、十種商人自言自語」上加入用戶本輪圖片的補充：左 rail 兩個字的水平置中和字與圖間距縮短、箭頭中央小「切換」、兩模式互換時右側貨架輕微 bounce、初次進入黑市全螢幕讀取、商人台詞移除對話框改文字陰影。**全部在第4批完成，不增加獨立批次。**
- 沒有更改黑市價格、五商人輪班、遊戲世界時間、好感、背包販賣與倉庫分離、卡牌複本、受保護品或 reducer。下一個商人的「世界時間倒數」仍是**第5批 v0.8.26**，不能把商人10秒語音輪播當作遊戲時間推進。

## 精確實作內容
1. `marketIdleLines.ts`：五位商人（broker/mechanic/medic/runner/scavenger）**各自10句且不重複**，保留原 `vendor.line` 作第一句，每人增加9句符合身分的自語；純函式 `getMarketIdleLines`、`getMarketIdleLine` 支援第10句後循環回第1句。時間常數 `MARKET_IDLE_INTERVAL_MS=10_000`（真實毫秒），不調整 `s.world.minute`。
2. `MarketIdleSpeech.tsx` 只管理文字索引與 interval。由 `BlackMarketPage` 依 `vendor.id` 給 React key，輪班商人改變時新文字從第1句開始、舊 timer 正確卸載。頁籤隱藏時透過 `visibilitychange` 清掉 interval，回前景重新啟動；StrictMode 不得重複計時。文字 span 切換時柔和淡入；`prefers-reduced-motion` 直接更新文字而不動畫。
3. 仍用 `market-v12__dialogue market-v0823__dialogue` 圖層定位，但新 `.market-v0825__speech` **完全移除 background/border/radius/shadow 外框**，僅透過明亮中文字、四角微描邊、深色文字陰影與場景本身暗化確保易讀。右側台詞不應蓋過 `vendor.name` 或底部好感度，長字允許局部閱讀；避免因十句長短使版面高度跳動。
4. `BlackMarketSceneArt.tsx` 匯出同源 GitHub Pages WebP URL；`useMarketSceneLoad.ts` 在黑市第一次掛載時真正 preload 與 `HTMLImageElement.decode()`，圖片成功後才顯示主 UI（GameContext 的商人、庫存、好感等資料為同步讀取），不能設置沒有意義的「載入固定2秒」。15秒過期/資產失敗顯示**明確錯誤畫面**，可按「重新載入」重試或返回主畫面；效果清理 onload/onerror/timeout，不因離開頁面造成失效 callback。卡住不可永遠顯示旋轉圈。
5. `MarketLoadingScreen.tsx` 使用獨立全視窗 `position:fixed;inset:0;z-index:9999`，深色霧紫的進入畫面、清楚的載入/錯誤文字與焦點可見的重試/返回按鈕，滿足初次 UI 資料與圖片準備完成才顯示黑市；成功後才掛載原場景、商品、操作。
6. 左側 rail 保留 v0824 的**整區一個切換 button**；「購／買」「販／賣」由兩個實際字元 span 垂直排列、以 Flex 水平置中，避開 writing-mode 導致光學位置偏移。兩文字交換位置時 transform Y 使用新縮短距離約109px（矮視窗96/79px）。icon 輪廓仍由 `MarketTradeSwitchIcon` 原 SVG 提供，繼續以自身中心旋轉180°；**「切換」文字直接放於箭頭中間上層，不參與旋轉**。小手機圖示按比例縮小、保留手指可點的 rail。
7. `BlackMarketPage` 在 `chooseMode` 真正切換時累積次數，使右側 `market-v12__table` 帶 `market-v0825__catalog--buy/sell`，兩種不同 animation 名稱保證買→賣和賣→買都能重新觸發約0.4s 的極小垂直彈跳/縮放，切相同狀態不觸發。只是視覺層，不影響交易數量/儲存/scroll位置或交易 modal；`prefers-reduced-motion` 不套任何動畫。
8. `src/styles/_v0825-market-dialogue-loading-polish.scss` 在 `main.scss` 最後匯入，所有新樣式專屬 `market-v0825` 與 `market-v13`，沒有修改其他遊戲功能與場景/商品美術。

## GitHub 自動測試
- `npm run build`：TypeScript type-check + Vite/Sass；`npm test`：全部現有 Vitest + 新 `tests/v0825-market-dialogue-loading-polish.test.ts`。
- 新測試含：五商人×10句唯一性/輪播 wraparound/原台詞保留/不變更存檔、10,000ms timer/隱藏頁暫停/cleanup、載入本地 WebP/解碼/失敗/超時/重試、完整視窗、左 rail 三物件置中/換位、箭頭文字不跟著旋轉、左右貨架切換 animation 與 reduced motion、原背包販賣 guard。
- 舊 v0823 測試改驗「原 `vendor.line` 仍作句庫第一句+由 `MarketIdleSpeech` 顯示」，不刪其場景/光效/好感/交易驗證。舊 v0824 測試只改新字元 span 預期和固定 package 版本斷言，不刪其背包vs倉庫／限售／實際 reducer 覆蓋。
- **CI 全綠不代表已真的在手機／Chrome 量測 pixel、互動動畫和觸控。**

## 使用者 Merge 後手動驗收
1. 1280×800、720×1176、390×844、360×740、320×568、600×360，以及 200% 文字縮放：左 rail 上「販賣／購買」文字在細框水平正中央，箭頭與文字上下間距縮短，「切換」正好落在 icon 中央，旋轉時字保持正向。
2. 點 rail 上、中、下與 Tab→Enter／Space 切換：每次兩標籤對調、箭頭旋轉180°，**右側商品陳列同步輕彈一次**、不抖到主場景/底部功能鍵。關閉系統動態效果，所有內容仍正確變化但無旋轉/彈跳。
3. 在同一位商人頁停留至少 110 秒，首句是原句，10秒後換下一句，100秒回到首句；10句文字皆不同。世界時間不隨台詞變化；切換其他商人後立刻用新句庫第一句，舊 timer 不再影響；離開黑市再進入不重複 timer。背景頁籤期間無持續更新，回前景才恢復節奏。
4. 場景右上台詞**不再有任何深色對話框輪廓**，必須透過陰影／淡描邊在暗部與燈下仍看得清楚。較長台詞不蓋住右下好感度，螢幕窄/矮時能讀取完整句子。
5. 首次進入黑市時，應直接看到黑色全螢幕載入畫面，再完整出現同一個當班商人/正確好感/商品名/模式。高速重進或圖片快取後不應刻意等待。開 DevTools 網速 throttling/阻擋 WebP 請求，應顯示錯誤和「重新載入／返回主畫面」而非永遠卡載入；正常恢復後重試能開啟主畫面。
6. 販賣：玩家背包兩件、倉庫四件同 id；切販賣顯示背包2，賣1→背包1、倉庫4；商人不收購與已裝備品顯示但無法成交。切回購買顯示原商人真實商品；篩選、拖曳、詳情、原有交易與好感都正常。
7. GitHub Pages 專案子路徑 URL 的 WebP 要被正確載入，Chrome/Edge/Safari 都應無 console error；GameContext 存檔載入正常且 loading 僅等待真實資產。
8. 第5批倒數仍不會出現在這個 PR；原左下的遊戲時段標籤保持現狀。

## 停點
本批**一個 PR，不自行 Merge**。只有在使用者 Merge v0.8.25 並明確通知後，才能開始第5批 `v0.8.26`（依遊戲世界時間計算下一任商人輪班剩餘時間，包含跨午夜）；第6批 `v0.8.27` 是最後整頁密度與功能整合。無需新增第7批。
