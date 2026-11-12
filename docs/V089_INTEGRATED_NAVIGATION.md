# v0.8.9｜第四批：移除頂端 Navbar，將版本與設定融入原介面

## 基準與變更界線
- 開發基準：`main` commit `f287e74ee13acc06f82812c9d498b05d0f1512ea`（PR #34 v0.8.8 已 Merge；建立分支前 open PR 0）。
- 本批僅修改 UI／導覽入口、相關測試、版本與文件。**不修改任務結算、撤退規則、血量、資源、物價、世界時間、NPC、存檔格式。**
- 版本改為 `v0.8.9`，保留部署 Git SHA 作為版本識別。
- 將 `Frame.tsx` 中整段原 `app-header` JSX（遊戲名稱、地圖、版本、設定）**移除**。不替換成另一個跨頁 Navbar 或覆蓋內容的固定浮動工具列；原本的 `app-main`、v0.8.8「返回主畫面」流程及音效/遊戲回饋保留。

## 取代方式（依畫面性質整合）
- `src/components/GameUtilities.tsx`：共用精簡 `BuildVersion`（`__APP_VERSION__`＋`__BUILD_REVISION__`）與設定入口 `Link to="/settings"`。在設定頁不重複設定按鈕；冒險中不提供可離開任務的設定連結。
- 第一章世界地圖 `/`：在原 `city-overview__title` 的右側，以小型版本與設定區塊取代裝飾性的「01」數字；第一章編號仍保留在 `CHAPTER 01 / WORLD MAP`、關卡列表等原有位置。地圖其餘進度、十二關、底部五個主功能入口保留。
- 尚未選職業的序章：`home-hero__top` 的 `EMBER CHRONICLES / PROLOGUE` 旁也有版本與設定，首次遊玩就能調音量。
- 城鎮、倉庫、人物、設定等次頁：既有 `return-main-dock` 的左側加入版本／設定組，右側維持 v0.8.8「返回主畫面」。設定頁已在設定中，只顯示版本和返回。
- 黑市、牌組圖鑑：直接在既有底部 footer 的「返回主畫面」旁加版本／設定；窄螢幕縮短輔助說明，不遮主要購買、卡片或互動。
- 事前準備：在既有 `preparation-footer` 內增加一行靠右的精簡系統工具；原本的返回主畫面與「帶著這些準備進關」並排按鈕、準備警告與任務開始不改。
- 進行任務：繼續使用 `ChapterPage` 原本「設定」入口及 `GameSettingsDialog`，只在該設定視窗內增加 `BuildVersion`；**不提供可直接離開任務的返回按鈕**。原 `GameRoutes` 冒險／結果導覽鎖定仍有效。
- 本批樣式放在 `src/styles/_v089-integrated-utilities.scss`；對 320～390px 與低高度視窗預留換行／縮排，不增加 fixed/sticky 跨頁 Navbar；所有工具仍可鍵盤聚焦。

## 提交前自動檢查與部署後人工驗收
1. `tests/v089-integrated-utilities.test.ts`：舊 navbar 不再存在；地圖、序章、次頁、黑市、牌組、準備、任務設定都能找到正確版本與設定入口，且冒險中無返回捷徑。原 `tests/v088-return-main-navigation.test.ts` 更新為跨版相容。
2. CI 應通過 TypeScript、Vite 與整套 Vitest；PR base 必須是 `main`、Merge 狀態 Clean。
3. 使用者 Merge 並等待 GitHub Pages 版本顯示 `v0.8.9 · SHA`，才算已部署；CI 不代表手機的完整 UI 驗收。
4. **桌面與 320/360/375/390px 手機**：主地圖首頁頂部沒有任何網頁式 Navbar；地圖章節標題同列的版本與設定能點擊，不遮章節進度或時間。
5. 無職業存檔可從序章按「設定」，設定頁可以返回主地圖。城鎮展開身體負面狀態後，底部八張設施卡、返回主畫面、設定和版本均不重疊。
6. 黑市買賣、牌組卡片縱向拖曳、準備頁底部開始任務按鈕均可操作；窄螢幕不隱藏版本或設定。
7. 進入任務後設定按鈕原樣可按，設定視窗中顯示版本，手動改 URL 不能跳離任務；戰敗需手動結算，不因移除 Navbar 而繞過流程。

## 協作停點
**這是第四批唯一 PR。** 通過 CI 後不自動 Merge；等使用者自行 Merge、檢查 GitHub Pages 並明確通知，才接受後續新批次需求。不可在本輪再開始下一個 PR。用戶前批尚未完成的人工測試也不能被視為「已驗證」。
