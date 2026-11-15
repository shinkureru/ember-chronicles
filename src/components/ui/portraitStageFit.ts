/**
 * A shared, browser-independent 768×1376 portrait art-fit calculation.
 * Use ONE set of coordinates for warehouse furniture and town hotspot layers:
 * never crop, stretch, round to integer pixels, or derive a different scale
 * per layer. Non-measurable/hidden containers return null until a resize.
 */
export const PORTRAIT_ART_SIZE=Object.freeze({width:768,height:1376});
export interface PortraitDimensions{width:number;height:number}
export function fitPortraitStage(
 containerWidth:number,containerHeight:number,
 artWidth=PORTRAIT_ART_SIZE.width,artHeight=PORTRAIT_ART_SIZE.height
):PortraitDimensions|null{
 if(![containerWidth,containerHeight,artWidth,artHeight].every(Number.isFinite))return null;
 if(containerWidth<=0||containerHeight<=0||artWidth<=0||artHeight<=0)return null;
 const scale=Math.min(containerWidth/artWidth,containerHeight/artHeight);
 if(!Number.isFinite(scale)||scale<=0)return null;
 return {width:artWidth*scale,height:artHeight*scale};
}
