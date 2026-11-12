import {House} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import {useGame} from '../app/GameContext';

/** Safe non-mission navigation to the chapter-one hub map. It must never
 * dispatch RETURN_HUB: mission exit stays behind its retreat/result flow. */
export default function ReturnMainLink({className=''}:{className?:string}){
 const {state}=useGame();
 if(state.mode!=='home')return null;
 return <NavLink to="/" end aria-label="返回主畫面（第一章地圖）"
  className={`return-main-link ${className}`.trim()}>
  <House size={16} aria-hidden="true"/><span>返回主畫面</span>
 </NavLink>;
}
