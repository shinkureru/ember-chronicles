import {Settings2} from 'lucide-react';
import {Link,useLocation} from 'react-router-dom';
import {useGame} from '../app/GameContext';

declare const __APP_VERSION__:string;
declare const __BUILD_REVISION__:string;

/** Build identity remains visible even after the old app-wide header is removed. */
export function BuildVersion({className=''}:{className?:string}){
 return <span className={`game-build-version ${className}`.trim()}
  title={`已部署版本 v${__APP_VERSION__} · Git ${__BUILD_REVISION__}`}
  aria-label={`目前遊戲版本 v${__APP_VERSION__}，程式版本 ${__BUILD_REVISION__}`}>
  <strong>v{__APP_VERSION__}</strong><small>· {__BUILD_REVISION__}</small>
 </span>;
}

/** Reusable compact build/settings controls embedded into each screen's own
 * existing information/action area. Never used as a replacement navbar. */
export default function GameUtilities({className=''}:{className?:string}){
 const {state}=useGame(),location=useLocation();
 return <div className={`game-utilities ${className}`.trim()} aria-label="版本與設定">
  <BuildVersion/>
  {state.mode==='home'&&location.pathname!=='/settings'&&
   <Link to="/settings" className="game-utilities__settings" aria-label="開啟遊戲設定" title="遊戲設定">
    <Settings2 size={17} aria-hidden="true"/><span>設定</span>
   </Link>}
 </div>;
}
