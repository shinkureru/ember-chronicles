import type {MarketVendor} from '../../game/data/marketVendors';

/** Nine additional vendor-specific comments; the original authored vendor.line
 * is always the first entry. Ten lines rotate in a stable 10-second loop.
 * Pure presentation data; no world time, trading or saved state changes.
 */
export const MARKET_IDLE_INTERVAL_MS=10_000;
export const MARKET_IDLE_EXTRAS:Record<string,readonly string[]>={
 broker:[
  '「這些紙張還有股焦味。有人很想讓你看不見它們。」',
  '「情報過了時辰，只剩下紙的重量。」',
  '「別把名字說得太大聲。牆也會記得。」',
  '「真正值錢的消息，往往沒人敢買。」',
  '「從這裡走出去，記得把剛才聽見的忘掉。」',
  '「一張收據，能比一把刀更讓人睡不安穩。」',
  '「你問得越少，我們就越可能再見面。」',
  '「有人花錢買沉默，也有人花錢打破它。」',
  '「那個地址……我勸你別在天亮前靠近。」',
 ],
 mechanic:[
  '「金屬還有溫度，至少證明它沒完全死透。」',
  '「別嫌這顆螺絲舊，新的反而容易斷。」',
  '「你那件護具，光聽聲音就知道快散了。」',
  '「把工具擦乾淨，血跡會讓齒輪生鏽。」',
  '「別問零件從哪來；能用就已經夠好了。」',
  '「修得了機械，修不了人心裡那道裂縫。」',
  '「如果聽見兩聲異響，就別再試第三次。」',
  '「這城市最不缺的，是沒人認領的廢鐵。」',
  '「用完記得帶回來，我想看看它撐了多久。」',
 ],
 medic:[
  '「那些發紫的傷口，可不是睡一覺就會好。」',
  '「別用髒手摸繃帶，你會讓它失去價值。」',
  '「我今天只處理傷口，不處理你的藉口。」',
  '「有人把藥當希望，有人把它當最後一餐。」',
  '「小聲一點，隔壁還有人勉強睡著。」',
  '「你走路的聲音……右腳傷得比較重吧。」',
  '「別逞強。身體比你更會記住欠下的債。」',
  '「這瓶藥能幫你多撐一晚，其他我不保證。」',
  '「能在這裡見到你，代表上次的方法還有效。」',
 ],
 runner:[
  '「門口的路已經換了，別照昨晚的地圖走。」',
  '「有人把捷徑封起來了。八成不是為了安全。」',
  '「在這座城，跑得快也得知道何時停下。」',
  '「我只替還能回來的人留下一條路。」',
  '「如果燈閃三次，就從另一個出口走。」',
  '「別跟陌生的腳步聲保持同樣的速度。」',
  '「今夜風向變了，巷子裡的味道不太對。」',
  '「你要的是路線，還是從這裡消失的機會？」',
  '「消息我會送到。至於人，就看運氣了。」',
 ],
 scavenger:[
  '「這些東西洗一洗，還能撐好幾個晚上。」',
  '「你手上那件垃圾，可能比你想的更值錢。」',
  '「別亂翻我的箱子，裡面有會咬人的東西。」',
  '「城裡的人扔得越多，我就越不愁沒飯吃。」',
  '「那邊那個袋子？最好別打開。」',
  '「我見過比這更破的東西，也見過更破的人。」',
  '「收回來的每一件物品，都有個不肯說的故事。」',
  '「手套別脫，夜裡撿到的東西不見得乾淨。」',
  '「有人丟掉回憶，我只負責替它們標價。」',
 ],
};
export function getMarketIdleLines(vendor:MarketVendor):readonly string[]{
 return [vendor.line,...(MARKET_IDLE_EXTRAS[vendor.id]??[])];
}
export function getMarketIdleLine(vendor:MarketVendor,index:number):string{
 const lines=getMarketIdleLines(vendor);
 return lines[((Math.floor(index)%lines.length)+lines.length)%lines.length]??vendor.line;
}
