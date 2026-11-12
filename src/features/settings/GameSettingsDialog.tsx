import { useEffect, useState } from 'react';
import { Save, Settings2, X } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { saveGame } from '../../game/state/storage';
import AudioSettingsControls from './AudioSettingsControls';
import {BuildVersion} from '../../components/GameUtilities';

/** In-mission settings: modal only, does not navigate away from the locked chapter. */
export default function GameSettingsDialog({onClose}:{onClose:()=>void}){
  const {state,pauseClock}=useGame();
  useEffect(()=>{pauseClock('dialog',true);return()=>pauseClock('dialog',false)},[pauseClock]);
  const [saved,setSaved]=useState<'idle'|'success'|'error'>('idle');
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose]);
  const persist=()=>setSaved(saveGame(state)?'success':'error');
  return <div className="game-sheet-backdrop mission-settings-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="mission-settings" role="dialog" aria-modal="true" aria-label="關卡設定">
      <div className="game-sheet__top"><h3><Settings2 size={17}/>關卡設定</h3><button type="button" onClick={onClose} aria-label="關閉設定"><X size={20}/></button></div>
      <p className="mission-settings__desc">可以隨時調整音量與手動存檔。關卡仍維持目前進度，無法由此離開任務。</p><div className="mission-settings__build"><BuildVersion/></div>
      <AudioSettingsControls/>
      <div className="mission-settings__save"><button type="button" className="primary-button primary-button--full" onClick={persist}><Save size={16}/>立即儲存目前進度</button>
      <p role="status">{saved==='success'?'已儲存在這台裝置的瀏覽器。':saved==='error'?'瀏覽器禁止寫入存檔；請檢查隱私模式與可用空間。':'進度也會在每次選擇後自動存檔。'}</p></div>
    </section>
  </div>;
}
