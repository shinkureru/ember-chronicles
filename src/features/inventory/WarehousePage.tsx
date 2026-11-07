import { useState } from 'react';
import { Archive, Backpack, Box, Heart, PackageOpen, ShieldCheck } from 'lucide-react';
import { useGame } from '../../app/GameContext';
import { ITEMS } from '../../game/data/items';
import { bagWeight } from '../../game/engine/rules';
import type { GameState } from '../../game/types';
import ViewTabs from '../../components/ViewTabs';
import PageStepper from '../../components/PageStepper';
import { WAREHOUSE_PAGE_SIZE } from '../../game/data/uiConfig';
const ItemRows=({items,state,where,page}:{items:Record<string,number>;state:GameState;where:'bag'|'warehouse';page:number})=>{
 const {dispatch}=useGame();const entries=Object.entries(items).slice(page*WAREHOUSE_PAGE_SIZE,page*WAREHOUSE_PAGE_SIZE+WAREHOUSE_PAGE_SIZE);
 if(Object.keys(items).length===0)return <p className="empty-state">目前沒有物品。完成調查後，戰利品會自動歸類進來。</p>;
 return <div className="item-list">{entries.map(([id,qty])=>{const item=ITEMS[id];if(!item)return null;const isProtected=state.protectedItems.includes(id);
 return <div className="item-row" key={id} title={item.description}><div className="item-row__emoji">{item.emoji}</div><div className="item-row__text"><strong>{item.name} <em>×{qty}</em></strong><small>{item.description}</small><span>{item.weight} kg / 個</span></div><div className="item-row__actions"><button type="button" className={isProtected?'mini-button is-on':'mini-button'} onClick={()=>dispatch({type:'PROTECT_ITEM',itemId:id})} title={isProtected?'取消常用裝備':'指定為常用裝備'}><ShieldCheck size={15}/></button>{where==='warehouse'&&<button className="mini-button" type="button" title="領出到背包" onClick={()=>dispatch({type:'WITHDRAW_ITEM',itemId:id})}><Backpack size={15}/></button>}{where==='bag'&&['biscuit','water','canned','firstaid','bandage'].includes(id)&&<button className="mini-button" type="button" title="使用道具" onClick={()=>dispatch({type:'USE_ITEM',itemId:id})}><Heart size={15}/></button>}</div></div>;
 })}</div>;
};
export default function WarehousePage(){
 const {state:s}=useGame();const [tab,setTab]=useState('bag'),[page,setPage]=useState(0);
 const capacityPct=Math.min(100,bagWeight(s.warehouse)/s.warehouseCapacity*100);
 const where=tab==='bag'?'bag':'warehouse';const items=where==='bag'?s.bag:s.warehouse;
 const pages=Math.max(1,Math.ceil(Object.keys(items).length/WAREHOUSE_PAGE_SIZE));const activePage=Math.min(page,pages-1);
 return <div className="page-stack viewport-page warehouse-viewport"><section className="page-heading"><span className="eyebrow">STORAGE / SAFEHOUSE</span><h1>物資倉庫</h1><p>自動收納臨時物資，常用裝備留在身上。</p></section>
 <section className="surface-card viewport-summary"><div className="inline-summary"><Archive size={19}/><strong>倉庫使用量</strong><span>{bagWeight(s.warehouse).toFixed(1)} / {s.warehouseCapacity} kg</span></div><div className="capacity-bar"><div style={{width:`${capacityPct}%`}}/></div><div className="warehouse-capacity-status">{capacityPct>=90?<div className="warning-panel"><Box size={15}/>接近容量上限；無法入倉的物品不會直接消失。</div>:<span>自動入倉已啟用 · 超出容量的物品仍留在背包</span>}</div></section>
 <ViewTabs value={tab} onChange={v=>{setTab(v);setPage(0)}} tabs={[{id:'bag',label:`隨身背包 ${bagWeight(s.bag).toFixed(1)}/15 kg`},{id:'warehouse',label:`據點倉庫 ${Object.values(s.warehouse).reduce((a,b)=>a+b,0)} 件`}]}/>
 <section className="surface-card viewport-list"><div className="inline-summary">{where==='bag'?<Backpack size={17}/>:<PackageOpen size={17}/>}<strong>{where==='bag'?'隨身物品':'已入倉物資'}</strong><span>{Object.keys(items).length} 種 · 每頁 15 筆</span></div><ItemRows items={items} state={s} where={where} page={activePage}/></section>
 <PageStepper page={activePage} pages={pages} onChange={setPage}/>
 </div>;
}
