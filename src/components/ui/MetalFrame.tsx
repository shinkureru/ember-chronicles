import type {ReactNode} from 'react';
import {type UrbanFrameLevel} from './urbanUiTokens';

interface MetalFrameProps{
 level?:UrbanFrameLevel;
 title?:string;
 eyebrow?:string;
 children:ReactNode;
 className?:string;
}

/** Restrained silver framing. Important panels get ornate detail;
 * low-priority UI gets a thin hairline so the whole game isn't chrome.
 */
export default function MetalFrame({level='secondary',title,eyebrow,children,className=''}:MetalFrameProps){
 return <section className={`urban-frame urban-frame--${level} ${className}`.trim()}
  data-urban-frame={level} aria-label={title}>
  {(title||eyebrow)&&<header className="urban-frame__header">
   {eyebrow&&<span className="urban-frame__eyebrow">{eyebrow}</span>}
   {title&&<h2>{title}</h2>}
  </header>}
  <div className="urban-frame__body">{children}</div>
 </section>;
}
