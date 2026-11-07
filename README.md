> 最新版本：**Prototype v0.4**。UI 修改與驗收請見 [`docs/V04_UI_SPEC.md`](docs/V04_UI_SPEC.md)。

# 餘燼紀事｜Ember Chronicles — Prototype v0.4

手機／Web 共用的暗黑劇情卡牌 RPG。現在先做 Web 和 GitHub Pages 版，未來可再封裝手機 App。**目前只有第一章第一關具有可玩內容**，其餘 11 個關卡為鎖定展示。

## 快速啟動

需要 Node.js 22 與 npm：

```bash
npm install
npm run dev
```

瀏覽器開啟 `http://localhost:5173`。以 Chrome 開發者工具的裝置模式模擬手機；也可讓手機連接相同區域網路，使用 `http://電腦區域網路IP:5173` 實機測試。

## 公開部署到 GitHub Pages

1. 建立 GitHub repository，把**本資料夾內的內容**推送至 `main` 分支。
2. GitHub → Settings → Pages → Source: **GitHub Actions**。
3. 讓 `.github/workflows/deploy.yml` 自動安裝、建置、執行測試並部署。
4. 遊戲網址通常為 `https://使用者名稱.github.io/儲存庫名稱/`。

GitHub Pages 的路由採 `HashRouter`，例如 `/#/character`。Vite 在 GitHub Actions 中會自動依 repository 名稱設定 `base`，本機則維持 `/`。更多請看 `docs/GITHUB_PAGES.md`。

## 遊戲內容

- 選擇調查記者或外送騎士，進入第一章地圖。
- 第一關提供劇情、三選一行動、技能卡、成功率、NPC 記憶、撤退、戰敗情報、搜刮、倉庫等試作功能。
- 戰鬥／劇情任務中會鎖定選單；關卡操作固定在單一畫面，劇情全文與技能卡以彈出面板開啟。
- 第一章地圖顯示全部十二關、橫向捲動；目前只有第一關可玩。
- 音效設定可調總音量、恐怖配樂、環境聲與操作音。聲音全部為程式原創合成，未包含第三方音效錄音。
- 目前遊戲只使用 `localStorage` 本機存檔；不具備跨裝置同步。

## 開發指令

```bash
npm run dev       # 開發伺服器
npm run build     # TypeScript 檢查 + 正式建置
npm test          # Vitest 規則測試
npm run preview   # 本機檢查正式建置
```

## 專案目錄

- `src/app/`：React 主程式、路由與遊戲 Context。
- `src/components/`：共用 HUD、框架、通知與狀態組件。
- `src/audio/`：程序配樂、各場景的聲音預設、混音音量與事件音效。
- `src/features/`：世界地圖、關卡、黑市、人物、背包、卡片、設定等畫面。
- `src/game/data/`：可拓充的卡牌、職業、場景、物品與章節資料。
- `src/game/engine/`：不依賴 UI 的規則、機率與事件結算。
- `src/game/state/`：初始狀態和本機存檔。
- `src/styles/`：全局黑暗風格、地圖與固定視窗介面。
- `docs/`：GDD、內容規格、部署步驟、音效授權、進度和 AI 交接文件。
- `.github/workflows/`：GitHub Pages 自動部署流程。

## 目前驗證限制

修改後已進行 TypeScript 原始檔語法解析；本工作環境無法解析 npm registry，沒有完成完整 `npm run build`、Vitest 與真實瀏覽器／手機操作驗證。GitHub Actions 應在第一次推送後執行這些檢查，有錯誤需依 Actions log 修正。`docs/FEATURE_STATUS.md` 有更詳細的完成狀態。

## 無垂直捲動的操作設計

遊戲視窗與文件固定在目前可視高度，章節內操作使用三張一組的行動選項與技能／劇情彈出面板；地圖只使用橫向捲動。主選單的人物／牌組／倉庫／黑市／設定也使用頁籤或上一頁／下一頁；內容過長時請在不同手機高度測試是否有文字被截斷，並改由「檢視全文」彈窗而不是恢復整頁縱向捲動。開發者測試頁目前不受這個限制。
