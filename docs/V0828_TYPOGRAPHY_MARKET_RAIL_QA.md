# v0.8.28｜新八批第1批：全域一般字重、黑市窄箭頭與輕量倒數、商人資料結構 QA

## 開工 GitHub 與承諾
- 原本六批黑市改版已完成，PR #53 v0.8.27 已 Merge，main `7257cdbff0333d4b74176eb1bfcbdb0582f463c3`，Pages success，open PR 0。
- 本批唯一分支 `ui/v0.8.28-typography-market-layout-vendor-schema`，版本0.8.28；下一批 v0.8.29 會處理新工作台環境圖的加入與輪播，**本 PR 不提前實作第2～8批**。
- 依使用者上輪需求，這批不改世界時間/飢餓 reducer（將在第6/7批改），不動交易規則或數值。

## 字重與劇情保留
- `_v0828-typography-market-rail.scss` 最後 import：全遊戲 `.game-frame` 範圍下，一般 button/Link/input/label/tooltip 的操作文字字重 `400`，h1～h6、strong/b 與數值標題改 `500`。原有 bold style 多為歷史 SCSS font shorthand，使用明確 font-weight !important 以保持大小／行距／字體家族原封不動。
- 特別排除具有真正敘事重量的 `.home-hero h1`、`.chapter-hero h1`、`.story-panel__scroll strong`、`.game-story-modal blockquote strong`、`.warning-panel strong`、`.mission-exit-dialog h3`、`.enemy-taunt-bubble span`，它們仍 700。
- 驗證黑市商人姓名、卡牌名稱、裝備/職業、地圖節點、任務 HUD、物品數值，與暗色背景仍易讀；200%放大時不可因字重調整造成捲動失效。**不改 body font size 或任何敘事內容。**

## 左側切換與輪班倒數
- 旋轉箭頭在一般尺寸由 v0827 的35px → 21px（60%）；窄屏31→19px，<=520px高27→16px。原 SVG 旋轉180°/購買與販賣字串交換和全條 button 的 click/ARIA/鍵盤/減少動效保留。
- 從 `market-v0823__meeting` 移除原本佔據商人場景左下的時間框；在同一買賣 rail 的底部**增加沒有底色、沒有邊框且 pointer-events:none 的輕量透明時鐘/輪班資訊**。單一整條 button 仍存在、點倒數文字位置也會通過到 button。商人圖可完整看見。
- `MarketShiftCountdown.tsx` 新增 `compact?:boolean` 分支，只呈現「交班／剩餘HH:MM／下班起點HH:MM／真實商人名」，螢幕閱讀器 role/status 描述完整的剩餘遊戲分鐘和下一位。原完整分支留供兼容與前版運算測試。
- 测試用現在世界04:03，下一位必須灰手羅恩，00:57倒數、05:00接班。不要把當前世界時間錯認為台灣真實時間；本批仍用現行 GameContext 時鐘，v0.8.33 才替換。

## 五名商人的外觀場景資料
| ID | 遊戲內既有商人 | 目前形象設定 | 圖片資產狀態 |
|---|---|---|---|
| broker | 墨鏡阿黛／情報掮客 | 瘦高、深色護目鏡與舊外套、藏筆記紙條 | 待提供、`sceneAssets:[]` |
| mechanic | 灰手羅恩／廢鐵修理師 | 灰色兜帽/破披風/工具腰帶/電焊設備 | 本輪上傳兩張工作台插圖待第2批入 repo，現仍 `sceneAssets:[]` |
| medic | 傷疤醫師／地下醫療商 | 面部舊傷、褪色醫袍、口罩與醫療箱 | 待提供、空資產 |
| runner | 白髮信使／路線情報販 | 白髮、輕便外套、磨損長靴與路線圖 | 待提供、空資產 |
| scavenger | 防毒面具／物資回收商 | 舊兜帽、濾毒面罩、紫色發光護目鏡 | 已有 `black-market-merchant.webp` |

- 新 `MarketVendorVisual` 在 `marketVendors.ts` 只增加 `appearance`、`sceneAssets`、`lighting`，其他 `id/name/role/buyItems/sellItems/cardIds/face` 完全原值。不修改 `GameState`／本機儲存，不新增視覺圖缺漏時的假圖。這是第2批場景支援的資料基礎，**本批不能聲稱已切換五商人實圖**。

## 自動 / 手動驗收界線
- `npm run build` TypeScript/Vite/Sass + `npm test` 全部舊測試與新增 `tests/v0828-typography-market-rail-vendor-data.test.ts`。
- 舊 `v0826`/ `v0827` 只更新從 hero 轉到 rail 的 UI 靜態合同與固定版號，所有真實日界/交易/背包倉庫回歸測試保留。
- 使用者 Merge 後在 320×568、360×740、390×844、720×1176、1280×800、600×360/高<520、字體200%下，測黑市場景無左下遮擋、arrow置中、rail倒數不壓住買賣中文字、原右下好感不卡、可完整點擊買賣。全域應確認一般文字是否確實變成正常粗細、重要故事/警告仍凸顯。
- CI只代表編譯和自動測試，**不代表已在 Chrome/手機/觸控/字幕放大實測**。待使用者自行 Merge 並通知後才開 v0.8.29。
