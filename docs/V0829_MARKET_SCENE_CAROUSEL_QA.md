# v0.8.29｜第2批：黑市商人專屬環境圖片 + 柔和交叉輪播 QA

## GitHub 起點
- 2026-11-13 開工 main `d8ba00d36dc1bb7ddfa3068aa797cab2c12e9668`，前批 PR #54 已合併、Pages 成功、開工時 open PR=0；本批獨立分支 `ui/v0.8.29-vendor-scene-carousel`。
- 不涉及 world time/hunger、交易/商人供貨或 GameState schema，package/lock 0.8.29。

## 素材來源與壓縮核對
- 原本 `public/black-market-merchant.webp` 是**防毒面具**現有正面肖像，檔案一樣使用，不要賦給其他商人。
- 使用者參考圖2 `Figure_rummaging_through_clutter…_4ce94395.jpg`：灰手羅恩在工作台旁整理機械（原 1376×768 698331 bytes），壓成 `public/black-market-mechanic-rummage.webp`。
- 使用者參考圖3 `Person_repairing_machinery_at_wo…_ddbd9849.jpg`：灰手羅恩在台前電焊（原 1376×768 686663 bytes），壓成 `public/black-market-mechanic-weld.webp`。
- 兩圖使用 Pillow WebP 品質/調整輸出，不失原畫面內容、人物和灯具位置；GitHub commit 兩個真正 binary WebP（不是 .b64.txt 或 CDN URL），實際 size 應小於65KB並具 RIFF/WEBP file signature。
- 公開網頁的 URL 經 `import.meta.env.BASE_URL` 組成，必須支援 `/ember-chronicles/` GitHub Pages 站台子路徑。

## 功能契約
1. 依真實五商人 `MARKET_VENDORS` 的 `visual.sceneAssets` 決定資產；灰手羅恩 2 幀；防毒面具 1 幀；墨鏡阿黛、傷疤醫師、白髮信使目前無圖，顯示暗色**不帶人物**的空環境，商品/交談/好感保持可操作。
2. 有2幀以上時，先 decode 所有資產，完成後才顯示 UI；每12秒從第1幀→第2幀→第1幀，並以 opacity 1.3s crossfade。沒有圖片時不做不必要的 HTTP 請求也不會顯示載入圈。單張場景（scavenger）不建立播放 timer。
3. 前景/背景切換：背景頁籤停止 timer，回前景再繼續且不出現多重 timer。減少動效設定：顯示第1張固定圖，切換/取消設定時不累積 interval；不作閃爍。
4. 05:00/11:00/14:00/18:00/23:00 當班商人更替後即重新載入新身份場景，不再顯示上一商人；場景圖片404/解碼失敗/15秒超時要顯示既有錯誤畫面，可重試或返主頁。
5. 防毒面具紫眼光特效不可在灰手羅恩或沒有提供肖像的空場景上出現。兩張機械工坊原圖的白色日光燈和中央橘燈位置接近，既有環境光可以沿用；**焊接圖的額外點狀火花留到 v0.8.30**。
6. 確認世界時鐘與左 rail 倒數（仍舊遊戲時間）、交易真價/庫存、背包只賣持有物、商人不收購時禁賣、好感和商人十句台詞/10秒輪播都不受影響。

## 真實瀏覽器/手機人工檢驗
- Chrome/Edge 桌面 1280×800、720×1176、手機 390×844、360×740、320×568，橫置 600×360；放大200%、開啟 prefers-reduced-motion。
- 在灰手羅恩時段（05:00～10:59）等待至少25秒，確認工作台搜翻圖和焊接圖兩次轉換且場景/文字/好感不抖；切出分頁30秒後回來確認不會跳多格。
- 在防毒面具時段（23:00～04:59）確認原正面像和紫眼光完全保留且不輪播；其餘商人顯示沒有臉的空環境，不讓角色名字和圖對不上。
- Chrome DevTools 用網路阻擋單張 WebP，應在圖片錯誤畫面提供「重新載入」和「返回主畫面」。恢復網路重新載入後輪播正常。手機背景/鎖屏後定時器不要疊加。
- **CI 靜態檢查/單元測試不等同實際手機、SVG 交叉淡入與秒數視覺驗收**。

## 合併停點
- 一個 PR，CI npm run build + npm test 都成功才交付，**絕不自行 Merge**。使用者 Merge 並通知後才開始第3批 v0.8.30（各場景燈光與焊接火花）。
