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
const categories:Record<string,{title:string;ids:AttributeId[];Icon:typeof HeartPulse}>={
 physical:{title:'身體與生存',['ids']:['maxHealth','maxStamina','mobility','melee','endurance','climate'],Icon:HeartPulse},
 mental:{title:'觀察與思維',ids:['observation','reasoning','memory','focus','adaptability','planning'],Icon:Brain},
 social:{title:'社交與心理',ids:['persuasion','deception','negotiation','empathy','intimidation','resilience'],Icon:UserRound},
};
function SurvivorFigure({equipment}:{equipment:Record<string,string|null>}){return <svg className="survivor-figure" viewBox="0 0 200 375" role="img" aria-label="主角全身裝備輪廓示意">
 <defs><linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3e3d3e"/><stop offset=".56" stopColor="#17191b"/><stop offset="1" stopColor="#080a0b"/></linearGradient></defs>
 <ellipse cx="100" cy="359" rx="64" ry="11" fill="#050608" opacity=".7"/>
 <path d="M79 58L75 77 59 89 54 137 45 206 56 215 69 174 78 158 76 214 67 330 83 338 97 236 105 233 117 337 134 333 124 209 130 161 141 203 153 197 145 132 139 88 118 77 117 57Z" fill="url(#body)" stroke="#726b68" strokeOpacity=".6" strokeWidth="1.5"/>
 <path d="M81 21 Q100 2 119 21L124 47 117 66 108 73 89 69 78 52Z" fill="#4c4340" stroke="#756762" strokeWidth="1.3"/>
 <path d="M81 24L95 22 108 31 120 25 115 17 104 13 88 14Z" fill="#151516"/>
 <path d="M83 76L100 104 117 76M100 104L103 218M74 89L81 155M126 89L121 155" stroke="#8d7871" strokeWidth="2" opacity=".55" fill="none"/>
 <path d="M77 216Q97 224 126 215L122 231 80 233Z" fill="#332b2b" stroke="#77645c" strokeWidth="1"/>
 <path d="M67 332L89 334 89 350 60 351ZM115 334L135 330 141 353 113 351Z" fill="#151515" stroke="#68605b" strokeWidth="1"/>
 <path d="M82 38L91 39M108 39L117 38" stroke="#d4b29d" strokeWidth="1" opacity=".6"/>
 {equipment.head==='cap'&&<g fill="#37363a" stroke="#93847e" strokeWidth="1"><path d="M79 24L82 13 111 11 122 21 115 27Z"/><path d="M95 22Q114 17 132 22L135 26Q119 30 104 27Z"/></g>}
 {equipment.body==='vest'&&<g><path d="M78 88L92 83 100 110 111 83 123 91 130 159 77 157Z" fill="#514e4b" stroke="#a59a88" strokeWidth="2"/><path d="M92 85L92 154M111 85L111 154M80 114L126 114M82 142L124 142" stroke="#a39a8e" strokeWidth="3" opacity=".6"/><rect x="101" y="118" width="11" height="12" rx="2" fill="#282b2c"/></g>}
 {equipment.body==='scarf'&&<path d="M81 72Q99 83 118 72L126 83 118 96 108 90 106 136 95 137 94 91 80 88Z" fill="#77706d" stroke="#a69a8e" strokeWidth="1.5"/>}
 {equipment.hands==='gloves'&&<g fill="#555054" stroke="#948681" strokeWidth="1"><path d="M46 194L60 196 64 214 50 218Z"/><path d="M140 190L156 190 159 204 146 209Z"/></g>}
 {equipment.mainHand==='wrench'&&<g stroke="#a7a2a0" strokeWidth="5" strokeLinecap="round" fill="none"><path d="M158 177L165 229"/><path d="M152 170L158 178L167 172"/></g>}
 {equipment.mainHand==='screwdriver'&&<g stroke="#a5a09d" strokeWidth="4" strokeLinecap="round"><path d="M155 181L163 229"/><path d="M161 212L165 239" strokeWidth="2"/></g>}
 {equipment.utility==='flashlight'&&<g transform="translate(143 184) rotate(18)" fill="#aba39c"><rect x="0" y="0" width="10" height="26" rx="3"/><rect x="-3" y="-4" width="16" height="9" rx="3"/></g>}
 {equipment.utility==='radio'&&<g><rect x="118" y="181" width="18" height="22" rx="2" fill="#656365" stroke="#ae9e95" strokeWidth="1"/><path d="M127 181L128 167" stroke="#a99d94" strokeWidth="2"/><circle cx="126" cy="189" r="2" fill="#a67a6b"/></g>}
 {equipment.accessory==='keyring'&&<g stroke="#b4a196" fill="none"><circle cx="76" cy="231" r="5" strokeWidth="2"/><path d="M76 235L78 247L82 246"/></g>}
 </svg>}

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
    <h2><BookOpenText size={19}/>NPC 記憶</h2><p>已嘗試 {s.attempt} 次；掌握情報 {s.clues.length} 條，NPC 對談判的適應值為 {s.npc.adaptations.talk??0}。</p>
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
