import { describe,it,expect } from 'vitest';
import { SOUNDSCAPES } from '../src/audio/soundscapes';
describe('soundscape presets',()=>{
 it('covers current chapter scenes',()=>{
  for(const scene of ['gate','survey','inside','confrontation','loot','map','result'] as const){
   expect(SOUNDSCAPES[scene].beat).toBeGreaterThan(0);
   expect(SOUNDSCAPES[scene].tonic).toBeGreaterThan(20);
   expect(SOUNDSCAPES[scene].melody.length).toBe(8);
   expect(SOUNDSCAPES[scene].melody.some(n=>n!==null)).toBe(true);
  }
 });
 it('provides a future sewer drip and echo theme',()=>{
  expect(SOUNDSCAPES.sewer.texture).toBe('drips');
 });
});
