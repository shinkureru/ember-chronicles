import {describe,it,expect} from 'vitest';
import { CARD_LIBRARY_PAGE_SIZE,WAREHOUSE_PAGE_SIZE,CHAPTER_ACTION_PAGE_SIZE } from '../src/game/data/uiConfig';
import { CARDS } from '../src/game/data/cards';
import { CARD_LORE } from '../src/game/data/cardLore';
import { AMBIENT_THOUGHTS, getAmbientThoughts } from '../src/game/data/ambientThoughts';
describe('v0.4 content/UI contracts',()=>{
 it('keeps card grid 3x4, warehouse list 15, three action choices',()=>{
   expect(CARD_LIBRARY_PAGE_SIZE).toBe(12);
   expect(WAREHOUSE_PAGE_SIZE).toBe(15);
   expect(CHAPTER_ACTION_PAGE_SIZE).toBe(3);
 });
 it('provides a story and acquisition source for every card',()=>{
   for(const id of Object.keys(CARDS)){
     expect(CARD_LORE[id]?.story.length).toBeGreaterThan(15);
     expect(CARD_LORE[id]?.acquisition.length).toBeGreaterThan(8);
   }
 });
 it('provides at least 100 authored first-person atmospheric lines',()=>{
   expect(Object.values(AMBIENT_THOUGHTS).flat().length).toBeGreaterThanOrEqual(100);
   for(const [id,entries] of Object.entries(AMBIENT_THOUGHTS)){
     expect(entries.length).toBeGreaterThanOrEqual(20);
     expect(getAmbientThoughts(id as keyof typeof AMBIENT_THOUGHTS,2,960).length).toBe(6);
   }
 });
});
