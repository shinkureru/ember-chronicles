# v1.5 — 外部 CC0 背景配樂授權清單

全部背景音樂**已改用原作者公開的 CC0 1.0** 音檔；已收錄進 `public/audio/cc0-music/`，部署與單機封裝均無需連線到外部伺服器。播放時使用原始錄音、循環、短時間交叉淡入淡出。操作音效仍使用原先 Kenney CC0 與合成後備。

| 本地檔案 | 曲目 | 作者 | 原始來源 | 授權 |
|---|---|---|---|---|
| `oga-dark-shrine.ogg` | Dark Shrine Loop | qubodup（基於 yd 的 Shrine） | https://opengameart.org/content/dark-shrine-loop | CC0 1.0 |
| `busy-cyberworld.ogg` | Sci-fi City — Ambient Loop | TinyWorlds | https://opengameart.org/content/scifi-city-ambient-loop | CC0 1.0 |
| `qubodup-menu-loop.ogg` | menumusicloop-tiggo | qubodup | https://opengameart.org/content/two-simple-game-music-loops | CC0 1.0 |
| `qubodup-battle-loop.ogg` | levelmusicloop-tigrun | qubodup | https://opengameart.org/content/two-simple-game-music-loops | CC0 1.0 |
| `wipics-menu-loop.ogg` | menu.ogg（Menu Music） | wipics | https://opengameart.org/content/menu-music-1 | CC0 1.0 |

- 五個原始曲目的 OpenGameArt 原文皆標示 **CC0**，可在商業遊戲中使用、修改與散布，不必署名；仍在本文件永久記錄作者與來源。
- 錄音素材透過含授權說明的開源遊戲倉庫取得：`euuuuuuan/moonshard-warden-public`（含來源的 license/manifest/原檔校驗碼）、`blancmathis/Super_Bash_Folds`、`tegnike/aozora-islands`、`MorninRage/idle-craft`；轉入本倉庫時保持原始 OGG 位元組，不重新編碼。最終權利來源以上列原作者的原始授權頁為準。
- 來源 GitHub：
  - https://github.com/euuuuuuan/moonshard-warden-public/blob/main/CREDITS.md
  - https://github.com/blancmathis/Super_Bash_Folds/blob/main/public/assets/audio/LICENSES.md
  - https://github.com/tegnike/aozora-islands/blob/main/src/assets/audio/README.md
  - https://github.com/MorninRage/idle-craft/blob/main/src/audio/musicManifest.ts
- **配樂分工**：世界地圖／城鎮／黑市／倉庫與探索／對峙戰鬥／結算各自有情境路由，戰鬥使用獨立曲目，不再播放原本程序式生成的短旋律。路由表在 `src/audio/licensedMusic.ts`。
- 音量可於設定頁分開調整總音量、背景音樂與音效；瀏覽器仍遵守首次使用者互動後才能啟動音訊的規定。
- 提醒：CC0 降低使用限制，但不保證 YouTube Content ID 永遠不會有人誤申訴。商業上架前應檢查完整授權頁與影片直播相容性。

## 進一步音樂美術導向
原型目前著重明確區分大地圖、探索、遭遇與戰鬥。部分 CC0 音樂節奏較明亮，若日後藝術方向要更冷調、心理驚悚，可在保留音訊介面的情況下更換 `SCENE_TRACKS` 與新的授權曲目；**不要**在缺少實際下載且來源不明確時直接串流或假稱已內建。

