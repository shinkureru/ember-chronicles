import { useEffect, useState } from 'react';
import { Archive, Backpack, Box, Heart, PackagePlus, PackageOpen, ShieldCheck, X, Info } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { ITEMS } from '../../game/data/items';
import { bagWeight } from '../../game/engine/rules';
import ViewTabs from '../../components/ViewTabs';
import PageStepper from '../../components/PageStepper';
import { WAREHOUSE_PAGE_SIZE } from '../../game/data/uiConfig';
import { playCue } from '../../audio/sound';

export default function WarehousePage(){
 const {state:s,dispatch}=useGame();
 const [tab,setTab]=useState<'bag'|'warehouse'>('bag');
 const [page,setPage]=useState(0);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const where=tab;
 const items=where==='bag'?s.bag:s.warehouse;
 const entries=Object.entries(items).filter(([id])=>!!ITEMS[id]);
 const pages=Math.max(1,Math.ceil(entries.length/WAREHOUSE_PAGE_SIZE));
 const activePage=Math.min(page,pages-1);
 const capacityPct=Math.min(100,bagWeight(s.warehouse)/s.warehouseCapacity*100);
 const selected=selectedId?ITEMS[selectedId]:undefined;
 const qty=selectedId?items[selectedId]??0:0;
 const protectedItem=!!selectedId&&s.protectedItems.includes(selectedId);
 const equipped=!!selectedId&&Object.values(s.equipment).includes(selectedId);
 const outOfSpace=!!selected&&where==='warehouse'?
  bagWeight(s.bag)+selected.weight>15:!!selected&&bagWeight(s.warehouse)+selected.weight>s.warehouseCapacity+1e-8;
 const moveBlocked=where==='bag'&&(protectedItem||equipped)||outOfSpace||qty<=0;
 const moveReason=equipped?'先卸下正在穿戴的裝備':protectedItem?'先取消常用物品標記':outOfSpace?where==='bag'?'倉庫容量不足':'背包已達負重上限':'';
 const isConsumable=!!selectedId&&['biscuit','water','canned','firstaid','bandage'].includes(selectedId);
 useEffect(()=>{
  if(!selectedId)return;
  const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setSelectedId(null);};
  window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
 },[selectedId]);
 const move=(id:string)=>{
  dispatch({type:where==='bag'?'DEPOSIT_ITEM':'WITHDRAW_ITEM',itemId:id});
  playCue('loot');
 };
 return <div className="page-stack viewport-page warehouse-viewport warehouse-viewport--v11">
  <section className="page-heading"><span className="eyebrow">STORAGE / SAFEHOUSE</span><h1>物資倉庫</h1><p>點選物品查看資料；可在背包與倉庫之間逐件移動。</p></section>
  <section className="surface-card viewport-summary">
   <div className="inline-summary"><Archive size={19}/><strong>倉庫使用量</strong><span>{bagWeight(s.warehouse).toFixed(1)} / {s.warehouseCapacity} kg</span></div>
   <div className="capacity-bar"><div style={{width:`${capacityPct}%`}}/></div>
   <div className="warehouse-capacity-status">{capacityPct>=90?<div className="warning-panel"><Box size={15}/>接近容量上限；物品不會因滿倉消失。</div>:<span>完成任務後自動入倉，常用裝備及超出容量的物資留在背包。</span>}</div>
  </section>
  <ViewTabs value={tab} onChange={v=>{setTab(v as 'bag'|'warehouse');setPage(0);setSelectedId(null)}} tabs={[{id:'bag',label:`隨身背包 ${bagWeight(s.bag).toFixed(1)}/15 kg`},{id:'warehouse',label:`據點倉庫 ${Object.values(s.warehouse).reduce((a,b)=>a+b,0)} 件`}]}/>
  <section className="surface-card viewport-list">
   <div className="inline-summary">{where==='bag'?<Backpack size={17}/>:<Archive size={17}/>}<strong>{where==='bag'?'隨身物品':'據點庫存'}</strong><span>{entries.length} 種 · 每頁 15 筆</span></div>
   {entries.length===0?<p className="empty-state">這裡還沒有物品。</p>:<div className="item-list">
    {entries.slice(activePage*WAREHOUSE_PAGE_SIZE,(activePage+1)*WAREHOUSE_PAGE_SIZE).map(([id,count])=>{
     const item=ITEMS[id]!,isFavorite=s.protectedItems.includes(id),inUse=Object.values(s.equipment).includes(id);
     const enoughRoom=where==='bag'?bagWeight(s.warehouse)+item.weight<=s.warehouseCapacity+1e-8:bagWeight(s.bag)+item.weight<=15+1e-8;
     const disabled=where==='bag'?(inUse||isFavorite||!enoughRoom):!enoughRoom;
     return <div className="item-row warehouse-v11__row" key={id}>
      <button type="button" className="warehouse-v11__inspect" onClick={()=>{setSelectedId(id);playCue('open')}} aria-label={`查看${item.name}詳細資料`}>
       <span className="item-row__emoji">{item.emoji}</span>
       <span className="warehouse-v11__row-content"><strong>{item.name} ×{count}</strong><small>{item.weight} kg / 個</small></span>
       <Info size={14} className="warehouse-v11__info"/>
      </button>
      <button type="button" className="warehouse-v11__move" disabled={disabled} onClick={()=>move(id)}
       title={where==='bag'?'存入倉庫':'領出至背包'}
       aria-label={where==='bag'?`將${item.name}存入倉庫`:`將${item.name}領到背包`}>
       {where==='bag'?<PackagePlus size={17}/>:<PackageOpen size={17}/>}
      </button>
     </div>;
    })}
   </div>}
  </section>
  <PageStepper page={activePage} pages={pages} onChange={setPage}/>
  {selected&&<div className="warehouse-v11__overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null)}}>
   <section className="warehouse-v11__detail" role="dialog" aria-modal="true" aria-label={selected.name+'物品資訊'}>
    <button type="button" className="warehouse-v11__close" aria-label="關閉物品資訊" onClick={()=>setSelectedId(null)}><X size={20}/></button>
    <small>INVENTORY / {selected.type.toUpperCase()}</small><div className="warehouse-v11__detail-art">{selected.emoji}</div>
    <h2>{selected.name}</h2><p>{selected.description}</p>
    <dl><div><dt>目前位置</dt><dd>{where==='bag'?'隨身背包':'據點倉庫'}</dd></div><div><dt>持有數量</dt><dd>{qty} 件</dd></div><div><dt>單件重量</dt><dd>{selected.weight} kg</dd></div><div><dt>狀態</dt><dd>{equipped?'已穿戴':protectedItem?'常用物品':'一般物資'}</dd></div></dl>
    {moveReason&&<p className="warehouse-v11__warning">{moveReason}</p>}
    <div className="warehouse-v11__actions">
     <button type="button" disabled={moveBlocked} onClick={()=>move(selected.id)}>
      {where==='bag'?<ArrowDownToLine size={17}/>:<ArrowUpFromLine size={17}/>} {where==='bag'?'存入倉庫 ×1':'領出至背包 ×1'}
     </button>
     <button type="button" disabled={equipped} onClick={()=>{dispatch({type:'PROTECT_ITEM',itemId:selected.id});playCue('select')}}>
      <ShieldCheck size={17}/>{protectedItem?'取消常用標記':'標為常用物品'}
     </button>
     {isConsumable&&where==='bag'&&<button type="button" onClick={()=>{dispatch({type:'USE_ITEM',itemId:selected.id});playCue('confirm')}}><Heart size={17}/>使用物品</button>}
    </div>
   </section>
  </div>}
 </div>;
}
