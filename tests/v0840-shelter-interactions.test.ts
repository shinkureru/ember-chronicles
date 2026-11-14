import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {getWarehouseFurnitureLayers,getWarehouseVisualMode,WAREHOUSE_LAYOUT,WAREHOUSE_STAGE,SHELTER_FURNITURE_IDS} from '../src/game/engine/shelterVisuals';
import {clientToStagePoint,stagePointToFurniturePixel,pickWarehouseFurniture,SHELTER_FACILITIES,
 makeDemoShelterAttention,enqueueShelterAttention,dismissShelterAttention,availableShelterAttention} from '../src/game/engine/shelterInteractions';
import {sampleFurnitureAlpha,furnitureMarkerOnStage,SHELTER_ALPHA_THRESHOLD} from '../src/features/shelter/shelterAlphaHit';
import ShelterScene from '../src/features/shelter/ShelterScene';
import type {ShelterFurnitureId} from '../src/game/types';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

describe('v0.8.40 — real-alpha selectable furniture and non-destructive hint foundations',()=>{
 it('projects desktop/mobile click positions to the same 768×1376 designer-authored coordinates',()=>{
  const stage={width:768,height:1376};
  expect(clientToStagePoint({x:192,y:344},{left:0,top:0,width:384,height:688},stage)).toEqual({x:384,y:688});
  expect(clientToStagePoint({x:100,y:200},{left:4,top:28,width:192,height:344},stage)).toEqual({x:384,y:688});
  expect(clientToStagePoint({x:500,y:99},{left:100,top:20,width:400,height:200},stage)).toEqual({x:768,y:543.52});
  expect(clientToStagePoint({x:99,y:200},{left:100,top:20,width:400,height:200},stage)).toBeNull();
  expect(clientToStagePoint({x:110,y:210},{left:100,top:20,width:0,height:200},stage)).toBeNull();
  expect(WAREHOUSE_STAGE).toEqual(stage);
 });
 it('uses original negative designer offsets and actual image size with no clamping or retiming',()=>{
  const bed=getWarehouseFurnitureLayers(['bed'])[0]!;
  const cooking=getWarehouseFurnitureLayers(['cooking'])[0]!;
  expect(bed.x).toBe(-23);
  expect(cooking.x).toBe(-52);
  expect([cooking.width,cooking.height,cooking.scale]).toEqual([914,1225,.4]);
  expect(stagePointToFurniturePixel({x:bed.x+bed.scale*100,y:bed.y+bed.scale*250},bed))
   .toEqual({x:100,y:250});
  expect(stagePointToFurniturePixel({x:bed.x-1,y:bed.y},bed)).toBeNull();
  expect(stagePointToFurniturePixel({x:bed.x+bed.width*bed.scale+1,y:bed.y},bed)).toBeNull();
  expect(WAREHOUSE_LAYOUT.assets.bed.x).toBe(-23);
 });
 it('inverts image rotation correctly; bounding-box alone does NOT count as a furniture hit',()=>{
  const ref=getWarehouseFurnitureLayers(['bed'])[0]!;
  const rotated={...ref,rotation:90,scale:1,x:10,y:20,width:100,height:80};
  const pixel=stagePointToFurniturePixel({x:10-20,y:20+30},rotated)!;
  expect(pixel.x).toBeCloseTo(30);
  expect(pixel.y).toBeCloseTo(20);
  expect(stagePointToFurniturePixel({x:1000,y:1000},rotated)).toBeNull();
  const alpha=(id:ShelterFurnitureId,x:number,y:number)=>id==='bed'&&x>=25&&x<40&&y>=15&&y<30;
  expect(pickWarehouseFurniture({x:-10,y:50},[rotated],alpha)).toBe('bed');
  expect(pickWarehouseFurniture({x:10,y:20},[rotated],alpha)).toBeNull();
 });
 it('treats transparent pixels as empty and prioritizes the frontmost overlapping furniture',()=>{
  const base=getWarehouseFurnitureLayers(['computer'])[0]!;
  const high={...base,id:'board' as const,z:base.z+10};
  const low={...base,id:'bed' as const,z:base.z-10};
  const point={x:base.x+base.scale*40,y:base.y+base.scale*40};
  expect(pickWarehouseFurniture(point,[low,high],()=>false)).toBeNull();
  expect(pickWarehouseFurniture(point,[low,high],id=>id==='bed')).toBe('bed');
  expect(pickWarehouseFurniture(point,[low,high],()=>true)).toBe('board');
  const before=[low,high].map(l=>l.id);
  pickWarehouseFurniture(point,[low,high],()=>true);
  expect([low,high].map(l=>l.id)).toEqual(before);
 });
 it('samples pre-decoded PNG alpha with no rectangular fallback and rejects faint transparent shadows',()=>{
  const mask={
   width:400,height:400,sampleWidth:4,sampleHeight:4,
   centroid:{x:180,y:200},
   alpha:Uint8Array.from([0,0,0,0, 0,95,96,0, 0,255,128,0, 0,0,0,0])
  };
  expect(SHELTER_ALPHA_THRESHOLD).toBe(96);
  expect(sampleFurnitureAlpha(mask,125,125)).toBe(false);
  expect(sampleFurnitureAlpha(mask,225,125)).toBe(true);
  expect(sampleFurnitureAlpha(mask,125,225)).toBe(true);
  expect(sampleFurnitureAlpha(mask,399,399)).toBe(false);
  expect(sampleFurnitureAlpha(mask,-1,10)).toBe(false);
  expect(sampleFurnitureAlpha(mask,400,10)).toBe(false);
  const bed=getWarehouseFurnitureLayers(['bed'])[0]!;
  const center=furnitureMarkerOnStage(bed,mask);
  expect(center).toEqual({x:-23+180*.205,y:695+200*.205});
 });
 it('defines an accessible facility panel for all eight owned furniture without speculative permanent effects',()=>{
  expect(Object.keys(SHELTER_FACILITIES)).toEqual([...SHELTER_FURNITURE_IDS]);
  expect(SHELTER_FACILITIES.computer.future).toContain('隱藏通訊');
  expect(SHELTER_FACILITIES.computer.notice).toContain('尚未決定');
  expect(SHELTER_FACILITIES.workbench.future).toContain('修理');
  expect(SHELTER_FACILITIES.board.future).toContain('線索');
  expect(SHELTER_FACILITIES.generator.future).toContain('電力');
  const ui=read('src/features/shelter/ShelterFacilityPanel.tsx');
  expect(ui).toContain('aria-label="關閉設施資訊"');
  expect(ui).toContain('onClose');
  expect(ui).toContain('功能預留');
 });
 it('hint queue deduplicates, supports skip/next/dismiss, and suppresses unowned furniture',()=>{
  const tutorial=makeDemoShelterAttention('tutorial');
  const quest=makeDemoShelterAttention('quest');
  const ready=makeDemoShelterAttention('ready');
  expect([tutorial.targetId,quest.targetId,ready.targetId]).toEqual(['board','computer','workbench']);
  let queue=enqueueShelterAttention([],tutorial);
  queue=enqueueShelterAttention(queue,quest);
  queue=enqueueShelterAttention(queue,quest);
  queue=enqueueShelterAttention(queue,ready);
  expect(queue.map(x=>x.id)).toEqual(['demo:tutorial','demo:quest','demo:ready']);
  expect(availableShelterAttention(queue,['computer'])).toEqual([quest]);
  expect(availableShelterAttention(queue,[])).toEqual([]);
  queue=dismissShelterAttention(queue,tutorial.id);
  expect(queue[0]).toBe(quest);
  queue=dismissShelterAttention(queue,quest.id);
  expect(queue).toEqual([ready]);
 });
 it('keeps full scene as clean JPEG and adds focusable, accessible markers for every owned item',()=>{
  const all=[...SHELTER_FURNITURE_IDS];
  expect(getWarehouseVisualMode(all)).toBe('full');
  const props={owned:all,onSelect:(_id:ShelterFurnitureId)=>{}};
  const markup=renderToStaticMarkup(createElement(ShelterScene,{...props,selectedId:'computer',attentionId:'board'}));
  expect(markup).toContain('background_full.jpg');
  expect(markup).not.toContain('shelter-scene__furniture"');
  expect((markup.match(/data-furniture-marker=/g)||[])).toHaveLength(8);
  expect(markup).toContain('查看已建設的電腦桌');
  expect(markup).toContain('shelter-scene__aura--attention');
  expect(markup).toContain('aria-pressed="true"');
  const partial=renderToStaticMarkup(createElement(ShelterScene,{owned:['computer','bed'],onSelect:()=>{}}));
  expect(partial).toContain('background_empty.jpg');
  expect((partial.match(/data-furniture-marker=/g)||[])).toHaveLength(2);
  const empty=renderToStaticMarkup(createElement(ShelterScene,{owned:[],onSelect:()=>{}}));
  expect(empty).not.toContain('data-furniture-marker');
 });
 it('renders a gentle mask-based silhouette instead of changing the artist JPG or PNG coordinates',()=>{
  const scene=read('src/features/shelter/ShelterScene.tsx');
  expect(scene).toContain('maskImage:');
  expect(scene).toContain('WebkitMaskImage:');
  expect(scene).toContain('clientToStagePoint');
  expect(scene).toContain('pickWarehouseFurniture');
  expect(scene).toContain('loadShelterAlphaMasks');
  expect(scene).toContain('event.stopPropagation()');
  const client=read('src/features/shelter/shelterAlphaHit.ts');
  expect(client).toContain('getImageData');
  expect(client).toContain("SHELTER_ALPHA_THRESHOLD=96");
  expect(client).toContain('MAX_MASK_WIDTH=384');
  expect(client).toContain('naturalWidth');
  const style=read('src/styles/_v0840-shelter-interactions.scss');
  expect(style).toContain('shelter-aura-breathe 2.8s');
  expect(style).toContain('prefers-reduced-motion:reduce');
  expect(style).toContain('max-width:360px');
  expect(read('src/styles/main.scss').trimEnd()).toMatch(/@import "v0840-shelter-interactions";$/);
 });
 it('provides a cancellable three-kind notification demo only for actually installed furniture',()=>{
  const ui=read('src/features/shelter/ShelterAttentionPanel.tsx');
  const home=read('src/features/shelter/ShelterHomePage.tsx');
  expect(ui).toContain('disabled={!installed}');
  expect(ui).toContain('onDismiss');
  expect(ui).toContain('onInspect');
  expect(ui).toContain('data-prototype-only="true"');
  expect(home).toContain('<ShelterAttentionPanel owned={owned}');
  expect(home).toContain('<ShelterFacilityPanel id={activeSelected}');
  expect(home).toContain('queue');
  expect(home).toContain('setQueue');
  expect(home).toContain('onSelect={selectFurniture}');
  expect(home).toContain("shelterId==='warehouse'||previewWarehouse");
  expect(home).toContain('const activeSelected=selectedId&&owned.includes(selectedId)?selectedId:null');
  expect(JSON.parse(read('package.json')).version).toBe('0.8.40');
  expect(JSON.parse(read('package-lock.json')).packages[''].version).toBe('0.8.40');
 });
});
