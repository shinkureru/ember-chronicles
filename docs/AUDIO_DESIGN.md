# 聲音設計與授權追蹤（v0.3）

## 架構

- `src/audio/soundscapes.ts`：每個地點的 `tonic`、緊張程度、環境音種類與節奏。
- `src/audio/sound.ts`：Web Audio API 程式合成的原創低頻恐怖氛圍音、環境噪聲、滴水回音、工業撞擊、步伐、喘息、受傷與操作音效。
- `src/components/Frame.tsx`：根據路由與 `sceneId` 自動切換背景音場，並對每次點擊進行基本回饋。
- `src/components/GameFeedback.tsx`：根據**已結算**的遊戲狀態播放事件音與彈出提示。
- `src/app/App.tsx`：總音量、恐怖音樂、環境音、操作事件音四個滑桿及靜音設定。

## 已有預設場景

`map`, `town`, `market`, `warehouse`, `gate`, `survey`, `inside`, `confrontation`, `loot`, `result`。`sewer` 為之後下水道關卡預留的滴水與模擬回音音場，目前**尚未有可玩的下水道關卡**。

## 授權

目前所有實際播放的聲音都是程式原創合成，專案沒有引用第三方音訊樣本與商業音樂。
未來替換成真實音檔時，優先考慮 Kenney CC0（例如 UI、Impact、RPG Audio），逐一記錄檔案來源、原作者、授權名稱、取得日期和修改內容。個別素材不一定與整個網站採同一授權。

Google Fonts：繁體中文 `Noto Sans TC`，英文 `Inter`，標題 `Noto Serif TC`。使用官方 Google Fonts CSS 載入；正式離線 App 需另行考量自託管及字型授權聲明。

## 未完成事項

程式合成只能初步驗證氣氛，尚不能等同於真實演員錄製的疼痛聲、人聲喘息、材質精準的腳步與肉搏 Foley。正式內容需取得可商用音效素材或自行錄製，並做混音及瀏覽器/手機效能測試。
