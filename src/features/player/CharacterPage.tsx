import { useState } from 'react';
import { Brain, HeartPulse, Shield, UserRound, LockKeyhole, BookOpenText } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { ATTRIBUTE_LABELS } from '../../game/data/attributes';
import { PROFESSIONS } from '../../game/data/professions';
import { EQUIPMENT_SLOTS, type EquipmentSlot } from '../../game/data/equipment';
import { EQUIPMENT_EFFECTS, getEquippedDefense } from '../../game/data/equipmentEffects';
import { ITEMS } from '../../game/data/items';
import type { AttributeId } from '../../game/types';
import { playCue } from '../../audio/sound';
import SurvivorFigure from '../../components/SurvivorFigure';
const categories:Record<string,{title:string;ids:AttributeId[];Icon:typeof HeartPulse}>={
 physical:{title:'身體與生存',['ids']:['maxHealth','maxStamina','mobility','melee','endurance','climate'],Icon:HeartPulse},
 mental:{title:'觀察與思維',ids:['observation','reasoning','memory','focus','adaptability','planning'],Icon:Brain},
 social:{title:'社交與心理',ids:['persuasion','deception','negotiation','empathy','intimidation','resilience'],Icon:UserRound},
};

export default function CharacterPage(){
 const {state:s,dispatch}=useGame();
 const [slot,setSlot]=useState<EquipmentSlot>('body');
 const [tab,setTab]=useState('equipment');
 if(!s.profession)return <section className="page-heading"><h1>人物檔案</h1><p>建立角色後即可檢視裝備與永久成長屬性。</p></section>;
 const profession=PROFESSIONS[s.profession],selected=EQUIPMENT_SLOTS.find(e=>e.id===slot)!;
 const ownedItems=[...new Set([...Object.keys(s.bag),...Object.keys(s.warehouse)])];
 const available=ownedItems.filter(id=>selected.allowed.includes(id));
 const category=categories[tab];
 return <div className="page-stack character-page viewport-page character-viewport character-viewport--v09">
  <header className="character-page__header"><div><span className="eyebrow">CHARACTER / SURVIVOR</span><h1>人物檔案</h1></div><span>{profession.name} · 防禦 {getEquippedDefense(s)}</span></header>
  <nav className="character-page__tabs" aria-label="人物資料分頁">
   {[
    {id:'equipment',label:'全身裝備'},{id:'physical',label:'身體'},{id:'mental',label:'思維'},
    {id:'social',label:'社交'},{id:'record',label:'NPC 記憶'},{id:'story',label:'人物故事'},
   ].map(item=><button key={item.id} type="button" aria-current={tab===item.id?'page':undefined} className={tab===item.id?'is-active':''} onClick={()=>{setTab(item.id);playCue('select')}}>{item.label}</button>)}
  </nav>
  {tab==='equipment'&&<section className="equipment-panel viewport-list character-equipment--v09">
   <div className="equipment-stage"><div className="equipment-stage__fog"/><SurvivorFigure equipment={s.equipment}/>
    {EQUIPMENT_SLOTS.map(e=>{
      const id=s.equipment[e.id],item=id?ITEMS[id]:null;
      return <button key={e.id} type="button" className={`equipment-slot equipment-slot--${e.id} ${slot===e.id?'is-selected':''}`}
        onClick={()=>{setSlot(e.id);playCue('select')}} aria-pressed={slot===e.id} aria-label={`${e.name}：${item?.name??'未裝備'}`}>
        <span className="equipment-slot__symbol">{e.icon}</span>
        <span className="equipment-slot__copy"><small>{e.name}</small><strong>{item?.name??'未裝備'}</strong><em>{item?EQUIPMENT_EFFECTS[item.id]?.description??'裝備功能待設定':'點選裝備'}</em></span>
      </button>;
    })}
   </div>
   <div className="equipment-picker">
    <div className="equipment-picker__title"><strong>{selected.name}</strong><span>{s.equipment[slot]?ITEMS[s.equipment[slot]!]!.name:'未裝備'}</span></div>
    <div className="equipment-picker__choices">
     {available.length?available.map(id=><button type="button" key={id} className="equipment-picker__item"
       disabled={s.equipment[slot]===id||s.mode==='adventure'} onClick={()=>{dispatch({type:'EQUIP_ITEM',slot,itemId:id});playCue('confirm')}}>
       <span>{ITEMS[id]!.name}<small>{EQUIPMENT_EFFECTS[id]?.description??'裝備功能待設定'}</small></span>
       <small>{s.equipment[slot]===id?'使用中':'裝備'} →</small>
     </button>):<div className="equipment-picker__empty"><LockKeyhole size={15}/>背包與倉庫暫無此部位裝備。</div>}
    </div>
    <button type="button" className="secondary-button equipment-picker__unequip" disabled={!s.equipment[slot]||s.mode==='adventure'}
      onClick={()=>{dispatch({type:'UNEQUIP_ITEM',slot});playCue('select')}}>{s.equipment[slot]?'卸下此部位裝備':'此部位尚未裝備'}</button>
   </div>
  </section>}
  {category&&<section className="character-tab-content viewport-list"><h2><category.Icon size={19}/>{category.title}</h2>
    <div className="character-tab-content__stats">{category.ids.map(id=><div className="character-tab-stat" key={id}><span>{ATTRIBUTE_LABELS[id]}</span><strong>{s.player.attributes[id]}</strong><small>永久成長屬性</small></div>)}</div>
    <p>每種屬性都有獨立成長方向。進行不同關卡或劇情選擇時，會逐步累積擅長領域。</p>
  </section>}
  {tab==='record'&&<section className="character-tab-content viewport-list">
    <h2><BookOpenText size={19}/>NPC 記憶</h2>
    <p>已嘗試 {s.attempt} 次；掌握情報 {s.clues.length} 條。以下 NPC 各自保留記憶，重新挑戰其他關卡也不會覆蓋。</p>
    <div className="character-tab-content__stats">
     <div className="character-tab-stat"><span>第一關 · 倉庫管理員阿忠</span><strong>來訪 {s.npc.met} 次</strong><small>敵意 {s.npc.hostility} · 交涉適應 {s.npc.adaptations.talk??0}</small></div>
     <div className="character-tab-stat"><span>第二關 · 後巷灰衣守望者</span><strong>來訪 {s.alleyNpc?.met??0} 次</strong><small>敵意 {s.alleyNpc?.hostility??18} · 交涉適應 {s.alleyNpc?.adaptations.talk??0}</small></div>
    </div>
    <p>倉庫記憶：{s.npc.remembers.length?s.npc.remembers.length+' 項事件已記住':'尚未發生特殊事件'}；後巷記憶：{s.alleyNpc?.remembers.length??0} 項事件已記住。</p>
    <div className="clue-list">{s.clues.slice().reverse().map((line,i)=><p key={i}>{line}</p>)}{s.clues.length===0&&<p>還沒有取得關鍵線索。</p>}</div>
  </section>}
  {tab==='story'&&<section className="character-tab-content viewport-list">
    <h2><Shield size={19}/>{profession.name}</h2>
    <p>「我還能走多遠，取決於我帶了什麼，也取決於我成了什麼樣的人。」</p>
    <p>{profession.overview}</p><p>職業天賦：{profession.passive}</p>
    <p>「這座被封鎖的城區，到底還藏了多少沒有說出口的事？」</p>
  </section>}
 </div>;
}
