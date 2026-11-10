/** Authored minor-key procedural motifs: every note is original to this project. */
export type SoundscapeId = 'map'|'town'|'market'|'warehouse'|'gate'|'survey'|'inside'|'confrontation'|'loot'|'result'|'sewer'|'silence'|'alley_gate'|'alley_survey'|'alley_inside'|'alley_confrontation'|'alley_loot';
export interface SoundscapePreset {
  title:string;
  tonic:number;
  tension:number;
  texture:'wind'|'industrial'|'rain'|'drips'|'hush';
  beat:number;
  /** Semitone offsets from tonic, null = a rest. 8 steps per loop. */
  melody:(number|null)[];
}
export const SOUNDSCAPES:Record<SoundscapeId,SoundscapePreset>={
  map:{title:'被遺棄的城區',tonic:49,tension:.42,texture:'wind',beat:1.05,melody:[0,null,3,7,5,null,2,-2]},
  town:{title:'暫時安全的據點',tonic:55,tension:.28,texture:'hush',beat:1.20,melody:[0,3,7,5,3,null,-2,null]},
  market:{title:'地下交易',tonic:46.25,tension:.57,texture:'industrial',beat:.86,melody:[0,1,6,null,3,1,-2,null]},
  warehouse:{title:'舊物流站',tonic:49,tension:.60,texture:'industrial',beat:.93,melody:[0,null,6,3,1,null,-2,0]},
  gate:{title:'倉庫外圍',tonic:49,tension:.52,texture:'wind',beat:1.02,melody:[0,3,null,1,7,6,3,null]},
  survey:{title:'無人走廊',tonic:46.25,tension:.61,texture:'industrial',beat:.86,melody:[0,null,-2,1,6,null,3,1]},
  inside:{title:'陰暗的倉庫',tonic:43.65,tension:.65,texture:'drips',beat:.90,melody:[0,3,6,3,null,1,-2,null]},
  confrontation:{title:'對峙與心跳',tonic:41.2,tension:.89,texture:'industrial',beat:.65,melody:[0,1,6,5,1,0,-2,null]},
  loot:{title:'倉庫搜刮',tonic:46.25,tension:.72,texture:'drips',beat:.79,melody:[0,3,null,6,5,1,0,null]},
  result:{title:'灰燼之後',tonic:55,tension:.25,texture:'hush',beat:1.22,melody:[0,3,7,null,5,3,0,null]},
  sewer:{title:'下水道 · 預留場景',tonic:43.65,tension:.78,texture:'drips',beat:.77,melody:[0,null,1,6,3,null,-2,1]},
  alley_gate:{title:'後巷・路燈下的聲音',tonic:43.65,tension:.68,texture:'rain',beat:.91,melody:[0,2,3,null,-2,5,6,1]},
  alley_survey:{title:'後巷・濕透的痕跡',tonic:49,tension:.71,texture:'drips',beat:.87,melody:[0,1,6,3,2,null,-2,1]},
  alley_inside:{title:'後巷・無法相信的證詞',tonic:46.25,tension:.76,texture:'hush',beat:.74,melody:[0,6,5,1,3,null,-1,2]},
  alley_confrontation:{title:'後巷・被追逐的脈搏',tonic:41.2,tension:.98,texture:'industrial',beat:.48,melody:[0,1,6,0,5,3,1,-2]},
  alley_loot:{title:'後巷・最後證物',tonic:46.25,tension:.55,texture:'drips',beat:.95,melody:[0,3,null,6,5,null,2,0]},
  silence:{title:'安靜',tonic:55,tension:0,texture:'hush',beat:1.2,melody:[null,null,null,null,null,null,null,null]},
};
