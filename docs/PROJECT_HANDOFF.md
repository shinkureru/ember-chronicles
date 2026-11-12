# 餘燼紀事｜永久跨對話開發交接（PROJECT_HANDOFF）

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
