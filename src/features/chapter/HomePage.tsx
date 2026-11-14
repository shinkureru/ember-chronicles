import {Link} from 'react-router-dom';
import {Archive,BookOpenText,FlaskConical,Landmark,Layers3,Map,Store,UserRound} from 'lucide-react';
import {useGame} from '../../app/GameContext';
import {SHELTER_OPTIONS} from '../../game/engine/onboarding';
import {sanitizeShelterFurniture} from '../../game/data/shelter';
import GameUtilities from '../../components/GameUtilities';
import Hud from '../../components/Hud';
import ShelterScene from '../shelter/ShelterScene';

const hubLinks=[
 {label:'城鎮',Icon:Landmark,to:'/town'},
 {label:'黑市',Icon:Store,to:'/black-market'},
 {label:'物資倉庫',Icon:Archive,to:'/warehouse'},
 {label:'人物',Icon:UserRound,to:'/character'},
 {label:'牌組',Icon:Layers3,to:'/cards'},
] as const;

/** The main screen is always the player's chosen shelter, never the chapter map. */
export default function HomePage(){
 const {state}=useGame();
 const shelter=SHELTER_OPTIONS.find(s=>s.id===state.onboarding.shelter);
 const owned=sanitizeShelterFurniture(state.shelterFurniture);
 return <div className="page-stack viewport-page shelter-hub">
  <header className="shelter-hub__header">
   <div><span className="eyebrow">EMBER CHRONICLES / MY SHELTER</span><h1>{shelter?.name??'尚未指定避難所'}</h1><small>{shelter?.en??'SHELTER UNASSIGNED'}</small></div>
   <GameUtilities className="game-utilities--shelter"/>
  </header>
  <section className="shelter-hub__visual" aria-label="避難所主場景">
   <ShelterScene shelter={state.onboarding.shelter} owned={owned}/>
   <div className="shelter-hub__scene-info">
    <span>{shelter?.short??'待選擇'}</span>
    <strong>{state.onboarding.shelter==='warehouse'?owned.length+'/8 件家具':'場景待製作'}</strong>
   </div>
  </section>
  {state.onboarding.shelter==='warehouse'
   ? <p className="shelter-hub__build-note">目前顯示已取得的家具。當八件全部取得，場景將自動換成完整高畫質倉庫圖。購買／隨機建設按鈕於下一批接入。</p>
   : <p className="shelter-hub__build-note">這個避難所的正式場景圖片仍待設計。你的選擇已保存，不會自動換成其他類型。</p>}
  <Hud/>
  {!state.profession&&<section className="shelter-hub__identity surface-card">
   <div><span className="eyebrow">YOUR PAST / 職業原型</span><h2>尚未選擇過去的身分</h2><p>選擇職業後，可以沿用原有關卡與戰鬥系統。避難所選擇不受影響。</p></div>
   <Link className="primary-button" to="/profession"><BookOpenText size={16}/>選擇職業</Link>
  </section>}
  <nav className="shelter-hub__links" aria-label="避難所功能入口">
   {hubLinks.map(({label,Icon,to})=><Link to={to} key={to} className="shelter-hub__link">
    <Icon size={20} aria-hidden="true"/><span>{label}</span>
   </Link>)}
  </nav>
  <details className="shelter-hub__prototype">
   <summary><FlaskConical size={15} aria-hidden="true"/>原型測試入口（暫時保留）</summary>
   <p>舊章節路線圖已從主畫面移除。是否透過家具解鎖仍未定案，目前只作開發與關卡驗證。</p>
   <Link to={state.profession?'/world-map':'/profession'}><Map size={16}/>{state.profession?'開啟舊關卡路線圖':'先選擇職業再進入關卡路線圖'}</Link>
  </details>
 </div>;
}
