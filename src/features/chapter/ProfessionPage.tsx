import {ChevronRight,Fingerprint,Info,Skull} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useGame} from '../../app/GameContext';
import {PROFESSIONS} from '../../game/data/professions';
import type {ProfessionId} from '../../game/types';
import {playCue} from '../../audio/sound';
import GameUtilities from '../../components/GameUtilities';

/** Former prologue profession chooser stays available, but no longer blocks shelter home. */
export default function ProfessionPage(){
 const {state,dispatch}=useGame(),navigate=useNavigate();
 if(state.profession)return null;
 return <div className="page-stack home-page viewport-page">
  <section className="home-hero"><div className="home-hero__top"><span className="eyebrow">EMBER CHRONICLES / YOUR PAST</span><GameUtilities className="game-utilities--prologue"/></div><div className="home-hero__symbol"><Skull size={46} strokeWidth={1}/></div>
   <h1>灰燼之下，<br/>沒有人是清白的。</h1>
   <p>「這座城有些人失蹤了。更可怕的是，沒有人願意承認自己知道原因。」</p><span className="hero-scroll">你的身分，將改變每一個答案。</span>
  </section>
  <section className="surface-card"><span className="eyebrow">CHOOSE YOUR PAST</span><h2>我曾經是誰？</h2>
   <p className="muted">目前開放三種職業原型；正式職業系統仍待後續討論。</p>
   <div className="profession-cards">{(Object.entries(PROFESSIONS) as [ProfessionId,typeof PROFESSIONS[ProfessionId]][]).map(([id,p])=>
    <button key={id} type="button" className="profession-card" onClick={()=>{
     playCue('confirm');dispatch({type:'SELECT_PROFESSION',profession:id});navigate('/',{replace:true});
    }}><span className="profession-card__icon"><Fingerprint size={29}/></span>
     <span><small>{p.en}</small><strong>{p.name}</strong><em>{p.tagline}</em></span><ChevronRight size={19}/></button>)}
   </div>
  </section>
  <div className="tip-panel"><Info size={16}/>選擇身分後返回自己的避難所。舊關卡路線圖保留在獨立測試入口。</div>
 </div>;
}
