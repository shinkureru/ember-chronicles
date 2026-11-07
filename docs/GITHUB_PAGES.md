# GitHub Pages 公開測試部署（v0.3）

## 快速部署

1. 在 GitHub 建立一個 repository（例如 `ember-chronicles`），把**本專案資料夾內的內容**推送到 repo 根目錄的 `main` 分支；不要多包一層 `narrative-card-rpg/`。
2. GitHub → Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。
3. 推送到 `main` 後，`.github/workflows/deploy.yml` 會執行 `npm install`、`npm run build`、`npm test`、部署 `dist/`。
4. 部署完成的網址通常是 `https://<使用者名稱>.github.io/<repo>/`。

## 已處理的問題

- Vite `base` 自動從 GitHub Actions 的 `GITHUB_REPOSITORY` 組合為 `/<repo>/`；本機維持 `/`。
- `HashRouter` 路由形式 `/#/character`，GitHub Pages 重新整理不會因缺少伺服器端 rewrite 而 404。
- 使用 `public/.nojekyll`。
- 靜態資產若要自行引用，請使用 `import.meta.env.BASE_URL` 或 Vite 的 import 規則，勿硬寫 `/assets/...`。

## 注意

- GitHub Pages 不包含後端；現階段遊戲依照 `localStorage` 存檔，**跨裝置不會同步**，清除網站資料可能造成存檔遺失。
- 專案需要 Node.js 22，初次安裝時應有網路連線。
- 目前尚未在本工作環境執行完整 npm build（環境無法連接 npm registry）；推送後請查看 Actions log，必要時修正 CI 回報。
- 正式公開前請檢查所有音效、圖片與字型授權，以及是否含測試存檔、私人金鑰或 API token。

## 新對話如何接續

貼上 repo 連結，並請助理**先閱讀**：`README.md`、`docs/AI_CONTEXT.md`、`docs/GAME_DESIGN.md`、`docs/FEATURE_STATUS.md`、`docs/CHANGELOG.md` 和 `src/game/types/index.ts`。Repo 只會反映已 commit/push 的修改，尚未推送的檔案或對話中未寫進文件的決定，無法自動從 repo 得知。
