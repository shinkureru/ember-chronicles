import type { ActionChoice } from '../game/types';
import type { SoundCue } from './sound';
/** Use a distinct foley cue for each narrative action, not only button taps. */
export const getActionSoundCue=(action:ActionChoice):SoundCue=>{
 if(action.attackCardId)return 'impact';
 if(action.lootSource==='npcGear'||action.lootSource==='pockets')return 'searchCloth';
 if(action.lootSource==='desk')return 'searchPaper';
 if(action.lootSource==='shelves')return 'searchTools';
 if(action.tags.includes('run'))return 'runFast';
 if(action.tags.includes('sneak'))return 'sneakStep';
 if(action.tags.includes('talk'))return 'dialogue';
 if(action.tags.includes('search'))return 'searchPaper';
 if(action.tags.includes('observe'))return 'inspect';
 return 'confirm';
};
