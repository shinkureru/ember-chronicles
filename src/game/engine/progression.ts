import type {AttributeId,GameState,LevelProgression} from '../types';

/**
 * XP is earned for a committed gameplay event, not UI clicks or world-clock ticks.
 * A repeated action has no XP reward on the same Taipei calendar day. The daily 120 XP
 * ceiling is an extra safeguard against clever mixtures of repeated services.
 */
export const makeInitialProgression=():LevelProgression=>({level:1,xp:0,totalXp:0,points:0,dailyAwards:{}});
export const xpNeededForLevel=(level:number)=>40+Math.max(0,level-1)*20;
export const DAILY_XP_CAP=120;
export const getProgression=(s:GameState):LevelProgression=>s.progression??makeInitialProgression();
export const awardExperience=(s:GameState,key:string,amount:number):number=>{
 if(!Number.isFinite(amount)||amount<=0||!key)return 0;
 const p=s.progression??(s.progression=makeInitialProgression());
 const day=s.world.day;
 const dailyKey=`${day}:${key}`;
 if(p.dailyAwards[dailyKey]!==undefined)return 0;
 const earnedToday=Object.entries(p.dailyAwards).reduce((acc,[event,xp])=>event.startsWith(`${day}:`)?acc+xp:acc,0);
 const given=Math.max(0,Math.min(Math.floor(amount),DAILY_XP_CAP-earnedToday));
 p.dailyAwards[dailyKey]=given;
 if(given===0)return 0;
 p.totalXp+=given;p.xp+=given;
 while(p.xp>=xpNeededForLevel(p.level)){
  p.xp-=xpNeededForLevel(p.level);
  p.level++;p.points++;
 }
 // Prevent save bloat while preserving the current week's duplicate protection.
 for(const event of Object.keys(p.dailyAwards)){
  const eventDay=Number(event.split(':')[0]);
  if(Number.isFinite(eventDay)&&eventDay<day-7)delete p.dailyAwards[event];
 }
 return given;
};
export const allocatePoint=(s:GameState,id:AttributeId):boolean=>{
 const p=s.progression;
 if(s.mode!=='home'||!p||p.points<1||!Object.hasOwn(s.player.attributes,id)||s.player.attributes[id]>=20)return false;
 p.points--;
 s.player.attributes[id]++;
 if(id==='maxHealth'){s.player.maxHealth++;s.player.health=Math.min(s.player.maxHealth,s.player.health+1);}
 if(id==='maxStamina'){s.player.maxStamina++;s.player.stamina=Math.min(s.player.maxStamina,s.player.stamina+1);}
 return true;
};
