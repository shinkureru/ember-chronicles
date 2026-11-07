/**
 * Procedural audio 0.3: completely synthesized dark ambient score + contextual foley.
 * No third-party sound file is bundled. Browser audio starts after first user gesture.
 */
import { SOUNDSCAPES, type SoundscapeId } from './soundscapes';

export type SoundCue = 'tap' | 'select' | 'confirm' | 'locked' | 'open' | 'loot' | 'reward' | 'card' |
  'warning' | 'injury' | 'impact' | 'breath' | 'footsteps' | 'retreat' | 'defeat' | 'victory';
export interface AudioSettings { muted:boolean; master:number; music:number; ambience:number; effects:number; }
const KEY='ember-audio-v03';
const defaults:AudioSettings={muted:false,master:.82,music:.31,ambience:.43,effects:.9};
const readSettings=():AudioSettings=>{
  try {const data=JSON.parse(localStorage.getItem(KEY)||'null') as Partial<AudioSettings>|null;
    return data?{...defaults,...data}:defaults;}catch{return defaults;}
};
let config=readSettings();
export const getAudioSettings=():AudioSettings=>({...config});
export const soundEnabled=()=>!config.muted;
export const setSoundEnabled=(enabled:boolean)=>updateAudioSettings({muted:!enabled});
export const updateAudioSettings=(change:Partial<AudioSettings>)=>{
  config={...config,...change};
  try{localStorage.setItem(KEY,JSON.stringify(config));}catch{/* Browsers may block storage. */}
  applyVolumes();
  if(typeof window!=='undefined')window.dispatchEvent(new Event('ember-audio-settings'));
};
let context:AudioContext|null=null;
let musicGain:GainNode|null=null, ambienceGain:GainNode|null=null, effectsGain:GainNode|null=null;
let sceneGain:GainNode|null=null;
let sceneNodes:AudioNode[]=[];
let sceneInterval:ReturnType<typeof setInterval>|null=null;
let desiredScene:SoundscapeId='map';
let playingScene:SoundscapeId|null=null;
let cueTime=0;
function applyVolumes(){
  if(!context)return;
  const multiplier=config.muted?0:Math.max(0,Math.min(1,config.master));
  const at=context.currentTime;
  musicGain?.gain.setTargetAtTime(multiplier*config.music*.28,at,.055);
  ambienceGain?.gain.setTargetAtTime(multiplier*config.ambience*.23,at,.055);
  effectsGain?.gain.setTargetAtTime(multiplier*config.effects*.61,at,.02);
}
function createContext():AudioContext|null{
  if(typeof window==='undefined')return null;
  try{
    if(!context){
      context=new AudioContext();
      musicGain=context.createGain();ambienceGain=context.createGain();effectsGain=context.createGain();
      musicGain.connect(context.destination);ambienceGain.connect(context.destination);
      const limiter=context.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=6;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.08;effectsGain.connect(limiter);limiter.connect(context.destination);
      applyVolumes();
    }
    return context;
  }catch{return null;}
}
function tone(ctx:AudioContext,frequency:number,duration:number,gainValue:number,type:OscillatorType='sine',destination:AudioNode=effectsGain!,delay=0){
  const start=ctx.currentTime+delay;
  const oscillator=ctx.createOscillator(),vol=ctx.createGain();
  oscillator.type=type;oscillator.frequency.setValueAtTime(Math.max(25,frequency),start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(25,frequency*.84),start+duration);
  vol.gain.setValueAtTime(.0001,start);vol.gain.exponentialRampToValueAtTime(Math.max(.0002,gainValue),start+.008);
  vol.gain.exponentialRampToValueAtTime(.0001,start+duration);
  oscillator.connect(vol);vol.connect(destination);oscillator.start(start);oscillator.stop(start+duration+.015);
}
function noiseBuffer(ctx:AudioContext,seconds=1.5){
 const buf=ctx.createBuffer(1,Math.ceil(seconds*ctx.sampleRate),ctx.sampleRate),data=buf.getChannelData(0);
 for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
 return buf;
}
function noiseShot(ctx:AudioContext,duration:number,volume:number,cutoff:number,destination:AudioNode=effectsGain!,delay=0){
 const t=ctx.currentTime+delay,src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 src.buffer=noiseBuffer(ctx,Math.max(.5,duration+.05));filter.type='lowpass';filter.frequency.value=cutoff;
 gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
 src.connect(filter);filter.connect(gain);gain.connect(destination);src.start(t);src.stop(t+duration+.01);
}
const cueParams:Record<SoundCue,[number,number,number,OscillatorType]>={
 tap:[165,.038,.20,'triangle'],select:[210,.060,.22,'triangle'],confirm:[124,.135,.31,'triangle'],locked:[72,.2,.30,'sawtooth'],
 open:[190,.16,.21,'sine'],loot:[288,.14,.19,'triangle'],reward:[350,.34,.20,'sine'],card:[235,.18,.23,'triangle'],
 warning:[99,.31,.34,'sawtooth'],injury:[72,.28,.39,'sawtooth'],impact:[68,.15,.40,'triangle'],breath:[180,.30,.10,'sine'],
 footsteps:[85,.18,.24,'triangle'],retreat:[122,.35,.25,'sawtooth'],defeat:[55,.8,.28,'sawtooth'],victory:[196,.6,.25,'sine']
};
export const playCue=(cue:SoundCue)=>{
 if(config.muted||config.master<=0||config.effects<=0)return;
 const ctx=createContext();if(!ctx)return;
 if(ctx.state==='suspended')void ctx.resume();
 if(cue==='tap'&&performance.now()-cueTime<70)return;
 cueTime=performance.now();
 const [freq,duration,vol,type]=cueParams[cue];
 tone(ctx,freq,duration,vol,type);
 if(['impact','injury','footsteps','loot','breath','warning','reward'].includes(cue)){
   noiseShot(ctx,duration*.7,vol*.58,cue==='breath'?440:cue==='footsteps'?170:900);
 }
 if(cue==='footsteps')tone(ctx,76,.12,.19,'triangle',effectsGain!,.18);
 if(cue==='reward'||cue==='victory')tone(ctx,freq*1.25,duration*.85,vol*.7,'sine',effectsGain!,.12);
 if(cue==='injury')tone(ctx,91,.36,.17,'sawtooth',effectsGain!,.05);
};
function stopScene(){
 if(sceneInterval){clearInterval(sceneInterval);sceneInterval=null;}
 for(const node of sceneNodes){try{if(node instanceof OscillatorNode||node instanceof AudioBufferSourceNode)node.stop();node.disconnect();}catch{/* already stopped */}}
 sceneNodes=[];
 if(sceneGain){try{sceneGain.disconnect()}catch{/* stopped */}}
 sceneGain=null;playingScene=null;
}
function startScene(){
 const ctx=createContext();if(!ctx||config.muted||playingScene===desiredScene)return;
 stopScene();
 playingScene=desiredScene;
 if(desiredScene==='silence')return;
 const preset=SOUNDSCAPES[desiredScene];
 const bus=ctx.createGain();bus.gain.value=1;sceneGain=bus;
 const pad=ctx.createGain(),texture=ctx.createGain();
 pad.gain.value=.45;texture.gain.value=.42;
 bus.connect(pad);bus.connect(texture);pad.connect(musicGain!);texture.connect(ambienceGain!);
 sceneNodes.push(bus,pad,texture);
 const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=180+preset.tension*85;
 const chord=[1,1.05946,1.4983]; // Unresolved semitone tension and fifth; original procedural score.
 chord.forEach((ratio,index)=>{
  const oscillator=ctx.createOscillator(),gain=ctx.createGain();
  oscillator.type=index===1?'sawtooth':'sine';oscillator.frequency.value=preset.tonic*ratio;
  gain.gain.value=index===1?.11:.2;
  oscillator.connect(gain);gain.connect(filter);oscillator.start();sceneNodes.push(oscillator,gain);
 });
 filter.connect(bus);sceneNodes.push(filter);
 const lfo=ctx.createOscillator(),lfoGain=ctx.createGain();lfo.frequency.value=.055+preset.tension*.045;
 lfoGain.gain.value=.16;lfo.connect(lfoGain);lfoGain.connect(pad.gain);lfo.start();sceneNodes.push(lfo,lfoGain);
 const wind=ctx.createBufferSource(),windFilter=ctx.createBiquadFilter(),windGain=ctx.createGain();
 wind.buffer=noiseBuffer(ctx,3);wind.loop=true;
 windFilter.type='lowpass';windFilter.frequency.value=preset.texture==='wind'?280:preset.texture==='drips'?160:180;
 windGain.gain.value=preset.texture==='hush'?.045:.15+preset.tension*.12;
 wind.connect(windFilter);windFilter.connect(windGain);windGain.connect(texture);wind.start();sceneNodes.push(wind,windFilter,windGain);
 // Separate music and ambience buses allow independent player volume sliders.
 sceneInterval=setInterval(()=>{
  if(!context||config.muted)return;
  const t=context;
  if(preset.texture==='drips'){
   const f=360+Math.random()*580;
   tone(t,f,.16,.18,'sine',ambienceGain!);
   tone(t,f*.67,.24,.06,'sine',ambienceGain!,.11); // short simulated echo
  }else if(preset.texture==='industrial'){
   noiseShot(t,.25,.14,220,ambienceGain!);
   tone(t,60+Math.random()*25,.3,.12,'triangle',ambienceGain!,.05);
  }else if(preset.texture==='wind')noiseShot(t,1.6,.09,340,ambienceGain!);
  // Sparse, original three-note motif (not a recording or borrowed melody).
  tone(t,preset.tonic*2,.28,.10,'sine',musicGain!);
  tone(t,preset.tonic*2.12,.38,.07,'sine',musicGain!,.42);
  if(preset.tension>.7)tone(t,preset.tonic,.26,.11,'triangle',ambienceGain!,.7);
 },Math.max(3500,preset.beat*1000));
}
export const setAudioScene=(scene:SoundscapeId)=>{desiredScene=scene;if(context?.state==='running')startScene();};
export const unlockAudio=()=>{
 if(config.muted)return;
 const ctx=createContext();if(!ctx)return;
 void ctx.resume().then(()=>startScene()).catch(()=>{/* browser blocks audio */});
};
export const disposeAudio=()=>{stopScene();if(context)void context.close();context=null;musicGain=null;ambienceGain=null;effectsGain=null;};
