# 《餘燼紀事》AI 美術素材流程（提案，尚未生成資產）

## 目的
支持角色一致性、多種時段、五場景／關卡、分層動態與手機／Steam 封裝，素材可逐步替換、可離線部署。

## 推薦資料結構
```text
public/art/
  characters/<npc-id>/reference.webp
  characters/<npc-id>/portrait.webp
  ch01/mission-01/gate/morning/bg.webp
  ch01/mission-01/gate/late-night/bg.webp
  ch01/mission-01/gate/late-night/foreground.webp
  ch01/mission-02/inside/evening/bg.webp
  town/market/evening/bg.webp
  world-map/ch01/night/map.webp
src/game/data/artManifest.ts
docs/ART_PROVENANCE.md
```
每張圖片需記錄生成工具／版本、商用條款日期、主題設定、原始底圖來源、參考圖授權、後製內容、尺寸和檔案 SHA256。

## 技術原則
- **角色設定優先**：先做同一角色正面、側面、背面、表情／衣物設計錨點，再生成場景。
- **分層**：背景圖、主體人物、前景遮擋、UI 文字分開，避免對話和按鈕直接印進圖片。敵人攻擊/受傷可以使用 CSS Transform、裁切、骨架動畫或角色序列。
- **時段**：色溫可以用 CSS 疊色快速變化；重要場景做 2–3 張專屬日／夜圖，不要求每個時段產生 5 張不同構圖。
- **效能**：輸出 WebP/AVIF，單場景背景建議 150–500KB，預先載入下一個可達 scene，其他場景延遲載入。完整關卡可放 60 張以上背景，但不應進入遊戲時一次下載。
- **UI 畫布**：文字、數值、互動熱點都由 React/TypeScript 管理，可無障礙且方便更改，不要烘焙到圖片。
- **縮圖／預覽**：先用低品質佔位圖確認路線，不需一口氣生成 12 關。

## 法律與商用風險
- 台灣智慧財產局：AI 作品是否受著作權保護，取決於是否有人類實際創意投入；純自動生成可能無法主張著作權。https://www.tipo.gov.tw/tw/copyright/692-34252.html
- 直接使用他人未授權照片或角色立繪作為圖生圖素材可能涉及重製／改作；只取得輸出圖商用權限，不代表來源圖像沒有侵權風險。https://www.tipo.gov.tw/tw/copyright/692-86740.html
- Steam Content Survey 對開發時使用 AI 製作的遊戲內容要求揭露；實際上架依當時最新規範辦理。https://partner.steamgames.com/doc/gettingstarted/contentsurvey
- 不要誤以為所有 AI 平台都提供相同的商用、保密、肖像或模型授權。確認各平台 ToS；避免未授權的知名 IP、商標和過度臨摹真人肖像。

此文件只定義未來生產流程；v1.5 仍沿用原本的 SVG 場景，**沒有宣稱已生成 AI 美術**。
