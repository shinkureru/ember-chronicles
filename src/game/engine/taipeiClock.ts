/** Device wall clock mapped into the Asia/Taipei civil calendar.
 * The numeric day is the UTC ordinal of Taipei's local calendar date.
 * No gameplay action is permitted to advance or pause this calendar.
 */
export const TAIPEI_TIME_ZONE='Asia/Taipei';
export const REALTIME_CLOCK_REFRESH_MS=1000;
const DAY_MS=86400000;
const formatter=new Intl.DateTimeFormat('en-US',{
 timeZone:TAIPEI_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit',
 hour:'2-digit',minute:'2-digit',hourCycle:'h23'
});
export interface TaipeiClock {day:number;minute:number}
export function getTaipeiClock(nowMs:number=Date.now()):TaipeiClock{
 if(!Number.isFinite(nowMs))throw new RangeError('Invalid timestamp');
 const parts=Object.fromEntries(formatter.formatToParts(new Date(nowMs))
  .filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
 const {year,month,day,hour,minute}=parts;
 if(!year||!month||!day||hour===undefined||minute===undefined)throw Error('Taipei time unavailable');
 return {day:Math.floor(Date.UTC(year,month-1,day)/DAY_MS),minute:hour*60+minute};
}
export function taipeiDate(day:number):string{
 if(!Number.isInteger(day)||day<0)return '日期未提供';
 return new Date(day*DAY_MS).toISOString().slice(0,10).replace(/-/g,'/');
}
