/** Chapter location data. Locked stages are visible from the beginning. */
export type ChapterPoint = {
  id: string; sequence: number; name: string; subtitle: string; x: number; y: number;
  kind: 'stage' | 'boss'; implementation: 'playable' | 'planned';
};
export const CHAPTER_ONE = {
  id: 'ch01', name: '灰燼封鎖區', english: 'THE ASHEN QUARTER', number: '01',
  synopsis: '城內的失蹤通報逐漸增加。每條道路都通往新的謊言，而夜裡似乎有人守著那些不該被發現的事。',
  stages: [
    {id:'01',sequence:1,name:'失蹤的倉庫員工',subtitle:'舊物流站 · 第一個線索',x:95,y:270,kind:'stage',implementation:'playable'},
    {id:'02',sequence:2,name:'後巷的目擊者',subtitle:'暗巷 · 不可靠的證詞',x:215,y:190,kind:'stage',implementation:'playable'},
    {id:'03',sequence:3,name:'無人接聽',subtitle:'公寓 · 午夜電話',x:337,y:290,kind:'stage',implementation:'planned'},
    {id:'04',sequence:4,name:'鎖住的診間',subtitle:'診所 · 消失的病歷',x:458,y:158,kind:'stage',implementation:'planned'},
    {id:'05',sequence:5,name:'車站末班車',subtitle:'轉運站 · 不存在的旅客',x:582,y:232,kind:'stage',implementation:'planned'},
    {id:'06',sequence:6,name:'灰色證物',subtitle:'證物室 · 封存清單',x:700,y:123,kind:'stage',implementation:'planned'},
    {id:'07',sequence:7,name:'午夜的雨',subtitle:'高架橋 · 無處躲藏',x:817,y:259,kind:'stage',implementation:'planned'},
    {id:'08',sequence:8,name:'剪斷的監視器',subtitle:'舊商場 · 失去畫面的夜晚',x:946,y:192,kind:'stage',implementation:'planned'},
    {id:'09',sequence:9,name:'失聲的人',subtitle:'地下室 · 最後證詞',x:1063,y:304,kind:'stage',implementation:'planned'},
    {id:'10',sequence:10,name:'黑水之下',subtitle:'排水道 · 沉沒的答案',x:1177,y:195,kind:'stage',implementation:'planned'},
    {id:'11',sequence:11,name:'封鎖命令',subtitle:'檢查站 · 無法通行',x:1291,y:102,kind:'stage',implementation:'planned'},
    {id:'12',sequence:12,name:'灰燼之門',subtitle:'城門 · 第一章終幕',x:1405,y:245,kind:'boss',implementation:'planned'},
  ] satisfies ChapterPoint[],
} as const;
