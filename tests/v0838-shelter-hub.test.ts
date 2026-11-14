import {afterEach,describe,expect,it,vi} from 'vitest';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {makeInitialState} from '../src/game/state/initial';
import {gameReducer} from '../src/game/engine/resolve';
import {loadGame,saveGame} from '../src/game/state/storage';
import {WAREHOUSE_LAYOUT,WAREHOUSE_FURNITURE_IDS,FURNITURE_IMAGE_SIZES,WAREHOUSE_BACKGROUNDS,visibleWarehouseLayers,warehouseSceneMode,sanitizeShelterFurniture} from '../src/game/data/shelter';
const text=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const binary=(p:string)=>readFileSync(new URL('../'+p,import.meta.url));
const sha256=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const EXPECTED_ART_SHA={
 'background_empty.jpg':'582daa21c4902c4387fdc49f425441fed1491b557f0b4594c13ff3cc2cd1309a',
 'background_full.jpg':'8fe210d75125a343f59964f965194c7508a5fdf66fbdff27f439595d2e4aadb5',
 'bed.png':'e525c82d0f06b4000a9111d74eeb6e7609e72903efe1457355f277b52f18944f',
 'storage.png':'b3d36454e404677f36deda1ab855820a4b7fc933757e26d39aff12b3715c3af4',
 'workbench.png':'50e0bce6da084ed8e2f91f6ac5b1366528c556d67fa60d322732b9e9efa4ee40',
 'radio.png':'419126cff120eb7b71769d6dcdb6ad3627ac26acc8b7445043c5cd7997aa42c2',
 'board.png':'620f5b6a7f1cbb93a1f4c13057569e4dbb38b70492f6ecdf24ebb4e525dc8f03',
 'generator.png':'a8c2c018817c4f347fe1acc26dc4a0e6868856e3a20a05aacb24304061336faf',
 'cooking.png':'34313802346f1b098e8c309631f940671eef0cd4b42a2d5ceef5d943bd92b511',
 'computer.png':'1ba16a0797c8b6ccbe5f14d01d1051bf03aaa9c078fec854165f980c7375037a',
};
afterEach(()=>vi.unstubAllGlobals());
describe('v0.8.38: exact user artwork, scene selection and shelter home',()=>{
 it('imports all ten original images byte-for-byte, with original PNG size and RGBA transparency',()=>{
  for(const [name,sha] of Object.entries(EXPECTED_ART_SHA)){
   const data=binary('public/assets/shelter/warehouse/'+name);
   expect(sha256(data),name).toBe(sha);
   expect(data.length).toBeGreaterThan(100000);
   if(name.endsWith('.png')){
    expect(data.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(data[25],name).toBe(6);
    const k=name.slice(0,-4) as keyof typeof FURNITURE_IMAGE_SIZES;
    expect([data.readUInt32BE(16),data.readUInt32BE(20)],name).toEqual([FURNITURE_IMAGE_SIZES[k].width,FURNITURE_IMAGE_SIZES[k].height]);
   }
  }
 });
 it('keeps the designer 768x1376 layout and original negative positions without guessing',()=>{
  expect(WAREHOUSE_LAYOUT.schema).toBe('ember-shelter-layout-v3');
  expect(WAREHOUSE_LAYOUT.stage).toEqual({width:768,height:1376});
  expect(WAREHOUSE_FURNITURE_IDS).toHaveLength(8);
  expect(WAREHOUSE_LAYOUT.assets.bed).toMatchObject({x:-23,y:695,scale:.205,z:20,rotation:0,opacity:1});
  expect(WAREHOUSE_LAYOUT.assets.storage).toMatchObject({x:135,y:547,scale:.274,z:10});
  expect(WAREHOUSE_LAYOUT.assets.workbench).toMatchObject({x:327,y:631,scale:.23,z:30});
  expect(WAREHOUSE_LAYOUT.assets.radio).toMatchObject({x:0,y:543,scale:.655,z:40});
  expect(WAREHOUSE_LAYOUT.assets.board).toMatchObject({x:576,y:572,scale:.22,z:15});
  expect(WAREHOUSE_LAYOUT.assets.generator).toMatchObject({x:504,y:738,scale:.155,z:50});
  expect(WAREHOUSE_LAYOUT.assets.cooking).toMatchObject({x:-52,y:789,scale:.4,z:60});
  expect(WAREHOUSE_LAYOUT.assets.computer).toMatchObject({x:442,y:736,scale:.425,z:70});
  expect(FURNITURE_IMAGE_SIZES.cooking).toEqual({width:914,height:1225});
  expect(WAREHOUSE_BACKGROUNDS).toEqual({empty:'background_empty.jpg',complete:'background_full.jpg'});
  const raw=JSON.parse(text('src/game/data/warehouse-shelter-layout.json'));
  expect(raw.assets).toEqual(WAREHOUSE_LAYOUT.assets);
  expect(raw.purchaseOrder).toEqual(['radio','bed','board','computer','storage','workbench','cooking','generator']);
 });
 it('chooses empty photo at 0, calibrated layers at 1-7 and full photo at 8 even with duplicates',()=>{
  const ids=[...WAREHOUSE_FURNITURE_IDS];
  expect(warehouseSceneMode([])).toBe('empty');
  for(let n=1;n<8;n++)expect(warehouseSceneMode(ids.slice(0,n))).toBe('layers');
  expect(warehouseSceneMode(ids)).toBe('complete');
  expect(warehouseSceneMode([...ids,'bed','fake'])).toBe('complete');
  expect(warehouseSceneMode(['fake','fake'])).toBe('empty');
  expect(warehouseSceneMode(['unknown',...ids.slice(0,7)])).toBe('layers');
  expect(visibleWarehouseLayers([])).toEqual([]);
 });
 it('renders same z-order regardless of the order the player bought furniture',()=>{
  const a=visibleWarehouseLayers(['computer','bed','board','radio','workbench']);
  const b=visibleWarehouseLayers(['workbench','radio','computer','board','bed']);
  expect(a).toEqual(b);
  expect(a.map(x=>x.id)).toEqual(['board','bed','workbench','radio','computer']);
  expect(a.find(x=>x.id==='bed')).toMatchObject({x:-23,y:695,scale:.205,width:1200,height:896});
  expect(a.find(x=>x.id==='computer')).toMatchObject({x:442,y:736,scale:.425,width:768,height:1376});
 });
 it('sanitizes malformed owned-list values and duplicate IDs without changing positions',()=>{
  expect(sanitizeShelterFurniture(null)).toEqual([]);
  expect(sanitizeShelterFurniture('all')).toEqual([]);
  expect(sanitizeShelterFurniture([{},99,'bed','bed','fake','computer',null,'radio'])).toEqual(['bed','computer','radio']);
  expect(visibleWarehouseLayers(['fake','bed','bed','computer']).map(x=>x.id)).toEqual(['bed','computer']);
 });
 it('persists empty furniture on old saves while retaining quest/NPC/coins/profession',()=>{
  const old=makeInitialState('courier');
  old.onboarding={phase:'complete',storyPage:2,tutorialStep:2,shelter:'bunker'};
  old.economy.coins=2301;old.player.hunger=81;old.npc.trust=96;
  old.chapterProgress.unlocked=2;old.warehouse.wrench=9;old.attempt=12;
  const parsed=JSON.parse(JSON.stringify(old)) as Record<string,unknown>;
  delete parsed.shelterFurniture;
  const db=new Map([['ember-chronicles-prototype-v1',JSON.stringify(parsed)]]);
  vi.stubGlobal('localStorage',{getItem:(k:string)=>db.get(k)??null,setItem:(k:string,v:string)=>db.set(k,v)});
  const migrated=loadGame();
  expect(migrated.shelterFurniture).toEqual([]);
  expect(migrated.onboarding.shelter).toBe('bunker');
  expect(migrated.economy.coins).toBe(2301);
  expect(migrated.player.hunger).toBe(81);
  expect(migrated.npc.trust).toBe(96);
  expect(migrated.chapterProgress.unlocked).toBe(2);
  expect(migrated.warehouse.wrench).toBe(9);
  expect(migrated.attempt).toBe(12);
  expect(saveGame(migrated)).toBe(true);
  expect(loadGame().shelterFurniture).toEqual([]);
 });
 it('does not wipe previously owned furniture or the chosen shelter when picking a profession',()=>{
  const s=makeInitialState();
  s.onboarding={phase:'complete',storyPage:2,tutorialStep:2,shelter:'warehouse'};
  s.shelterFurniture=['computer','bed'];
  const next=gameReducer(s,{type:'SELECT_PROFESSION',profession:'journalist'});
  expect(next.profession).toBe('journalist');
  expect(next.shelterFurniture).toEqual(['computer','bed']);
  expect(next.onboarding.shelter).toBe('warehouse');
 });
 it('keeps apartment/bunker as art placeholders, leaves the chapter engine on its own test route',()=>{
  const home=text('src/features/chapter/HomePage.tsx');
  const scene=text('src/features/shelter/ShelterScene.tsx');
  const app=text('src/app/App.tsx');
  expect(home).toContain('<ShelterScene shelter={state.onboarding.shelter}');
  expect(home).toContain('<Hud/>');
  expect(home).not.toContain('<ChapterMapPage');
  expect(scene).toContain("if(shelter!=='warehouse')");
  expect(scene).toContain('場景美術待製作，暫不使用倉庫圖片替代');
  expect(scene).toContain("mode==='complete'?WAREHOUSE_BACKGROUNDS.complete:WAREHOUSE_BACKGROUNDS.empty");
  expect(scene).toContain("mode==='layers'?visibleWarehouseLayers(safeOwned):[]");
  expect(scene).toContain('import.meta.env.BASE_URL+WAREHOUSE_ASSET_ROOT');
  expect(scene).toContain('top:(layer.y/stage.height*100)');
  expect(scene).toContain('left:(layer.x/stage.width*100)');
  expect(scene).toContain('width:(layer.width*layer.scale/stage.width*100)');
  expect(app).toContain('path="/world-map"');
  expect(app).toContain('path="/profession"');
  expect(app).toContain('path="/chapter"');
  expect(app).toContain('path="/town"');
  expect(app).toContain('path="/black-market"');
  expect(app).toContain("if(state.mode!=='home'&&location.pathname!=='/chapter')");
  expect(text('src/features/world-map/ChapterMapPage.tsx')).toContain("dispatch({type:'SELECT_STAGE',stageId:sequence");
  expect(text('src/styles/_v0838-shelter-hub.scss')).toContain('aspect-ratio:768/1376');
  expect(text('src/styles/_v0838-shelter-hub.scss')).toContain('prefers-reduced-motion:reduce');
  expect(text('src/styles/main.scss').trimEnd()).toMatch(/@import "v0838-shelter-hub";$/);
  expect(JSON.parse(text('package.json')).version).toBe('0.8.38');
  expect(JSON.parse(text('package-lock.json')).packages[''].version).toBe('0.8.38');
 });
});
