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
  {tab==='town'&&<section id="character-panel-town" aria-label="城鎮成長"
   className="character-tab-content character-v0819 character-v0819--town viewport-list">
   <header className="character-v0819__heading">
    <div><span className="character-v0819__eyebrow">TOWN / GROWTH</span>
     <h2><Shield size={17}/>城鎮培養紀錄</h2></div>
    <small>DAY {s.world.day}</small>
   </header>
   <p className="character-v0819__intro">城鎮訓練與支線委託已直接作用於永久屬性。每日最多完成一次屬性專項訓練，每項最高 Lv.20。</p>
   <div className="character-tab-content__stats character-v0819__metric-grid">
    <article className="character-tab-stat character-v0819__metric">
     <span>今日訓練</span><strong>{s.town?.lastTrainingDay===s.world.day?'已完成':'可訓練'}</strong>
     <small>於城鎮訓練場所選擇 18 項之一</small>
    </article>
    <article className="character-tab-stat character-v0819__metric">
     <span>完成委託</span><strong>{Object.values(s.town?.quests??{}).filter(v=>v==='completed').length} 件</strong>
     <small>不同委託獎勵不同的永久屬性</small>
    </article>
    <article className="character-tab-stat character-v0819__metric">
     <span>身體狀況</span><strong>外傷 {s.conditions?.wounds??0}</strong>
     <small>感染 {s.conditions?.infection??0} · 中毒 {s.conditions?.poisoning??0} · 疾病 {s.conditions?.illness??0}</small>
    </article>
    <article className="character-tab-stat character-v0819__metric">
     <span>裝備改良</span><strong>{Object.values(s.town?.upgrades??{}).reduce((sum,x)=>sum+x,0)} 階</strong>
     <small>回城鎮工坊可修復或改良已裝備的物品</small>
    </article>
   </div>
   <aside className="character-v0819__note">
    所有永久屬性變動都會同步影響冒險判定。訓練時數、物資和貨幣是成長的實際成本。
   </aside>
  </section>}
  {tab==='record'&&<section id="character-panel-record" aria-label="NPC 記憶"
   className="character-tab-content character-v0819 character-v0819--record viewport-list">
   <header className="character-v0819__heading">
    <div><span className="character-v0819__eyebrow">MEMORY / RECORD</span>
     <h2><BookOpenText size={17}/>NPC 記憶</h2></div>
    <small>敵人會記住遭遇</small>
   </header>
   <div className="character-v0819__summary" aria-label="冒險與情報摘要">
    <span>已嘗試 <strong>{s.attempt}</strong> 次</span>
    <span>掌握情報 <strong>{s.clues.length}</strong> 條</span>
    <span>倉庫記憶 <strong>{s.npc.remembers.length}</strong> 項</span>
    <span>後巷記憶 <strong>{s.alleyNpc?.remembers.length??0}</strong> 項</span>
   </div>
   <p className="character-v0819__intro">以下 NPC 各自保留記憶，重新挑戰其他關卡也不會覆蓋。</p>
   <div className="character-v0819__npc-grid">
    {([{label:'倉庫管理員阿忠',npc:s.npc,id:'warehouse_guard',stage:'第一關'},
       {label:'後巷灰衣守望者',npc:s.alleyNpc,id:'alley_watchman',stage:'第二關'}] as const)
      .map(({label,npc,id,stage})=>npc?<article key={id} className="npc-defeat-record character-v0819__npc">
      <header className="character-v0819__npc-heading">
       <div><span>{stage}</span><h3>{label}</h3></div>
       <small>敵意 <strong>{npc.hostility}/100</strong></small>
      </header>
      <dl className="character-v0819__npc-metrics">
       <div><dt>來訪</dt><dd>{npc.met} 次</dd></div>
       <div><dt>交涉適應</dt><dd>{npc.adaptations.talk??0}</dd></div>
       <div><dt>攻擊適應</dt><dd>{npc.adaptations.fight??0}/12</dd></div>
       <div><dt>我擊敗敵人</dt><dd>{npc.combatDefeats??0} 次</dd></div>
       <div><dt>我被擊敗</dt><dd>{npc.playerDefeats??0} 次</dd></div>
       <div><dt>下次關鍵判定</dt><dd>+{s.insightByEnemy?.[id]??0}%</dd></div>
      </dl>
      <small className="character-v0819__npc-foot">判定加成僅限此敵人；和平迴避不計入戰鬥記憶。</small>
      {npc.defeatMemories?.length?<details className="character-v0819__disclosure">
       <summary>戰鬥記憶 <strong>{npc.defeatMemories.length}</strong> 則 <span>展開／收起</span></summary>
       <div className="npc-defeat-record__log character-v0819__memory-log">
        {npc.defeatMemories.slice().reverse().map(memory=><p key={memory.count}>
         <span>第 {memory.count} 次 · {memory.method}</span>
         <em>「{memory.thought}」</em>
         <small>{memory.effect}</small>
        </p>)}
       </div>
      </details>:<p className="character-v0819__empty">
       尚未被我以戰鬥手段擊敗；和平迴避不會改寫這裡的心理紀錄。
      </p>}
     </article>:null)}
   </div>
   <details className="character-v0819__disclosure character-v0819__clues">
    <summary>已掌握的關鍵線索 <strong>{s.clues.length}</strong> 條 <span>展開／收起</span></summary>
    <div className="clue-list character-v0819__clue-list">
     {s.clues.slice().reverse().map((line,i)=><p key={i}>{line}</p>)}
     {s.clues.length===0&&<p>還沒有取得關鍵線索。</p>}
    </div>
   </details>
  </section>}
  {tab==='story'&&<section id="character-panel-story" aria-label="人物故事"
   className="character-tab-content character-v0819 character-v0819--story viewport-list">
   <header className="character-v0819__heading">
    <div><span className="character-v0819__eyebrow">PERSONAL / STORY</span>
     <h2><UserRound size={17}/>{profession.name}</h2></div>
    <small>{profession.en}</small>
   </header>
   <blockquote className="character-v0819__quote">
    「我還能走多遠，取決於我帶了什麼，也取決於我成了什麼樣的人。」
   </blockquote>
   <article className="character-v0819__story-card">
    <h3>角色經歷</h3>
    <p>{profession.overview}</p>
   </article>
   <article className="character-v0819__story-card character-v0819__story-card--passive">
    <h3>職業天賦</h3>
    <p>職業天賦：{profession.passive}</p>
   </article>
   <blockquote className="character-v0819__quote character-v0819__quote--last">
    「這座被封鎖的城區，到底還藏了多少沒有說出口的事？」
   </blockquote>
  </section>}
 </div>;
}
