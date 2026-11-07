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
  courier: {
    name:'外送騎士',en:'COURIER',emoji:'🛵',tagline:'別人看到死路，你看到捷徑', resourceName:'衝勁',
    passive:'街區記憶｜移動與撤離判定享有固定優勢，首次找到捷徑時恢復少量衝勁。',
    overview:'擅長追逐、逃跑、地形移動與路線判斷，對緊急狀況反應敏銳。',primary:'移動能力・臨機應變',color:'#E5C184',
  },
};
