import { useState } from 'react';
import { MousePointer2, Music2, Volume2, VolumeX, Waves } from 'lucide-react';
import { getAudioSettings, playCue, unlockAudio, updateAudioSettings, type AudioSettings } from '../../audio/sound';

const channels = [
  {key:'master',name:'總音量',Icon:Volume2},
  {key:'music',name:'恐怖背景音樂',Icon:Music2},
  {key:'ambience',name:'環境氣氛音',Icon:Waves},
  {key:'effects',name:'操作與事件音效',Icon:MousePointer2},
] as const;
export default function AudioSettingsControls(){
  const [audio,setAudio]=useState<AudioSettings>(getAudioSettings);
  const update=(key:keyof AudioSettings,value:number|boolean)=>{
    const next={...audio,[key]:value};
    setAudio(next);updateAudioSettings({[key]:value});
    if(key==='muted'&&value===false)unlockAudio();
    if(key==='effects')playCue('select');
  };
  return <div className="settings-audio-controls">
    <button type="button" className="secondary-button" onClick={()=>update('muted',!audio.muted)}>{audio.muted?<VolumeX size={16}/>:<Volume2 size={16}/>} {audio.muted?'取消靜音':'全部靜音'}</button>
    {channels.map(({key,name,Icon})=><label className="audio-slider" key={key}><span><Icon size={15}/>{name}<strong>{Math.round(audio[key]*100)}%</strong></span><input aria-label={name} type="range" min="0" max="100" step="1" value={Math.round(audio[key]*100)} onChange={e=>update(key,Number(e.target.value)/100)}/></label>)}
    <button type="button" className="secondary-button" onClick={()=>{unlockAudio();playCue('impact')}}>測試音效</button>
  </div>;
}
