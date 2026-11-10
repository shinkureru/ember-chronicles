import type { ActionChoice } from '../game/types';
import type { SoundCue } from './sound';
/** Use a distinct foley cue for each narrative action, not only button taps. */
export const getActionSoundCue=(action:ActionChoice):SoundCue=>{
 if(action.attackCardId)return 'impact';
 if(['npcGear','pockets','alley_pockets','alley_bag'].includes(action.lootSource??''))return 'searchCloth';
 if(['desk','alley_wall'].includes(action.lootSource??''))return 'searchPaper';
 if(['shelves','alley_bin'].includes(action.lootSource??''))return 'searchTools';
 if(action.tags.includes('run'))return 'runFast';
 if(action.tags.includes('sneak'))return 'sneakStep';
 if(action.tags.includes('talk'))return 'dialogue';
 if(action.tags.includes('search'))return 'searchPaper';
 if(action.tags.includes('observe'))return 'inspect';
 return 'confirm';
};
