# 程式資料結構（Prototype v0.1）

## 檔案與擴充位置

- `src/game/types/index.ts`：核心 TypeScript 型別。**改資料結構從此檔開始**。
- `src/game/data/attributes.ts`：18 種永久屬性名稱及初始值。
- `src/game/data/professions.ts`：職業定義、職業資源及被動描述。
- `src/game/data/cards.ts`：技能卡、行動標籤、費用、升級材料。
- `src/game/data/items.ts`：物品型別、重量、NPC 持有物及搜查掉落池。
- `src/game/data/scenes.ts`：各章節資料的註冊／導出入口。
- `src/game/data/chapters/ch01-warehouse/scenes.ts`：第一章的劇情節點與行動選項；新章節新增自己的資料夾。
- `src/game/engine/rules.ts`：**純函式計算**；成功率、負重、時間、可見選項、技能可用性。
- `src/game/engine/resolve.ts`：唯一的玩家行動結算入口 `gameReducer`。
- `src/game/state/initial.ts`：新遊戲初始世界資料。
- `src/game/state/storage.ts`：版本化本地自動存檔。

## UI 邊界

UI 不能自行寫一套成功率公式。需要成功率的地方直接呼叫 `calculateActionPreview(state, choice, skillId)`。

行動真正結算則呼叫 `dispatch({ type: 'CHOOSE', choiceId, skillId })`。

藉此確保卡牌強化後的成功率與消耗數值，在畫面顯示和實際執行間保持一致。

## 遊戲事件模型（縮寫）

```ts
interface ActionChoice {
  id: string;
  title: string;
  thought: string;    // 主角第一人稱內心 OS
  detail: string;     // 風險與行動說明
  tags: ActionTag[];  // talk / observe / run / search ...
  baseChance: number;
  staminaCost: number;
  courageDelta: number;
  minutes: number;
  successScene?: SceneId;
  failureScene?: SceneId;
  successOutcome?: Outcome;
  failureOutcome?: Outcome;
  lootSource?: string;
}
```

## 擴充注意

- 現在的場景屬單章節有限圖（typed scene IDs）。新增章節時應擴成 `chapterId + sceneId` 的命名空間。
- NPC 現有單一示範資料物件；多 NPC 時改為 `Record<NpcId, NpcState>`，每人持有個別記憶、行程、物品。
- 原型 `rngSeed` 由存檔控制，保持可重現測試。
- 存檔若修改欄位必須提升 `version` 並編寫 migration，不應直接把舊存檔默默當成新版本。
- 目前失敗新線索有固定陣列加唯一失敗次數；正式版須替換為依據 NPC 行為的「內容合理的新情報」，避免只換編號。
