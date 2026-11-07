# 音效授權與導入規範（Prototype v0.2）

## 目前專案實際使用情況

- `src/audio/sound.ts` 為我們自行以 Web Audio API 寫出的程序式短音效（UI 點擊、確認、未解鎖、進入、獲得物品）。
- 原型 **沒有內含任何第三方音效檔**，也未使用他人遊戲或電影的音效。
- 只在使用者按鍵／觸控後啟動音訊，提供設定頁的音效開關。
- 程序式音效屬本專案自有程式產生，沒有外部素材授權歸屬問題。

## 可選素材來源（需逐一查核實際檔案）

| 來源 | 授權要點 | 連結 |
|---|---|---|
| Kenney Interface Sounds | 官方標示 CC0，可商用，不必署名；適合介面按鍵音 | https://kenney.nl/assets/interface-sounds |
| Kenney Impact Sounds | 官方標示 CC0，可商用，不必署名；適合撞擊、腳步、短特效 | https://kenney.nl/assets/impact-sounds |
| Mixkit Free Sound Effects | 免費用於包含電子遊戲的商業成品，不強制署名；**不得將原素材單獨再散布或當素材包出售** | https://mixkit.co/license/modal/sfxFree/ |
| Pixabay Sound Effects | 免費使用、通常不需署名，但禁止單獨販售／散布原素材等行為，需詳讀 Content License | https://pixabay.com/service/license-summary/ |
| Freesound | 每個檔案個別授權，僅選 CC0 或確認 CC BY 條件；避免含 NC 的音效用於商業作品 | https://freesound.org/ |

## 專案使用規範

1. 優先選擇自己錄製、自己合成或確定 CC0 的音效。
2. 從素材站取得音效時，記錄來源連結、作者、授權名稱、下載日期、素材檔名、授權頁快照／原始條款。
3. CC BY 音效加入遊戲 Credits 與授權清單，依條款提供署名與授權連結，標示修改。
4. CC0 不強制署名，仍建議在內部建立來源清單以利稽核。
5. 不要直接下載遊戲、動畫、電影裡的音效，不能因為「網路上能下載」就視為免費可用。
6. 不要將音效檔包裝成獨立素材庫販售或任意分享；第三方音效應僅作為合規遊戲成品的一部分。
7. 商用上線前重新確認每個外部素材目前的授權條件與相關使用限制，並保存證據。

## 後續架構

未來將依用途分組：

```
public/assets/audio/
  ambience/     # 城市夜晚、風、雨、室內迴音
  ui/           # 選卡、確認、取消、危險提示
  character/    # 衣服摩擦、腳步、呼吸
  combat/       # 衝擊、裝備碰撞
  stingers/     # 劇情節點短音
src/audio/
  sound.ts      # 目前可執行的原創程序式音效
  registry.ts   # 後續新增外部素材才建立：清單與授權來源
```

瀏覽器對自動播放有限制，必須在使用者互動後才啟動／恢復 AudioContext。可參考 https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices 。
