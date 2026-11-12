import {Eye,Zap,Footprints,Sparkles} from 'lucide-react';
import type {ProfessionId} from '../game/types';

/** Each profession owns its own readable resource symbol across HUD and skill cards. */
export default function ProfessionResourceIcon({profession,size=14}:{profession:ProfessionId|null;size?:number}){
 const Icon=profession==='journalist'?Eye:profession==='courier'?Zap:profession==='infiltrator'?Footprints:Sparkles;
 return <Icon size={size} strokeWidth={2.2} aria-hidden="true"/>;
}
