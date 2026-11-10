# 音效授權與導入規範（Prototype v0.2）

## 目前專案實際使用情況

- `src/audio/sound.ts` 包含自製 Web Audio API 程序式短音效，並於 v1.1 加入 Kenney CC0 實錄 Foley 音效。
- v1.1 **已實際納入 11 個 CC0 錄音檔**；沒有使用版權不明的遊戲、電影或動畫原聲。
- 只在使用者按鍵／觸控後啟動音訊，提供設定頁的音效開關。
- 自製程序式音效仍是後備音效；實錄音效依 CC0 授權使用，保留來源紀錄。

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

## v1.1 實際導入的錄音

**原始作者／授權：** Kenney，`RPG Audio` 1.0，Creative Commons Zero 1.0（CC0-1.0）。官方素材頁：https://kenney.nl/assets/rpg-audio ，官方標示 CC0。

**取得方式／可追溯來源：** 從開源 Godot 重整版 `Boyquotes/kenney-rpg-audio-for-godot` 中的原始 OGG 取得，再將音訊檔以 GitHub blob 原樣加入自己的專案。鏡像網址：https://github.com/Boyquotes/kenney-rpg-audio-for-godot 。建議在正式發行前保存官方授權頁封存／日期證據。

| 本專案音檔（`public/audio/kenney-rpg/`） | 用途 |
|---|---|
| `footstep_0.ogg`, `footstep_2.ogg`, `footstep_4.ogg` | 一般腳步、快速跑步、潛行 |
| `cloth_1.ogg`, `cloth_2.ogg` | 翻找外套、衣物與口袋 |
| `book_flip_1.ogg`, `book_open.ogg` | 翻文件、查看辦公桌文件、卡牌翻動 |
| `metal_click.ogg`, `metal_latch.ogg` | 工具、金屬零件、搜查貨架 |
| `handle_small_leather.ogg` | 取得／處理皮革小物 |
| `door_open_1.ogg` | 開啟介面或門的音效 |

所有檔案由遊戲整合播放，可商用且不強制署名。音檔還沒準備好、網路離線或瀏覽器無法解碼時保留原先的合成效果，不會造成選項無法執行。**各段音效仍需於實際裝置上聆聽與音量校正；檔名匹配不等於最終品質驗收。**



## Prototype v1.4 — 實際納入的 Kenney 介面音效（2026-11-11）

- 資料來源：[Kenney UI Audio（GitHub 鏡像）](https://github.com/Calinou/kenney-ui-audio) / [原版 Kenney 介面音效](https://kenney.nl/assets/interface-sounds)。
- 音效鏡像的 [LICENSE.txt](https://github.com/Calinou/kenney-ui-audio/blob/master/LICENSE.txt) 明確標示 CC0、允許商業用途，不要求署名。原始官方 [Kenney 支援說明](https://kenney.nl/support) 亦說明其資產頁面素材皆採 CC0。
- 本次實際匯入 GitHub 專案的來源：`addons/kenney_ui_audio/` 下列檔案，均未改動其內容（`public/audio/kenney-ui/`）：`click1.wav`、`click3.wav`、`click5.wav`、`rollover2.wav`、`switch10.wav`、`switch14.wav`、`mouseclick1.wav`、`mouserelease1.wav`。
- 實際操作映射：一般點擊 `click5`、選擇 `click3`、確認 `switch10`、鎖定／警告 `switch14`、開啟 `mouserelease1`、檢查 `rollover2`、對話 `click1`。
- 原已在 v1.1 匯入的 Kenney RPG Audio OGG 繼續使用，保留原始 CC0 授權記錄。讀取失敗時播放程式自製合成音，不會無聲。
- v1.4 場景 BGM 為 `soundscapes.ts` 與 `sound.ts` 的**本專案全新程序式作曲**，無任何第三方曲目、商業歌曲、現有作品旋律的拷貝；已讓交戰節奏與主題旋律明顯不同。音樂本身不依賴外部 CDN。
- 在 OpenGameArt 找到多個標示 CC0 的候選音樂，例如 https://opengameart.org/content/ancient-caverns-horror-ambient-loop、https://opengameart.org/content/chiptune-battle-music，但 **v1.4 並未納入這些檔案**，以避免聲音風格不符與事後難以追溯音源。
- 對於未來行動版／付費上架，仍應保存素材原檔、授權聲明與提供者網址，並進行最終法務檢視。
