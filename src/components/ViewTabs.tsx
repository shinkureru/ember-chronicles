type Tab = {id:string;label:string};
export default function ViewTabs({tabs,value,onChange}:{tabs:Tab[];value:string;onChange:(v:string)=>void}){
 return <div className="view-tabs" role="tablist" aria-label="資料分類">{tabs.map(tab=><button key={tab.id} type="button" role="tab" aria-selected={value===tab.id} className={value===tab.id?'is-active':''} onClick={()=>onChange(tab.id)}>{tab.label}</button>)}</div>;
}
