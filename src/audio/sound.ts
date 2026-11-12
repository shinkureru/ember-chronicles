/**
 * Ember Chronicles v1.4 original procedural score and CC0-recorded foley.
 * Kenney RPG Audio and Kenney UI Audio (CC0) supplement 100% original MIDI-free synthesized music.
 * AudioContext requires a user gesture on mobile browsers.
 */
import type { SoundscapeId } from './soundscapes';
import { SCENE_TRACKS,musicPath,type LicensedTrackId } from './licensedMusic';

export type SoundCue='tap'|'select'|'confirm'|'locked'|'open'|'loot'|'reward'|'card'|
  'warning'|'injury'|'impact'|'breath'|'footsteps'|'retreat'|'defeat'|'victory'|
  'runFast'|'sneakStep'|'searchCloth'|'searchPaper'|'searchTools'|'dialogue'|'inspect';

/** Kenney RPG Audio 1.0, Creative Commons CC0 1.0.
 * Recorded source provenance: docs/AUDIO_LICENSES.md. URLs are local Vite public assets. */
const RECORDED_FOLEY:Partial<Record<SoundCue,readonly string[]>>={
 tap:['ui:click5'],
 select:['ui:click3'],
 confirm:['ui:switch10'],
 locked:['ui:switch14'],
 warning:['ui:switch14'],
 open:['ui:mouserelease1'],
 inspect:['ui:rollover2'],
 dialogue:['ui:click1'],
 footsteps:['footstep_0','footstep_2'],
 runFast:['footstep_0','footstep_2','footstep_4'],
 sneakStep:['footstep_4','footstep_2'],
 searchCloth:['cloth_1','cloth_2'],
 searchPaper:['book_flip_1','book_open'],
 searchTools:['metal_latch','metal_click'],
 loot:['handle_small_leather'],
 card:['book_flip_1'],
};
const FOLEY_ASSETS=[...new Set(Object.values(RECORDED_FOLEY).flat())] as string[];
const recordedBuffers=new Map<string,AudioBuffer>();
const loadingBuffers=new Set<string>();
function queueFoley(ctx:AudioContext,id:string){
 if(recordedBuffers.has(id)||loadingBuffers.has(id))return;
 loadingBuffers.add(id);
 const url=id.startsWith('ui:')?`${import.meta.env.BASE_URL}audio/kenney-ui/${id.slice(3)}.wav`:
   `${import.meta.env.BASE_URL}audio/kenney-rpg/${id}.ogg`;
 void fetch(url).then(response=>{
  if(!response.ok)throw Error('Unable to load '+url);
  return response.arrayBuffer();
 }).then(buffer=>ctx.decodeAudioData(buffer)).then(buffer=>recordedBuffers.set(id,buffer))
  .catch(()=>{/* Synthesized SFX stays available when offline. */})
  .finally(()=>loadingBuffers.delete(id));
}
function playRecordedFoley(ctx:AudioContext,cue:SoundCue){
 const ids=RECORDED_FOLEY[cue];
 if(!ids?.length||!effectsGain)return false;
 const ready=ids.every(id=>recordedBuffers.has(id));
 if(!ready){ids.forEach(id=>queueFoley(ctx,id));return false;}
 const steps=cue==='runFast'?7:cue==='footsteps'?2:cue==='sneakStep'?3:
  cue==='searchCloth'?3:cue==='searchPaper'?2:1;
 const gap=cue==='runFast'?.115:cue==='footsteps'?.23:cue==='sneakStep'?.37:cue==='searchCloth'?.19:cue==='searchPaper'?.18:0;
 for(let i=0;i<steps;i++){
  const buffer=recordedBuffers.get(ids[i%ids.length]!);
  if(!buffer)continue;
  const src=ctx.createBufferSource(),gain=ctx.createGain();
  src.buffer=buffer;src.playbackRate.value=.96+Math.random()*.09;
  gain.gain.value=cue==='runFast'?.49:cue==='sneakStep'?.25:cue==='warning'?.52:cue==='confirm'?.58:.47;
  src.connect(gain);gain.connect(effectsGain);
  src.start(ctx.currentTime+i*gap);
 }
 return true;
}
export interface AudioSettings { muted:boolean;master:number;music:number;ambience:number;effects:number; }
const KEY='ember-audio-v03'; // Keep previously saved player settings.
const defaults:AudioSettings={muted:false,master:.95,music:.55,ambience:.55,effects:1};
const clamp01=(value:number)=>Math.max(0,Math.min(1,value));
const readSettings=():AudioSettings=>{
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'null') as Partial<AudioSettings>|null;
    return saved?{...defaults,...saved}:defaults;
  }catch{return defaults;}
};
let config=readSettings();
let context:AudioContext|null=null;
let musicGain:GainNode|null=null, ambienceGain:GainNode|null=null,effectsGain:GainNode|null=null;
let scene:SoundscapeId|null=null;
let desiredScene:SoundscapeId='map';
let activeMusic:HTMLAudioElement|null=null;
let activeMusicId:LicensedTrackId|null=null;
let fadingMusic:HTMLAudioElement|null=null;
let musicFade:ReturnType<typeof setInterval>|null=null;
let fadeStep=0;
let audioUnlocked=false;
const targetMusicVolume=()=>config.muted?0:Math.max(0,Math.min(1,config.master*config.music*.68));
let lastTap=0;

export const getAudioSettings=():AudioSettings=>({...config});
export const soundEnabled=()=>!config.muted;
export const setSoundEnabled=(enabled:boolean)=>updateAudioSettings({muted:!enabled});
export const updateAudioSettings=(change:Partial<AudioSettings>)=>{
  config={...config,...change};
  for(const k of ['master','music','ambience','effects'] as const)config[k]=clamp01(config[k]);
  try{localStorage.setItem(KEY,JSON.stringify(config));}catch{/* Storage optional */}
  if(config.muted){activeMusic?.pause();fadingMusic?.pause();}
  else if(audioUnlocked){if(activeMusic?.paused)void activeMusic.play().catch(()=>{});startScene();}
  applyVolumes();
  if(typeof window!=='undefined')window.dispatchEvent(new Event('ember-audio-settings'));
};
function applyVolumes(){
  if(!context)return;
  const m=config.muted?0:config.master;
  const at=context.currentTime;
  // The entire mix feeds a compressor; noticeably louder than v0.4, without hard clipping.
  if(activeMusic&&!musicFade)activeMusic.volume=targetMusicVolume();
  if(fadingMusic&&!musicFade)fadingMusic.volume=0;
  ambienceGain?.gain.setTargetAtTime(m*config.ambience*.48,at,.04);
  effectsGain?.gain.setTargetAtTime(m*config.effects*.96,at,.018);
}
function createContext():AudioContext|null{
  if(typeof window==='undefined')return null;
  try{
    if(!context){
      context=new AudioContext();
      const limiter=context.createDynamicsCompressor();
      limiter.threshold.value=-11;limiter.knee.value=9;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.15;
      musicGain=context.createGain();ambienceGain=context.createGain();effectsGain=context.createGain();
      musicGain.connect(limiter);ambienceGain.connect(limiter);effectsGain.connect(limiter);
      limiter.connect(context.destination);applyVolumes();
    }
    return context;
  }catch{return null;}
}
function note(ctx:AudioContext,freq:number,seconds:number,loudness:number,options:{type?:OscillatorType;into?:AudioNode;delay?:number;glide?:number;attack?:number}={}){
  const start=ctx.currentTime+(options.delay??0),end=start+seconds;
  const osc=ctx.createOscillator(),env=ctx.createGain();
  osc.type=options.type??'sine';
  osc.frequency.setValueAtTime(Math.max(30,freq),start);
  if(options.glide)osc.frequency.exponentialRampToValueAtTime(Math.max(30,freq*options.glide),end);
  const attack=Math.min(seconds*.4,options.attack??.012);
  env.gain.setValueAtTime(.0001,start);
  env.gain.exponentialRampToValueAtTime(Math.max(.0002,loudness),start+Math.max(.006,attack));
  env.gain.exponentialRampToValueAtTime(.0001,end);
  osc.connect(env);env.connect(options.into??effectsGain!);
  osc.start(start);osc.stop(end+.02);
}
function noise(ctx:AudioContext,duration:number,volume:number,cutoff:number,options:{delay?:number;highpass?:boolean;into?:AudioNode}={}){
  const start=ctx.currentTime+(options.delay??0);
  const buffer=ctx.createBuffer(1,Math.max(1,Math.ceil((duration+.05)*ctx.sampleRate)),ctx.sampleRate);
  const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
  const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),env=ctx.createGain();
  src.buffer=buffer;filter.type=options.highpass?'highpass':'lowpass';filter.frequency.value=cutoff;
  env.gain.setValueAtTime(.0001,start);env.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.009);
  env.gain.exponentialRampToValueAtTime(.0001,start+duration);
  src.connect(filter);filter.connect(env);env.connect(options.into??effectsGain!);
  src.start(start);src.stop(start+duration+.02);
}
/** Each interaction family has an audible signature, not a recolored single beep. */
export const playCue=(cue:SoundCue)=>{
  if(config.muted||config.master<=0||config.effects<=0)return;
  const ctx=createContext();if(!ctx)return;
  if(ctx.state==='suspended')void ctx.resume();
  const now=typeof performance!=='undefined'?performance.now():Date.now();
  if(cue==='tap'&&now-lastTap<70)return;
  if(cue==='tap')lastTap=now;
  if(playRecordedFoley(ctx,cue))return;
  switch(cue){
    case 'tap':noise(ctx,.035,.34,1900,{highpass:true});note(ctx,540,.045,.19,{type:'triangle'});break;
    case 'select':note(ctx,350,.10,.30,{type:'triangle'});note(ctx,440,.11,.20,{delay:.065});break;
    case 'confirm':note(ctx,392,.16,.31,{type:'triangle'});note(ctx,587,.22,.20,{delay:.10});break;
    case 'locked':note(ctx,106,.25,.40,{type:'sawtooth',glide:.65});noise(ctx,.14,.18,500);break;
    case 'open':noise(ctx,.23,.25,1200);note(ctx,260,.20,.22,{type:'sine',glide:1.35});break;
    case 'card':noise(ctx,.065,.39,1400,{highpass:true});note(ctx,623,.20,.26,{type:'triangle',delay:.02});break;
    case 'loot':noise(ctx,.13,.36,2200);note(ctx,480,.18,.21,{type:'triangle',delay:.04});note(ctx,620,.16,.17,{delay:.14});break;
    case 'reward':note(ctx,330,.26,.26);note(ctx,392,.35,.25,{delay:.10});note(ctx,523,.55,.27,{delay:.21});break;
    case 'warning':note(ctx,185,.19,.38,{type:'square'});note(ctx,174,.23,.30,{type:'square',delay:.23});break;
    case 'impact':noise(ctx,.20,.53,580);note(ctx,85,.20,.35,{type:'triangle',glide:.48});break;
    case 'injury':noise(ctx,.34,.42,480);note(ctx,136,.46,.34,{type:'sawtooth',glide:.5});break;
    case 'breath':noise(ctx,.40,.24,1050);noise(ctx,.24,.13,1000,{delay:.45});break;
    case 'footsteps':noise(ctx,.11,.48,330);noise(ctx,.12,.48,290,{delay:.2});break;
    case 'runFast':
      for(let i=0;i<7;i++){noise(ctx,.075,.46,210+(i%2)*100,{delay:i*.105});note(ctx,82+(i%3)*19,.078,.16,{type:'triangle',delay:i*.105});}
      break;
    case 'sneakStep':
      for(let i=0;i<3;i++)noise(ctx,.12,.23,260,{delay:i*.31});
      break;
    case 'searchCloth':
      for(let i=0;i<5;i++)noise(ctx,.16,.18,1000+(i%2)*320,{delay:i*.14,highpass:true});
      break;
    case 'searchPaper':
      for(let i=0;i<4;i++)noise(ctx,.08,.27,1750,{delay:i*.115,highpass:true});
      break;
    case 'searchTools':
      noise(ctx,.18,.31,760);note(ctx,650,.1,.19,{delay:.16,type:'triangle'});noise(ctx,.12,.27,910,{delay:.31});
      break;
    case 'dialogue':
      note(ctx,312,.12,.15,{type:'triangle'});note(ctx,287,.14,.13,{type:'triangle',delay:.19});break;
    case 'inspect':
      note(ctx,590,.08,.09,{type:'sine'});noise(ctx,.10,.14,1550,{delay:.08,highpass:true});break;
    case 'retreat':noise(ctx,.46,.29,1450);note(ctx,330,.46,.35,{type:'triangle',glide:.55});break;
    case 'defeat':note(ctx,262,.43,.29,{type:'triangle'});note(ctx,196,.55,.30,{type:'triangle',delay:.25});note(ctx,131,.95,.25,{delay:.52});break;
    case 'victory':note(ctx,294,.36,.24);note(ctx,392,.39,.24,{delay:.14});note(ctx,466,.55,.28,{delay:.30});break;
  }
};
/** All scene music comes from self-hosted CC0 OGG assets. Short crossfades prevent abrupt cuts. */
function stopScene(){
 if(musicFade){clearInterval(musicFade);musicFade=null;}
 fadingMusic?.pause();fadingMusic=null;
 activeMusic?.pause();activeMusic=null;activeMusicId=null;
 scene=null;
}
function startScene(){
 if(!audioUnlocked||typeof window==='undefined'||config.muted)return;
 const chosen=SCENE_TRACKS[desiredScene];
 if(scene===desiredScene&&activeMusic)return;
 scene=desiredScene;
 if(musicFade){clearInterval(musicFade);musicFade=null;}
 if(fadingMusic){fadingMusic.pause();fadingMusic=null;}
 if(!chosen){stopScene();scene=desiredScene;return;}
 if(chosen===activeMusicId&&activeMusic){applyVolumes();return;}
 const previous=activeMusic;
 const next=new Audio(musicPath(chosen));
 next.loop=true;
 next.preload='auto';
 next.volume=0;
 activeMusic=next;activeMusicId=chosen;
 fadingMusic=previous;
 void next.play().catch(()=>{audioUnlocked=false;});
 fadeStep=0;
 musicFade=setInterval(()=>{
  fadeStep=Math.min(1,fadeStep+.11);
  const ease=fadeStep*fadeStep*(3-2*fadeStep);
  if(activeMusic===next)next.volume=Math.min(1,targetMusicVolume()*ease);
  if(previous)previous.volume=Math.min(1,targetMusicVolume()*(1-ease));
  if(fadeStep>=1){
   previous?.pause();if(fadingMusic===previous)fadingMusic=null;
   if(musicFade){clearInterval(musicFade);musicFade=null;}
  }
 },55);
}
export const setAudioScene=(id:SoundscapeId)=>{desiredScene=id;if(audioUnlocked)startScene();};
export const unlockAudio=()=>{
 if(config.muted)return;
 const ctx=createContext();if(!ctx)return;
 audioUnlocked=true;
 void ctx.resume().then(()=>{
  FOLEY_ASSETS.forEach(id=>queueFoley(ctx,id));
  if(activeMusic?.paused)void activeMusic.play().catch(()=>{audioUnlocked=false;});
  startScene();
 }).catch(()=>{/* Browsers require a gesture */});
};
export const disposeAudio=()=>{stopScene();audioUnlocked=false;if(context)void context.close();context=null;musicGain=null;ambienceGain=null;effectsGain=null;};

/** Original short lullaby composed from simple sine/triangle voices: no third-party
 * recording, no loop, no licensing obligations. Plays only after a user gesture. */
export type RestLullabyKind='rest_cot'|'rest_private'|'rest_short';
export const playRestLullaby=(kind:RestLullabyKind):(()=>void)=>{
 if(config.muted||config.master<=0||config.music<=0)return ()=>{};
 const ctx=createContext();if(!ctx)return ()=>{};
 if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 const layer=ctx.createGain(),now=ctx.currentTime;
 const volume=config.master*config.music*.14;
 layer.gain.setValueAtTime(.0001,now);
 layer.gain.linearRampToValueAtTime(Math.max(.0002,volume),now+.55);
 layer.gain.setValueAtTime(Math.max(.0002,volume),now+3.8);
 layer.gain.linearRampToValueAtTime(.0001,now+4.9);
 layer.connect(musicGain??ctx.destination);
 const patterns:Record<RestLullabyKind,number[]>={
  rest_cot:[261.63,329.63,392.00,329.63,293.66,261.63],
  rest_private:[261.63,392.00,523.25,493.88,392.00,329.63],
  rest_short:[293.66,349.23,392.00,349.23,293.66,261.63],
 };
 const tones=patterns[kind];
 const pace=kind==='rest_short'?.47:kind==='rest_private'?.64:.58;
 for(let i=0;i<tones.length;i++){
  const t=i*pace;
  note(ctx,tones[i]!,Math.min(.93,pace*1.55),.28,{
   type:kind==='rest_private'?'sine':'triangle',into:layer,delay:t,attack:.17
  });
  if(i%2===0)note(ctx,tones[i]!/2,Math.min(1.3,pace*2),.12,{type:'sine',into:layer,delay:t,attack:.27});
 }
 const previous=activeMusic,oldVolume=previous?.volume;
 if(previous&&!previous.paused)previous.volume=targetMusicVolume()*.22;
 let stopped=false;
 const timer=window.setTimeout(()=>finish(),5100);
 function finish(){
  if(stopped)return;
  stopped=true;window.clearTimeout(timer);
  if(ctx&&ctx.state==='running')layer.gain.setTargetAtTime(.0001,ctx.currentTime,.04);
  window.setTimeout(()=>{try{layer.disconnect();}catch{/* Node may already be closed. */}},220);
  if(previous&&previous===activeMusic&&oldVolume!==undefined)previous.volume=targetMusicVolume();
 }
 return finish;
};
