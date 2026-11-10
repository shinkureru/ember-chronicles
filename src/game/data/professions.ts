import type { ProfessionId } from '../types';
export const PROFESSIONS: Record<ProfessionId, {
  name: string; en: string; emoji: string; tagline: string; resourceName: string;
  passive: string; overview: string; primary: string; color: string;
}> = {
  journalist: {
    name:'調查記者',en:'JOURNALIST',emoji:'📰',tagline:'把真相變成你的武器', resourceName:'洞察',
    passive:'情報嗅覺｜調查取得新線索時，恢復少量洞察。',
    overview:'善於識別說詞的破綻、整理線索，透過證據改變交涉局勢。', primary:'觀察力・推理能力', color:'#8ECDB8',
  },
  infiltrator:{
    name:'滲透者',en:'INFILTRATOR',emoji:'🕶️',tagline:'我只留下別人來不及看清的影子',resourceName:'隱匿',
    passive:'影縫本能｜潛行成功率額外 +11 個百分點；成功潛行時恢復 1 點隱匿。與外送騎士的純速度優勢區分。',
    overview:'精通盲區、反跟蹤與悄無聲息的移動，正面交涉和持久肉搏並非強項。',primary:'潛行・環境盲點',color:'#9ca6ab',
  },
  courier: {
    name:'外送騎士',en:'COURIER',emoji:'🛵',tagline:'別人看到死路，你看到捷徑', resourceName:'衝勁',
    passive:'街區記憶｜移動與撤離判定享有固定優勢，首次找到捷徑時恢復少量衝勁。',
    overview:'擅長追逐、逃跑、地形移動與路線判斷，對緊急狀況反應敏銳。',primary:'移動能力・臨機應變',color:'#E5C184',
  },
};
