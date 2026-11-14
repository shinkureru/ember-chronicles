# v0.8.38 — 避難所主畫面及正式美術導入 QA（第三批）

## 資產驗收
- 已在 `public/assets/shelter/warehouse/` 存放 10 張**完整原始** JPG/PNG，包含玩家最後修好陰影的八張透明家具圖。原檔 Git blob SHA、SHA-256 與測試核對，未裁切/重新去背。
- 證物調查板由玩家 `medical(1).png` 更名存放 `board.png`，不是醫療床；不可使用舊白底或白化預覽。
- 唯一座標：`src/game/data/shelter/warehouse-layout.json`，**768×1376**，負的 bed x=-23、cooking x=-52 需保留。
- 所有 URL 都要以 Vite `import.meta.env.BASE_URL` 產生，支援 GitHub Pages 子路徑部署。

## 畫面狀態
- [ ] `warehouse`、沒有購入家具：載入原空倉庫 `background_empty.jpg`，**不得套用 JSON Demo 的 `owned` 全八項**。
- [ ] 倉庫任意1～7件：空景加正確 PNG，依 JSON `x,y,scale,z,rotation,opacity` 以原圖透明邊界繪製。訂購順序改變但集合相同時同畫面。
- [ ] 八件全部擁有：完全切換為 `background_full.jpg`，不再疊任何透明 PNG。沒有重複的燈光、影子、電腦或無線電線材。
- [ ] `apartment` 廢棄公寓：顯示獨立文字占位，不使用倉庫圖；同樣適用 `bunker` 地下防空室。
- [ ] 每次開啟仍先播放 v0.8.36 的全畫面封面，完成 v0.8.37 的序章／強制教學／避難所選擇後進入新基地首頁。
- [ ] 職業在首頁下方繼續選，選完仍停在基地；日後再次開啟保存身分與基地、舊幣/生命/物資。
- [ ] 舊進度保存：沒有 `shelterOwned` 的存檔應自動取得空集合，**不會給八件**；未知/重複家具 ID 自動排除。
- [ ] 原章節地圖可以透過 `/#/world-map` 進行開發測試；DEV 測試入口只在 Vite DEV 顯示。準備／關卡／結算／Town／Black Market／設定／卡牌仍正常。
- [ ] 桌機和手機實際測 320、360、390、720、1280、200%縮放及短高度。直式場景應按寬等比縮放不被擠壓；前景裁切符合圖像設計，且不能產生全頁水平捲動。

## CI 自動測試
- `npm run build` (React + TypeScript + Vite)，`npm test`（原有 419+ 專項回歸 + 新 v0838）。
- 新 `tests/v0838-shelter-home-assets.test.ts` 逐一 SHA-256 核對、定位、三態、JSON Demo owned 與實際玩家擁有區別、舊存檔遷移、類型占位、保留世界地圖。
- CI 成功不能替代真正的 Chrome／Safari 觸控及圖像逐像素目視驗收。

## 下一批 v0.8.39（請勿超前實作）
- 原型專用逐件購入／隨機排序／清空／一鍵滿配、建設淡入，以及購買操作寫入存檔；不在此批偷偷加入正式材料消耗。
