import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function PageStepper({page,pages,onChange}:{page:number;pages:number;onChange:(page:number)=>void}){
 if(pages<=1)return null;
 return <div className="page-stepper" aria-label="列表分頁"><button aria-label="上一頁" disabled={page===0} onClick={()=>onChange(page-1)}><ChevronLeft size={16}/></button><span>{page+1} / {pages}</span><button aria-label="下一頁" disabled={page===pages-1} onClick={()=>onChange(page+1)}><ChevronRight size={16}/></button></div>;
}
