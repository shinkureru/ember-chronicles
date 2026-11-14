import { ChevronRight, Fingerprint, Info, Skull } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { PROFESSIONS } from '../../game/data/professions';
import type { ProfessionId } from '../../game/types';
import ChapterMapPage from '../world-map/ChapterMapPage';
import { playCue } from '../../audio/sound';
import GameUtilities from '../../components/GameUtilities';
import {SHELTER_OPTIONS} from '../../game/engine/onboarding';
export default function HomePage(){
 const {state,dispatch}=useGame();
 const shelterName=SHELTER_OPTIONS.find(s=>s.id===state.onboarding.shelter)?.name;
 if(state.profession)return <><section className="onboarding-hub-notice" role="status">目前避難所：{shelterName??'尚待選擇'} · 第3批將替換為避難所主畫面，暫時保留舊關卡路線圖供測試。</section><ChapterMapPage/></>;
 return <div className="page-stack home-page viewport-page">
  <section className="home-hero"><div className="home-hero__top"><span className="eyebrow">EMBER CHRONICLES / PROLOGUE</span><GameUtilities className="game-utilities--prologue"/></div><div className="home-hero__symbol"><Skull size={46} strokeWidth={1}/></div><h1>灰燼之下，<br/>沒有人是清白的。</h1><p>「這座城有些人失蹤了。更可怕的是，沒有人願意承認自己知道原因。」</p><span className="hero-scroll">你的身分，將改變每一個答案。</span></section>
  <section className="onboarding-hub-notice" role="status">已選擇據點：{shelterName??'尚待選擇'}。本批先沿用原型職業選擇，下一批接上真正的避難所主畫面。</section>
  <section className="surface-card"><span className="eyebrow">CHOOSE YOUR PAST</span><h2>我曾經是誰？</h2><p className="muted">目前開放三種職業原型。正式企劃將逐步擴充成六種截然不同的人生背景。</p>
   <div className="profession-cards">{(Object.entries(PROFESSIONS) as [ProfessionId,typeof PROFESSIONS[ProfessionId]][]).map(([id,p])=><button key={id} type="button" className="profession-card" onClick={()=>{playCue('confirm');dispatch({type:'SELECT_PROFESSION',profession:id})}}><span className="profession-card__icon"><Fingerprint size={29}/></span><span><small>{p.en}</small><strong>{p.name}</strong><em>{p.tagline}</em></span><ChevronRight size={19}/></button>)}</div>
  </section><div className="tip-panel"><Info size={16}/>原型使用瀏覽器本機存檔。選擇職業後進入第一章互動地圖。</div>
 </div>;
}
