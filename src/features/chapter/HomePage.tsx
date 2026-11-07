import { ChevronRight, Fingerprint, Info, Skull } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { PROFESSIONS } from '../../game/data/professions';
import type { ProfessionId } from '../../game/types';
import ChapterMapPage from '../world-map/ChapterMapPage';
import { playCue } from '../../audio/sound';
export default function HomePage(){
 const {state,dispatch}=useGame();
 if(state.profession)return <ChapterMapPage/>;
 return <div className="page-stack home-page viewport-page">
  <section className="home-hero"><span className="eyebrow">EMBER CHRONICLES / PROLOGUE</span><div className="home-hero__symbol"><Skull size={46} strokeWidth={1}/></div><h1>灰燼之下，<br/>沒有人是清白的。</h1><p>「這座城有些人失蹤了。更可怕的是，沒有人願意承認自己知道原因。」</p><span className="hero-scroll">你的身分，將改變每一個答案。</span></section>
  <section className="surface-card"><span className="eyebrow">CHOOSE YOUR PAST</span><h2>我曾經是誰？</h2><p className="muted">首個原型開放兩種職業。正式企劃規劃六個彼此截然不同的人生背景。</p>
   <div className="profession-cards">{(Object.entries(PROFESSIONS) as [ProfessionId,typeof PROFESSIONS[ProfessionId]][]).map(([id,p])=><button key={id} type="button" className="profession-card" onClick={()=>{playCue('confirm');dispatch({type:'SELECT_PROFESSION',profession:id})}}><span className="profession-card__icon"><Fingerprint size={29}/></span><span><small>{p.en}</small><strong>{p.name}</strong><em>{p.tagline}</em></span><ChevronRight size={19}/></button>)}</div>
  </section><div className="tip-panel"><Info size={16}/>原型使用瀏覽器本機存檔。選擇職業後進入第一章互動地圖。</div>
 </div>;
}
