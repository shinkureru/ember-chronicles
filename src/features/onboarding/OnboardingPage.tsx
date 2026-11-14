import {ArrowRight,ChevronRight,ImageOff,Shield,Warehouse,Building2,AlertTriangle} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useGame} from '../../app/GameContext';
import {INTRO_STORY_PAGES,TUTORIAL_PLACEHOLDER_STEPS,SHELTER_OPTIONS} from '../../game/engine/onboarding';
import type {ShelterId} from '../../game/types';

/** Deliberate placeholder images: art and combat tutorial are not produced in this batch. */
function ArtPlaceholder({name,number}:{name:string;number:string}){
 return <div className="onboarding-scene" role="img" aria-label={name}>
  <div className="onboarding-scene__symbol" aria-hidden="true"><ImageOff size={25} strokeWidth={1.2}/></div>
  <span>SCENE / {number}</span>
  <strong>{name}</strong>
  <small>圖像素材預留 · 稍後由正式美術替換</small>
 </div>;
}

const iconByShelter={warehouse:Warehouse,apartment:Building2,bunker:Shield};

export default function OnboardingPage(){
 const {state,dispatch}=useGame();
 const navigate=useNavigate();
 const progress=state.onboarding;
 if(progress.phase==='story'){
  const story=INTRO_STORY_PAGES[progress.storyPage]??INTRO_STORY_PAGES[0];
  return <div className="onboarding-page onboarding-page--story">
   <header className="onboarding-top">
    <span className="onboarding-kicker">EMBER CHRONICLES · 序章佔位</span>
    <button type="button" className="onboarding-skip" onClick={()=>dispatch({type:'ONBOARDING_STORY_SKIP'})}
      aria-label="跳過故事介紹，進入必經的新手教學">跳過 <ArrowRight size={17} aria-hidden="true"/></button>
   </header>
   <ArtPlaceholder name={story.art} number={String(progress.storyPage+1).padStart(2,'0')}/>
   <section className="onboarding-story-text" aria-live="polite">
    <span className="onboarding-eyebrow">{story.eyebrow}</span>
    <h1>{story.title}</h1>
    <p>{story.text}</p>
   </section>
   <footer className="onboarding-bottom">
    <span className="onboarding-count">故事介紹 {progress.storyPage+1} / {INTRO_STORY_PAGES.length}</span>
    <button className="primary-button onboarding-next" type="button" onClick={()=>dispatch({type:'ONBOARDING_STORY_NEXT'})}>
      {progress.storyPage===INTRO_STORY_PAGES.length-1?'進入新手教學':'下一頁'} <ChevronRight size={18}/>
    </button>
   </footer>
  </div>;
 }
 if(progress.phase==='tutorial'){
  const step=TUTORIAL_PLACEHOLDER_STEPS[progress.tutorialStep]??TUTORIAL_PLACEHOLDER_STEPS[0];
  const defeat=progress.tutorialStep===TUTORIAL_PLACEHOLDER_STEPS.length-1;
  return <div className="onboarding-page onboarding-page--tutorial">
   <header className="onboarding-top">
    <span className="onboarding-kicker">TUTORIAL · 強制關卡占位</span>
    <span className="onboarding-stage-label">不可跳過</span>
   </header>
   <ArtPlaceholder name={step.art} number={String(progress.tutorialStep+1).padStart(2,'0')}/>
   <section className="onboarding-story-text" aria-live="polite">
    <span className="onboarding-eyebrow">{step.eyebrow}</span>
    <h1>{step.title}</h1>
    <p>{step.text}</p>
    {defeat?<p className="onboarding-defeat-message"><AlertTriangle size={15} aria-hidden="true"/> 劇情固定戰敗。此占位不計入正式生命、飢餓、物資與戰敗紀錄。</p>:
     <p className="onboarding-temporary-note">目前僅演示新手流程。可操作的戰鬥及完整介面教學將另行製作。</p>}
   </section>
   <footer className="onboarding-bottom">
    <span className="onboarding-count">教學演示 {progress.tutorialStep+1} / {TUTORIAL_PLACEHOLDER_STEPS.length}</span>
    <button className="primary-button onboarding-next" type="button"
      onClick={()=>dispatch(defeat?{type:'ONBOARDING_TUTORIAL_DEFEAT'}:{type:'ONBOARDING_TUTORIAL_NEXT'})}>
      {defeat?'戰敗後醒來，尋找避難所':'繼續教學演示'} <ArrowRight size={17}/>
    </button>
   </footer>
  </div>;
 }
 if(progress.phase==='shelter'){
  const choose=(id:ShelterId)=>{
   dispatch({type:'ONBOARDING_SELECT_SHELTER',shelterId:id});
   navigate('/',{replace:true});
  };
  return <div className="onboarding-page onboarding-page--shelter">
   <header className="onboarding-top"><span className="onboarding-kicker">AFTERMATH · 最初的據點</span><span className="onboarding-stage-label">三選一</span></header>
   <section className="onboarding-shelter-intro">
    <span className="onboarding-eyebrow">SHELTER SELECTION</span>
    <h1>你需要一個能活下去的地方。</h1>
    <p>失去意識後，你終於甦醒。接下來，選擇一處廢棄建築作為自己的第一個避難所。</p>
    <small>廢棄倉庫已有正式場景與家具配置；公寓、防空室仍預留美術圖像。能力差異尚未定案，選擇將寫入本機存檔。</small>
   </section>
   <div className="onboarding-shelter-list">
    {SHELTER_OPTIONS.map(s=>{
     const Icon=iconByShelter[s.id];
     return <button type="button" className={'onboarding-shelter-card onboarding-shelter-card--'+s.id}
      key={s.id} data-shelter-id={s.id} onClick={()=>choose(s.id)}>
      <span className="onboarding-shelter-art" role="img" aria-label={s.art}><Icon size={28} strokeWidth={1.2} aria-hidden="true"/><small>{s.art}</small></span>
      <span className="onboarding-shelter-card__body"><small>{s.en} · {s.short}</small><strong>{s.name}</strong><span>{s.description}</span></span>
      <ChevronRight size={19} className="onboarding-shelter-card__arrow" aria-hidden="true"/>
     </button>;
    })}
   </div>
   <p className="onboarding-shelter-footnote">選定後將以你的避難所作為主畫面。倉庫提供建築與家具互動測試；其他兩種據點待加入專屬圖片。這仍是原型測試版本。</p>
  </div>;
 }
 return null;
}
