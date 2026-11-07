/** All cues here are synthesized in real time; no sampled third-party audio. */
export type SoundscapeId = 'map' | 'town' | 'market' | 'warehouse' | 'gate' | 'survey' | 'inside' | 'confrontation' | 'loot' | 'result' | 'sewer' | 'silence';
export interface SoundscapePreset { title:string; tonic:number; tension:number; texture:'wind'|'industrial'|'rain'|'drips'|'hush'; beat:number; }
export const SOUNDSCAPES:Record<SoundscapeId,SoundscapePreset> = {
  map:{title:'被遺棄的城區',tonic:48.999,tension:.42,texture:'wind',beat:11},
  town:{title:'暫時安全的據點',tonic:55,tension:.28,texture:'hush',beat:14},
  market:{title:'地下交易',tonic:46.249,tension:.57,texture:'industrial',beat:9},
  warehouse:{title:'舊物流站',tonic:49,tension:.60,texture:'industrial',beat:8},
  gate:{title:'倉庫外圍',tonic:49,tension:.52,texture:'wind',beat:10},
  survey:{title:'無人走廊',tonic:46.249,tension:.61,texture:'industrial',beat:8},
  inside:{title:'陰暗的倉庫',tonic:43.65,tension:.65,texture:'drips',beat:7},
  confrontation:{title:'對峙與心跳',tonic:41.2,tension:.89,texture:'industrial',beat:4},
  loot:{title:'倉庫搜刮',tonic:46.249,tension:.72,texture:'drips',beat:6},
  result:{title:'灰燼之後',tonic:55,tension:.25,texture:'hush',beat:15},
  sewer:{title:'下水道 · 預留場景',tonic:43.65,tension:.78,texture:'drips',beat:5},
  silence:{title:'安靜',tonic:55,tension:0,texture:'hush',beat:30},
};
