import {useState} from 'react';
import {ArrowLeft,BookOpen,Check,ChevronRight,CircuitBoard,Crown,Home,Package,Shield,SlidersHorizontal,Sparkles} from 'lucide-react';
import {Link} from 'react-router-dom';
import LuminousProgressBar from '../../components/ui/LuminousProgressBar';
import SquareRaritySlot from '../../components/ui/SquareRaritySlot';
import MetalFrame from '../../components/ui/MetalFrame';
import {meterPercent,URBAN_FRAME_LEVELS,URBAN_RARITIES,type UrbanRarity} from '../../components/ui/urbanUiTokens';

const SLOT_EXAMPLES={
 gray:{name:'磨損零件',Icon:Package,detail:'一般物資'},
 green:{name:'軍用工具',Icon:CircuitBoard,detail:'精良裝備'},
 blue:{name:'舊式護板',Icon:Shield,detail:'稀有裝備'},
 purple:{name:'禁忌書頁',Icon:BookOpen,detail:'禁忌（展示）'},
 gold:{name:'未命名遺物',Icon:Crown,detail:'金色系統預留'},
} as const;

/** Isolated UI design laboratory. Deliberately has no useGame or dispatch:
 * moving its sliders and selecting demonstration tiles must never edit saves.
 */
export default function UiShowcasePage(){
 const [health,setHealth]=useState(1250);
 const [stamina,setStamina]=useState(550);
 const [effects,setEffects]=useState(true);
 const [particles,setParticles]=useState(true);
 const [picked,setPicked]=useState<UrbanRarity>('purple');
 const chosen=URBAN_RARITIES.find(x=>x.id===picked)!;
 return <div className="urban-showcase-page viewport-page" data-ui-showcase="v0.8.44">
  <header className="urban-showcase__heading">
   <Link to="/settings" aria-label="返回遊戲設定"><ArrowLeft size={18}/></Link>
   <div><span className="eyebrow">EMBER CHRONICLES / UI LAB · 0.8.44</span><h1>金屬・微光設計實驗室</h1></div>
   <Link to="/" aria-label="返回避難所"><Home size={17}/></Link>
  </header>
  <p className="urban-showcase__disclaimer">視覺原型展示：你可以調整數值、切換特效與點選卡格；所有操作都不修改遊戲存檔或商店資料。</p>
  <div className="urban-showcase__scroll" role="region" tabIndex={0} aria-label="UI 元件展示區，可上下捲動">
   <MetalFrame level="primary" eyebrow="01 / PROGRESS SYSTEM" title="生命與體力・前緣微粒子">
    <p className="urban-showcase__description">漸層金屬條 + 亮點 + 柔和流動火花。動態完全由 CSS 繪製，不需去背影片。</p>
    <div className="urban-showcase__meters">
     <LuminousProgressBar value={health} max={1000} tone="health" label="生命 HP"
      animated={effects} particles={particles}/>
     <LuminousProgressBar value={stamina} max={900} tone="stamina" label="體力 ST"
      animated={effects} particles={particles}/>
    </div>
    <div className="urban-showcase__controls" aria-label="發光狀態條數值校正">
     <label><span>生命值 <strong>{health} / 1000</strong></span>
      <input type="range" min={0} max={1500} step={25} value={health} onChange={e=>setHealth(Number(e.target.value))}/></label>
     <label><span>體力值 <strong>{stamina} / 900</strong></span>
      <input type="range" min={0} max={900} step={25} value={stamina} onChange={e=>setStamina(Number(e.target.value))}/></label>
     <div className="urban-showcase__toggles">
      <button type="button" aria-pressed={effects} onClick={()=>setEffects(x=>!x)}>
       {effects?<Check size={15}/>:<SlidersHorizontal size={15}/>}柔光動畫 {effects?'開啟':'關閉'}
      </button>
      <button type="button" aria-pressed={particles} onClick={()=>setParticles(x=>!x)}>
       <Sparkles size={15}/>粒子 {particles?'顯示':'隱藏'}
      </button>
     </div>
     <small className="urban-showcase__hint">生命填充 {meterPercent(health,1000)}%。數值超過上限時，保留原數字，但圖條最多只填滿 100%。遵守系統「減少動態效果」設定。</small>
    </div>
   </MetalFrame>
   <MetalFrame level="secondary" eyebrow="02 / SQUARE INVENTORY" title="正方形商品格・稀有度提案">
    <p className="urban-showcase__description">未選取時只顯示深色底盤，點選後才顯示該稀有度的彩色外框。金色選取時會偶發星芒與微弱水紋；金色仍未加入正式掉落表。</p>
    <div className="urban-showcase__rarities" aria-label="選擇 UI 稀有度樣式">
     {URBAN_RARITIES.map(r=>{
      const sample=SLOT_EXAMPLES[r.id],Icon=sample.Icon;
      return <SquareRaritySlot key={r.id} rarity={r.id} name={sample.name} detail={sample.detail}
       selected={picked===r.id} onSelect={()=>setPicked(r.id)} icon={<Icon size={34} strokeWidth={1.6}/>}/>;
     })}
    </div>
    <div className="urban-showcase__selection" role="status" aria-live="polite">
     <span><Sparkles size={15}/>目前選取：<strong>{chosen.label}</strong></span>
     <p>{chosen.description}</p>
    </div>
    <p className="urban-showcase__hint">灰／綠／藍／紫只改選取視覺；金色維持展示預留。原始商品價格、數量、卡牌 rarity 與角色牌組不受影響。</p>
   </MetalFrame>
   <MetalFrame level="light" eyebrow="03 / SURFACE HIERARCHY" title="銀色金屬邊框・三級">
    <p className="urban-showcase__description">厚重主框只給關鍵介面，次框放常用面板，輕框給次要元件，避免整個遊戲都像銀色相框。</p>
    <div className="urban-showcase__frame-samples">
     {URBAN_FRAME_LEVELS.map(level=><MetalFrame level={level.id} eyebrow={level.id.toUpperCase()}
       title={level.label} key={level.id}>
      <p>{level.description}</p>
      <span className="urban-showcase__sample-meta"><ChevronRight size={12}/>細節與陰影層級比較</span>
     </MetalFrame>)}
    </div>
   </MetalFrame>
   <div className="urban-showcase__footer">
    <span><Sparkles size={14}/>本頁是設計校對工具；第 4 批才會選擇性套用到黑市、卡牌與既有 HUD。</span>
    <Link to="/settings"><ArrowLeft size={15}/>返回遊戲設定</Link>
   </div>
  </div>
 </div>;
}
