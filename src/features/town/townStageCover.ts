import type {PortraitDimensions} from '../../components/ui/portraitStageFit';

/** Expand the old aspect-safe fit proportionally until it fills the host.
 * Hotspots and the image live in the same centered, potentially cropped
 * stage; CSS never stretches art differently from its hit targets. */
export function coverTownStage(
 contain:PortraitDimensions,containerWidth:number,containerHeight:number
):PortraitDimensions|null{
 if(![contain.width,contain.height,containerWidth,containerHeight].every(Number.isFinite)
  ||contain.width<=0||contain.height<=0||containerWidth<=0||containerHeight<=0)return null;
 const scale=Math.max(containerWidth/contain.width,containerHeight/contain.height);
 return Number.isFinite(scale)&&scale>0?
  {width:contain.width*scale,height:contain.height*scale}:null;
}
