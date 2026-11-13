# 餘燼紀事｜永久跨對話開發交接（PROJECT_HANDOFF）

## 2026-11-14｜第四輪第3批 v0.8.30：防毒面具三張場景、吊燈/日光燈及焊花（本 PR 待 Merge）

- **開工狀態**：main `f2d62632b7461fe2cdc51b70156090ae16d5f6d0`、PR #55 v0.8.29 已 Merge、Pages success、open PR=0。唯一分支 `ui/v0.8.30-scavenger-three-scenes-lighting`。前批 handoff 對工作台圖屬「灰手羅恩」的說法已經使用者在2026-11-14明確更正，**當作歷史錯誤，不可恢復**。
- **三張圖全部屬防毒面具 scavenger**：原 `black-market-merchant.webp`（紫眼人物）、`black-market-scavenger-rummage.webp`（翻找工作台）、`black-market-scavenger-weld.webp`（工作台焊接）。舊 `black-market-mechanic-rummage.webp`、`black-market-mechanic-weld.webp` 以相同 Git blob SHA 改名，二張原畫品質/壓縮大小不變；`marketVendors.ts` scavenger.sceneAssets 三張與 lighting=workbench-weld，mechanic 灰手羅恩 sceneAssets=[]、lighting=ambient。broker/medic/runner 仍 []。未來五位商人各三張，但未獲圖不能虛構人物。
- **場景整組交叉淡入**：`BlackMarketSceneArt.tsx` 仍用原 v0829 的12秒輪播、1.3秒 opacity 淡入；每個 SVG `<g className="market-v0830__scene-layer">` 把對應 `<image>`/燈源/肖像紫眼/焊點特效放一起交叉淡化，絕不把前張的紫眼或焊花照在新張。新 `marketSceneLighting.ts` 純函式由圖檔名判 portrait/workbench/welding/ambient，並且有 scavenger id 雙重保護。背景分頁/減少動效停止 interval 與動畫，空圖保留無人物背景。
- **光源**：原960×536座標暖色吊燈 x529/y51、冷色左日光燈 x202/y67及延伸光暈 x189/y88，6.6/7.8/8.4秒非同步柔和亮度波動；焊接圖第三張約在原1376×768 (426,400)，新 SVG 光源 x297/y279，2.4秒非規律短促青白焊花。只有 welding 圖渲染焊花；reduce-motion 靜態微光、不畫閃爍火花。新的 `_v0830-market-scene-lights.scss` 在 `main.scss` 最後 import。
- **原功能完全保留**：v0829 三張 predecode+圖片失敗可重試/背景暫停，10句商人台詞、好感、當班輪替、真實價格庫存、bag-only販賣、四級商品卡、動畫/世界時鐘每10秒+5遊戲分鐘、飢餓規則皆不更動。package/lock =0.8.30。
- **測試文件**：新增 `tests/v0830-scavenger-lighting.test.ts`，更新 v0828/29 舊測試錯誤資產身分與固定版號；驗三張實際RIFF/WEBP、無舊 mechanic 檔、場景特效只屬對應圖、12秒輪播、reduced-motion 及 bag vs warehouse reducer。更新 `docs/REALTIME_HUNGER_REDESIGN_ROADMAP.md`、新增 `docs/V0830_SCAVENGER_LIGHTING_QA.md`。CI必須 `npm run build`+`npm test` 全綠，**CI不等於已在真實手機量測光源位置/頻率**。
- **停點**：本批一個 PR，不自行 Merge。使用者合併並通知後才開始第四批 v0.8.31（商品卡斜對角區域波浪）；第五批 v0.8.32 商人資料整合、第六批 v0.8.33 台北真實時間、第七批 v0.8.34 飢餓代價、第八批 v0.8.35 最終 QA 不提前修改。

---


## 2026-11-13｜第四輪第2批 v0.8.29：黑市按當班商人切換圖片與柔和輪播（本 PR 待使用者 Merge）

- **開工 GitHub 核對**：`main` `d8ba00d36dc1bb7ddfa3068aa797cab2c12e9668`，第1批 PR #54 v0.8.28 已 Merge，Pages success，開工 open PR 0。上一批手工 QA 未由 CI 代替；下一批仍重新核對。
- 本批唯一分支 `ui/v0.8.29-vendor-scene-carousel`，package/lock `0.8.29`。修改 `marketVendors.ts` 灰手羅恩的 `visual.sceneAssets` 為 `black-market-mechanic-rummage.webp` + `black-market-mechanic-weld.webp`，他人 **scavenger 防毒面具**沿用 `black-market-merchant.webp`，broker/medic/runner 空陣列。圖片均為使用者原先提供、1376×768 JPG 壓縮後的同畫面 WebP，不推論/移植不同商人的人物。
- `BlackMarketSceneArt.tsx` 接收 `vendor`，各幀用同一 `960×536` SVG viewBox 與 `import.meta.env.BASE_URL` 載入，真正有2+張才每現實12秒轉換，CSS 1.3秒 opacity crossfade，背景頁籤與 reduced-motion 停止，cleanup interval/listener；scavenger 的紫眼 SVG 僅它自己顯示，原暖黃/日光燈 overlay 與台詞/好感均保留；第三批 v0.8.30 才處理焊接圖的局部火花光。
- `useMarketSceneLoad(sceneAssets)` 預載所有當班圖片並 `Image.decode` 成功才揭開黑市 UI，15秒任一圖片錯誤有重試/返主頁，嚴格按 `key=sceneAssets.join('|')` 避免換班時顯示上一商人圖片；空圖陣列直接 ready，在黑市場景以純 CSS 無人物暗色環境作背景，**不冒用別人肖像、不卡載入**。`BlackMarketPage` 場景 `key={vendor.id}` 切班重設輪播。
- 新 `src/styles/_v0829-market-scene-carousel.scss` 最後 import，沒有改任何圖片座標以外的交易 UI。新 `tests/v0829-market-scene-carousel.test.ts` + 更新 v0823/v0825/v0828 舊字串斷言，保留世界時段/背包販售 reducer 回歸。QA `docs/V0829_MARKET_SCENE_CAROUSEL_QA.md`；同時永久更新 `docs/PROJECT_HANDOFF.md` 及 `docs/REALTIME_HUNGER_REDESIGN_ROADMAP.md`。
- **本批絕不修改**：世界時間每現實10秒+5遊戲分鐘、商人時段/貨品、價格/庫存、卡牌複本、背包禁售、商人10句台詞、好感度、飢餓。v0.8.30 單獨做燈管/焊點特殊效果、v0.8.31 斜對角商品波浪、v0.8.33 台北時間、v0.8.34 飢餓成本；**每批必須由使用者 Merge 並通知才繼續，不自行合併**。
- 自動驗收必須 `npm run build`+ `npm test` GitHub CI 全綠。尚未執行/不可聲稱真實 Chrome / 手機檢查；人工驗收包含手機窄/矮窗、12秒轉場、Tab背景停播、資產404重試、沒有圖的商人空場景、同一人 2 張圖的頭像/角色不誤串、減少動態效果停播。

---


## 2026-11-13｜第四輪第1批 v0.8.28：全域正常字重＋黑市倒數移入買賣 rail＋商人圖資 schema（本 PR 待使用者 Merge）

- **開工 GitHub 狀態**：`main` `7257cdbff0333d4b74176eb1bfcbdb0582f463c3`；PR #53 v0.8.27 已 Merge，Pages success，開工 open PR=0。這輪新規劃八批，`docs/REALTIME_HUNGER_REDESIGN_ROADMAP.md` 逐批列出 v0.8.28～v0.8.35；不能自動開下一批。
- **唯一分支** `ui/v0.8.28-typography-market-layout-vendor-schema`、package/lock `0.8.28`；本批只改 UI 基礎與展示資料，不涉及 `gameReducer`、`GameContext`、存檔、交易、飢餓或世界時間。用戶本輪提供兩張灰手羅恩工作台圖片，正式檔案尚未納入 repo（下一批 v0.8.29）；原黑市單圖 `black-market-merchant.webp` 是防毒面具商人的場景，目前舊 UI 仍使用全市場公用圖，等下一批才依 vendor 身分切換。
- **字重全面控制**：新 `_v0828-typography-market-rail.scss` 最後 import，一般 buttons/links/labels/small = 400，UI headings / strong / b / outputs = 500，重要章節標題/故事內強調/警告/敵人敘事特例700，大小/字距/色彩均不動。不能簡單把所有敘事強制變普通，也不能只調整黑市字重。
- **箭頭與倒數**：黑市 v0827 35px → 21px（小手機19px／矮16px），仍依原 180° SVG 自中心旋轉。原壓住商人主視覺的 `market-v0826__shift` 從 `market-v0823__meeting` 移到買賣 rail 底部空間，`MarketShiftCountdown` 支援 `compact`，只顯示當前世界時間、剩餘HH:MM、下一班時刻與真實姓名；透明無框、pointer-events:none，rail 整條 button 仍可點並支援鍵盤。**此時仍是舊遊戲世界時間，不是台北實時！** 新實時改制在第6批 v0.8.33。
- **商人 schema**：既有 `MARKET_VENDORS` 五個正式名稱依次 `墨鏡阿黛 / 灰手羅恩 / 傷疤醫師 / 白髮信使 / 防毒面具`；新增 `visual:{appearance,sceneAssets,lighting}` 資料型別。只有 scavenger 現有 public WebP，其他 `sceneAssets:[]`，mechanic 標記 `workbench-weld`；不造假圖、不新增 NPC / 假商品。先前助手草案裡「墨鏡阿焦、縫骨瑪蕾、鉛鎖巴克、鴉羽寇比」並非 repo 正式角色，禁止擅自替換。
- **將來飢餓規則核對**：現有 `player.hunger` 初始20，吃餅乾/罐頭 `hunger-20`、熱飯 `hunger-38`，`hunger>70` 當飢餓警告。新體力消耗應 `hunger +X`，而非先前規劃稿錯誤的減飢餓；本批不調代價。真實台北時鐘與一切時間加速移除放第6批，飢餓替代時間代價放第7批。
- **驗證**：新 `tests/v0828-typography-market-rail-vendor-data.test.ts`；更新前批 v0826/27 版面與版本斷言但保留原世界時間/交易 reducer 測試。人工檢驗 `docs/V0828_TYPOGRAPHY_MARKET_RAIL_QA.md`。CI 必須完整 `npm run build`＋`npm test` 全綠；CI 不等於真實瀏覽器像素/觸控 QA。完成後只開一個 PR，使用者自行 Merge，**不得自行 Merge 或提前進第2批**。

---


## 2026-11-13｜黑市第三輪第6批（最後一批）v0.8.27：最終視覺與六批整合驗收（本 PR 待使用者 Merge）

- **GitHub 開工現況**：`main` `6f93b100a1ae3beeebb571b4100197328d26309b`，前批 PR #52 v0.8.26 已 Merge、Pages success，開工時 open PR=0。下方 v0826 及之前「待 Merge」是歷史時點，日後新請求仍須實際查最新 main/PR/交接。
- **唯一分支** `ui/v0.8.27-market-final-visual-qa`，package/lock `0.8.27`。本批是 `docs/BLACK_MARKET_REDESIGN_ROADMAP.md` 六批的**最後一批**，並完整吸收使用者 2026-11-13 黑市驗收新圖片的四項補充；不自動增加第7批。
- **中文字黑色線條修復**：上一批 `_v0825-market-dialogue-loading-polish.scss` 原有四方向 1px 深色影、`-webkit-text-stroke:.15px` 與文字 `filter:blur(1px)` 過渡，在小字上易形成黑色水平矩形/渲染殘影。本批最後覆寫 `-webkit-text-stroke:0!important`、`filter:none!important`，只用兩層柔和 `text-shadow` 提高可讀性；改成 opacity 淡入，**保留台詞直接疊在畫面，不恢復對話框**。原五商人各10句/10秒輪播規則不變。
- **左切換縮小**：移除 JSX 的 `<span className="market-v0824__switch-foot">切換</span>`，保留全區可點 `button`、上下交換的購買/販賣、aria-label、原 `MarketTradeSwitchIcon` 與自心180°旋轉。箭頭一般35px、手機31px、矮高度27～31px，水平置中。
- **逐商品波浪**：原 v0825 `market-v12__table` 整塊 0.4秒彈跳是不符需求的。新 `_v0827-market-final-polish.scss` **關掉整塊動畫**；`BlackMarketPage.tsx` `filteredOffers.map((offer,index)=>...)` 每張商品加 `market-v0827__wave-item`，`animationDelay: Math.min(index,28)×66ms`，依 DOM 網格從左上順序到右下各自約0.58秒微彈跳。買/賣兩種動畫名，保證來回重播；刻意用 CSS 獨立 `translate/scale` 避開舊商品 `transform:none!important`。只有切換過後的商品參與，不影響篩選列／整張表格或原點擊/drag/scroll。禁用動效完全停用。
- **左日光燈柔和脈動**：`BlackMarketSceneArt.tsx` 在原 `960×536` viewBox 左白日光燈 x189/y88、旋轉13° 新增淡藍白 gradient + `market-v0827__fluorescent-bloom`，6.5秒緩慢亮度呼吸而非刺眼頻閃，原暖黃燈／冷光／紫眼效果與右側商人文字、好感保持。reduced-motion 時靜態。
- 最終六批整合的響應式 QA 與交易安全文件 `docs/V0827_MARKET_FINAL_VISUAL_QA.md`；新 `tests/v0827-market-final-polish.test.ts` 覆蓋文字渲染策略、箭頭無字、卡片個別波浪/延遲、光暈/無動效、手機/矮視窗、原世界輪班計算與背包/倉庫禁售；v0825/26 固定斷言依實際改版修正，其餘回歸全保留。CSS `_v0827-market-final-polish.scss` 最後匯入 `main.scss`。
- **重大保留規則**：真實交易價格/庫存、背包出售只扣 `s.bag`、商人不收購和受保護品禁售、裝備與卡複本、五位商人 world-time 輪班與10秒各10句台詞、黑市 WebP 預解碼/錯誤回復、左下世界時間輪班倒數、右下好感、存檔 schema、音效均不能改。現有世界時鐘仍每現實10秒推進5分鐘遊戲時間（可見/未暫停狀態），不是由 UI 倒數自行更新。
- **驗收界線**：GitHub Actions `npm run build`+`npm test` 應全綠；**CI 不等於已在 Chrome/手機實際操作/像素檢驗**，待使用者 Merge 後按照 QA 完成人工實機驗收。絕不自行 Merge。六批到此停止；若使用者另提出新問題，先核對最新 GitHub，再依新需求另開修復工作，不擅自延伸第7批。

---


## 2026-11-13｜黑市第三輪第5批 v0.8.26：下一任商人輪班倒數（本 PR 待使用者 Merge）

- **開工現況**：GitHub `main` `e54b552a0017eee5e39ffa426ffe25afdd2ac369`，前批 PR #51 v0.8.25 **已合併**、Pages success，open PR 0。下方各批記錄的「待 Merge」是歷史敘述，下一批仍須重新核對 GitHub。
- **本批唯一分支** `ui/v0.8.26-market-world-shift-countdown`，package/lock = `0.8.26`，範圍僅**黑市場景左下角到下任商人的世界時間倒數**。新 `src/features/market/marketShiftCountdown.ts` 純函式以一天1440分鐘與五個交班界線 `[300,660,840,1080,1380]` 計算；`MarketShiftCountdown.tsx` 只接受 `s.world.minute` 重新投影出目前/下一班商人、到班時刻、剩餘HH:MM與時段，**沒有建立獨立定時器**，不改任何遊戲狀態。
- **時間規則實際核對後修正**：先前文件稱「世界時間只有行動推進」不完整；目前 `src/app/GameContext.tsx` 明確有 `WORLD_TICK_REAL_MS=10000`、`WORLD_TICK_GAME_MINUTES=5`，遊戲可見/非暫停/非結果時**每現實10秒前進5分鐘遊戲時間**，另外還可由行動推進。這批畫面倒數會跟 `WORLD_CLOCK_TICK` 的 `s.world.minute` 同步跳動，不按現實秒數推進別的商人或商品；`gameReducer` 的交易時段 guard 仍唯一負責允許交易。
- `BlackMarketPage.tsx` 保留 `market-v12__time market-v0823__time` 舊 badge 和真實 `worldPhase/worldClock`，在同一左下角擴成 `market-v0826__shift` 含現在時間+下位商人剩餘HH:MM+下一到班時間/時段/姓名，數字 tabular-nums，明示世界時間。右下好感度不變。切換到新 `vendor.id` 時既有關閉交易詳情保留，並清理過期分類篩選／把商品列表捲回頂端，讓新輪班商品直接可見。原五商人、10秒自語、紫眼/燈光/背景、真實庫存/背包販賣規則都不修改。
- 新 CSS `src/styles/_v0826-market-shift-countdown.scss` 最後匯入 `main.scss`，壓縮左側倒數面板、320px以下/矮視窗避免與右下好感或底部 footer 撞位，沒有新動畫；`prefers-reduced-motion` 安全。全樣式範圍限定黑市。
- 專項 `tests/v0826-market-world-shift-countdown.test.ts` 驗 04:59/05:00/10:59/11:00/13:59/14:00/17:59/18:00/22:59/23:00/23:59/00:00/02:23、跨午夜/多天、所有1440個分鐘、世界時鐘原有5分鐘 tick、商人售價與交易 guard、無timer、好感與底部功能未動。前批 `tests/v0825-market-dialogue-loading-polish.test.ts` 固定版號斷言修成0.8.x。人工 QA `docs/V0826_MARKET_SHIFT_COUNTDOWN_QA.md`。
- **此批提交一個 PR，CI `npm run build`+`npm test` 全綠後停點，絕對不自行 Merge**。使用者 Merge 並明確通知後，下一批 `v0.8.27` 是黑市最後第6批：全頁 RWD、長字/超長商品格、動畫、觸控、320/360/390/720/1280、横置短高及 200% 縮放等綜合美化與回歸。不能提前進入下一批。

---


## 2026-11-13｜黑市第三輪第4批 v0.8.25：自言自語＋左 rail 置中＋輕彈跳＋全螢幕讀取（本 PR 待 Merge）

- **GitHub 基準**：`main` `2563e63753cc3bdad90da5dc3a1a92d20978c38f`；PR #50 v0.8.24 已 Merge、最新 Pages 部署成功，開工前 open PR=0。下方 v0824「待 Merge」是歷史狀態，不能略過下一次 GitHub 核對。
- 本輪黑市改版依 `docs/BLACK_MARKET_REDESIGN_ROADMAP.md` **六批**，本次唯一 `ui/v0.8.25-market-dialogue-loading-polish`（package+lock 版本 `0.8.25`），包含原排定第4批與使用者 2026-11-13 本回合新追加：左側購買/販賣文字**水平置中且靠近 icon**、圖3旋轉箭頭中心放入縮小的「切換」而不跟著旋轉、模式變更時右側商品表格微彈跳、黑市初次進入全螢幕 loading、商人自言自語**只留陰影/描邊文字，移除框/背景**。本批全部整合，不挪往下一批。
- 新 `src/features/market/marketIdleLines.ts` 每位五商人保留原 `vendor.line` 作第1句+9句個別自語=各10句，`getMarketIdleLine` 可循環；`MarketIdleSpeech.tsx` 用 `MARKET_IDLE_INTERVAL_MS=10_000` 真實秒輪播、`visibilitychange` 後台停止/回前台恢復、effect 清理，掛載 `key={vendor.id}` 確保換商人重設；世界時間/輪班沒有被 timer 推進。CSS `.market-v0825__speech` 消除原場景舊對話框 border/background，強化文字影與微描邊。
- 新 `useMarketSceneLoad.ts` 預載 `BLACK_MARKET_SCENE_URL` 之實際本地 WebP、等 `Image.onload` + `decode` 才顯示完整市場；資料全部來自同步已初始化 `useGame`（不新增假載入2秒）。15秒失敗、資產損壞或 timeout 改顯示有「重新載入／返回主畫面」的錯誤畫面；cleanup onload/onerror/timeout。新 `MarketLoadingScreen.tsx` 深色 `position:fixed` 全視窗、載入/錯誤有 aria，主市場不提前掛載。原場景使用原 BASE_URL 路徑，`BlackMarketSceneArt.tsx` 匯出統一 URL 常數。
- `BlackMarketPage.tsx` 中 `market-v0824__switch-label--buy/sell` 各用兩個獨立中文字 span；新 CSS flex horizontal center 去掉舊 writing-mode 的偏位。icon 仍是用戶圖3向量輪廓 `MarketTradeSwitchIcon`，只讓 SVG 自心旋轉180°；「切換」作為置中的兄弟元素保持不旋轉；約 109px 上下交換、矮畫面微調。真正買賣切換時才 `setSwitchCount`，右側貨架 `market-v0825__catalog--buy/sell` 分別用不同名的 0.4s 微幅 bounce，減少動效停用，原 mode/分類/捲動/交易保護與背包販售都保留。
- 新 `src/styles/_v0825-market-dialogue-loading-polish.scss` 最後載入；沒有重做 v0822 商品卡/四階級、v0823 場景燈眼/好感或 v0824 背包販售/reducer，也不改遊戲世界時間。新 `tests/v0825-market-dialogue-loading-polish.test.ts` 驗各商人10句、timer/清理、圖片載入/失敗/重試、布局、bounce及原交易；更新舊 v0823/v0824 靜態斷言以符合新 UI 但不刪其交易與場景回歸。QA `docs/V0825_MARKET_DIALOGUE_LOADING_QA.md`。
- **剩下的批次排程不變**：第5批 `v0.8.26` 單獨實作下次商人到班的**遊戲世界時間**倒數（非每10秒台詞），第6批 `v0.8.27` 整頁 RWD、動畫/長字/操控驗收。不自動追加批次；第4批完成 CI (`npm run build`+`npm test`) 後只交一個 PR，**不自行 Merge**。待使用者明確 Merge 通知後才先重新核對 main/PR/交接/黑市程式並續做。

---


## 2026-11-13｜黑市第三輪第3批 v0.8.24：左側買賣切換與背包販售（本 PR 待使用者 Merge）

- **開工核對**：GitHub `main` `0d210bdd1edbee9cc00956c7c5c83f91ab5fba60`，PR #49 v0.8.23 已 Merge、Pages 成功，open PR 0。下方任何「待 Merge」是各歷史批次提交當時狀態；未來繼續仍必須先查實際 GitHub。
- **唯一分支** `ui/v0.8.24-market-toggle-and-bag-selling`，package/lock `0.8.24`，黑市六批第3批。新 `MarketTradeSwitchIcon.tsx` 使用用戶圖3 `circle.png` 512×512透明 icon **向量描邊後保持原兩個循環箭頭輪廓**，用 `currentColor` 染銅金；新 `_v0824-market-toggle.scss` 最後匯入。商品貨架左邊新增一條整區可點的 `market-v0824__switch`：買/賣文字互換上下位置、啟用放大與亮色、停用縮小/灰淡，SVG 以自身中心旋轉180°。保留 `prefers-reduced-motion`、鍵盤焦點、觸控。原底部兩個買/賣鈕移除，統一使用 `chooseMode` 重置篩選/詳情/商品捲動。
- **使用者強制要求**：販賣模式右側改為**玩家背包 `s.bag` 所有數量 >0 的實體物品**，不再由商人 `vendor.buyItems` 決定是否「顯示」，不混入只有 `s.warehouse` 的物品。新 `marketSellInventory.ts` 純函式區分背包物品陳列與商人的收購政策。受保護/已裝備/備戰唯一必要武器、不被當班商人收購的背包物品**仍可見**，但 `canTrade=false`，開詳細窗顯示真實禁售原因並 disabled 確認。購買頁照舊使用商人的 `sellItems` 和真實庫存/舊幣。
- **必要 reducer 同步修正**：`src/game/engine/resolve.ts` 的 `MARKET_SELL_ITEM` 過去優先扣倉庫造成列表與交易來源錯位，現在**僅扣 `s.bag`**，無背包存量則拒絕出售。仍保留當班驗證/商人 whitelist/保護裝備/備戰唯一武器、真實價格、好感、經驗與存檔 schema。卡牌複本使用獨立 `ownedCards`：只顯示複本 >0，商人不收購時仍可見但禁賣，`MARKET_SELL` guard 不改。
- 專項 `tests/v0824-market-toggle-bag-selling.test.ts` 驗證模式切換/PNG輪廓/180度/RWD減少動畫、背包與倉庫差異（bag1/warehouse4 只扣 bag，warehouse only 拒絕）、商人不收購/受保護拒絕、真實卡複本流程。更新前批 `tests/v0823-market-cinematic-scene.test.ts` 固定版本斷言改 `0.8.x`。QA `docs/V0824_MARKET_SWITCH_BAG_SELL_QA.md`，完整六批規劃仍在 `docs/BLACK_MARKET_REDESIGN_ROADMAP.md`。
- **停點**：本批單一 PR、CI npm run build/test 全綠後停，不自動合併。使用者合併並通知後，下一批 **v0.8.25 商人十句自言自語，每10秒切換並循環**；切換商人應清理計時器。接續前要讀最新 main、PR、交接檔/相關 TSX/CSS/測試，不提前做第5批輪班倒數。

---


## 2026-11-13｜黑市第三輪第2批 v0.8.23：用戶場景圖片、紫色眼光與動態燈光（本 PR 待 Merge）

- **GitHub 最新開工核對**：`main` `f540c94df0d28ca9e0b374457724cd378de001d9`；前批 PR #48／v0.8.22 已 Merge，Pages 部署成功，開工前 open PR 0。下方舊條目的「待 Merge」是歷史時點資訊；每批必須重新查最新 main/PR/交接、程式和測試。
- **唯一分支** `ui/v0.8.23-market-cinematic-scene`、package/lock `0.8.23`；本批**只修改黑市上方場景**。上傳圖2原 JPEG 1376×768／695,892B，採用之前已預壓的 **960×536 WebP／32,380B**（約減少95.35%），已真正以 Git 二進位 blob 納入 `public/black-market-merchant.webp`。新 `BlackMarketSceneArt.tsx` 透過 `import.meta.env.BASE_URL` 引用同源資產，SVG `viewBox 0 0 960 536` 防止寬窄裁切時眼部/燈光錯位。
- SVG 眼光使用同色系紫色/粉紫、固定 x335/y121 和 x384/y128；屋頂暖燈 x529/y51、左側冷燈 x202/y67，三種 CSS opacity 循環閃爍。以 `prefers-reduced-motion` 關閉動畫保留靜態低光。光暈/遮罩 pointer-events none；未使用 timer 或 React 額外刷新。
- `BlackMarketPage.tsx` 移除舊兩側人物/隔牆並改為全畫面商人場景，仍動態顯示 **`vendor.name`／`vendor.role`／`vendor.line`**、世界時段與時鐘。新 `.market-v0823__favor` 放右下，使用真實 `blackMarketFavor/100` 以及有 aria-now/min/max 的細雙色進度條。圖片中斗篷人物是共同場景美術，原五名不同時段商人與真正的交易/價格/好感/庫存資料完全保留。
- 新 CSS `src/styles/_v0823-market-cinematic-scene.scss` 最後匯入，只作用於此 hero；商品四階卡及底部買賣選單、篩選、交易 modal、`MARKET_BUY/SELL(_ITEM)`、world.time、資料結構及存檔沒有修改。桌面/320/360/390px、短高 RWD，右台詞可局部閱讀。詳細 `docs/V0823_MARKET_CINEMATIC_SCENE_QA.md`；專項 `tests/v0823-market-cinematic-scene.test.ts` 測資產 RIFF/大小、圖片 URL/效果座標、動態商人、好感更新、媒體查詢與原交易保留。舊 `tests/v0822-market-product-tiers.test.ts` 固定版本改0.8.x，保留全部回歸。CI npm run build/test 必須全綠；不能取代使用者實際瀏覽器畫面檢查。
- **本回合使用者新增強制規格**：**切換販賣時右側陳列必須來自玩家的「背包」現有物品，不能用商人 buyItems 白名單做陳列來源，也不能用背包+倉庫加總。** 不被當班商人收購/受保護/裝備中的物品可見但必須禁售顯示原因，卡牌複本資料應獨立處理。現有舊版賣出清單 `vendor.buyItems.map` + `totalOwned` 與需求不符；**已記錄於路線圖與QA、指定下批 v0.8.24 買賣切換時必須修正**。本批不提前改動販賣來源/交易引擎。
- **停止點**：本批一個 PR，不自行 Merge；使用者合併通知才開始 v0.8.24（左側買賣整區 toggle／圖3箭頭調色＋上述背包販賣清單修正）。下批同樣重新查 GitHub state。

---


## 2026-11-13｜黑市第三輪第1批 v0.8.22：四階級商品卡片（本 PR 待使用者 Merge）

- **GitHub 最新開工基準**：`main` `b959b5df1a81b2290f9f6c1d77490f554be951c2`，上一輪 PR #47 v0.8.21 **已 Merge**，Pages 成功、開工時 open PR 0。下方上一輪 v0.8.21「待 Merge」是歷史記錄；不得當成當下狀態。
- **新一輪細分六批**，詳細 `docs/BLACK_MARKET_REDESIGN_ROADMAP.md`，用戶原始圖片1-3是本輪參考。**本次只執行第一批** `ui/v0.8.22-market-product-tiers`；後續 v0.8.23 場景圖片/眼睛/燈光、v0.8.24 左側買賣切換及圖3 recolor、v0.8.25 十則自言自語10秒輪播、v0.8.26 世界時間的商人輪班倒數、v0.8.27 最終 RWD/回歸；未得到使用者合併通知前不提前施工。
- **本批新增** `src/features/market/marketProductPresentation.ts`，四階 UI 等級灰/綠/藍/紫及 Lv；現有 `ITEMS` 沒有本身 rarity/level 欄，物品只顯示**展示級別**5/15/30/50、不影響實際能力/售價；黑市卡牌交易都是 Lv.1 的升級複本，稀有度按現有 CARDS.rarity 映射到綠/藍/紫。不新增商品/假禁忌牌；原卡買入內部 sentinel 99 應顯示「庫存不限」，不是錯誤的99張。
- `BlackMarketPage.tsx` 商品卡現在同時含頂部 Lv/階、圖案、兩行名稱、正確價格/舊幣icon、購買庫存或出售持有數，彩色但暗色的細框/底色；商品詳情加入展示等級說明與數量處理。保留原 `market-v12__meeting`、`market-v13__filters`、買賣按鈕、`MARKET_BUY/SELL(_ITEM)` 分派、商人交易身份/數據、`useVerticalDragScroll`。SCSS最後 `_v0822-market-product-tiers.scss` 覆蓋，不改引擎或存檔。
- 專項 `tests/v0822-market-product-tiers.test.ts` 完整五位商人的商品覆蓋、四階級、實際原價格/買入stock/按班拒絕/卡牌出售、UI四欄位、RWD；舊固定 v0821 版本測試改為0.8.x。QA `docs/V0822_MARKET_PRODUCT_TIERS_QA.md`；版本 package/lock 0.8.22。
- **圖片預處理**：用戶圖2原JPEG 1376×768 / 695,892 bytes，本地壓縮測到 WebP 960×536 / 32,380 bytes（-95.35%），但**尚未把圖檔提交或引用至網站**；第2批才處理，避免商品/場景同時改版造成回歸。圖3 PNG recolor 將在第3批處理。
- **止步**：單一 PR，CI npm run build/test 全綠後停止。不自行 Merge。使用者合併、通知後，重新核對 GitHub main/PR/交接/市場 TSX/SCSS/測試，再進下一批。

---


## 2026-11-13｜第二輪第8批（最後批）v0.8.21：攻擊型主動牌＋事前準備版面（本 PR 待使用者 Merge）

- **本批 GitHub 開工核對**：`main` `c3dba2f9a0ee8c098eec32cdbc11dd5f86da2167`；前批 PR #46／v0.8.20 已 Merge，最新 GitHub Pages 部署成功，開工時 open PR = 0。下面歷史「待 Merge」皆以當時資料紀錄，不代表現在真實狀態。下次開工仍須先讀此檔／查最新 main+PR+CI。
- **唯一分支** `ui/v0.8.21-attack-codex-preparation`，package 與 lock = `0.8.21`；對應 `docs/UI_COMPACT_REDESIGN_ROADMAP.md` 的第8批（八批中的最後一批）。本批功能範圍只在 `CardsPage.tsx` 攻擊圖鑑視覺與 `PreparationPage.tsx` 戰前準備 UI，**無新卡／數值平衡／戰鬥判定／存檔／路由／音效引擎變更**。
- **攻擊型主動牌圖鑑**：延用 v0.8.20 共同的三大頂部導航、持有狀態、稀有度/職業歸屬交集篩選，功能牌／攻擊牌**各自保留不同篩選狀態**。新增 `src/features/cards/attackCodexFilters.ts` 純函式，只過濾 `ATTACK_CARDS`，持有者排前；不改 `ownedCards`。每張攻擊卡維持原始 LV.I 複本和升級主卡分格、I-V 邊框色/稀有度、名稱/數量/emoji/未解鎖狀態，卡面另外顯示真實 `getAttackDamage`、基礎成功率、體力成本、必備武器名稱與背包/倉庫/缺少的存放狀態。倉庫持有**不保證已經符合負重**，詳情有提示須到準備頁檢查。仍沿用原 `UPGRADE_CARD`／詳情/故事/取得方式、拖曳與觸控/鍵盤網格捲動。
- **事前準備**：`PreparationPage.tsx` 保留 `/preparation` 路由、固定5攻擊槽、`PREPARE_ATTACK_CARD` 加入/移除、原 `START_ATTEMPT` 和 `navigate('/chapter')`；增加返回圖鑑入口與四格摘要（已選/5、可用牌、實際背包重量、預估武器備妥後重量）。頂部選擇槽狀態不誤隱藏，原攻擊牌清單重排成深色銅金的高密度格子，顯示實際傷害/基礎成功率/體力消耗/武器名稱及背包/倉庫/不足警告；可選區獨立垂直捲動，底部返回、遊戲設定、進關及警告仍在。
- **讀取型演算** `src/features/preparation/preparationReadiness.ts` 是從原 `PreparationPage.tsx` 的 **逐張依序、倉庫候補、15kg** 檢查原樣抽出，不執行任何取物、裝備、變更卡牌或開始任務；實際轉移與五張上限仍由原 `gameReducer` 判斷。若沒有攻擊牌或選了缺武器牌，原 `requestStart` 彈出二次警告，玩家依舊可以自行選「我知道了，仍要進關」而進關；沒有變成強制禁止。
- **CSS** `src/styles/_v0821-attack-codex-preparation.scss` 最後匯入 `main.scss`。攻擊卡的四欄格、等級/武器訊息、細節視窗縮距；準備頁五欄攻擊槽+兩欄可選攻擊卡（<=380px 退為一欄，>=650px 三欄），正常直式手機主要標題、五槽、概要、操作固定，只有列表捲動；極矮<480px允許主準備面板垂直捲動避免裁切底部確認。支援短寬、長名字、focus-visible、觸控、reduced motion。
- **自動測試** 新 `tests/v0821-attack-codex-preparation.test.ts` 覆蓋兩類獨立 filter、稀有度與職業交集、卡牌分級/數量/真實攻擊升級與傷害、倉庫轉移、15kg候補及缺武器、5張上限/移除、進關二次確認合約、原地捲動與RWD；前批 `tests/v0820-card-codex-skill-layout.test.ts` 對共用 filter 與新版號更新，保留原技能所有回歸。QA 詳細清單 `docs/V0821_FINAL_CARD_PREPARATION_QA.md`。CI 必須 `npm run build` + `npm test` 全綠；**不能把 CI 視為已在 Chrome/手機完成像素/觸控 QA**。
- **八批結束狀態**：第1批 v0.8.14 至第7批 v0.8.20 均已由使用者先後 Merge；**第8批 v0.8.21 此 PR 在交付時仍待使用者 Merge／實機驗收**，不得自行 Merge。此輪改版完成後不自動開第9批。使用者如有驗收問題，先開新的修正討論並依最新 GitHub 與畫面核對。

---


## 2026-11-13｜第二輪第7批 v0.8.20：牌組圖鑑主骨架與功能型技能卡（本 PR 待使用者 Merge）

- **GitHub preflight**：`main` `d66e8af0366e6498f86eae4605526f7ff4fa1b0e`；前批 PR #45／v0.8.19 已合併、GitHub Pages 部署成功，開工時 open PR 0。下方先前「待 Merge」均為歷史文字；每次新批次仍要查最新 main、PR、相關程式、CI。
- **唯一分支** `ui/v0.8.20-card-codex-skill-layout`，package/lock 版本 `0.8.20`。對應 `docs/UI_COMPACT_REDESIGN_ROADMAP.md` 第7批，參照使用者圖4，**只重設牌組圖鑑主骨架＋功能型附加技能卡面**。下一批 v0.8.21 的「攻擊型主動牌／事前準備」專有版型未動。
- `CardsPage.tsx` 保留三主入口（功能／附加技能、攻擊型主動牌、事前準備）、原有解鎖比例和全部/已持有篩選。功能型再加「稀有度（全部/普通/稀有/混沌）」與「歸屬（全部/共通/記者/滲透者/騎士）」交集篩選、可見卡格數；切換條件自動捲回卡區最上方。新 `src/features/cards/cardCodexFilters.ts` 僅純計算 ID，不變更 `CARDS`、`ownedCards` 或任何存檔。
- 功能型四欄 `cards-v0820__skill-grid` 保留原 `buildCardArchiveVariants`（LV.I 素材與已升級主卡分格）、5級顏色／稀有度標籤、emoji／尚未解鎖鎖、名稱/數量，增加原 `chanceBonus` 和 `resourceCost` 小字。卡格保留原 `useVerticalDragScroll` 滑鼠拖曳/手機觸控；只允許圖鑑格子獨立捲動，頂部篩選及底部 `GameUtilities` / `ReturnMainLink` 不走位。
- `src/styles/_v0820-card-codex.scss` 在 `src/styles/main.scss` 最後匯入。以 `.cards-v0820` 定義全圖鑑一致的黑灰銅金導覽/篩選，**新的格子/詳情緊湊設計限定 `cards-v0820--skills`**；攻擊卡留第8批。細節窗仍用原 `CARD_LORE`、取得方式、LV/張數、升級成本與 `UPGRADE_CARD`；遊戲卡牌/職業/戰鬥/備戰/存檔/路由/音效資料沒有修改。
- 專項 `tests/v0820-card-codex-skill-layout.test.ts` 覆蓋持有/稀有度/職業交集、卡牌階級和實際升級、導航/拖曳/RWD；前批 v0819 固定版號斷言改 0.8.x。人工 QA `docs/V0820_CARD_CODEX_QA.md`。**CI 必須 `npm run build`+ `npm test` 全綠才可交付；CI 不能視為瀏覽器目視驗收。**
- **停點**：僅建立一個 PR、不可自動 Merge 或提前修改第8批。使用者自行 Merge 並明確通知後才重新核對 GitHub 最新 main/PR/交接與 `CardsPage`/`PreparationPage`，進入 **v0.8.21 攻擊型主動牌及事前準備版型**。

---


## 2026-11-13｜第二輪第6批 v0.8.19：城鎮成長、NPC 記憶、人物故事精簡化（本 PR 待 Merge）

- **GitHub preflight**：`main` `ccf31ee396058194c15d98697e0b6e29a9b4de33`；上一批 PR #44／v0.8.18 已 Merge，最新 Pages 部署成功，開工時 open PR = 0。下方各批「待 Merge」均是當時的歷史狀態，後續開工請再次查最新 GitHub。
- **唯一分支** `ui/v0.8.19-compact-character-archives`、版本 package/lock `0.8.19`。遵守 `docs/UI_COMPACT_REDESIGN_ROADMAP.md` 第6批，只更動 `src/features/player/CharacterPage.tsx` 的 **town/record/story** 三頁 JSX 和最後載入的 `src/styles/_v0819-character-archive-compact.scss`。裝備 v0817、18屬性 v0818、game reducer、存檔、路由、人物其他頁完全不動。
- **城鎮成長**改四張緊湊卡：今日訓練（每日一次狀態）、委託完成數、外傷/感染/中毒/疾病與裝備精工總階。保留全部原說明和原 state 取值，手機2×2、內容寬≥600改四欄，頁尾成本提示仍完整。
- **NPC 記憶**：上方四格嘗試次數/線索/兩名NPC已記住事件數；下方各 NPC 的密集數據（來訪、敵意、交涉/攻擊適應、我擊敗/我被擊敗、對此敵人下次判定加成）。戰鬥記憶完整保留 `npc.defeatMemories.slice().reverse()` 的所有方法、NPC 心聲和效果，但改成原生 `<details><summary>` 預設收合；線索 `s.clues.slice().reverse()` 同樣提供可展開全文，長列表內部捲動，無紀錄仍顯示空狀態。
- **人物故事**：三職業原 `profession.name`、`profession.overview`、`profession.passive` 與兩段第一人稱引言全數保留，以共用暗銅金的「引言/角色經歷/職業天賦/餘韻」敘事區塊呈現。
- 三頁共用 `.character-v0819` 的 header、字級、資訊卡與RWD tokens，正常手機高度一頁式摘要，展開大量紀錄/極矮螢幕/200%放大時允許**僅內容面板和指定 log**捲動；不推走上方5頁導覽。
- 新增 `tests/v0819-character-archives.test.ts` 對真實城鎮/兩NPC記憶/長線索/角色故事/安全版型作回歸，更新前批 `tests/v0818-compact-character-attributes.test.ts` 的版本斷言至0.8.x。詳細目視 QA `docs/V0819_CHARACTER_ARCHIVES_QA.md`，CI 須 `npm run build` + `npm test` 全綠。
- **停點**：本批只交付一個 PR，使用者自行 Merge，沒有授權提前進第7批。待收到明確「Merge 好了，開始第七批 v0.8.20」後，**重新核對 GitHub main/PR/交接/相關卡牌程式與測試**，再進「牌組圖鑑主骨架／被動技能」。

---


## 2026-11-13｜第二輪第5批 v0.8.18：身體／思維／社交一頁式緊湊屬性（PR 待使用者 Merge）

- **GitHub 開工核對**：`main` `70be35a7f317ca59ab84fd614031faf6f0bbed8c`；上一 PR #43／v0.8.17 已 Merge、Pages 部署成功；開工前 open PR = 0。下方「v0.8.17 待 Merge」為歷史狀態，往後仍必須每次查 GitHub main／PR／交接／相關碼與 CI。
- **本次唯一分支** `ui/v0.8.18-compact-character-attributes`，package/lock 版本 `0.8.18`。本批只改 `CharacterPage.tsx` 的「屬性」區與新 `src/styles/_v0818-compact-character-attributes.scss`（最後載入 main.scss），其餘四人物頁以及第4批裝備、城鎮、NPC、故事、卡牌/存檔引擎全不動。
- 手機**三組上下排列，每組兩欄三列**的18項緊湊「屬性名稱／目前等級/20／＋加點」小卡；大於等於540px 採三組並排、每組單欄六列。首頁上方精簡 Lv、XP/需求、剩餘點數及5px進度條；三分組各列目前總等級／120；移除佔位的分類捷徑與各卡重複「永久成長屬性」副標籤。保留全屬性 `ATTRIBUTE_GROUPS` 的原始18 IDs／中文名稱，單鍵加點清楚可達。
- 按鈕只在 `progression.points>0 && s.player.attributes[id]<20 && s.mode==='home'` 可用；0點/已達Lv20/非home可見禁用並附完整說明與 aria-label。唯一加點仍是 `dispatch({type:'ALLOCATE_POINT',attribute:id})`；角色資料/XP/HP/ST/存檔/轉職限制不變。小高度320×568/600×360或200%縮放，只允許屬性內容區內部捲動；不能為一頁式隱藏加點或長字。
- 新 `tests/v0818-compact-character-attributes.test.ts` 對18項唯一/真實18次跨群組加點/點數0/等級20/非home/HP ST副作用與CSS／可用性做檢查；更新前版 `tests/v0816-character-navigation.test.ts` 對本批已移除的分類捷徑，以及新的等價加點限制檢查。人工 QA 交接 `docs/V0818_CHARACTER_ATTRIBUTES_QA.md`。
- **每批止步約定**：本批一個 PR；需 GitHub CI `npm run build`＋`npm test` 全綠；使用者自己 Merge 並手動目視驗收；明確通知「Merge 好了，繼續第六批」後才重新查 GitHub 最新 main，開始 **v0.8.19 城鎮成長/NPC記憶/人物故事緊湊化**。禁止自己合併或提前做下批。

---


## 2026-11-13｜第二輪第4批 v0.8.17 人物裝備高密度頁（待 Merge）

- **最新 GitHub 基準**：`main` `64f9a01046dd0611d181cd327b158fc9dc8ddf2c`，前一 PR #42 已 Merge、Pages 成功、開工時 open PR 0。舊 v0.8.16「待 Merge」為歷史文字。
- 唯一分支 `ui/v0.8.17-character-equipment-board`；package/lock `0.8.17`。只處理 `docs/UI_COMPACT_REDESIGN_ROADMAP.md` 第4批（全身裝備頁），沒有提前做屬性、NPC、牌組後續批次。
- `CharacterPage.tsx` 抽出 `CharacterEquipmentPanel.tsx` 及 `equipmentInventory.ts`：中央既有原創 `SurvivorFigure`、七個裝備插槽左3右4、六個真實數值（HP/ST/DEF/移動/觀察/韌性）、下方背包＋倉庫合計的 ItemArt 六欄格子。物品資訊先點擊開詳情，按確定才送既有 `EQUIP_ITEM`，同時支援 `UNEQUIP_ITEM`；前端提供錯槽／重複／倉庫超15kg等禁用原因，遊戲 reducer 為權威，不更動遊戲邏輯與存檔。
- 新樣式 `src/styles/_v0817-character-equipment-board.scss` 最後載入：暗色銅金視覺，只有 Inventory Grid 在物品多時捲動，極矮屏才降級為裝備主容器捲動；原五頁導覽與其它4頁內容不改。v0.8.18 才將18項永久屬性在一頁式內收斂。
- 測試 `tests/v0817-character-equipment-board.test.ts` 對七槽、真實數值、庫存、裝備許可、實際 reducer、Responsive 契約；更新舊 `tests/v0816-character-navigation.test.ts` 裝備合約來源與版號。人工 QA 在 `docs/V0817_CHARACTER_EQUIPMENT_QA.md`。CI/PR/手機驗收請以 GitHub 與使用者實測為準。
- **停止規則**：本次僅一個 PR，CI 全綠後停止；不得自行 Merge。使用者 Merge 並通知後才重查 GitHub 最新 main/PR/交接、進入 v0.8.18。

---


## 2026-11-13｜第二輪第3批 v0.8.16：人物檔案導航/屬性整合（PR 待 Merge）

- **開工 GitHub preflight**：`main` `2fcbba8ac9b8afe232980542a2577d59c058507a`，PR #41（v0.8.15）已合併、Pages 部署成功，open PR = 0。較舊 v0.8.15「待 Merge」等為歷史內容。
- 唯一分支 `feat/v0.8.16-character-navigation`，版本 package/lock = 0.8.16。只實作 `docs/UI_COMPACT_REDESIGN_ROADMAP.md` 第3批，沒有提前動第4/5批。
- `src/features/player/characterSections.ts` 統一五個頂部導覽（全身裝備／屬性／城鎮成長／NPC 記憶／人物故事）與18個原永久屬性ID（身體／思維／社交各6）；`CharacterPage.tsx` 三類併入同一「屬性」頁，可透過分類快速定位，XP／Lv／可用點數一次顯示，原 `ALLOCATE_POINT`、點數不足、20級上限和非home禁用不變。
- `src/styles/_v0816-character-navigation.scss` 最後匯入 main.scss，五入口等寬避免頂部水平捲動；屬性內部內容可縱捲保證18項皆可達。下一批 v0.8.17 專注參考圖3重排裝備人物圖，v0.8.18 再做三組18屬性**一頁式**高密度排版，v0.8.19 再處理 NPC 記憶/城鎮/故事。
- 城鎮成長、NPC記憶、職業故事、裝備 CRUD、角色狀態及 `GameRoutes` 存檔/路由鎖均未改動。新增 `tests/v0816-character-navigation.test.ts`（5頁／18項唯一/實際加點與安全門檻），更新前批版本測試。QA 文件 `docs/V0816_CHARACTER_NAVIGATION_QA.md`；自動 CI 與人工驗收狀態需分開敘述。
- 每批只有一個 PR。**此批提交通過 CI 就停止，不代 Merge；須等使用者自行合併、明確通知後，重新核對 GitHub 最新 main／PR／交接，才做 v0.8.17**。

---


## 2026-11-13｜第二輪 UI 八批中的第2批 v0.8.15（本分支待使用者 Merge）

- **本次 GitHub preflight**：`main` `00b491ae096e46793c959da4a21448b4ec41f90b`，PR #40／v0.8.14 已 Merge，GitHub Pages 部署成功；開工前 open PR 0。先讀過本檔及 `docs/UI_COMPACT_REDESIGN_ROADMAP.md`，並核對旅店、診所、條色樣式、拖曳及舊回歸測試。上一段「v0.8.14 待 Merge」是歷史文字。
- **本次唯一分支** `ui/v0.8.15-shared-recovery-preview`，版本 `0.8.15`。只修改雙色預覽 UI（旅店及地下診所），不動人物頁或牌組、任何療效/收費/時間/存檔/路由。
- 新增 `src/styles/_v0815-shared-recovery-preview.scss`，`main.scss` 最後匯入，提供可共用的 `recovery-preview-card`、`recovery-preview-meter` 及 6px CSS 進度條高度/數字/內距/顏色 token；旅店原 13px、診所原 9px 雙色條統一 6px。紅＋淡粉的生命、綠＋淡綠的體力、紫色疲勞與其他負面值皆保留語意；一般單色即時條 **不納入**本批。
- `InnRestDialog.tsx` HP/ST 預覽改為左標籤右前後數值、下方短條與恢復量；三床位選擇卡與建議卡更精簡，外框自然內容高度＋max-height。**關鍵修復**：把費用、剩餘次數及 `getTownServiceLock` 的不足舊幣訊息放到 `inn-rest-dialog__checkout`（**獨立於內部捲動**，固定在 footer 上方），無訊息也保留原高度，避免一出現「舊幣不足」就突然要拉動才能看到。確認按鈕禁用邏輯不變。
- `ClinicDialog.tsx` 只加共用視覺 class，預計治療結果繼續用原 `clinicTreatmentOutcomes`／原本 before/after 百分比及 ARIA，診所舊 v0.8.12 縮卡再精簡。此批未修改治療計算、每日委託、藥房、拖曳 Hook。
- 測試：`tests/v0815-shared-recovery-preview.test.ts`（共用條、顏色、預覽數值、checkout 固定及不足舊幣、舊機制），上一批 v0814 歷史定值斷言改 regex；QA 文件 `docs/V0815_SHARED_RECOVERY_QA.md`。
- **合作協定**：同一批只有這一個 PR，GitHub CI（`npm run build`、`npm test`）全通才交付；瀏覽器目視仍需使用者 Merge 後驗收。收到明確「Merge 好了繼續第3批」才以最新 GitHub 重新核對 main/PR/交接/測試，開 v0.8.16 人物檔案資訊架構改版；**絕不代 Merge 或提前改下批**。

---


## 2026-11-13｜新一輪8批 UI 重設計：v0.8.14 第1批（本分支尚待使用者 Merge）

- **本次 GitHub preflight**：`main` commit `a8e6860f6ec1f4408f595815bacc7720325b2fd2`，前批 PR #39／v0.8.13 已 Merge，Pages 部署成功，開工前 open PR = 0。下方 v0.8.13「待 Merge」為歷史狀態；**永遠以新 GitHub preflight 與最新交接頁首為準**。
- 使用者 2026-11-13 提供四張新版參照圖，要求大型改版細分可獨立 Merge 批次。**現已排成8批**：v0.8.14 工坊；v0.8.15 全域雙色結果進度條（旅店/診所）；v0.8.16 人物頁導覽；v0.8.17 全身裝備頁；v0.8.18 身體＋思維＋社交合併加點頁；v0.8.19 城鎮成長/NPC記憶/故事；v0.8.20 牌組圖鑑/被動；v0.8.21 主動卡/事前準備。**詳見 `docs/UI_COMPACT_REDESIGN_ROADMAP.md`**，後續批次僅規劃未施工。
- 第1批唯一分支 `ui/v0.8.14-workshop-selector-refinement`、版本 0.8.14。工坊保留既有結構，新增 `src/styles/_v0814-workshop-refinement.scss` 在 `main.scss` 最後：選擇卡桌面四欄(61px高起)、手機兩欄(60px高起)，短狀態、名稱最多兩行；縮小插畫/詳情/耐久/對照/按鈕，僅 detail 區可捲動，footer 固定。
- `WorkshopDialog.tsx` 新增 `showNotice` 僅在成功點選工坊服務時顯示 `s.lastEvent`，切換部位清除，避免其他設施過往事件被誤顯示。未裝備卡簡寫「空欄位」，完整說明留在詳情。
- 新增 `tests/v0814-workshop-refinement.test.ts`、QA `docs/V0814_WORKSHOP_REFINEMENT_QA.md`。不碰引擎／存檔／修理價格／戰鬥／其他設施。Build / Tests / PR 及實機狀態**以 GitHub/使用者實際結果為準**；未通過時於原 PR 修正。
- **使用者日後每次說 Merge 好了/繼續**：自動透過 GitHub connector 先讀 `docs/PROJECT_HANDOFF.md`、查最新 main SHA、PR、相關程式和現有測試，依 roadmap 僅開下一批1個分支PR；CI 全綠就停，**禁止自己 Merge 或提前施工下一批**。如 connector 不可用，明說而不猜已部署或 PR。

---


## 2026-11-13｜v0.8.13 第四批：黑市陳列面積與商品卡密度（PR 待 Merge）

- **已核對最新 GitHub**：`main` `94e2c6f00ba7673a618c75c9f41adb03eddd52d7`；PR #38／v0.8.12 已合併、GitHub Pages 部署成功；本批開始時 open PR = 0。過去交接檔中所有「待 Merge」字樣屬歷史狀態，不得覆蓋 GitHub 最新狀態。
- **本批唯一分支**：`ui/v0.8.13-market-expanded-catalog`，版本 `0.8.13`。使用者要求每批獨立 PR、自己 Merge 才能做下一批；這是第四批最後一個原定 UI 需求。
- 原 `src/styles/_v12.scss` 人物/商品比例為 `53% / 47%`，此批新增 `src/styles/_v0813-market-expanded-catalog.scss` 於 `main.scss` 最後覆蓋：人物區 `clamp(162px,29%,295px)`、商品桌 `flex:1 1 0`，**人物/隔間/時間/對話/商人好感不刪**；對話移至好感晶片上方防止交疊，商品列表可佔大部分垂直區域。
- 商品 Grid 桌面/一般手機三欄，每格 `clamp(88px,8.6dvh,100px)`；≤375px 改二欄，每格 `clamp(93px,10dvh,106px)`；短視窗更緊湊。商品圖示 max 35px、名稱至少兩行保留、高低間距與價格 baseline 一致，價格採表格式數字，保留長名稱全字於商品詳情／aria-label。捲動只作用商品列表，分類與底下購買、出售、版本、設定、返回主畫面不被遮住。
- 完全不改 `BlackMarketPage.tsx`／黑市商品、卡牌、交易計算、進度、存檔、路由；沿用 v0.8.10 共用拖曳。新增 `tests/v0813-market-expanded-catalog.test.ts`；舊 v0812 的版本定值斷言調成 patch 規則；詳細手動 QA `docs/V0813_MARKET_CATALOG_QA.md`。任何「已視覺驗收」「已上線」陳述以實際結果為準。
- **本批完成 PR 後停止**，須由使用者 Merge 與實際驗收，並明確提出下一輪需求才開始後續開發；絕不預先開下一批。

---


## 2026-11-13｜v0.8.12 第三批：地下診所療程結果精簡（本分支待 Merge）

- **已核對最新 GitHub**：`main` `42d7f059097fed3998bbb84550ee399a32a7e405`，上一批 PR #37／v0.8.11 已合併；其 CI、Pages 部署成功；新分支建立前 open PR 0。前一條標註「待 Merge」屬舊時間點，不可當成現況。
- **本輪唯一分支**：`ui/v0.8.12-clinic-compact-outcomes`，版本 package 與 lock = `0.8.12`。只調「地下診所 → 診療 → 預計治療結果」的卡片密度，不動每日委託、專屬藥房、黑市或修理工坊。
- 新增 `src/styles/_v0812-clinic-compact-outcomes.scss`（位於 `main.scss` 最後），仍保留 v0.8.6 一欄上下的完整雙色長條、生命與外傷原有顏色、前後數值與改善量，但將標籤＋變化與前後數字移至同一資訊行，下一行用 9px 高雙色條。收窄卡片、標籤和清單間距，避免大面積空白；手機 ≤360px 改三行安全布局，過長仍自然換行，無裁切。
- 完全不修改 `ClinicDialog.tsx` JSX 或 `game/engine/clinic.ts`，沿用原本 `clinicTreatmentOutcomes`、`getTownServiceLock`、`useClinicDragScroll` 和減少動畫規則。治療/交易/世界時間/存檔均無變更。測試 `tests/v0812-clinic-compact-outcomes.test.ts` 新增既有色條、佈局斷點、直接療效 6/10→10/10 與外傷 6→4、舊操作保留檢查；舊 v0811 固定版本測試改 0.8.x 向後相容。
- QA 文件：`docs/V0812_CLINIC_COMPACT_QA.md`。**CI、PR 狀態與手機/桌面人工 QA 以 GitHub 與使用者實際結果為準**，未合併前不得稱已部署或完成瀏覽器驗收。
- 下一批 v0.8.13 黑市商品陳列擴大及卡片縮小，需要使用者自行 Merge v0.8.12 並明確通知後才開始，禁止同輪提前開第四批。

---


## 2026-11-13｜v0.8.11 第二批：工坊緊湊四部位＋獨立詳情（本批待 Merge）

- **本輪真實 GitHub 基準**：`main` `59a952d43e7ae49bfcf301cf7b8fb0945b5b3548`，上一批 **PR #36 已合併**、Pages 部署成功、開始時 open PR 0；`v0.8.10` 舊標題的「待 Merge」是歷史紀錄。使用者已明確通知繼續第二批。
- **唯一分支**：`fix/v0.8.11-workshop-compact-layout`，package + lock v0.8.11。本批**只調修理工坊 UI**，不修改診所、黑市、攻防計算、修理費、交易、存檔/路由。
- `WorkshopDialog.tsx` 將四卡部位選擇從原 scroll 中分離成固定 `workshop-dialog__selection`，詳情獨立 `workshop-inspection` 垂直捲動；切換部位重設詳情 scrollTop = 0，避免長/短裝備內容造成位置錯亂。按鈕保留 `aria-pressed`，加上 `aria-controls`。title/scene/footer 都保持原有內容、位置固定。
- 新樣式 `src/styles/_v0811-workshop-compact.scss`（在 main.scss 最末載入，覆蓋 v0.8.4 92dvh 版型）：桌面>=640px 四欄一列，每格最少 88px；窄螢幕兩欄兩列，最少 72px；字體、狀態、卡片及詳情內距緊縮但保留換行；窗高上限 770px，底部按鈕維持可達。短高與橫置狀態另有 RWD，內容過長只捲動詳情。沒有刪除完整修理規則文案。
- 新測試 `tests/v0811-workshop-compact.test.ts`，修正舊 v0.8.10 固定版本斷言；詳細驗收文件 `docs/V0811_WORKSHOP_COMPACT_QA.md`。CI／實機手測以實際結果為準，勿宣稱提交即部署。
- **下一批** v0.8.12 診所預覽精簡；之後 v0.8.13 黑市陳列與卡片密度。**完成一個 PR 就停，等待使用者手動 Merge 並明確回覆才動下一批。**

---


## 2026-11-13｜v0.8.10 第一批：桌面 Web 拖曳穩定性（本分支待使用者 Merge）

- **已核對的起點**：`main` commit `3431fbb95f20586cac6abc1673ae55d75afe55f5`，PR #35（v0.8.9）已 Merge；GitHub Actions Pages 部署成功；建立分支前 open PR = 0。舊的 v0.8.9 段落提到「未 Merge」是歷史紀錄，不可視為最新狀態。
- **唯一分支**：`fix/v0.8.10-desktop-drag-scroll`；版本 `0.8.10`。本批只做桌面滑鼠垂直拖曳穩定性，**不提前修改尺寸／治療畫面／商品排版**。使用者要求每批自行 Merge 後再明確指示下一批。
- 重構 `src/components/useVerticalDragScroll.ts`，用 document capture 持續接收滑鼠位移與放開，覆蓋快拖、拖過按鈕／超出捲動區；7px 門檻、放開後 click 抑制、文字選取與原生 dragstart 保護、完整事件 cleanup；非滑鼠觸控與滾輪及鍵盤保留原生。
- `src/features/market/BlackMarketPage.tsx` 原本獨立的 pointer capture 拖曳改用相同 Hook；修理工坊、城鎮、旅店、卡片、其餘城鎮設施因既有 Hook 自動受益。診所維持之前的獨立 document drag Hook，避免 regression。沒有動商品交易與修理流程。
- 測試新增 `tests/v0810-desktop-drag-scroll.test.ts`，調整舊的黑市拖曳契約與版本斷言；詳細 QA 清單見 `docs/V0810_DESKTOP_DRAG_SCROLL.md`。CI、瀏覽器/觸控手測狀態必須以 GitHub 與使用者實際結果為準；**勿將已提交 PR 當成已合併、已部署或已實機驗收。**
- **後續待逐批進行**：v0.8.11 工坊四格與下方說明縮小且穩定不跑版；v0.8.12 診所雙色預覽卡縮小；v0.8.13 黑市陳列視區擴大＋商品與字距收斂。下一批須等使用者 Merge 本批並明確通知，且必須重核最新 main、PR、測試。

---


## 2026-11-13｜最新｜第四批 v0.8.9 移除網頁式 Navbar，整合版本與設定（未 Merge）

- 本批基準 `main` commit `f287e74ee13acc06f82812c9d498b05d0f1512ea`（前批 PR #34 已合併，v0.8.8）。新分支 `feat/v0.8.9-integrated-utilities-no-navbar`，**不提前做第五批**。
- **整個 `Frame.tsx` 頂部 `app-header` 已從 JSX 移除**（包含遊戲名稱、回地圖、版本、設定），以節省畫面空間。沒有新增固定浮動工具列。
- 建立 `src/components/GameUtilities.tsx` 共用 `BuildVersion`，仍顯示 `v__APP_VERSION__ · __BUILD_REVISION__`；`Link to="/settings"` 僅在 `state.mode==='home'` 且非設定頁存在。
- 地圖的 `city-overview__title` 右側嵌入小型版本與設定（原裝飾性 01 移除，章節編號仍在 CHAPTER 01）；尚未選職業的 `HomePage` 序章資訊列也能使用設定。
- v0.8.8 已有的 `return-main-dock` 左側嵌入版本/設定、右側維持返回主畫面；黑市、牌組、事前準備則直接融入各自原本的底部操作列，避免重複的 dock 或遮住清單。設定頁本身不出現重複的設定連結。
- 冒險中 **完全不增加返回主畫面**：`ChapterPage` 原有設定照舊，`GameSettingsDialog` 新增版本文字；`GameRoutes` 路由安全鎖、撤退確認／戰敗結果／任務結算保持原有。沒有引擎／存檔資料變更。
- 样式 `src/styles/_v089-integrated-utilities.scss`；全新檢查 `tests/v089-integrated-utilities.test.ts`，並更新前批 `tests/v088-return-main-navigation.test.ts` 的歷史 Navbar 假設；版本 package/lock = `v0.8.9`。詳細規格：`docs/V089_INTEGRATED_NAVIGATION.md`。
- 交付條件：先 CI 全綠、PR 可 Clean Merge；使用者自行 Merge 及 GitHub Pages/手機實測後，**明確通知再做下一批**。已 Merge ≠ 已在設備完成驗收。

---


## 2026-11-13｜最新｜第三批 v0.8.8 頁面「返回主畫面」導覽（尚待 Merge）

**基準：**`main` `7f942108ed542c0a323ba70ec14046729cace01e` = v0.8.7，PR #33 已合併，當時沒有其它 open PR。上一批的城鎮八設施版型已存在於 main，不得重做。

**本批唯一分支：**`feat/v0.8.8-return-main-navigation`。
- 共用 `src/components/ReturnMainLink.tsx` 以 `<NavLink to="/">返回主畫面</NavLink>` 導向現有第一章世界地圖。透過 `state.mode==='home'` 限制，**不會 dispatch `RETURN_HUB`**。舊的 `GameRoutes` 冒險路由鎖仍有效。
- `Frame.tsx` 針對一般非主地圖與非任務頁面在 main 之後渲染有自己高度的底部右側操作列，不覆蓋卡牌／設施；黑市、卡牌圖鑑、事前準備將元件直接放進現有 footer，不重複全域列。這些畫面仍保留原有買賣、卡牌升級與進關主要操作。
- 冒險和結算結果時**不顯示**直接跳主地圖捷徑，返回仍透過確認撤退／任務結果原機制。主地圖本身無多餘捷徑。此批不移除原 top header，不改版本/設定入口，留在下一批。
- 樣式 `src/styles/_v088-return-navigation.scss`，測試 `tests/v088-return-main-navigation.test.ts`，QA 文件 `docs/V088_RETURN_MAIN_NAVIGATION.md`。版本 `v0.8.8`，package/lock 同步。**不修改遊戲數值或存檔結構**。
- 下一批 **v0.8.9** 為移除頂端 Navbar、將 Git 版本標示與設定融入主要頁面，**需等使用者 Merge 本批、Pages 部署測試且明確通知才開始**。
- 目前此條屬「已提交分支、等待 PR CI/人工驗收」狀態，勿宣稱已上線。GitHub 當前狀態優先。

---


## 2026-11-13｜最新｜第二批 v0.8.7 城鎮畫面結構（待 Merge）

- 已確認最新 `main`：`6c3e207d10700c8aa0dedca3a25e2b3a71bb1a55`（v0.8.6，PR #32 已 Merge，使用者尚未對 v0.8.6 實機測試）。建置本分支時 open PR 數量 0。**不要因下方歷史紀錄誤以為前批尚未合併。**
- 本批分支：`fix/v0.8.7-town-eight-facilities-only`，是使用者明確允許執行的**第二批 v0.8.7**；**只做城鎮頁面常駐內容移除與原本設施功能的彈窗遷移**，不處理第三批導覽按鈕或第四批 Navbar。
- `TownPage.tsx` 主頁僅顯示舊街避難所介紹、生命/體力/飢餓/疲勞＋可展開的外傷等負面影響、八張設施卡。主頁下方 **不再渲染原本預設旅店的 `town-v15__detail` 與 `town-v15__footer`**；頁面最後停在第八張卡，不再有重複事件與存檔提示。
- 既有的旅店／地下診所／修理工坊維持各自專屬彈窗。資訊酒館／訓練場所／公告欄／洗衣店／食堂的 UI 與真實操作改由新 `src/features/town/TownFacilityDialog.tsx` 承載，所有服務仍由原 `TOWN_SERVICE`、`TOWN_ACCEPT_QUEST`、`TOWN_COMPLETE_QUEST` reducer 結算。顯示原不可使用原因、時間、售價及訓練選項，彈窗 scroll 可拖曳，保留 Esc / 返回按鈕。
- 新樣式：`src/styles/_v087-town-dialogs.scss`；測試：`tests/v087-town-eight-only.test.ts`；本批詳細驗收：`docs/V087_TOWN_EIGHT_FACILITIES.md`；版本號 `v0.8.7`（`package.json`、lock 同步）。**沒有修改存檔與經濟/任務/服務計算。**
- 用戶規定協作流程：完成**唯一一個 PR**後即停止，使用者自行 Merge 與測試，再明確通知才開始第三批 v0.8.8（各頁返回主畫面按鈕）；第四批 v0.8.9 移除頂端 Navbar、將設定與版本融入既有頁面。不自行提前做新 PR。
- 此條為最新開發交接，CI 與手動驗收狀態應以 GitHub 當下為準，勿直接宣稱新功能已部署。

---


## 2026-11-13｜最新｜v0.8.6 第一批（診所 UI + 拖曳）

- 最新已部署基準 `main`：`6c7cf70086bd15c170c7d0fd3bc760a9518c4328`（v0.8.5），**舊 PR #29、#30、#31 都已 Merge；open PR 0**。舊條目寫的「尚未部署」為歷史紀錄，勿當作最新狀態。
- 新工作分支 `fix/v0.8.6-clinic-layout-drag` 由上述 main SHA 建立。**本輪只實作第一批**：縮短診所「待處理」狀態列、將療程的前後變化改成出租床位式同色雙色長進度條、修正診療與藥房桌面滑鼠拖曳失效、修正底部短句出現獨立捲軸與舊休息訊息殘留。診所專用 `useClinicDragScroll` 監聽 document pointermove/up，拖曳時抑制 click；手機仍使用原生觸控。
- 變更檔案：`src/features/town/ClinicDialog.tsx`、`src/features/town/useClinicDragScroll.ts`、`src/styles/_v086-clinic-polish.scss`、`src/styles/main.scss`、`package.json`、`package-lock.json`、`tests/v086-clinic-polish.test.ts`、`docs/V086_CLINIC_LAYOUT_QA.md`、此交接檔。
- **無數值／狀態欄位／存檔格式調整**；療程預覽保持與 `clinicTreatmentOutcomes`／`clinicTreatmentPreview` 同源。時間進行仍可能影響飢餓或疲勞，進度條呈現的是療程直接改變。
- 後續批次依序：**v0.8.7** 城鎮八設施下方移除重複的詳細區塊並維持可操作、**v0.8.8** 主要頁面融合返回主畫面與規劃版本設定入口、**v0.8.9** 移除頂端舊 Navbar 並融入設定／版本及 RWD 檢查。
- 用戶指定合作流程：**只交付一個 PR 就停手**，等用戶自行 Merge、確認 GitHub Pages 和測試，再由用戶明確回覆繼續下一批。**禁止擅自同輪開多個相依 PR**。本批合併與實機驗收之前，不要誤報已部署／完全驗收。
- 本批專項文件：`docs/V086_CLINIC_LAYOUT_QA.md`。先確認 CI 自動測試，再交給使用者合併。

---


## 2026-11-12｜v0.8.5 微批次 3：診所療程效果預覽

本輪（圖 1～5 的修正）已切成三個獨立小 PR：**PR #29** `fix/v0.8.3-town-inn-scroll`（城鎮狀態展開後可拖曳到下方設施、出租床位 footer 固定）；**PR #30** `fix/v0.8.4-workshop-dialog-layout`（有裝備/空裝備同一尺寸，工坊詳情捲動）；**PR #31** `feat/v0.8.5-clinic-treatment-preview`（診所只顯示有異常的就診摘要及每張療程卡真實前後數值）。

### 診所最新設計規則
- 避免重複城鎮四條完整 HP/ST/飢餓/疲勞條。改在「診療」頁頂部僅列出缺損 HP 或大於 0 的外傷/感染/中毒/疾病，提醒玩家優先處理的問題。
- 每張原療程卡使用 `clinicTreatmentOutcomes`（由原 `clinicTreatmentPreview` 衍生）顯示生命／體力／外傷／感染／中毒／疾病／疲勞的直接改善「治療前 → 預計治療後」。沒有改善就顯示無改善；照舊由 `getTownServiceLock` 決定是否可使用。
- 時間推進還會額外改變飢餓/疲勞，介面明示目前顯示的是療程直接效果。**不得宣稱治療預覽包含世界時間所有間接效果**。交易/負面效果/收費/存檔未更改。
- 規格 `docs/V085_CLINIC_TREATMENT_PREVIEW.md`，測試 `tests/v085-clinic-treatment-preview.test.ts`，前兩批驗收見 `docs/V083_TOWN_INN_SCROLL.md` 和 `docs/V084_WORKSHOP_LAYOUT.md`。
- 三批均以**尚未合併、尚未部署**為預設，需讀 GitHub 最新狀態確認。PR 依賴 #29 → #30 → #31；上一批合併後把下一批 base 調成 main 並重新查 CI，再合併。**使用者將等三批部署後一次實機驗收**，CI 不是實機 UI 的替代。
- 往後沿用每批只有一個明確小目標、可測試、可單獨回滾、更新永久交接的做法。超過 30 分鐘要分更多批。

---


## 2026-11-12｜v0.8.4 微批次 2（最新狀態）

依賴 PR #29 / v0.8.3，分支 `fix/v0.8.4-workshop-dialog-layout`。修理工坊有裝備、沒裝備共用同一高度 `92dvh` 視窗，內部文字與修理動作可垂直捲動，原標題/工坊場景/footer 固定。修復有裝備時被壓到畫面之外和空裝備版型尺寸不一致，不更動戰鬥防禦/磨損/修理費/存檔。測試 `tests/v084-workshop-layout.test.ts`，規格 `docs/V084_WORKSHOP_LAYOUT.md`。此批不是已部署版本，先確認 CI；使用者將三批合併後統一實機驗收。下一批 v0.8.5 地下診所療程狀態預覽依此分支繼續，合併次序 #29 → v0.8.4 → v0.8.5。

---


## 2026-11-12｜v0.8.3 微批次 1（最新優先）

以 `main` v0.8.2 commit `bc6ef7be04f5174328ad4c3ea2ecedc2ca3a5f3e` 開發。第一個小 PR 分支 `fix/v0.8.3-town-inn-scroll`：解決城鎮身體負面狀態展開後無法向下拖曳其他設施、出租床位預覽將確認按鈕推出畫面。加入既有安全拖曳 hook、城鎮自身可滑、旅店標題／底部按鈕固定＋中段內容滑動。**不修改恢復公式、存檔或其它功能**。測試 `tests/v083-town-inn-scroll.test.ts`，文件 `docs/V083_TOWN_INN_SCROLL.md`。

使用者要求單輪超過 30 分鐘即拆分。後續第二小 PR `v0.8.4` 改修理工坊固定外框，第三小 PR `v0.8.5` 做診所療程前後狀態。以 main 最新狀態和 open PR 為準，勿重複修改或倒序合併。**本批尚待 CI/使用者實機驗收，不可宣稱已部署**。

---


## 2026-11-12 晚間｜訊息逾時後復原、PR 重疊排除（優先閱讀）

**本輪已先停止新增遊戲功能，只做 GitHub 驗證與 PR 依賴整理。** 之前長時間回覆被使用者端顯示「訊息傳送逾時」，該訊息與遊戲/GitHub Actions 失敗是兩回事。不能因聊天逾時推斷 GitHub 沒寫入。未來每次只改一個可驗收小功能，完成後就結束當輪，不要持續加寫多批讓對話逾時。

**真實狀態（以本次 GitHub REST 查證）：**
- `main`: `4ef2eccc77bec18d4ec2c0a476a798a9cb56716e`，v1.7.5，PR #25 已合併。
- Batch A PR #26：`feature/v0.8.0-rest-and-town-status` → `main`；最新 CI run `43219571019` 成功，尚未合併。
- Batch B PR #27：`feature/v0.8.1-market-grid` → **`feature/v0.8.0-rest-and-town-status`**；最新 CI run `43222382628` 成功，尚未合併。
- Batch C PR #28：`feature/v0.8.2-card-archive-grid` → **`feature/v0.8.1-market-grid`**；最新 CI run `43222394975` 成功，尚未合併。
- #27 與 #28 原先都以 `main` 為 base，導致 Files Changed 重複顯示 A、B 的檔案。已**只更新 PR base**（未重寫程式、未 merge）；現在 #26 14 個檔案、#27 9 個、#28 11 個，三個 PR 均顯示 clean。
- **注意：** 這三個是 stacked PR。合併 #26 到 main 後，先將 #27 base 改回 `main`，確認 diff/CI，再合併 #27；之後將 #28 base 改回 `main`，確認 diff/CI，再合併 #28。不要在調整 base 以前刪除仍被當作 PR base 的分支，更不要倒序合併。合併前先重新讀 GitHub 狀態，防止另一處已更新。
- 三批**程式與自動測試已完成但未在 Pages 部署且未做人工 QA**。所有手機/桌面互動、音樂、排版與存檔兼容性仍需遊戲瀏覽器驗收。
- 新的微批次規則：每輪「一項功能、針對性修改、獨立測試、交接檔、PR/CI 結果」，先讀主分支 SHA／open PR／最新 run，確認沒有待合併重複內容。失敗修正也是獨立一輪；不要一次處理多個新子系統。使用者可在最後選擇按 PR 順序驗收。

---


## 2026-11-12｜第六輪 Batch C 卡牌圖鑑 v0.8.2（本分支最新資訊）

已完成三個依賴批次的程式與對應文件，尚需核對所有 PR 最新 CI 及合併。基準 `main:4ef2ecc`，分支順序 **A `feature/v0.8.0-rest-and-town-status` PR #26 → B `feature/v0.8.1-market-grid` PR #27 → C `feature/v0.8.2-card-archive-grid`（本 PR）**。每個階段應先確認原 PR 已合併再合併下一個；最後 Pages 顯示 `v0.8.2` 與新短 SHA，等待使用者一次實際驗收。

本批卡牌圖鑑 4 欄×5 列視區、垂直拖曳/滾輪/觸控、右側沒有 scrollbar、超過 20 張才會露出下一排。**複本資料沒有自造不存在的等級**：`ownedCards[id]` 的主要等級主卡×1、未使用的基礎 LV1 複本×N 分開顯示，沒有高等版本時不可顯示假卡牌。五級依**升級等級**採灰／綠／藍／紫／金，獨立保留稀有度文字 `normal/rare/chaos`；原有升級 reducer 不變、舊存檔可沿用。詳見 `docs/V082_BATCH_C_CARD_ARCHIVE.md`、`tests/v082-card-archive-grid.test.ts`。

不要將「CI 通過」記為已完成人工遊戲 QA。休息動畫需要瀏覽器音量／自動播放與過場測試，黑市／圖鑑需要桌面滑鼠與手機觸控測試。

---


## 2026-11-12｜第六輪 Batch B 黑市 v0.8.1（本分支最新資訊）

依賴 Batch A PR #26，分支 `feature/v0.8.1-market-grid`、版本 `v0.8.1`。黑市商品改**整齊固定三欄／窄幅兩欄**，取消每張商品的隨機轉角/位移；限制區域高度露出下一列，可手機觸控/電腦滑鼠按住拖曳/滾輪/鍵盤瀏覽，隱藏 scrollbar。原有購買/出售、分類、交易引擎保持不變。測試 `tests/v081-market-grid.test.ts`，詳細 `docs/V081_BATCH_B_MARKET.md`。**尚未合併到 main，不代表 Pages 已部署。** 按順序合併 A→B→C 並一起做實際瀏覽器驗收。

---


## 2026-11-12｜第六輪 v0.8.x 開發起點（最新優先）

**基準：** `main` Commit `4ef2eccc77bec18d4ec2c0a476a798a9cb56716e`，已部署 `v1.7.5`；所有早期說 PR #25 尚未合併的歷史段落已過期。

**Batch A：休息和主城狀態（待 CI 和合併）**：`feature/v0.8.0-rest-and-town-status`。版本號改成未正式發布用的 **v0.8.0**，沿用舊存檔 schema/Key；三床位各自的原創溫馨短音樂及動畫；血量/體力回復雙色動態條以真實差值同步；城鎮四項生命/體力/飢餓/疲勞進度條與可收合四種負面狀態。**現行外傷未扣除最大 HP，中毒/感染未自動扣血，不要在 UI 謊稱已實作**。驗收見 `docs/V080_BATCH_A_REST_TOWN.md`，測試 `tests/v080-rest-town-and-version.test.ts`。

**Batch B（開發予定）**：黑市商品改整齊固定格線、可拖曳上下瀏覽、捲軸隱藏、下一列露出一部分。

**Batch C（開發予定）**：圖鑑 4 欄 × 約 5 列，垂直拖曳，取消分頁；同名卡按獨立等級呈現，Lv.1–5 分別灰/綠/藍/紫/金。這些是**升級等級**的視覺標示，原有 `normal/rare/chaos` 是另一個**稀有度**維度，禁止混淆。

所有批次 PR 需依 A→B→C 順序合併；每批更新手交接和測試。CI 通過不等於手機／桌面介面實測通過；使用者將等全部完成後一起驗收。

---


## 2026-11-12｜第五輪：v1.7.5 四部位防禦與修理工坊（最新優先）

**最新已部署起點：** PR #24 已成功合併到 `main`，基準 Commit `6626020d03a8777a44b73aff9cd82da2bf01b4aa`，版本 `v1.7.4`。任何較舊段落聲稱 PR #24 未合併皆已過時。

**第二批開發分支（尚未合併/人工驗收）：**
- `feature/v1.7.5-armor-durability-workshop`，版本 `v1.7.5`。深入規格和 QA：`docs/V175_ARMOR_REPAIR_WORKSHOP.md`；測試：`tests/v175-armor-repairs.test.ts`。
- 裝備新增四防護部位 `head`、`body`、`arms`、`legs`，保留武器/工具/配件；舊手套 `hands` 自動遷移 `arms`；新增可搜刮或黑市購買的護臂固定板/護膝防撞墊及專屬 SVG 圖案。
- 只有敵人真正命中並扣生命時，隨機選一件已穿戴防具磨損；部位權重身體40%、其他各20%，只對實際穿戴的防具重新正規化。每件防具 3、5、10 次命中後依序輕/中/重度損壞，降低其有效防禦，不摧毀裝備，跨任務保留。
- `getEquippedDefense` 只計算四防護部位；`mitigateCounterDamage` 保證傷害至少 1，最多減輕原始傷害的 35%（向下取整）。**不修改交涉／潛行成功機率或個別 NPC 失敗反思加成**。
- 直接點城鎮「修理工坊」開啟四部位視窗；依受擊與部位決定修理費，預覽與結算共用 `getTownServiceFee`。完全修復有 25% 機率「完美修理」：僅下一次任務受益的單件防具 +1 防禦。原先 45 舊幣＋材料 1 份的精工改良保留。
- `town.armorHits` 與 `town.perfectRepairs` 採可相容舊存檔的新增欄位；舊 `wear` 數據保留並換算磨損次數。既有遊戲存檔 KEY / `version:1` 皆不變。
- 新 PR 未合併前不得宣稱 GitHub Pages 已部署；PR CI 通過不等於手機/桌面實機確認。不能自動 Merge。此輪 PR 完成後可以讓使用者和上一批一起實機測試。

---


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
