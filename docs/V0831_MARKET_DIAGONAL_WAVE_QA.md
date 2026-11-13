# v0.8.31｜黑市第四批：斜向區域波浪動畫／回歸 QA

## 開發基準
- GitHub `main` `b6074719df78a3cf89f1051752709f89921d87a6`，PR #56 v0.8.30 已合併、Pages success、無 open PR。單一分支 `ui/v0.8.31-market-diagonal-card-wave`。
- 圖像歸屬／燈光：維持 v0830 的防毒面具三張場景，灰手羅恩等四位仍沒有專圖。這次**不改**圖像輪播、燈光、十句台詞、世界時間、飢餓、交易、卡牌或存檔結構。
- 動畫目的：使用者指出原有商品「只有第二個在跳」且並非斜向區域波浪。根因是在 `_v081-market-grid.scss` 中舊 CSS `transform:none!important;translate:none!important;scale:1!important` 直接覆蓋了 v0827 卡片上動畫。

## 實際動畫規格
1. 每一張 `filteredOffers` 商品 card button 現在由**獨立的** `market-v0831__wave-slot`（grid item）包起來；button 仍佔滿 100% slot，四階商品卡顏色/等級/價錢/數量與鍵盤焦點/滑鼠手勢不受影響。對 slot 使用真正 `transform`，不再觸碰舊 button 的 `!important`。商品點擊、詳情、賣出等仍在原 button。
2. 每卡 phase=`Math.floor(index/columns)+(index%columns)`。寬 >375px 用3欄；<=375px用2欄。每個**相同斜線** `row+col` 具有相同波前 delay，例如3欄第一波是 idx0，下一波 idx1+idx3，再下一波 idx2+idx4+idx6，依斜角擴散；2欄下一波 idx1+idx2，再下一波 idx3+idx4。使用單張 index×66ms 的舊直線排隊動畫已移除。
3. 相鄰波前間隔82ms但每卡起伏持續720ms，因此相鄰好幾組同時在半途（有寬度的柔和區域波，不能看起來像單卡排隊）。位移 0→-2.5→-4→-2→+0.8→0px、縮放最高1.006；不更改卡片不透明度、商品背景或交易狀態。phase最多12防止大量20+商品延遲無限增加。
4. 只有購買→販賣或販賣→購買**真正發生模式變更**才啟動（第一次進頁預設購買不啟動）。快速反覆點 rail 時 `waveEpoch` 增加，原 timer 被清理，slot key 重新產生，保證每次重新觸發。動畫波前全部結束後 `waveActive` 自行關閉，日後切篩選或商品庫存變更不會自行播放波浪。
5. 商品篩選／更多進階篩選／成交／輪班接班會停止波浪；原格子卷軸與 header/filters/場景/左 rail/右下好感都**固定不會跟著跳**。`prefers-reduced-motion:reduce` 直接取消 slot animation。

## 自動驗收
- 新 `tests/v0831-market-diagonal-wave.test.ts` 覆蓋0/1/2/3/7/20商品、2/3欄的 phase/延遲、多項同步斜向卡片、動畫上限、定時器／StrictMode cleanup/買賣快速切換/篩選不重新播放，以及真實商品買賣 reducer 與 bag vs warehouse 分離。
- `tests/v0827-market-final-polish.test.ts` 舊已淘汰的「每張 index×66ms」斷言更新為確認舊動態因 button `!important` 不可靠、現已改外層 wrapper，但保留其他台詞、光效、買賣 regression。
- `npm run build` TypeScript+Vite+Sass、`npm test` 全部通過才能交 PR；**靜態 Vitest 與 CI 無法證明 Chrome/手機畫面像素或實際動畫是否完全符合視覺預期**。

## 使用者 Merge 後人工 QA
- **3欄**（390×844、720×1176、1280×800）且商品>=7：從買到賣及從賣到買各5次，觀察 idx0→idx1+3→idx2+4+6 等斜向一片片起伏，而非只有第2張或整個框跳動。
- **2欄**（320×568、360×740）且商品>=7：觀察 idx0→idx1+2→idx3+4，保持連續斜向波、強度溫和。較矮畫面600×360／<=520px高時確認可見商品與滾動容器不卡。
- **空、1、2、3張商品**：兩種買賣狀態都沒有 console errors；只有一張就單張正常微彈，空清單顯示原文字；禁售商品沒有因動態變成可按「確認交易」。
- **20張以上**：只使可滾動商品區運動，不會把主畫面或 grid 外框/篩選條推動；上方和下方商品卡全部維持原本尺寸，沒有失去點擊、遺漏尾端物品、捲軸跳位。
- **互動回歸**：快速買↔賣連點5次、切種類/更多篩選、開/關商品詳情、按Esc、桌面滑鼠左鍵拖曳、手機手指上下捲動、鍵盤 Tab 選取與 Enter 操作、禁售品／卡牌複本／背包1倉庫4出售，結果都要和 v0830 一樣。
- **減少動態**：系統開啟 Reduced Motion 後商品立即切換清單，不應有波浪；場景原本的 reduced-motion 也維持。
- 人工 QA 特別目視 Chromium CSS animation 作用在 wrapper 時整張卡「含背景/邊框」一起浮起、不是文字或圖示局部動。

**停點**：本批只開PR不自行 Merge，等使用者 Merge 通知才第5批 v0.8.32 商人資料整合。
