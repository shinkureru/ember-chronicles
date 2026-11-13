import { useState } from 'react';
import { Brain, HeartPulse, Shield, UserRound, BookOpenText } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { ATTRIBUTE_LABELS } from '../../game/data/attributes';
import { PROFESSIONS } from '../../game/data/professions';
import { getEquippedDefense } from '../../game/data/equipmentEffects';
import { playCue } from '../../audio/sound';
import { getProgression,xpNeededForLevel } from '../../game/engine/progression';
import {CHARACTER_TABS,ATTRIBUTE_GROUPS,type CharacterTab,type AttributeGroupId} from './characterSections';
import CharacterEquipmentPanel from './CharacterEquipmentPanel';
const groupIcons:Record<AttributeGroupId,typeof HeartPulse>={physical:HeartPulse,mental:Brain,social:UserRound};

export default function CharacterPage(){
 const {state:s,dispatch}=useGame();
 const [tab,setTab]=useState<CharacterTab>('equipment');
 if(!s.profession)return <section className="page-heading"><h1>人物檔案</h1><p>建立角色後即可檢視裝備與永久成長屬性。</p></section>;
 const profession=PROFESSIONS[s.profession];
 const progression=getProgression(s);
 const xpGoal=xpNeededForLevel(progression.level);
 return <div className="page-stack character-page viewport-page character-viewport character-viewport--v09">
  <header className="character-page__header"><div><span className="eyebrow">CHARACTER / SURVIVOR</span><h1>人物檔案</h1></div><span>{profession.name} · 防禦 {getEquippedDefense(s)}</span></header>
  <nav className="character-page__tabs" aria-label="人物資料分頁">
   {CHARACTER_TABS.map(item=><button key={item.id} type="button"
    aria-current={tab===item.id?'page':undefined}
    aria-controls={tab===item.id?`character-panel-${item.id}`:undefined}
    className={tab===item.id?'is-active':''}
    onClick={()=>{setTab(item.id);playCue('select')}}>{item.label}</button>)}
  </nav>
  {tab==='equipment'&&<CharacterEquipmentPanel/>}
  {tab==='attributes'&&<section id="character-panel-attributes" aria-label="身體、思維與社交永久屬性"
   className="character-tab-content character-attributes-panel character-v0818 viewport-list">
   <header className="character-v0818__heading">
    <h2><HeartPulse size={17}/>永久屬性</h2>
    <small>18 項成長能力 · 每項最高 Lv.20</small>
   </header>
   <div className="character-progression character-v0818__overview" aria-label="角色等級、經驗與可用點數">
    <div className="character-v0818__summary">
     <span>等級 <strong>Lv.{progression.level}</strong></span>
     <span>經驗 <strong>{progression.xp}/{xpGoal}</strong></span>
     <span className="character-v0818__points">可分配 <output aria-live="polite">{progression.points}</output> 點</span>
    </div>
    <div className="character-progression__meter" role="progressbar" aria-label="本級經驗進度"
     aria-valuemin={0} aria-valuemax={xpGoal} aria-valuenow={progression.xp}>
     <i style={{width:`${Math.min(100,100*progression.xp/xpNeededForLevel(progression.level))}%`}}/>
    </div>
   </div>
   <p className="character-v0818__hint" id="character-v0818-upgrade-hint">
    {progression.points>0?'點選 ＋ 消耗 1 點升級屬性；點數可跨類別分配。':'目前沒有可分配點數；完成行動取得 XP 後可再升級。'}
   </p>
   <div className="character-attribute-sections character-v0818__groups">
    {ATTRIBUTE_GROUPS.map(group=>{
     const Icon=groupIcons[group.id];
     const total=group.ids.reduce((sum,id)=>sum+s.player.attributes[id],0);
     return <section className={`character-attribute-group character-v0818__group character-v0818__group--${group.id}`}
      key={group.id} id={`character-attribute-${group.id}`}
      aria-labelledby={`character-attribute-heading-${group.id}`}>
      <header className="character-v0818__group-header">
       <h3 id={`character-attribute-heading-${group.id}`}><Icon size={15}/>{group.title}</h3>
       <small aria-label={`分類累計 ${total}，最高 120`}>{total}/120</small>
      </header>
      <div className="character-tab-content__stats character-v0818__stat-grid">
       {group.ids.map(id=>{
        const level=s.player.attributes[id];
        const canUpgrade=progression.points>0&&s.player.attributes[id]<20&&s.mode==='home';
        const reason=s.mode!=='home'?'回到避難所才能加點'
         :level>=20?'已達 Lv.20 上限'
         :progression.points<=0?'沒有可分配點數':'消耗 1 點升級';
        return <div className={`character-tab-stat character-v0818__stat ${level>=20?'is-maxed':''}`} key={id}>
         <span className="character-v0818__stat-name" title={ATTRIBUTE_LABELS[id]}>{ATTRIBUTE_LABELS[id]}</span>
         <strong className="character-v0818__stat-level" aria-label={`等級 ${level}，上限 20`}>{level}<small>/20</small></strong>
         <button type="button" className="character-v0818__upgrade"
          disabled={!canUpgrade} title={reason}
          aria-label={`升級${ATTRIBUTE_LABELS[id]}，目前 ${level}/20；${reason}`}
          aria-describedby="character-v0818-upgrade-hint"
          onClick={()=>dispatch({type:'ALLOCATE_POINT',attribute:id})}><span aria-hidden="true">{level>=20?'✓':'＋'}</span></button>
        </div>;
       })}
      </div>
     </section>;
    })}
   </div>
  </section>}
  {tab==='town'&&<section id="character-panel-town" aria-label="城鎮成長" className="character-tab-content viewport-list">
    <h2><Shield size={19}/>城鎮培養紀錄</h2>
    <p>城鎮訓練與支線委託已直接作用於永久屬性。每日最多完成一次屬性專項訓練，每項最高 Lv.20。</p>
    <div className="character-tab-content__stats">
     <div className="character-tab-stat"><span>今日訓練</span><strong>{s.town?.lastTrainingDay===s.world.day?'已完成':'可訓練'}</strong><small>於城鎮訓練場所選擇 18 項之一</small></div>
     <div className="character-tab-stat"><span>完成委託</span><strong>{Object.values(s.town?.quests??{}).filter(v=>v==='completed').length} 件</strong><small>不同委託獎勵不同的永久屬性</small></div>
     <div className="character-tab-stat"><span>身體狀況</span><strong>外傷 {s.conditions?.wounds??0}</strong><small>感染 {s.conditions?.infection??0} · 中毒 {s.conditions?.poisoning??0} · 疾病 {s.conditions?.illness??0}</small></div>
     <div className="character-tab-stat"><span>裝備改良</span><strong>{Object.values(s.town?.upgrades??{}).reduce((sum,x)=>sum+x,0)} 階</strong><small>回城鎮工坊可修復或改良已裝備的物品</small></div>
    </div>
    <p>所有永久屬性變動都會同步影響冒險判定。訓練時數、物資和貨幣是成長的實際成本。</p>
  </section>}
  {tab==='record'&&<section id="character-panel-record" aria-label="NPC 記憶" className="character-tab-content viewport-list">
    <h2><BookOpenText size={19}/>NPC 記憶</h2>
    <p>已嘗試 {s.attempt} 次；掌握情報 {s.clues.length} 條。以下 NPC 各自保留記憶，重新挑戰其他關卡也不會覆蓋。</p>
    <div className="character-tab-content__stats">
     <div className="character-tab-stat"><span>第一關 · 倉庫管理員阿忠</span><strong>來訪 {s.npc.met} 次</strong><small>敵意 {s.npc.hostility} · 交涉適應 {s.npc.adaptations.talk??0}</small></div>
     <div className="character-tab-stat"><span>第二關 · 後巷灰衣守望者</span><strong>來訪 {s.alleyNpc?.met??0} 次</strong><small>敵意 {s.alleyNpc?.hostility??18} · 交涉適應 {s.alleyNpc?.adaptations.talk??0}</small></div>
    </div>
    <p>倉庫記憶：{s.npc.remembers.length?s.npc.remembers.length+' 項事件已記住':'尚未發生特殊事件'}；後巷記憶：{s.alleyNpc?.remembers.length??0} 項事件已記住。</p>
    {([{label:'倉庫管理員阿忠',npc:s.npc,id:'warehouse_guard'},{label:'後巷灰衣守望者',npc:s.alleyNpc,id:'alley_watchman'}] as const).map(({label,npc,id})=>npc?<article key={label} className="npc-defeat-record">
      <strong>{label} · 被我擊敗 {npc.combatDefeats??0} 次</strong>
      <small>攻擊適應 {npc.adaptations.fight??0}/12 · 敵意 {npc.hostility}/100</small>
      <small>我在此敵人手上失敗 {npc.playerDefeats??0} 次 · 下次關鍵判定 +{s.insightByEnemy?.[id]??0}%（僅限此敵人）</small>
      {npc.defeatMemories?.length?<div className="npc-defeat-record__log">
       {npc.defeatMemories.slice().reverse().map(memory=><p key={memory.count}>
        <span>第 {memory.count} 次 · {memory.method}</span>
        <em>「{memory.thought}」</em>
        <small>{memory.effect}</small>
       </p>)}
      </div>:<p>尚未被我以戰鬥手段擊敗；和平迴避不會改寫這裡的心理紀錄。</p>}
     </article>:null)}
    <div className="clue-list">{s.clues.slice().reverse().map((line,i)=><p key={i}>{line}</p>)}{s.clues.length===0&&<p>還沒有取得關鍵線索。</p>}</div>
  </section>}
  {tab==='story'&&<section id="character-panel-story" aria-label="人物故事" className="character-tab-content viewport-list">
    <h2><Shield size={19}/>{profession.name}</h2>
    <p>「我還能走多遠，取決於我帶了什麼，也取決於我成了什麼樣的人。」</p>
    <p>{profession.overview}</p><p>職業天賦：{profession.passive}</p>
    <p>「這座被封鎖的城區，到底還藏了多少沒有說出口的事？」</p>
  </section>}
 </div>;
}
