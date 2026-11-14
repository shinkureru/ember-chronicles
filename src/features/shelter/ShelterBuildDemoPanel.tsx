import {useEffect,useState} from 'react';
import {Check,FastForward,Pause,Play,RotateCcw,Shuffle,StepForward,TestTube2} from 'lucide-react';
import {useGame} from '../../app/GameContext';
import type {ShelterFurnitureId} from '../../game/types';
import {SHELTER_FURNITURE_IDS,normalizeShelterOwned} from '../../game/engine/shelterVisuals';
import {nextShelterBuildItem,normalizeShelterBuildOrder,randomShelterBuildOrder} from '../../game/engine/shelterBuild';

const NAMES:Record<ShelterFurnitureId,string>={
 bed:'折疊床',storage:'儲物架',workbench:'工作台',radio:'無線電台',
 board:'證物調查板',generator:'發電機',cooking:'料理台',computer:'電腦桌'
};
export const SHELTER_DEMO_STEP_MS=850;

/**
 * Prototype only; intentionally shown in deployed test builds (not import.meta.env.DEV)
 * so designers can review the real GitHub Pages scene. Remove this entire component
 * before public release or gate it behind a developer-only build flag.
 */
export default function ShelterBuildDemoPanel(){
 const {state,dispatch}=useGame();
 const [playing,setPlaying]=useState(false);
 const owned=normalizeShelterOwned(state.shelterOwned);
 const order=normalizeShelterBuildOrder(state.shelterBuildOrder);
 const next=nextShelterBuildItem(owned,order);
 const all=owned.length===SHELTER_FURNITURE_IDS.length;

 // A single timeout (not a long-running interval) prevents dispatching extra
 // purchases after navigation, stopping, clearing or reaching 8/8.
 useEffect(()=>{
  if(!playing||!next)return;
  const timer=window.setTimeout(()=>dispatch({type:'SHELTER_DEMO_ADD_NEXT'}),SHELTER_DEMO_STEP_MS);
  return()=>window.clearTimeout(timer);
 },[playing,next,dispatch]);
 useEffect(()=>{if(playing&&!next)setPlaying(false)},[playing,next]);

 const stop=()=>setPlaying(false);
 const setOwned=(items:readonly ShelterFurnitureId[],newOrder?:readonly ShelterFurnitureId[])=>{
  stop();dispatch({type:'SHELTER_DEMO_SET_OWNED',owned:items,order:newOrder});
 };
 const randomConfig=(count:number)=>{
  const shuffled=randomShelterBuildOrder();
  setOwned(shuffled.slice(0,count),shuffled);
 };
 return <section className="shelter-build-demo surface-card" data-prototype-only="true" aria-label="家具建設開發測試">
  <header className="shelter-build-demo__header">
   <span className="shelter-build-demo__eyebrow"><TestTube2 size={15} aria-hidden="true"/> DEVELOPMENT ONLY / 家具建設測試</span>
   <strong aria-live="polite">{owned.length} / {SHELTER_FURNITURE_IDS.length}</strong>
  </header>
  <progress className="shelter-build-demo__progress" value={owned.length} max={SHELTER_FURNITURE_IDS.length} aria-label="家具建設完成度"/>
  <p className="shelter-build-demo__note">測試模式：不扣舊幣或材料，不影響生命、飢餓或關卡。所有購入結果會保存在目前裝置；清空僅清除家具。</p>
  <div className="shelter-build-demo__primary">
   <button type="button" onClick={()=>{stop();dispatch({type:'SHELTER_DEMO_ADD_NEXT'})}} disabled={!next}
    title={next?'下一件：'+NAMES[next]:'全部八件家具已完成'}><StepForward size={16} aria-hidden="true"/> 購入下一件{next?' · '+NAMES[next]:''}</button>
   <button type="button" className={playing?'active':''} aria-pressed={playing}
    onClick={()=>setPlaying(value=>!value)} disabled={!next&&!playing}>
    {playing?<><Pause size={15}/> 停止播放</>:<><Play size={15}/> 自動建造</>}
   </button>
  </div>
  <div className="shelter-build-demo__quick" aria-label="隨機配置與快速測試">
   <button type="button" onClick={()=>{stop();dispatch({type:'SHELTER_DEMO_SET_ORDER',order:randomShelterBuildOrder()})}}
    title="僅打亂尚未取得家具的取得優先順序；不會清空已購入家具"><Shuffle size={15}/> 重洗路線</button>
   <button type="button" onClick={()=>randomConfig(3)}>隨機 3 件</button>
   <button type="button" onClick={()=>randomConfig(5)}>隨機 5 件</button>
   <button type="button" onClick={()=>randomConfig(Math.floor(Math.random()*9))}>隨機 0～8 件</button>
   <button type="button" onClick={()=>setOwned(SHELTER_FURNITURE_IDS)}><FastForward size={14}/> 一鍵滿配</button>
   <button type="button" onClick={()=>setOwned([])} disabled={owned.length===0}><RotateCcw size={14}/> 清空家具</button>
  </div>
  <div className="shelter-build-demo__section-title">自訂購買順序 <span>各件可單獨取得或移除</span></div>
  <div className="shelter-build-demo__furniture-list">
   {order.map((id,i)=>{
    const acquired=owned.includes(id);
    return <button type="button" key={id} className={acquired?'is-owned':''}
     aria-pressed={acquired} onClick={()=>{stop();dispatch({type:'SHELTER_DEMO_TOGGLE',furnitureId:id})}}
     title={acquired?'測試移除 '+NAMES[id]:'測試購入 '+NAMES[id]}>
     <span className="shelter-build-demo__position">{i+1}</span>
     <span className="shelter-build-demo__furniture-name">{NAMES[id]}</span>
     <span className="shelter-build-demo__status">{acquired?<><Check size={13}/> 已配置</>:'+ 購入'}</span>
    </button>;
   })}
  </div>
  <p className="shelter-build-demo__footer" aria-live="polite">
   {all?'家具已集齊：主場景自動切換成原始高品質滿配置圖。':
    next?'下一個測試目標：'+NAMES[next]+'。可自由挑選其他家具，不受順序限制。':
     '沒有待購買的家具。'}
   <span>此工具將於正式版本移除。</span>
  </p>
 </section>;
}
