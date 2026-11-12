import type {GameState} from '../types';

export type RestServiceId='rest_cot'|'rest_private'|'rest_short';
export const isRestService=(id:string):id is RestServiceId=>['rest_cot','rest_private','rest_short'].includes(id);

const recoveryAt=(state:GameState,id:RestServiceId,stamina:number):number=>{
 const p=state.player,max=Math.max(1,p.maxStamina);
 const missingRatio=1-Math.max(0,Math.min(max,stamina))/max;
 const factor=id==='rest_private'?(.22+.78*missingRatio):id==='rest_short'?(.08+.35*missingRatio):(.15+.70*missingRatio);
 return Math.max(id==='rest_short'?0:1,Math.floor(p.maxHealth*factor));
};

/** One pure prediction for both the dialog and reducer, based on the stamina *ratio*,
 * so future 30-ST / 10-HP builds do not break the curve. */
export const previewInnRest=(state:GameState,id:RestServiceId)=>{
 const p=state.player;
 const healthGain=Math.min(p.maxHealth-p.health,recoveryAt(state,id,p.stamina));
 const staminaGain=Math.min(p.maxStamina-p.stamina,
  id==='rest_short'?Math.max(1,Math.ceil(p.maxStamina*.4)):p.maxStamina);
 const predictedHealth=p.health+healthGain, predictedStamina=p.stamina+staminaGain;
 const threshold=Array.from({length:Math.floor(p.stamina)+1},(_,i)=>Math.floor(p.stamina)-i)
  .find(stamina=>p.health+recoveryAt(state,id,stamina)>=p.maxHealth);
 const recommendation=predictedHealth>=p.maxHealth?
  '目前這個休息方案已經能讓生命回到上限，無須刻意消耗體力。':
  threshold!==undefined?`體力降到 ${threshold}/${p.maxStamina} 以下再休息，才有機會一次恢復滿血。`:
  '即使體力降到 0，這個方案也無法一次恢復滿血；可考慮安靜單人房或地下診所。';
 return {predictedHealth,predictedStamina,healthGain,staminaGain,threshold,recommendation};
};
export const remainingDailyRest=(state:GameState)=>{
 const town=state.town;
 return Math.max(0,2-(town?.lastRestDay===state.world.day?(town.restsToday??0):0));
};
